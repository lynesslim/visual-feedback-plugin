<?php

if (!defined('ABSPATH')) {
    exit;
}

final class AFWP_Supabase
{
    private string $baseUrl;
    private string $serviceKey;

    public function __construct(array $settings)
    {
        $this->baseUrl = rtrim((string)($settings['supabase_url'] ?? ''), '/');
        $this->serviceKey = (string)($settings['service_role_key'] ?? '');
    }

    public function is_configured(): bool
    {
        return $this->baseUrl !== '' && $this->serviceKey !== '';
    }

    public function resolve_project(string $slug, string $embedPublicKey, bool $withPasscode = false): ?array
    {
        if (!$this->is_configured()) {
            return null;
        }
        $select = $withPasscode ? 'id,embed_public_key,feedback_passcode' : 'id,embed_public_key';
        $res = $this->request('GET', '/rest/v1/projects', [
            'select' => $select,
            'slug' => 'eq.' . $slug,
            'limit' => '1',
        ], null, ['Accept' => 'application/json']);
        if ($res['status'] >= 300 || empty($res['body'][0])) {
            return null;
        }
        $row = $res['body'][0];
        $actual = (string)($row['embed_public_key'] ?? '');
        if (!hash_equals($actual, $embedPublicKey)) {
            return null;
        }
        return $row;
    }

    public function update_project_passcode(string $slug, string $passcode): bool
    {
        if (!$this->is_configured() || $slug === '') {
            return false;
        }
        $res = $this->request('PATCH', '/rest/v1/projects', [
            'slug' => 'eq.' . $slug,
        ], ['feedback_passcode' => $passcode], [
            'Prefer' => 'return=minimal',
        ]);
        return $res['status'] >= 200 && $res['status'] < 300;
    }

    public function request(
        string $method,
        string $path,
        array $query = [],
        $body = null,
        array $headers = []
    ): array {
        $url = $this->baseUrl . $path;
        if (!empty($query)) {
            $url .= '?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986);
        }
        $defaultHeaders = [
            'apikey' => $this->serviceKey,
            'Authorization' => 'Bearer ' . $this->serviceKey,
        ];
        $args = [
            'method' => strtoupper($method),
            'timeout' => 20,
            'headers' => array_merge($defaultHeaders, $headers),
        ];
        if ($body !== null) {
            if (!isset($args['headers']['Content-Type'])) {
                $args['headers']['Content-Type'] = 'application/json';
            }
            $args['body'] = is_string($body) ? $body : wp_json_encode($body);
        }
        $resp = wp_remote_request($url, $args);
        if (is_wp_error($resp)) {
            return ['status' => 500, 'body' => null, 'error' => $resp->get_error_message()];
        }
        $code = (int) wp_remote_retrieve_response_code($resp);
        $raw = (string) wp_remote_retrieve_body($resp);
        $json = null;
        if ($raw !== '') {
            $decoded = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $json = $decoded;
            }
        }
        return ['status' => $code, 'body' => $json, 'raw' => $raw];
    }

    public function upload_file(string $projectId, array $file): ?array
    {
        if (!$this->is_configured()) {
            return null;
        }
        $tmp = (string)($file['tmp_name'] ?? '');
        $mime = (string)($file['type'] ?? '');
        $name = (string)($file['name'] ?? '');
        if ($tmp === '' || !file_exists($tmp)) {
            return null;
        }
        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($mime, $allowed, true)) {
            return null;
        }
        $ext = pathinfo($name, PATHINFO_EXTENSION);
        if ($ext === '') {
            $ext = str_replace('image/', '', $mime);
        }
        $objectPath = sprintf(
            '%s/%d-%s.%s',
            $projectId,
            time(),
            wp_generate_password(12, false, false),
            sanitize_file_name($ext)
        );
        $content = file_get_contents($tmp);
        if ($content === false) {
            return null;
        }
        $res = $this->request(
            'POST',
            '/storage/v1/object/feedback-attachments/' . rawurlencode($objectPath),
            [],
            $content,
            [
                'Content-Type' => $mime,
                'x-upsert' => 'false',
            ]
        );
        if ($res['status'] < 200 || $res['status'] >= 300) {
            return null;
        }
        $publicUrl = $this->baseUrl . '/storage/v1/object/public/feedback-attachments/' . rawurlencode($objectPath);
        return ['path' => $objectPath, 'url' => $publicUrl];
    }
}
