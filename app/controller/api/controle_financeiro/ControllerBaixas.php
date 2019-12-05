<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 18/03/19
 * Time: 09:36
 */

namespace AppController\api\controle_financeiro;


use AppCore\Controller;
use AppCore\errors\AppException;
use AppCore\Genericos;

class ControllerBaixas extends Controller
{
    public function listar()
    {
        $this->setMethodsAceitos('GET');
        $this->loadModel('controle_financeiro/controle_financeiro');
        $model = $this->model_controle_financeiro_controle_financeiro;

        $necessarios = $this->getParamSend(['entidade','data_periodo'], true);

        $entidade = $necessarios['entidade'];

        $data_periodo = $necessarios['data_periodo'];
        $data_periodo = is_array($data_periodo) ? $data_periodo : [$data_periodo];

        $tipo_controle = $this->getParamSend('tipo_controle');
        $tipo_controle = $tipo_controle == false ? 1 : $tipo_controle['tipo_controle'];

        $tipo_busca = $this->getParamSend('tipo_busca');
        $tipo_busca = $tipo_busca == false ? 3 : $tipo_busca['tipo_busca'];

        $desfazer = $this->getParamSend('defazer');
        $desfazer = $desfazer == false ? false : $desfazer['desfazer'];

        $msg_nada = 'Nenhuma conta encontrada para a entidade: '.$entidade
                    .' no período de '.implode(' a ',$data_periodo);

        $model->setMsgNaoEncontrado($msg_nada);

        $retornar = $model->getBaixaDeContas($entidade, $data_periodo, $tipo_controle, $tipo_busca, $desfazer);

        $this->setOutputJson($retornar);
    }

    public function baixarBoleto()
    {
        $this->setMethodsAceitos('POST');

        $this->loadModel('controle_financeiro/controle_financeiro');
        $model = $this->model_controle_financeiro_controle_financeiro;

        $boletos_baixar = $this->getParamSend('boletos_baixar',true);
        $boletos_baixar = $boletos_baixar['boletos_baixar'];

        $dados_boletos = Genericos::jsonDecode($boletos_baixar,'Os dados passados dos boletos não são um arquivo de json válido');

        $this->setOutputJson($model->setBaixarBoletosRetorno($dados_boletos));
    }
}