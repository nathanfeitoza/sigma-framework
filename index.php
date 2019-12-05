<?php
/**
 * @Author: Nathan
 * @Date:   2019-03-08 16:16:23
 * @Last Modified by:   Nathan Feitoza
 * @Last Modified time: 2019-03-28 09:18:10
 */

use \AppCore\Start;
use \AppCore\Configuracoes;

$configUsuario = './defines/config.php';
$mensagensUsuario = './defines/mensagem_erro_usuario.php';

if(file_exists($configUsuario)) require $configUsuario;
if(file_exists($mensagensUsuario)) require $mensagensUsuario;

require __DIR__.'/app/defines/config.php';
require __DIR__.'/app/defines/mensagem_erro_usuario.php';
$GLOBALS['config'] = $config;
require __DIR__.'/app/externo/composer/autoload.php';

if(@Configuracoes::get('DEBUG') != true) error_reporting(0);

$iniciar = new Start();
$iniciar->run();