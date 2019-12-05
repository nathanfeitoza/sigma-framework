<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 15/03/19
 * Time: 11:33
 */

namespace AppController\api\entidade;


use AppCore\Controller;
class ControllerCliente extends ControllerEntidade
{
    public function __construct($container = false)
    {
        parent::__construct($container);
        $this->model_cliente->setMsgNaoEncontrado('Nenhum cliente encontrado');
    }

    public function listar()
    {
        $this->setMethodsAceitos('GET');
        $this->setOutputJson($this->model_cliente->setPaginacao($this->getAllParams())->getClientes());
    }


    public function buscar()
    {
        $this->setMethodsAceitos('GET');
        $cliente = $this->getParamSend('cliente', true)['cliente'];
        $retorno = is_numeric($cliente) ? $this->model_cliente->getCliente($cliente) : $this->model_cliente->getClienteNome($cliente);
        $this->setOutputJson($retorno);
    }
}