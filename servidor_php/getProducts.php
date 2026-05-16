<?php
header("Access-Control-Allow-Origin: *"); // ou especifique a origem, ex: http://localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once 'funcoes/funcoes.php';

$db = db()->query("SELECT * FROM products");
$products = $db->fetchAll(PDO::FETCH_ASSOC);
$products_formated = array_map(function ($product) {
    $product['id'] = $product['id'];
    $dados = json_decode($product['dados'], true);
    foreach ($dados as $key => $value) {
        $product[$key] = $value;
    }
    unset($product['dados']);
    return $product;
}, $products);
echo json_encode($products_formated, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
