<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 25/06/19
 * Time: 09:49
 */

namespace AppController\api\controle_financeiro;


use AppCore\Controller;

class ControllerCaixaOperador extends Controller
{
    protected function model()
    {
        $this->loadModel('controle_financeiro/caixa_operador');

        return $this->model_controle_financeiro_caixa_operador;
    }

    public function listarCaixaOperador()
    {
        $this->setMethodsAceitos('GET');

        $data = $this->getParamSend('data', true)['data'];

        $this->setOutputJson($this->model()->getCaixaOperador($data));
    }

    public function listarDocumentosCaixaOperador()
    {
        $this->setMethodsAceitos('GET');

        $dados = $this->getParamSend(['data','turno','operador_id'], true);

        $this->loadModel('estoque_mov/estoque_mov');
        $model = $this->model_estoque_mov_estoque_mov;

        $novoDb = $model->db()
            ->campos(['documento','data_emissao','valor'])
            ->where('data_emissao', '=', $dados['data'])
            ->whereAnd('turno', '=', $dados['turno'])
            ->whereAnd('caixa_id', '=', $dados['operador_id'])
            ->orderBy('documento','asc');

        $model->setObjDb($novoDb);

        $this->setOutputJson($model->getProdutosSaidas());
    }

    public function listarResumoPagamentos()
    {
        $this->setMethodsAceitos('GET');

        $dados = $this->getParamSend(['data_emissao','turno','caixa_id'],true);

        $this->setOutputJson( $this->model()->getResumoPagamentos($dados['data_emissao'], $dados['turno'], $dados['caixa_id']) );
    }

    public function atualizarValorCaixaOperador()
    {
        $this->setMethodsAceitos('PUT');

        $dados = $this->getParamSend(['id_caixa','valor','forma_pagto_id'], true);

        $this->setOutputJson( $this->model()->updateValorCaixa($dados['id_caixa'], $dados['valor'], $dados['forma_pagto_id']) );
    }
}