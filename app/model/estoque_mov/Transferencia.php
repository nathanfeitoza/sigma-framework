<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 19/03/19
 * Time: 09:13
 */

namespace AppModel\estoque_mov;


use AppCore\Genericos;

class Transferencia extends EstoqueMov
{
    public function getTransferencia($transferencia_id)
    {
        $cabecalho = $this
            ->setMsgNaoEncontrado('Nenhuma movimentação de estoque com o id '.$transferencia_id.' encontrada')
            ->setCamposRetornar(['id','entidade_id','data_emissao'])
            ->getEstoqueMov($transferencia_id);

        $obj_db_itens = $this->getObjDb()
            ->leftJoin(Genericos::getSchema().'view_produtos b','b.id = a.produto_id')
            ->leftJoin(Genericos::getSchema().'view_produto_grades c','c.id = a.produto_grade_id')
            ->orderBy('id','asc');

        $retorno = [
            'CABECALHO' => $cabecalho,
            'ITENS' => $this->setCamposRetornar(['a.id','a.produto_id',
                'b.nome as desc_produto','a.cfop as cfop_transferencia',
                'a.produto_grade_id','c.cor','c.tamanho','a.quantidade',
                'a.preco_compra','a.unidade_id as unidade_medida',
                'a.setor_id as setor_origem',
                'a.setor_id_transf as setor_destino'])
                ->setMsgNaoEncontrado('Nenhum item encontrado para a movimentação de estoque '.$transferencia_id)
                ->setObjDb($obj_db_itens)
                ->setAliasTabela('a')
                ->getEstoqueMovItem($transferencia_id)
        ];

        return $retorno;
    }

    public function addTransferencia($adicionar)
    {
        $necessarios_cabecalho = ['entidade_id','data_transferencia','setor_origem','setor_destino'];
        Genericos::camposVazios($adicionar, $necessarios_cabecalho, true);

        $entidade_id = $adicionar[$necessarios_cabecalho[0]];
        $data_transferencia = $adicionar[$necessarios_cabecalho[1]];
        $setor_origem = $adicionar[$necessarios_cabecalho[2]];
        $setor_destino = $adicionar[end($necessarios_cabecalho)];
        $documento = date('ymdHs');
        $tipo_mov = 2;
        $modelo_documento = 99;
        $usuario_id = Genericos::getUsuarioSCLogado(true, false);
        $usuario_id = ($usuario_id == false) ? 1930 : $usuario_id;

        $necessarios_produtos = ['id_produto','cfop','preco_compra','unidade','quantidade']; // grade_id opcional

        $id_produtos = $adicionar[$necessarios_produtos[0]];
        $transacao = $this->db();
        $transacao->iniciarTransacao();
        
        $estoque_mov_id = Genericos::verificarCampoPreenchido($adicionar, 'estoque_mov_id');
        $estoque_mov_id = $estoque_mov_id ? $adicionar['estoque_mov_id'] : false;
        $estoque_mov_id_old = $estoque_mov_id;

        if ($estoque_mov_id != false) {
            $this->deletar_bd1_estoque_mov(function($where) use ($estoque_mov_id) {
                $where->where('id', '=', $estoque_mov_id);
            });
        }

        // Gravar cabeçalho
        $this->inserir_bd1_estoque_mov(
                ['entidade_id','data_emissao','data_mov','documento','tipo_mov',
                'modelo_documento','usuario_id'],
                [$entidade_id, $data_transferencia,date('Y-m-d'), $documento,
                $tipo_mov,$modelo_documento, $usuario_id]
            );

        $estoque_mov_id = $transacao->tabela(Genericos::getSchema() . 'estoque_mov')
            ->campos(['id'])
            ->limit(1)
            ->orderBy('id','desc');

        $estoque_mov_id = $estoque_mov_id->buildQuery('select')[0]->ID;

        if ($estoque_mov_id_old != false) {
            $this->atualizar_bd1_estoque_mov('id',$estoque_mov_id_old,
                function($where) use ($estoque_mov_id){
                    $where->where('id','=', $estoque_mov_id);
                }
            );

            $estoque_mov_id = $estoque_mov_id_old;
        }

        // Gravar itens
        foreach ($id_produtos as $i => $produto_id) {
            $cfop = $adicionar[$necessarios_produtos[1]][$i];
            $preco_compra = $adicionar[$necessarios_produtos[2]][$i];
            $unidade_id = $adicionar[$necessarios_produtos[3]][$i];
            $unidade_id = str_replace('.','',$unidade_id);
            $unidade_id = str_replace(',','.',$unidade_id);
            $unidade_id = (int) $unidade_id;

            $quantidade = $adicionar[end($necessarios_produtos)][$i];
            $grade_id = null;
            $mov_estoque = 1;
            $item = $i + 1;

            if (isset($adicionar['grade_id'])) {
                if (Genericos::verificarCampoPreenchido($adicionar['grade_id'], $i)) {
                    $grade_id = $adicionar['grade_id'][$i];
                }
            }

            $this->inserir_bd1_estoque_mov_item(
                ['estoque_mov_id','item','setor_id','setor_id_transf','quantidade','produto_id','mov_estoque',
                    'cfop','produto_grade_id','entidade_id','preco_compra','unidade_id'],
                [$estoque_mov_id,$item,$setor_origem, $setor_destino,$quantidade,$produto_id,
                    $mov_estoque,$cfop,$grade_id,$entidade_id,$preco_compra, $unidade_id]
            );
        }

        $transacao->commit();

        return ['msg' => 'Transferência '.$estoque_mov_id.' concluída com sucesso', 'estoque_mov_id' => $estoque_mov_id];
    }
}