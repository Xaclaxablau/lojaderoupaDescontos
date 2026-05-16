<?php
header("Access-Control-Allow-Origin: *"); // ou especifique a origem, ex: http://localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once 'funcoes/funcoes.php';
$form = form();
if (isset($form['email']) && isset($form['password'])) {
    $email = $form['email'];
    $password = $form['password'];
    $db = db()->query("SELECT * FROM users WHERE email = '$email' AND password = '$password'");
    $user = $db->fetch(PDO::FETCH_ASSOC);
    echo json_encode($user);
} else {
    echo json_encode([]);
}
