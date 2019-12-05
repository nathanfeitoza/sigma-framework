<?php

/**
 * Created by Nathan Feitoza (Sigma).
 * Date: 10/25/2019
 * Time: 12:35
 */

namespace AppController\api\testar;

use AppCore\Controller;
use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Log;

class ControllerTeste extends Controller
{

    public function adicionar() 
    {
        $this->setMethodsAceitos(["POST"]);
        $this->loadModel("testar/teste");
        $model = $this->model_testar_teste;

        $this->setOutputJson($model->adicionar($this->getAllParams()));
    }

    public function atualizar() 
    {
        $this->setMethodsAceitos(["PUT"]);
        $this->loadModel("testar/teste");
        $model = $this->model_testar_teste;

        $this->setOutputJson($model->atualizar($this->getAllParams()));
    }

    public function deletar() 
    {
        $this->setMethodsAceitos(["DELETE"]);
        $this->loadModel("testar/teste");
        $model = $this->model_testar_teste;
        $id = $this->getParamSend("id", true)["id"];

        $this->setOutputJson($model->deletar($id));
    }

    public function listar() 
    {
        $this->setMethodsAceitos(["GET"]);
        $this->loadModel("testar/teste");
        $model = $this->model_testar_teste;
        $campos = $this->getParamSend("campos");
        $query = $this->getParamSend("query");
        $model->setPaginacao($this->getAllParams());

        if($campos !== false) {
            $campos_listar = $campos["campos"];
            $model->setCamposRetornar($campos_listar);
        }

        $this->setOutputJson($model->listar($query));
    }
}
