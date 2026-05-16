<?php
header("Access-Control-Allow-Origin: *"); // ou especifique a origem, ex: http://localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once 'funcoes/funcoes.php';

$form = form();
db()->query('truncate iframe');
echo json_encode(['success' => true]);
exit;
