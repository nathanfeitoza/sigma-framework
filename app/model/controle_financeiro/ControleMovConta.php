<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 01/04/19
 * Time: 11:28
 */

namespace AppModel\controle_financeiro;


use AppCore\Genericos;
use AppCore\Model;

class ControleMovConta extends Model
{

    public function getSaldoAnterior($data, $conta_corrente_id)
    {
        $saldo_anterior = $this->db()->tabela(Genericos::getSchema().'controle_mov_conta')
            ->campos(['sum(valor) as saldo'])
            ->where('data','<', $data)
            ->whereAnd('conta_corrente_id','=', $conta_corrente_id)
            ->buildQuery('select')[0];

        $saldo_anterior->SALDO = is_null( $saldo_anterior->SALDO ) ? 0 : $saldo_anterior->SALDO;

        return $saldo_anterior;
    }

    public function getSaldoAtual($data, $conta_corrente_id)
    {
        $saldo_anterior = $this->getSaldoAnterior($data, $conta_corrente_id)->SALDO;
        $saldo_atual = $this->db()->tabela(Genericos::getSchema().'controle_mov_conta')
            ->campos(['sum(valor) as saldo'])
            ->where('data','>=', $data)
            ->whereAnd('conta_corrente_id','=', $conta_corrente_id)
            ->buildQuery('select')[0];

        $saldo_atual->SALDO = is_null($saldo_atual->SALDO) ? 0 : $saldo_atual->SALDO;

        $saldo_atual->SALDO += $saldo_anterior;

        return $saldo_atual;
    }

    public function criarControleMovConta($dados)
    {
        Genericos::camposVazios($dados,['centro_de_custo','conta_corrente','data_historico',
            'documento','historico_lancamento','plano_de_conta','valor'],true);

        $transacao = $this->db();

        $transacao->iniciarTransacao();

        $adicionar = [
            'historico' => $dados['historico_lancamento'],
            'valor' => $dados['valor'],
            'tipo' => $dados['valor'] > 0 ? 'C' : 'D',
            'documento' => $dados['documento'],
            'usuario_id' => Genericos::getUsuarioSCLogado(true, false, 1),
            'data' => $dados['data_historico'],
            'plano_contas_id' => $dados['plano_de_conta'],
            'conta_corrente_id' => $dados['conta_corrente'],
            'controle_centro_custo_id' => $dados['centro_de_custo']
        ];

        $this->inserir_bd1_controle_mov_conta(array_keys($adicionar), array_values($adicionar));

        $transacao->commit();

        $ultimo = $this->db()
            ->tabela(Genericos::getSchema().'controle_mov_conta')
            ->campos(['id'])
            ->orderBy('id','desc')
            ->limit(1)
            ->buildQuery('select');

        return $ultimo[0];
    }

    public function getControleMovConta($data, $conta_corrente_id, $somente_dia = false)
    {
        $comparador = $somente_dia ? '=' : '>=';

        $dados = $this->db()
            ->tabela(Genericos::getSchema().'controle_mov_conta')
            ->campos(['id','historico','valor','documento','data','plano_contas_id','controle_centro_custo_id','conta_corrente_id'])
            ->orderBy('id','asc')
            ->where('data',$comparador,$data)
            ->whereAnd('conta_corrente_id','=', $conta_corrente_id)
            ->buildQuery('select');

        return $dados;
    }

    public function excluirControleMov($id_excluir)
    {
        $this->db()->tabela(Genericos::getSchema().'controle_mov_conta')
            ->campos(['id'])
            ->where('id','=',$id_excluir)
            ->setMsgNaoEncontrado('Nenhum lançamento encontrado com o id '.$id_excluir)
            ->buildQuery('select');

        $transa = $this->db();

        $transa->iniciarTransacao();

        $this->deletar_bd1_controle_mov_conta(function($where) use ($id_excluir){
            $where->where('id','=',$id_excluir);
        });

        $transa->commit();

        return 'Lançamento '.$id_excluir.' excluído com sucesso';
    }

    public function getResumoMovContaDiario($data, $conta_corrente, $somente_dia_atual=false)
    {
        $comparador_data = $somente_dia_atual ? '=' : '<=';
        $dados = $this->db()->tabela(Genericos::getSchema().'view_resumo_mov_conta_diario')
                    ->where('data',$comparador_data,$data)
                    ->whereAnd('conta_corrente_id','=',$conta_corrente)
                    ->buildQuery('select');

        return $dados;

    }
}