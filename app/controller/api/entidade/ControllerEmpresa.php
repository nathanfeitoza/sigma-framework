<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 19/03/19
 * Time: 16:25
 */

namespace AppController\api\entidade;


class ControllerEmpresa extends ControllerEntidade
{
    public function exibir()
    {
        $retorno = $this->model_empresa->setMsgNaoEncontrado('Empresa não configurada')->getEmpresa();
        $this->setOutputJson($retorno);
    }
}