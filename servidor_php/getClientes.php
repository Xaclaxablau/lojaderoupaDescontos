<?php
header("Access-Control-Allow-Origin: *"); // ou especifique a origem, ex: http://localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once 'funcoes/funcoes.php';

$db = db()->query("SELECT * FROM clientes order by id desc limit 1");
$clientes = $db->fetch(PDO::FETCH_ASSOC);
if (empty($clientes)) {
    echo json_encode([], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
echo $clientes['dados'];
