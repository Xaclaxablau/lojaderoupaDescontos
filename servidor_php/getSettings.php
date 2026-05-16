<?php
header("Access-Control-Allow-Origin: *"); // ou especifique a origem, ex: http://localhost:3000
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

require_once 'funcoes/funcoes.php';

$db = db()->query("SELECT * FROM configuration WHERE id = 1");
$settings = $db->fetch(PDO::FETCH_ASSOC);
$settings_formated = $settings['dados'];
function sanitize_json_string($value)
{
    return preg_replace('/[[:cntrl:]]/', '', $value);
}
$settings_formated = sanitize_json_string($settings_formated);
echo $settings_formated;
