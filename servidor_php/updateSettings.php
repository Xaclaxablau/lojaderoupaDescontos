<?php
header("Access-Control-Allow-Origin: *"); // ou especifique a origem, ex: http://localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once 'funcoes/funcoes.php';

$form = form();
$converted  = $form;
$dado = [];
db()->query('truncate configuration');
$dado = $converted;
db()->query("insert into configuration (dados) values ('{$dado}')");
echo json_encode(['success' => true]);
