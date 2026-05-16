<?php
header("Access-Control-Allow-Origin: *"); // ou especifique a origem, ex: http://localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once 'funcoes/funcoes.php';

$form = form();
$clientes  = $form;
$clientes = json_encode($clientes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$dado = [];
db()->query('truncate clientes');
$dado = $clientes;
db()->query("insert into clientes (dados) values ('{$dado}')");
echo json_encode(['success' => true]);
exit;
