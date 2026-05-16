<?php
header("Access-Control-Allow-Origin: *"); // ou especifique a origem, ex: http://localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once 'funcoes/funcoes.php';

$form = form();
$financeiro  = $form;
$financeiro = json_encode($financeiro, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$dado = [];
db()->query('truncate financeiro');
$dado = $financeiro;
db()->query("insert into financeiro (dados) values ('{$dado}')");
echo json_encode(['success' => true]);
exit;
