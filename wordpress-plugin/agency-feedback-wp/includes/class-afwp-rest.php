<?php

if (!defined('ABSPATH')) {
    exit;
}

final class AFWP_Rest
{
    private AFWP_Supabase $supabase;

    public function __construct(AFWP_Supabase $supabase)
    {
        $this->supabase = $supabase;
    }

    public function register_routes(): void
    {
        $ns = 'agency-feedback/v1';
        register_rest_route($ns, '/api/public/feedback', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'list_feedback'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'create_feedback'],
                'permission_callback' => '__return_true',
            ],
        ]);
        register_rest_route($ns, '/api/public/feedback/verify-pin', [
            [
                'methods' => 'POST',
                'callback' => [$this, 'verify_pin'],
                'permission_callback' => '__return_true',
            ],
        ]);
        register_rest_route($ns, '/api/public/feedback/upload', [
            [
                'methods' => 'POST',
                'callback' => [$this, 'upload'],
                'permission_callback' => '__return_true',
            ],
        ]);
        register_rest_route($ns, '/api/public/feedback/(?P<id>[0-9a-f-]{36})', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_feedback_detail'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods' => 'PATCH',
                'callback' => [$this, 'resolve_feedback'],
                'permission_callback' => '__return_true',
            ],
        ]);
        register_rest_route($ns, '/api/public/feedback/(?P<id>[0-9a-f-]{36})/comments', [
            [
                'methods' => 'POST',
                'callback' => [$this, 'create_comment'],
                'permission_callback' => '__return_true',
            ],
        ]);
    }

    private function json(array $body, int $status = 200): WP_REST_Response
    {
        return new WP_REST_Response($body, $status);
    }

    private function parse_image_urls($raw): ?array
    {
        if ($raw === null || $raw === '') {
            return [];
        }
        if (!is_array($raw)) {
            return null;
        }
        if (count($raw) > 8) {
            return null;
        }
        $out = [];
        foreach ($raw as $url) {
            if (!is_string($url)) {
                return null;
            }
            $url = trim($url);
            if ($url === '') {
                continue;
            }
            if (!preg_match('#^https?://#i', $url)) {
                return null;
            }
            $out[] = $url;
        }
        return $out;
    }

    private function normalize_url_path(string $input): string
    {
        if ($input === '') {
            return '';
        }
        $parts = explode('?', $input, 2);
        $path = $parts[0] ?? '';
        if ($path !== '/' && str_ends_with($path, '/')) {
            $path = rtrim($path, '/');
        }
        if (isset($parts[1]) && $parts[1] !== '') {
            return $path . '?' . $parts[1];
        }
        return $path;
    }

    private function resolve_project_from_request(array $payload, bool $withPasscode = false): ?array
    {
        $slug = trim((string)($payload['projectSlug'] ?? ''));
        $key = trim((string)($payload['embedPublicKey'] ?? ''));
        if ($slug === '' || $key === '') {
            return null;
        }
        return $this->supabase->resolve_project($slug, $key, $withPasscode);
    }

    public function verify_pin(WP_REST_Request $req): WP_REST_Response
    {
        $body = (array) $req->get_json_params();
        $project = $this->resolve_project_from_request($body, true);
        if (!$project) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }
        $passcode = preg_replace('/\D+/', '', (string)($body['passcode'] ?? ''));
        if (strlen($passcode) !== 4) {
            return $this->json(['error' => 'passcode must be 4 digits'], 400);
        }
        $stored = (string)($project['feedback_passcode'] ?? '');
        if (!hash_equals($stored, $passcode)) {
            return $this->json(['error' => 'Invalid passcode'], 401);
        }
        return $this->json(['ok' => true], 200);
    }

    public function list_feedback(WP_REST_Request $req): WP_REST_Response
    {
        $project = $this->resolve_project_from_request($req->get_params());
        if (!$project) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }
        $projectId = (string)$project['id'];
        $base = [
            'select' => 'id,selector,coordinates,comment_text,author,metadata,status,priority,url_path,image_urls,created_at',
            'project_id' => 'eq.' . $projectId,
            'order' => 'created_at.asc',
        ];
        $urlPath = $this->normalize_url_path((string)($req->get_param('urlPath') ?? ''));
        $includeResolved = in_array((string)$req->get_param('includeResolved'), ['1', 'true'], true);
        if (!$includeResolved) {
            $base['status'] = 'in.(open,in_progress)';
        }

        if ($urlPath === '') {
            $res = $this->supabase->request('GET', '/rest/v1/feedback', $base, null, ['Accept' => 'application/json']);
        } else {
            $pathOnly = explode('?', $urlPath, 2)[0] ?? '';
            $slashVariant = ($pathOnly !== '' && $pathOnly !== '/') ? ($pathOnly . '/') : rtrim($pathOnly, '/');
            $q = $base;
            $q['url_path'] = 'eq.' . $urlPath;
            $res = $this->supabase->request('GET', '/rest/v1/feedback', $q, null, ['Accept' => 'application/json']);

            // Fallback to pathname-only match if exact URL path doesn't return rows.
            $rows = (is_array($res['body']) ? $res['body'] : []);
            if ($res['status'] < 300 && count($rows) === 0 && $pathOnly !== '' && $pathOnly !== $urlPath) {
                $q2 = $base;
                $q2['url_path'] = 'eq.' . $pathOnly;
                $res = $this->supabase->request('GET', '/rest/v1/feedback', $q2, null, ['Accept' => 'application/json']);
                $rows = (is_array($res['body']) ? $res['body'] : []);
            }
            if ($res['status'] < 300 && count($rows) === 0 && $slashVariant !== '' && $slashVariant !== $pathOnly) {
                $qSlash = $base;
                $qSlash['url_path'] = 'eq.' . $slashVariant;
                $res = $this->supabase->request('GET', '/rest/v1/feedback', $qSlash, null, ['Accept' => 'application/json']);
                $rows = (is_array($res['body']) ? $res['body'] : []);
            }
            if ($res['status'] < 300 && count($rows) === 0 && $pathOnly !== '') {
                $q3 = $base;
                $q3['url_path'] = 'like.' . $pathOnly . '?%';
                $res = $this->supabase->request('GET', '/rest/v1/feedback', $q3, null, ['Accept' => 'application/json']);
            }
        }
        if ($res['status'] >= 300) {
            return $this->json(['error' => 'Failed to load feedback'], 500);
        }
        return $this->json(['feedback' => is_array($res['body']) ? $res['body'] : []], 200);
    }

    public function create_feedback(WP_REST_Request $req): WP_REST_Response
    {
        $body = (array)$req->get_json_params();
        $project = $this->resolve_project_from_request($body);
        if (!$project) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }
        $selector = trim((string)($body['selector'] ?? ''));
        $commentText = trim((string)($body['commentText'] ?? ''));
        $author = trim((string)($body['author'] ?? ''));
        $urlPath = $this->normalize_url_path(trim((string)($body['urlPath'] ?? '')));
        $coords = $body['coordinates'] ?? null;
        $priority = $body['priority'] ?? null;
        $metadata = (is_array($body['metadata'] ?? null)) ? $body['metadata'] : [];
        $imageUrls = $this->parse_image_urls($body['imageUrls'] ?? null);
        if ($imageUrls === null) {
            return $this->json(['error' => 'imageUrls must be an array of http(s) URLs'], 400);
        }
        if (!is_array($coords) || !isset($coords['x'], $coords['y'])) {
            return $this->json(['error' => 'Invalid coordinates'], 400);
        }
        if ($selector === '' || $author === '') {
            return $this->json(['error' => 'Missing required fields'], 400);
        }
        if ($commentText === '' && count($imageUrls) === 0) {
            return $this->json(['error' => 'Provide commentText or at least one image'], 400);
        }
        if (!in_array($author, ['Client', 'Supercraft'], true)) {
            return $this->json(['error' => 'author must be Client or Supercraft'], 400);
        }
        if (!in_array($priority, [null, '', 'low', 'medium', 'high'], true)) {
            return $this->json(['error' => 'Invalid priority'], 400);
        }
        $insert = [[
            'project_id' => (string)$project['id'],
            'selector' => $selector,
            'coordinates' => [
                'x' => max(0, min(1, (float)$coords['x'])),
                'y' => max(0, min(1, (float)$coords['y'])),
            ],
            'comment_text' => $commentText,
            'author' => $author,
            'metadata' => $metadata,
            'status' => 'open',
            'priority' => $priority ?: null,
            'url_path' => $urlPath,
            'image_urls' => $imageUrls,
        ]];
        $res = $this->supabase->request('POST', '/rest/v1/feedback', ['select' => 'id,created_at'], $insert, [
            'Prefer' => 'return=representation',
        ]);
        if ($res['status'] >= 300 || empty($res['body'][0])) {
            return $this->json(['error' => 'Failed to save feedback'], 500);
        }
        $row = $res['body'][0];
        return $this->json(['id' => $row['id'], 'created_at' => $row['created_at']], 201);
    }

    public function get_feedback_detail(WP_REST_Request $req): WP_REST_Response
    {
        $id = (string)$req['id'];
        $project = $this->resolve_project_from_request($req->get_params());
        if (!$project) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }
        $projectId = (string)$project['id'];
        $f = $this->supabase->request('GET', '/rest/v1/feedback', [
            'select' => 'id,selector,coordinates,comment_text,author,metadata,status,priority,url_path,image_urls,created_at',
            'id' => 'eq.' . $id,
            'project_id' => 'eq.' . $projectId,
            'limit' => '1',
        ], null, ['Accept' => 'application/json']);
        if ($f['status'] >= 300 || empty($f['body'][0])) {
            return $this->json(['error' => 'Not found'], 404);
        }
        $c = $this->supabase->request('GET', '/rest/v1/feedback_comments', [
            'select' => 'id,author_type,body,image_urls,created_at',
            'feedback_id' => 'eq.' . $id,
            'order' => 'created_at.asc',
        ], null, ['Accept' => 'application/json']);
        if ($c['status'] >= 300) {
            return $this->json(['error' => 'Failed to load comments'], 500);
        }
        return $this->json([
            'feedback' => $f['body'][0],
            'comments' => is_array($c['body']) ? $c['body'] : [],
        ], 200);
    }

    public function create_comment(WP_REST_Request $req): WP_REST_Response
    {
        $id = (string)$req['id'];
        $body = (array)$req->get_json_params();
        $project = $this->resolve_project_from_request($body);
        if (!$project) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }
        $projectId = (string)$project['id'];
        $exists = $this->supabase->request('GET', '/rest/v1/feedback', [
            'select' => 'id',
            'id' => 'eq.' . $id,
            'project_id' => 'eq.' . $projectId,
            'limit' => '1',
        ], null, ['Accept' => 'application/json']);
        if ($exists['status'] >= 300 || empty($exists['body'][0])) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }
        $authorType = strtolower(trim((string)($body['authorType'] ?? '')));
        $text = trim((string)($body['body'] ?? ''));
        $imageUrls = $this->parse_image_urls($body['imageUrls'] ?? null);
        if (!in_array($authorType, ['client', 'agency'], true)) {
            return $this->json(['error' => 'authorType must be client or agency'], 400);
        }
        if ($imageUrls === null) {
            return $this->json(['error' => 'imageUrls must be an array of http(s) URLs'], 400);
        }
        if (mb_strlen($text) > 8000) {
            return $this->json(['error' => 'body max length is 8000 chars'], 400);
        }
        if ($text === '' && count($imageUrls) === 0) {
            return $this->json(['error' => 'body or imageUrls is required'], 400);
        }
        $res = $this->supabase->request('POST', '/rest/v1/feedback_comments', [
            'select' => 'id,author_type,body,image_urls,created_at',
        ], [[
            'feedback_id' => $id,
            'author_type' => $authorType,
            'body' => $text,
            'image_urls' => $imageUrls,
        ]], [
            'Prefer' => 'return=representation',
        ]);
        if ($res['status'] >= 300 || empty($res['body'][0])) {
            return $this->json(['error' => 'Failed to save comment'], 500);
        }
        return $this->json(['comment' => $res['body'][0]], 201);
    }

    public function resolve_feedback(WP_REST_Request $req): WP_REST_Response
    {
        $id = (string)$req['id'];
        $body = (array)$req->get_json_params();
        $project = $this->resolve_project_from_request($body);
        if (!$project) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }
        if ((string)($body['status'] ?? '') !== 'resolved') {
            return $this->json(['error' => 'Only status resolved is supported'], 400);
        }
        $res = $this->supabase->request('PATCH', '/rest/v1/feedback', [
            'id' => 'eq.' . $id,
            'project_id' => 'eq.' . (string)$project['id'],
        ], ['status' => 'resolved'], [
            'Prefer' => 'return=minimal',
        ]);
        if ($res['status'] >= 300) {
            return $this->json(['error' => 'Failed to update'], 500);
        }
        return $this->json(['ok' => true], 200);
    }

    public function upload(WP_REST_Request $req): WP_REST_Response
    {
        $slug = trim((string)$req->get_param('projectSlug'));
        $key = trim((string)$req->get_param('embedPublicKey'));
        if ($slug === '' || $key === '') {
            return $this->json(['error' => 'Missing projectSlug or embedPublicKey'], 400);
        }
        $project = $this->supabase->resolve_project($slug, $key, false);
        if (!$project) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }
        $files = $req->get_file_params();
        $file = $files['file'] ?? null;
        if (!is_array($file) || empty($file['tmp_name'])) {
            return $this->json(['error' => 'Missing image file'], 400);
        }
        if ((int)($file['size'] ?? 0) > 8 * 1024 * 1024) {
            return $this->json(['error' => 'Image exceeds 8MB limit'], 400);
        }
        $up = $this->supabase->upload_file((string)$project['id'], $file);
        if (!$up) {
            return $this->json(['error' => 'Upload failed'], 500);
        }
        return $this->json(['url' => $up['url'], 'path' => $up['path']], 201);
    }
}
