<?php
$env = parse_ini_file('.env');
$servidor = $env['SERVER'];
$db = $env['DB'];
$user = $env['USER'];
$pass = $env['PASSWORD'];
$pdo = new PDO("mysql:host=$servidor;dbname=$db", $user, $pass);
