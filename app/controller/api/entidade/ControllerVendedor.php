<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 17/03/19
 * Time: 01:16
 */

namespace AppController\api\entidade;


class ControllerVendedor extends ControllerEntidade
{
    public function __construct($container = false)
    {
        parent::__construct($container);
        $this->model_vendedores->setMsgNaoEncontrado('Nenhum vendedor encontrado');
    }

    public function listar()
    {
        $this->setMethodsAceitos('GET');
        $this->setOutputJson($this->model_vendedores->setPaginacao($this->getAllParams())->getVendedores());
    }

    public function buscar()
    {
        $this->setMethodsAceitos('GET');
        $vendedor = $this->getParamSend('vendedor', true)['vendedor'];
        $this->model_vendedores->setCamposRetornar(['id','nome']);
        $retorno = is_numeric($vendedor) ? $this->model_vendedores->getVendedor($vendedor) : $this->model_vendedores->getVendedorNome($vendedor);
        $this->setOutputJson($retorno);
    }
}