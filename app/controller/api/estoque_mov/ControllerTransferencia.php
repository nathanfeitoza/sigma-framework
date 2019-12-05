<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 19/03/19
 * Time: 09:29
 */
namespace AppController\api\estoque_mov;


use AppCore\Genericos;

class ControllerTransferencia extends ControllerEstoqueMov
{
    public function buscar()
    {
        $this->setMethodsAceitos('GET');
        $this->loadModel('estoque_mov/transferencia');
        $model = $this->model_estoque_mov_transferencia;

        $transferencia_id = $this->getParamSend('transferencia_id', true);

        $this->setOutputJson($model->getTransferencia($transferencia_id['transferencia_id']));
    }

    public function adicionar()
    {
        $this->setMethodsAceitos('POST');
        $this->loadModel('estoque_mov/transferencia');
        $model = $this->model_estoque_mov_transferencia;

        $dados_gravar = $this->getParamSend('dados_gravar',true)['dados_gravar'];
        $dados_gravar = (array) Genericos::jsonDecode($dados_gravar,'Json da transferência está inválido');

        $this->setOutputJson($model->addTransferencia($dados_gravar));
    }
}