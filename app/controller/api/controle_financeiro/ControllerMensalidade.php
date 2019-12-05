<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 17/03/19
 * Time: 12:29
 */

namespace AppController\api\controle_financeiro;


use AppCore\Controller;

class ControllerMensalidade extends Controller
{
    public function buscar()
    {
        $this->setMethodsAceitos('GET');
        $this->loadModel('controle_financeiro/mensalidade');
        $model = $this->model_controle_financeiro_mensalidade;

        $validar = $this->getParamSend(['data_consultar','tipo_consultar'],true);
        $data_consultar = $validar['data_consultar'];
        $tipo_consultar = (int) $validar['tipo_consultar'];

        $this->setOutputJson($model->getMensalidades($data_consultar, $tipo_consultar));
    }

    public function gerar()
    {
        $this->setMethodsAceitos('PUT');

        $this->loadModel('controle_financeiro/mensalidade');
        $model = $this->model_controle_financeiro_mensalidade;

        $data_gerar = $this->getParamSend('data_gerar', true)['data_gerar'];
        $data_gerar = $data_gerar.'-01';

        $this->setOutputJson($model->gerarMensalidades($data_gerar));
    }
}