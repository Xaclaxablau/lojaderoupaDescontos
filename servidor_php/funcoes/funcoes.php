<?php
require_once 'conexao/conexao.php';
function form()
{
    $request = json_decode(file_get_contents('php://input'), true);
    if (isset($request)) {
        if (!empty($request)) {
            return $request;
        }
    }
    $request = $_REQUEST;
    if (isset($request)) {
        if (!empty($request)) {
            return $request;
        }
    }
    $request = $_POST;
    if (isset($request)) {
        if (!empty($request)) {
            return $request;
        }
    }
    $request = $_GET;
    if (isset($request)) {
        if (!empty($request)) {
            return $request;
        }
    }
    return [];
}

function db()
{
    global $pdo;
    return $pdo;
}
