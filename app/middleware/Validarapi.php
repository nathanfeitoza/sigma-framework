<?php
use AppCore\Genericos;
use AppCore\errors\AppException;

if (false) { //$isApi
    $allParams = $this->getAllParams();

    $this->loadModel('auth/auth');
    $this->model = $this->model_auth_auth;

    if (!Genericos::verificarCampoPreenchido($allParams,'key')){
        throw new AppException('Acesso negado a api. Não foi informada a chave de acesso a api',1018);
    }

    $chaveApi = $allParams['key'];
    $this->model->setValidarChaveApi($chaveApi);

    if (strtolower($method) == 'token') {
        $metodoHttpPadrao = 'POST';
        $this->setMethodsAceitos($metodoHttpPadrao);

        if ($isApiSecret and !$request->hasHeader('Secret-key')) {
            throw new AppException('A chave secreta da api não foi passada no corpo HTTP', 1019);
        }

        if ($isApiExterno and !$request->hasHeader('Origin')) {
            throw new AppException('Este endereço não pode acessar a api.', 1020);
        }

    } else {

        if ($this->tipoAcessoApi == 1) {

            if (!Genericos::verificarCampoPreenchido($allParams,'access_token')) {
                throw new AppException('Token de acesso não informado na requisição',1027);
            }

            $token = $allParams['access_token'];

            $csrfNameKey = $this->getSlimGuard()->getTokenNameKey();
            $csrfValueKey = $this->getSlimGuard()->getTokenValueKey();

            $vazios = Genericos::camposVazios($allParams, [$csrfNameKey,$csrfValueKey]);

            if ($vazios != 1)
                throw new AppException('Acceso negado a api. '.$vazios,1021);

            if (!$this->getSlimGuard()->validateToken($allParams[$csrfNameKey], $allParams[$csrfValueKey])) {
                throw new AppException('Tokens de autenticação são inválidos',1022);
            }

            $secret = false;

        } else {

            if (!$request->hasHeader('Authorization')) {
                throw new AppException('Token de autorização não informado no corpo do HTTP', 1028);
            }

            $token = $request->getHeader('Authorization')[0];
            $token = $this->model->getTokenAuthorization($token);

            if ($this->tipoAcessoApi == 2) {
                if (!$request->hasHeader('Secret-key')) {
                    throw new AppException('A chave secreta da api não foi passada no corpo HTTP', 1026);
                }

                $secret = $request->getHeader('Secret-key')[0];

            } elseif ($this->tipoAcessoApi == 3) {
                if (!$request->hasHeader('Origin')) {
                    throw new AppException('Origem da chamada não foi passada no corpo HTTP', 1029);
                }

                $secret = false;
            } elseif ($this->tipoAcessoApi == 4) {
                $secret = false;
            }
        }

        $dados_validados = $this->model->validarTokenOauth($token, $chaveApi, $secret, true);

        if (!$dados_validados)
            throw new AppException('Token enviado não é válido', 1030);

        $GLOBALS['dados_usuario_oauth'] = $dados_validados;
    }
}