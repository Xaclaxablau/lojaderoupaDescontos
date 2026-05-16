<?php
header("Access-Control-Allow-Origin: *"); // ou especifique a origem, ex: http://localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once 'funcoes/funcoes.php';

$form = form();
$converted  = $form;
$dado = [];
db()->query('delete from products');
foreach ($converted as $key => $value) {
    $dado = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    db()->query("insert into products (dados) values ('{$dado}')");
}
echo json_encode(['success' => true]);
