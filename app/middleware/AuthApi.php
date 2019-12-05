<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 04/09/19
 * Time: 21:17
 */

namespace Middleware;

use AppCore\Configuracoes;
use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;

class AuthApi extends Model
{
    const AUTH_CLIENT = 1;
    const AUTH_APP = 2;

    private $request;
    private $response;
    private $tipoAutenticacao;
    private $requerLoginSenha;

    public function __construct($tipoAutenticacao, $requerLoginSenha = false)
    {
        $this->tipoAutenticacao = $tipoAutenticacao;
        $this->requerLoginSenha = $requerLoginSenha;
    }

    public function __invoke($request, $response, $next)
    {
        $this->request = $request;
        $this->response = $response;
        
        preg_match('/\/token$/i', $request->getUri()->getPath(), $isToken);
        $isToken = count($isToken) > 0;
        
        if(!$isToken) $this->validarApi();

        //$response->getBody()->write('BEFORE');
        $response = $next($request, $response);
        //$response->getBody()->write('AFTER');

        return $response;
    }

    public function validarHeaderAutenticadores($verificarBearer = false, $params = null)
    {
        $necessariosHeaders = ['HTTP_CLIENT_ID'];
        $necessariosParametros = ['client_id'];

        switch($this->tipoAutenticacao) {
            case self::AUTH_APP:
                $necessariosHeaders[] = 'HTTP_CLIENT_SECRET';
                $necessariosParametros[] = 'client_secret';
                break;
        }

        if(!$verificarBearer && $this->requerLoginSenha) {
            $necessariosHeaders[] = 'HTTP_LOGIN';
            $necessariosHeaders[] = 'HTTP_PASSWORD';
            $necessariosParametros[] = 'login';
            $necessariosParametros[] = 'password';
        }

        if($verificarBearer) $necessariosHeaders[] = 'HTTP_BEARER';
        
        $headers = $this->request->getHeaders();
        $verificarHeaders = Genericos::camposVazios($headers, $necessariosHeaders);
        $erro = false;

        if(is_string($verificarHeaders)) $erro = ['erro' => 'header', 'msg' => $verificarHeaders]; 

        if(!is_null($params)) {
            $erro = false;
            $verificarParams = Genericos::camposVazios($params, $necessariosParametros);
            
            if(is_string($necessariosParametros)) $erro = ['erro' => 'header', 'msg' => $verificarParams];
        }

        if(is_array($erro)) return $erro;

        return true;
    }

    public function validarApi()
    {
        $this->validarHeaderAutenticadores(true);
    }

    public function validarRotaToken($params = null)
    {
        $validacao = $this->validarHeaderAutenticadores(false, $params);

        if(!is_bool($validacao)) {
            throw new AppException($validacao['msg'], 46114);
        }

        $this->loadModel('auth/auth');
        $modelAuth = $this->model_auth_auth;
        
        return $modelAuth->getReturnOatuh(['token' => 'teste']);
    }

    public function setRequest($request)
    {
        $this->request = $request;

        return $this;
    }

    public function setResponse($response)
    {
        $this->response = $response;

        return $this;
    }
}