<?php

/**
 * @Author: Nathan
 * @Date:   2019-03-08 16:38:21
 * @Last Modified by:   Nathan Feitoza
 * @Last Modified time: 2019-03-08 16:38:43
 */
namespace AppCore;

use AppCore\errors\AppException;

abstract class Controller
{
    use ControllerModelTrait;

    protected $request, $response, $args = [], $params = [], $container;
    protected $codHttp = 200, $output = '';
    protected $tipoAcessoApi = false;
    private $acessoExterno = true;

    public function __construct($container = false)
    {
        $this->container = $container;
    }

    public final function view()
    {
        return new RenderView($this->getContainer());
    }

    protected function setCodHttp($cod)
    {
        $this->codHttp = $cod;
        return $this;
    }

    protected function setOutputJson($valor, $padraoApi=true, $status=true, $codReturn=200)
    {
        $normalValor = $valor;
        $valor = is_array($valor) ? $valor : [$valor];
        $response = $this->getResponse();
        $response = $response->withHeader('Content-type', 'application/json');
        $this->setResponse($response);
        $retorno = $padraoApi ? $this->view()->msgJsonSys($normalValor,$status,$codReturn) : $valor;
        $this->setOutput( $this->view()->toJson($retorno) );
    }

    protected function setOutput($valor)
    {
        if(is_object($valor)) {
            return $this->output = $valor;
        }

        $response = $this->getResponse();
        $response = $response->withStatus($this->codHttp);
        $body = $response->getBody()->__toString();
        if(!empty($body)) $valor = $body.$valor;

        $stream = Genericos::setStream($valor);
        $this->output = $response->withBody($stream);
    }

    protected function setOutputPage($pagina, $dados = [])
    {
        $this->output = $this->view()->toPage($this->getResponse(), $pagina, $dados);
    }

    public function getOutput()
    {
        return $this->output;
    }

    public function getAllParams()
    {
        $request = $this->getRequest();
        $queryParams = $_GET;
        $input = file_get_contents("php://input");
        parse_str($input, $post_vars);
        $postParams = $post_vars;

        if(!is_null($request)) {
            $queryParams = $request->getQueryParams();
            $postParams = is_array($request->getParsedBody()) ? (array) $request->getParsedBody() : [];
        }

        return array_merge($queryParams,$postParams);
    }

    public function getParamSend($param, $exception=false,$msgNaoEncontrado='')
    {
        $get = $this->getAllParams();
        $validarP = is_array($param) ? $param : [$param];
        $validar = Genericos::camposVazios($get, $validarP);

        if($validar != 1) {
            if($exception) throw new AppException('Erro ao executar. '.$validar, 1035,401, $msgNaoEncontrado);
            return $exception;
        }

        if(count($get) == 1) return [$param => $get[$param]];

        $buscar = function($arr) use ($validarP) {
            return in_array($arr, $validarP);
        };

        return array_filter($get, $buscar, ARRAY_FILTER_USE_KEY);
    }

    /**
     * @return mixed
     */
    protected function getContainer()
    {
        return $this->container;
    }

    /**
     * @return mixed
     */
    protected function getRequest()
    {
        return $this->request;
    }

    /**
     * @param mixed $request
     */
    public function setRequest($request)
    {
        $this->request = $request;
    }

    /**
     * @return mixed
     */
    protected function getResponse()
    {
        return $this->response;
    }

    /**
     * @param mixed $response
     */
    protected function setResponse($response)
    {
        $this->response = $response;
    }

    /**
     * @return mixed
     */
    protected function getArgs()
    {
        return $this->args;
    }

    /**
     * @param mixed $args
     */
    protected function setArgs($args)
    {
        $args = isset($args["params"]) ? $args["params"] : "";
        $args = strlen($args) == 0 ? '/' : $args;
        $args = $args == '/' ? [] : explode('/',$args);

        $limpar = function($valor) {
            return !empty($valor);
        };

        $args = array_filter($args, $limpar);
        $this->args = $args;
    }

    /**
     * @return mixed
     */
    protected function getParams()
    {
        return $this->params;
    }

    /**
     * @param mixed $params
     */
    public function setParams($params)
    {
        $this->params = $params;
    }

    public function setTipoAcessoApi($tipo)
    {
        $this->tipoAcessoApi = $tipo;
    }

    public function getPaginaPaginacao()
    {
        $pagina = $this->getParamSend('pagina',false);
        $pagina = !$pagina ? 1 : $pagina['pagina'];
        return $pagina;
    }

    public function getMaxPorPaginaPaginacao()
    {
        $max = $this->getParamSend('max_por_pagina',false);
        $max = !$max ? 30 : $max['max_por_pagina'];
        return $max;
    }

    public function setMethodsAceitos($methods)
    {
        $methods = is_array($methods) ? $methods : [$methods];
        $metodoAcesso = $this->getRequest()->getMethod();

        if($metodoAcesso == 'OPTIONS') {
            $this->setOutput(true);
            return true;
        }

        if(!in_array($metodoAcesso, $methods)) {
            throw new AppException('Não é possível acessar esta rota usando o método: '.$metodoAcesso, 1012, 403);
        }
    }

    /**
     * Undocumented function
     *
     * @param [type] $campos_input
     * @param [type] $nao_listar
     * @param string | bool $mensagem (Caso seja um booleano irá retornar false se nenhum campo poderá ser listado)
     * @param integer $cod_erro
     * @return void
     */
    public function getCamposListarCrud($campos_input, $nao_listar, $mensagem = 'Nada encontrado', $cod_erro = 404)
    {
        $campos_listar = array_filter($campos_input, function($valor) use ($nao_listar) {
            return !in_array($valor, $nao_listar);
        });

        if(count($campos_listar) == 0) {
            if(is_bool($mensagem)) return false;

            throw new AppException($mensagem, $cod_erro, $cod_erro);
        }

        return $campos_listar;
    }

    public function index()
    {
        throw new AppException('Nada encontrado', 1044, 404);
        //$this->setOutputJson('',true);
    }

    public function getAcessoExterno()
    {
        return $this->acessoExterno;
    }

    public function setAcessoExterno($acessoExterno)
    {
        $this->acessoExterno = $acessoExterno;

        return $this;
    }
}