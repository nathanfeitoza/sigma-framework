<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 28/05/19
 * Time: 16:18
 */

require dirname(__DIR__) . '/defines/config.php';
require dirname(__DIR__) . '/defines/mensagem_erro_usuario.php';
require dirname(__DIR__) . '/externo/composer/autoload.php';

try {
    $classScript = new \AppCore\ScriptsLinhaComando;
} catch (\AppCore\errors\AppException $e) {
    $class = new \AppCore\ScriptsLinhaComando;
    $class->setErro($e->getMessage(), $e->getCode());
}

register_shutdown_function( "capturarErroFatal" );

function capturarErroFatal()
{
    $error = error_get_last();

    if(!is_null($error)) {
        $class = new \AppCore\ScriptsLinhaComando;
        $mensagemSalvar = 'Ocorreu um erro fatal: ' . $error["message"] . ' - Tipo: ' . $error["type"] . ' - Arquivo: ' . $error["file"] . ' - Linha: ' . $error["line"];

        $class->salvarLogScripts($mensagemSalvar, $error['type']);
    }
}