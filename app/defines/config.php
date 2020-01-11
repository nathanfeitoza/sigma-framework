<?php

$configDefault = [
    'ROOTDIR' => rtrim(str_replace('index.php', '', $_SERVER['SCRIPT_FILENAME'])),
    'TEMA' => 'default',
    'NOME_LOG' => 'AppLog',
    'CONTROLLER' => 'Controller',
    'SLIM_SETTINGS' => ['displayErrorsDetails' => true,'debug' => true],
    'TEMPO_EXPIRA_TOKEN' => 7200,
    'DEBUG' => false,
    'USANDO_HISTORY_JS' => false,
    'DEFAULT_TIME_ZONE' => 'America/Bahia',
    'CHAVE_CRIPT_ZIP' => '',
    'CHAVE_CRIPT_USER' => '',
    'BANCO_DADOS' => [
        'TYPE' => '',
        'HOST' => '',
        'DATABASE' => '',
        'USER' => '',
        'PASS' => '',
        'OPCOES'  => [
            "nome_campos" => "MIN", 
            "CHARSET" => "utf-8", 
            "dir_log"=> "logs/"
        ],
    ]
];

$configIgualar = $configDefault;

if (isset($config)) {
    $configIgualar = array_merge($configDefault, $config);
}

$config = $configIgualar;

define('VERSION', '0.0.1');