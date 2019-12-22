<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 01/04/19
 * Time: 10:38
 */

namespace AppController\api\controle_financeiro;


use AppCore\Controller;
use AppCore\errors\AppException;

class ControllerControleFinanceiro extends Controller
{
    protected function model()
    {
        $this->loadModel('controle_financeiro/controle_mov_conta');
        return $this->model_controle_financeiro_controle_mov_conta;
    }

    public function adicionarControleMov()
    {
        $this->setMethodsAceitos('POST');

        $adicionar = $this->getAllParams();

        $this->setOutputJson($this->model()->criarControleMovConta($adicionar));
    }

    public function saldoMovConta()
    {
        $this->setMethodsAceitos('GET');

        $dados = $this->getParamSend(['data','conta_corrente'], true);

        $data = $dados['data'];
        $conta_corrente = $dados['conta_corrente'];

        $params = $this->getParams();
        $tipo = isset($params[1]) ? $params[1] : 'atual';
        $tipo = strtolower($tipo);

        if ($tipo == 'atual') {
            $retornar = $this->model()->getSaldoAtual($data, $conta_corrente);
        } else {
            $retornar = $this->model()->getSaldoAnterior($data, $conta_corrente);
        }

        $this->setOutputJson($retornar);
    }

    public function removerControleMov()
    {
        $this->setMethodsAceitos('DELETE');

        $dados = $this->getParamSend(['id_excluir','data','conta_corrente'], true);

        $id_excluir = $dados['id_excluir'];
        $data = $dados['data'];
        $conta_corrente = $dados['conta_corrente'];

        $msg = $this->model()->excluirControleMov($id_excluir);
        $saldo_atual = $this->model()->getSaldoAtual($data,$conta_corrente);

        $this->setOutputJson(['msg' => $msg, 'saldo_atual' => $saldo_atual]);
    }

    public function getMovConta()
    {
        $this->setMethodsAceitos('GET');

        $dados = $this->getParamSend(['data','conta_corrente'], true);

        $data = $dados['data'];
        $conta_corrente = $dados['conta_corrente'];
        $somente_dia = $this->getParamSend('somente_dia');
        $somente_dia = $somente_dia != false;

        $msg_nao_encontrado = 'Nenhuma controle de contas encontrado para a data '.date('d/m/Y', strtotime($data)). ' na conta corrente de id '.$conta_corrente;

        $retornar['SALDO_ANTERIOR'] = $this->model()->getSaldoAnterior($data, $conta_corrente);
        $retornar['DADOS'] = $this->model()
            ->setFalseException(true)
            ->getControleMovConta($data, $conta_corrente, $somente_dia);

        $status = true;
        $cod = 200;

        if (is_bool($retornar['DADOS'])) {
            $this->setCodHttp(404);
            $retornar['DADOS'] = $msg_nao_encontrado;
            $status = false;
            $cod = 404;
        }

        $this->setOutputJson($retornar, true, $status, $cod);
    }

    public function resumoMovContaDiario()
    {
        $this->setMethodsAceitos('GET');

        $params = $this->getParams();
        $so_do_dia = isset($params[1]) ? $params[1] : '';
        $so_do_dia = strtolower($so_do_dia) == 'dia';

        $dados = $this->getParamSend(['data','conta_corrente'],true);
        $data = $dados['data'];
        $conta_corrente = $dados['conta_corrente'];

        $retornar = $this->model()
            ->setMsgNaoEncontrado('Nenhum registro encontrado para a movimentação da data '.date('d/m/Y',strtotime($data)).' para a conta corrente '.$conta_corrente)
            ->setCamposRetornar(['id','plano_conta','total'])
            ->getResumoMovContaDiario($data, $conta_corrente, $so_do_dia);

        $this->setOutputJson($retornar);
    }
}