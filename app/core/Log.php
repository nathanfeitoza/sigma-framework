<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 12/03/19
 * Time: 20:28
 */

namespace AppCore;


use Monolog\Handler\StreamHandler;
use Monolog\Logger;

class Log
{

    public static function logger($rastro=true)
    {
        $logger = new Logger(Configuracoes::get('NOME_LOG'));
        
        $nomeArquivo = date('d-m-Y');
        
        $file_handler = new StreamHandler(Configuracoes::get('ROOTDIR') .
        '/app/storage/logs/' . $nomeArquivo . '.app.log');

        $logger->pushHandler($file_handler); // Salva o handler e está pronto para uso

        return $logger;
    }
}