<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 09/03/19
 * Time: 21:25
 */

namespace AppCore\errors;

use AppCore\Configuracoes;
use AppCore\Genericos;
use AppCore\Log;
use Throwable;
use Exception;

class AppException extends Exception
{
    private $codeHttp = 403, $msgUsuario = '';

    public function __construct($message = "", $code = 0, $codeHttp = 500, $msgUsuario = '', Throwable $previous = null)
    {
        $this->codeHttp = $codeHttp;
        $this->msgUsuario = strlen($msgUsuario) == 0 ? $message : $msgUsuario;

        if(!Configuracoes::get('DEBUG')) {
            $mensagensErroUsuario = MENSAGENS_ERROS_USUARIO;

            $this->msgUsuario = !(@empty($mensagensErroUsuario[$code])) ? $mensagensErroUsuario[$code] : $this->msgUsuario;
        }

        parent::__construct($message, $code, $previous);
        self::gerarLog($this);
    }

    public static function gerarLog($e)
    {
        $codeHttp = 403;
        $msgUsuario = '';

        if(method_exists($e, 'getCodeHttp')) $codeHttp = $e->getCodeHttp();
        if(method_exists($e, 'getMsgUsuario')) $msgUsuario = $e->getMsgUsuario();

        $rastro = json_encode(['rastro' => $e->getTraceAsString()]);

        $msgErro = $e->getMessage().
            ' - Cod: '.$e->getCode().
            ' - CodeHtpp: '.$codeHttp.
            ' - Msg_Usuario: '.$msgUsuario.
            ' - Arquivo: '.$e->getFile().
            ' - Linha: '.$e->getLine().
            ' - Rastro: '.$rastro;
        Log::logger()->addError($msgErro);
    }

    public function getCodeHttp()
    {
        return $this->codeHttp;
    }

    public function getMsgUsuario()
    {
        return $this->msgUsuario;
    }
}