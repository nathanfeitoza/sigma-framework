<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 18/03/19
 * Time: 10:33
 */

namespace AppController\api\controle_financeiro;


use AppCore\Controller;

class ControllerLote extends Controller
{
    public function buscar()
    {
        $this->setMethodsAceitos('GET');
        $this->loadModel('controle_financeiro/controle_financeiro');
        $model = $this->model_controle_financeiro_controle_financeiro;

        $doc_lote = $this->getParamSend('doc_lote',true)['doc_lote'];
        $id_lote = $this->getParamSend('id_lote',true)['id_lote'];
        $completo = $this->getParamSend('completo');
        $completo = $completo == false ? false : $completo['completo'];

        $model->setMsgNaoEncontrado('Nenhuma informação encontrada para o lote de documento '.$doc_lote);

        $this->setOutputJson($model->getLote($id_lote, $completo));
    }
}