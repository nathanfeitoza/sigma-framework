<?php

namespace AppCore;

use AppCore\errors\AppException;
use Middleware\AuthApi;

abstract class ControllerApi extends Controller
{
    private $desativarAuth = false;
    private $ativarRequestToken = false;
    private $tipoAutenticacao = AuthApi::AUTH_CLIENT;
    private $tokenRequerLoginSenha = false;
    
    private function getAuthApi()
    {
        return new AuthApi(
            $this->tipoAutenticacao, 
            $this->tokenRequerLoginSenha
        );
    }

    public function middleware()
    {
        $authApi = $this->getAuthApi();
        
        $retornar = [];
        
        if(!$this->desativarAuth) $retornar[] = $authApi;

        return $retornar;
    }

    public function token()
    {
        $this->setMethodsAceitos('POST');

        if($this->ativarRequestToken) {
            $authApi = $this->getAuthApi();
            $authApi->setRequest($this->getRequest())
            ->setResponse($this->getResponse());
            
            $this->setOutputJson(
                $authApi->validarRotaToken($this->getAllParams()),
                false
            );
            return;
        }

        throw new AppException('Página não encontrada', 404, 404);
    }

    protected function desativarAuth($desativarAuth = true)
    {
        $this->desativarAuth = $desativarAuth;

        return $this;
    }

    protected function ativarRequestToken($ativarRequestToken = true)
    {
        $this->ativarRequestToken = $ativarRequestToken;

        return $this;
    }

    protected function setTipoAutenticacao($tipoAutenticacao)
    {
        $this->tipoAutenticacao = $tipoAutenticacao;

        return $this;
    }

    public function setTokenRequerLoginSenha($tokenRequerLoginSenha = true)
    {
        $this->tokenRequerLoginSenha = $tokenRequerLoginSenha;

        return $this;
    }
}