<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 17/03/19
 * Time: 01:03
 */

namespace AppController\api\entidade;


class ControllerFuncionario extends ControllerEntidade
{
    public function __construct($container = false)
    {
        parent::__construct($container);
        $this->model_funcionarios->setMsgNaoEncontrado('Nenhum funcionário encontrada');
    }

    public function listar()
    {
        $this->setMethodsAceitos('GET');
        $this->setOutputJson($this->model_funcionarios->setPaginacao($this->getAllParams())->getFuncionarios());
    }

    public function buscar()
    {
        $this->setMethodsAceitos('GET');
        $funcionario = $this->getParamSend('funcionario', true)['funcionario'];
        $retorno = is_numeric($funcionario) ? $this->model_funcionarios->getFuncionario($funcionario) : $this->model_funcionarios->getFuncionarioNome($funcionario);
        $this->setOutputJson($retorno);
    }
}