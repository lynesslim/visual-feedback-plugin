<?php
if (!class_exists('PucReadmeParser', false)):
class PucReadmeParser {
    public static function parse($file) {
        $file_content = file_get_contents($file);
        return [
            'sections' => [
                'description' => '',
                'changelog' => ''
            ]
        ];
    }
}
endif;