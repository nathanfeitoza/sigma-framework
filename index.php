<?php
/**
 * @Author: Nathan
 * @Date:   2019-03-08 16:16:23
 * @Last Modified by:   Nathan Feitoza
 * @Last Modified time: 2019-03-28 09:18:10
 */

use \AppCore\Start;
use \AppCore\Configuracoes;

$pastaDefines = 'defines';

$arquivosConfiguracoesAdicionar = [
    'config',
    'mensagem_erro_usuario'
];

foreach($arquivosConfiguracoesAdicionar as $arquivoConfig) {
    $arquivoConfig .= '.php';
    
    $configEspecifico = './' . $pastaDefines . '/' . $arquivoConfig;
    $configDefault = __DIR__ . '/app/' . $pastaDefines . '/' . $arquivoConfig;
    
    if (file_exists($configEspecifico)) require_once $configEspecifico;    
    
    require_once $configDefault;    
}

$GLOBALS['config'] = $config;
require __DIR__.'/app/externo/composer/autoload.php';

if(@Configuracoes::get('DEBUG') != true) error_reporting(0);

$iniciar = new Start();
$iniciar->run();