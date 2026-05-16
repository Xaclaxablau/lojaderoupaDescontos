<?php
header("Access-Control-Allow-Origin: *"); // ou especifique a origem, ex: http://localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once 'funcoes/funcoes.php';

$form = form();
$iframe  = $form;
$iframe = json_encode($iframe, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$dado = [];
try {
    $img = json_decode($iframe, true)['imageUrl'];
    $img_arr = explode(',', $img);
    $img = base64_decode($img_arr[1]);
    if (file_exists('img.jpg')) {
        unlink('img.jpg');
    }
    $tipo = $img_arr[0];
    file_put_contents('img.jpg', $img);
} catch (Exception $e) {
}
db()->query('truncate iframe');
$dado = $iframe;
db()->query("insert into iframe (dados) values ('{$dado}')");
echo json_encode(['success' => true]);
exit;
