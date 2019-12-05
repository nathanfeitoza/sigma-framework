<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 19/03/19
 * Time: 16:22
 */

namespace AppController\api\entidade;


use AppCore\errors\AppException;
use AppCore\Genericos;

class ControllerFornecedor extends ControllerEntidade
{
    public function buscar()
    {
        $this->setMethodsAceitos('GET');
        $fornecedor = $this->getParamSend('fornecedor', true)['fornecedor'];
        $retorno = is_numeric($fornecedor) ? $this->model_fornecedor->getFornecedor($fornecedor) : $this->model_fornecedor->getFornecedorNome($fornecedor);
        $this->setOutputJson($retorno);
    }
}