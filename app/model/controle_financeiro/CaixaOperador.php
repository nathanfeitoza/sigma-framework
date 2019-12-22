<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 25/06/19
 * Time: 09:48
 */

namespace AppModel\controle_financeiro;


use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;

class CaixaOperador extends Model
{

    public function getCaixa($id_caixa)
    {
        return $this->setFalseException(true)->db()->tabela(Genericos::getSchema() . 'controle_financeiro_caixa_operador')
                ->where('id','=',$id_caixa)
                ->buildQuery('select');
    }

    public function getCaixaOperador($data)
    {
        $dados = $this->db()->tabela(Genericos::getSchema() . 'view_controle_financeiro_caixa_operador')
            ->campos(['*'])
            ->where('data','=',$data)
            ->setMsgNaoEncontrado('Nenhuma movimentação encontrada')
            ->buildQuery('select');

        return $dados;
    }

    public function getResumoPagamentos($data_emissao, $turno, $caixa_id)
    {
        /*$dados = $this->db()->tabela(Genericos::getSchema() . 'view_produtos_saidas_pagto')
            ->campos(['nome','sum(valor) as valor'])
            ->where('data_emissao','=',$data_emissao)
            ->whereAnd('turno','=',$turno)
            ->whereAnd('caixa_id','=', $caixa_id)
            ->groupBy('nome')
            ->setMsgNaoEncontrado('Nenhum registro encontrado')
            ->buildQuery('select');*/

        $dados = $this->db()->tabela(Genericos::getSchema() . 'view_controle_financeiro_caixa_operador')
            ->where('data','=',$data_emissao)
            ->whereAnd('turno','=',$turno)
            ->whereAnd('operador_id','=', $caixa_id)
            ->setMsgNaoEncontrado('Nenhum registro encontrado')
            ->buildQuery('select');

        return $dados;
    }

    public function updateValorCaixa($id_caixa, $novo_valor, $forma_pagto_id)
    {
        if (!$this->getCaixa($id_caixa)) throw new AppException('Este caixa não existe', 18158);

        $transacao = $this->db();

        $transacao->iniciarTransacao();

        foreach ($novo_valor as $i => $valor_salvar) {
            if (isset($forma_pagto_id[$i])) {

                $formaPagtoId = $forma_pagto_id[$i];

                $this->atualizar_bd1_controle_financeiro_caixa_operador(['valor'], [$valor_salvar], function ($where) use ($id_caixa, $formaPagtoId) {
                    $where->where('id', '=', $id_caixa)
                        ->whereAnd('forma_pagamento_id', '=', $formaPagtoId);
                });
            }
        }

        $transacao->commit();

        return 'Caixa '.$id_caixa.' atualizado o valor';
    }
}