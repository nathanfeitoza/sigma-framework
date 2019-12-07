<?php
$configDefault = [
    'ROOTDIR' => rtrim(str_replace('index.php','',$_SERVER['SCRIPT_FILENAME'])),
    'TEMA' => 'tema',
    'NOME_LOG' => 'AppLog',
    'CONTROLLER' => 'Controller',
    'SLIM_SETTINGS' => ['displayErrorsDetails' => true,'debug' => true],
    'TEMPO_EXPIRA_TOKEN' => 7200,
    'DEBUG' => false,
    'USANDO_HISTORY_JS' => false,
    'BANCO_DADOS' => [
        'TYPE' => '',
        'HOST' => '',
        'DATABASE' => '',
        'USER' => '',
        'PASS' => '',
        'OPCOES'  => ["nome_campos" => "MIN", "CHARSET" => 'utf-8', 'dir_log'=>'logs/'],
    ]
];

$configIgualar = $configDefault;

if(isset($config)) {
    $configIgualar = array_merge($configDefault, $config);
}

$config = $configIgualar;