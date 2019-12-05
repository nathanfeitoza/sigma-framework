<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 17/03/19
 * Time: 02:59
 */

namespace AppModel\produto;


use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;

class PreVenda extends Model
{
    public function getPreVenda($produto_pre_venda_id) {
        return $this->db()->tabela(Genericos::getSchema().'produto_pre_venda')
                ->where('id','=',$produto_pre_venda_id)
                ->buildQuery('select');
    }

    public function getPreVendaItem($produto_pre_venda_item, $produto_pre_venda_id = false) {
        $campo_buscar = 'id';
        $valor = $produto_pre_venda_item;

        if($produto_pre_venda_id == false) {
            $campo_buscar = 'produto_pre_venda_id';
            $valor = $produto_pre_venda_id;
        }

        $dados = $this->db()->tabela(Genericos::getSchema().'produto_pre_venda_item')
                ->where($campo_buscar,'=',$valor);

        if($produto_pre_venda_item != false && $produto_pre_venda_id != false) {
            $dados->whereAnd('produto_pre_venda_id','=',$produto_pre_venda_id);
        }

        $dados = $dados->buildQuery('select');

        return $dados;
    }

    public function getPreVendaPagto($produto_pre_venda_pagto, $produto_pre_venda_id = false) {
        $campo_buscar = 'id';
        $valor = $produto_pre_venda_pagto;

        if($produto_pre_venda_id == false) {
            $campo_buscar = 'produto_pre_venda_id';
            $valor = $produto_pre_venda_id;
        }

        $dados = $this->db()->tabela(Genericos::getSchema().'produto_pre_venda_pagto')
                ->where($campo_buscar,'=',$valor);

        if($produto_pre_venda_pagto != false && $produto_pre_venda_id != false) {
            $dados->whereAnd('produto_pre_venda_id','=',$produto_pre_venda_id);
        }

        $dados = $dados->buildQuery('select');

        return $dados;
    }

    /**
     * Objetivo: Recuperar dados de um pedido de compra ou venda
     * Recebe: Id do pedido e seu tipo
     * Retorna: Dados do pedido solicitado
     * Autor: Nathan Feitoza
     * Nome Método: getPedidoCompraVenda
     *
     * @param $pedido_id
     * @param $tipo_pedido
     * @return array
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getPedidoCompraVenda($pedido_id, $tipo_pedido=3)
    {
        $tipos_aceitos = [3,4];

        if(!in_array($tipo_pedido, $tipos_aceitos)) throw new AppException('Tipo de pedido não aceito',315);

        $campos_cabec = ['a.comanda as documento','a.data as saida','a.tipo','b.nome as nome_cliente_destin','b.fantasia',
            'b.cnpj as cpf_cnpj','b.cep','b.logradouro as endereco','b.numero','b.email',
            'b.telefone1 as tel','b.bairro','b.cidade','b.uf'];

        $campos_produtos = ['c.id','c.vendedor_id as vendedor','c.produto_id','d.nome as nome_produto',
            'c.preco_venda as preco_compra','c.quantidade','(c.quantidade*c.preco_venda) as total',
            'c.produto_estoque_grade_id as grade','c.desconto_total','c.acrescimo_total'];

        $cabec = $this->db()->tabela(Genericos::getSchema().'produto_pre_venda a')
            ->campos($campos_cabec)
            ->where('a.id','=',$pedido_id)
            ->whereAnd('a.tipo','=',$tipo_pedido)
            ->whereAnd('a.cancelado','=','0')
            ->leftJoin('entidade b','b.id = a.entidade_id')
            ->buildQuery('select');

        if(is_int($cabec) || is_bool($cabec)) return 0;

        $cabec[0]->PAGTO = $this->db()->tabela(Genericos::getSchema().'produto_pre_venda_pagto')
            ->campos(['id','forma_pagto_id','valor'])
            ->where('produto_pre_venda_id', '=', $pedido_id)
            ->orderBy('id','asc')
            ->buildQUery('select');

        if(is_int($cabec[0]) || is_bool($cabec[0])) return -1;

        $produtos = $this->db()->tabela(Genericos::getSchema().'produto_pre_venda_item c')
            ->campos($campos_produtos)
            ->where('c.produto_pre_venda_id','=', $pedido_id)
            ->whereAnd('c.cancelado', '=', 0)
            ->setMsgNaoEncontrado('Nenhum item de compra ou venda encontrado')
            ->leftJoin(Genericos::getSchema().'view_produtos d','c.produto_id = d.id')
            ->orderBy('c.id','asc')
            ->buildQuery('select');

        if(is_int($produtos) || is_bool($produtos)) return -2;

        $this->loadModel('produto/produto');

        $produtos_class = $this->model_produto_produto;

        foreach($produtos as $chave => $produto) {
            if(!is_null($produto->GRADE)){
                $produto->GRADE = $produtos_class->setUsarException(false)->getProdutoGrade($produto->GRADE, true);
            } else {
                unset($produto->GRADE);
            }
        }

        return ["CABECALHO" => $cabec[0], "PRODUTOS" => $produtos];
    }

    /**
     * Objetivo: Retornar o último id que está no grupo das tabelas de pre_venda
     * Recebe: Qual item do grupo será buscado o ultimo id
     * Retorna: O ultimo id da tabela
     * Autor: Nathan Feitoza
     * Nome Método: getUltimoIdPrevenda
     *
     * @param bool $item
     * @return mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    protected function getUltimoIdPrevenda($item=false)
    {
        $item = $item ? 'item_' : '';
        $retorno = $this->db()
            ->tabela(Genericos::getSchema().'produto_pre_venda_'.$item.'id_seq')
            ->campos(['last_value'])
            ->buildQuery('select');

        return $retorno[0]->LAST_VALUE;
    }

    /**
     * Objetivo: Cancelar um item de uma pre venda
     * Recebe: o id do pedido a ser cancelalo
     * Retorna: mensagem informando que o cancelado
     * Autor: Nathan Feitoza
     * Nome Método: setCancelarItemPreVenda
     *
     * @param $pedido_item_id
     * @return string
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function cancelarItemPreVenda($pedido_item_id)
    {
        $this->deletar_bd1_produto_pre_venda_item(function($where) use($pedido_item_id){
            $where->where('id', '=', $pedido_item_id);
        });

        return 'Pedido '.$pedido_item_id.' deletado';
    }

    /**
     * Objetivo: Salvar um pedido de compra ou venda da tela de pedidos de compra/venda
     * Recebe: Dados a serem salvos
     * Retorna: id do pedido registrado
     * Autor: Nathan Feitoza
     * Nome Método: setSalvarPedidoCompraVenda
     *
     * @param $dados_salvar
     * @return array
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function criarPedidoCompraVenda($dados_salvar)
    {
        $necessarios = ["documento","saida","nome_cliente","cpf_cnpj","vendedor",
            "forma_pagto","total_acrescimo","total_desconto","total_pedido","tipo_pedido"];
        $opc_itens = ["codigo","preco","quantidade"];

        Genericos::camposVazios($dados_salvar, $necessarios, true);

        $documento = $dados_salvar[$necessarios[0]];
        $saida = $dados_salvar[$necessarios[1]];
        $nome_entidade = $dados_salvar[$necessarios[2]];
        $cpf_cnpj = $dados_salvar[$necessarios[3]];
        $vendedor = $dados_salvar[$necessarios[4]];
        $forma_pagto = $dados_salvar[$necessarios[5]];
        $tipo_pedido = $dados_salvar[end($necessarios)];

        $cpf_cnpj = preg_replace("/[^\d]/", "", $cpf_cnpj);

        if(isset($dados_salvar[$opc_itens[0]]) && !isset($dados_salvar['pedido_id'])) Genericos::camposVazios($dados_salvar, $opc_itens, true);

        if(isset($dados_salvar[$opc_itens[0]])) {
            $codigos_item = $dados_salvar[$opc_itens[0]];
            $precos_item = $dados_salvar[$opc_itens[1]];
            $quants_item = $dados_salvar[$opc_itens[2]];
        }

        $acrescimos = $dados_salvar[$necessarios[6]];
        $descontos = $dados_salvar[$necessarios[7]];
        $total_pedido = $dados_salvar[$necessarios[8]];

        $this->loadModel('entidade/entidade');
        $entidade = $this->model_entidade_entidade;

        $cpf_ou_cnpj = 'CPF';
        $tipo_entidade = $entidade::view_clientes;
        $tipo_entidade_cadastrar = 1;

        if ((int)$tipo_pedido == 4) {
            $cpf_ou_cnpj = 'CNPJ';
            $tipo_entidade = $entidade::view_fornecedores;
            $tipo_entidade_cadastrar = 2;
        }

        $entidade_id = $entidade->setFalseException(true)->getEntidadeCnpj($cpf_cnpj, $tipo_entidade);

        if ($entidade_id == false) {

            $entidade_add = [
                'nome' => $nome_entidade,
                'fantasia' => $nome_entidade,
                'cnpj' => $cpf_cnpj,
                'logradouro' => isset($dados_salvar['endereco']) ? $dados_salvar['endereco'] : null,
                'bairro' => isset($dados_salvar['bairro']) ? $dados_salvar['bairro'] : null,
                'numero' => isset($dados_salvar['numero']) ? $dados_salvar['numero'] : null,
                'cep' => isset($dados_salvar['cep']) ? $dados_salvar['cep'] : null,
                'telefone1' => isset($dados_salvar['tel']) ? $dados_salvar['tel'] : null,
                'data_cadastro' => date('Y-m-d H:i:s'),
                'tipo' => $tipo_entidade_cadastrar,
                'entidade_tipo' => $tipo_entidade_cadastrar,
                'cidade' => isset($dados_salvar['cidade']) ? $dados_salvar['cidade'] : null,
                'uf' => isset($dados_salvar['uf']) ? $dados_salvar['uf'] : null,
                'situacao' => 0,
                'email' => isset($dados_salvar['email']) ? $dados_salvar['email'] : null
            ];

            $entidade->inserir_bd_entidade(array_keys($entidade_add), array_values($entidade_add));

            $entidade_id = $entidade->getEntidadeCnpj($cpf_cnpj, $tipo_entidade);
        }

        $entidade_id = $entidade_id[0]->ID;

        $campos_adicionar_pre = ['comanda', 'data', 'tipo', 'entidade_id', 'vendedor_id'];
        $valores_campos_adicionar_pre = [$documento, $saida, $tipo_pedido, $entidade_id, $vendedor[0]];

        //$obj_adicionar_pre = $this->getConBD()->setLogandoComplexo();
        $adicionar_pre = $this->db();
        $adicionar_pre->iniciarTransacao();


        if(!Genericos::verificarCampoPreenchido($dados_salvar, 'pedido_id')) {
            $this->inserir_bd1_produto_pre_venda($campos_adicionar_pre, $valores_campos_adicionar_pre);
            $id_ultima_pre = $this->getUltimoIdPrevenda();
        } else {
            $id_ultima_pre = (int) $dados_salvar['pedido_id'];
            $this->atualizar_bd1_produto_pre_venda($campos_adicionar_pre, $valores_campos_adicionar_pre,
                function($where) use ($id_ultima_pre) {
                    $where->where('id','=', $id_ultima_pre);
                }
            );
        }

        $retorno = ["PEDIDO_REGISTRADO" => $id_ultima_pre];

        // Para cancelar (excluir) itens da pré-venda (pedido compra/venda)
        if(Genericos::verificarCampoPreenchido($dados_salvar, 'cancelar')) {
            foreach($dados_salvar['cancelar'] as $chave_cancelar => $prods_cancelar) {
                $this->cancelarItemPreVenda($prods_cancelar);
            }
        }

        $valor_pagto = 0;
        $desconto_total_itens = 0;
        $acrescimo_total_itens = 0;

        if(isset($dados_salvar[$opc_itens[0]])) {
            try {
                //$obj_adicionar_pre_sec = $this->getConBD()->setLogandoComplexo();
                //$adicionar_pre_sec = $this->setObjetoBuildquery($obj_adicionar_pre_sec)->setEmTransacao();

                $this->deletar_bd1_produto_pre_venda_pagto(function($where) use ($id_ultima_pre) {
                    $where->where('produto_pre_venda_id', '=', $id_ultima_pre);
                });

                foreach ($codigos_item as $chave_item => $codigo_item) {
                    if (strlen($codigo_item) > 0) {
                        $preco_item = $precos_item[$chave_item];
                        $quant_item = $quants_item[$chave_item];
                        $total_item = $preco_item * $quant_item;

                        $desconto_total_itens_usar = $desconto_total_itens;

                        if($chave_item != (count($codigos_item) - 1)) {
                            $desconto_item = round((($total_item * $descontos) / $total_pedido), 2);
                            $acrescimo_item = round((($total_item * $acrescimos) / $total_pedido), 2);

                            $desconto_total_itens += (double) $desconto_item;
                            $acrescimo_total_itens += (double) $acrescimo_item;
                        } else {
                            $desconto_item = ((double) $descontos) - $desconto_total_itens;
                            $acrescimo_item = $acrescimos - $acrescimo_total_itens;
                        }

                        $vendedor_item = $vendedor[$chave_item];
                        $grade_item = isset($dados_salvar['grades_id']) ? (isset($dados_salvar['grades_id'][$chave_item]) ? $dados_salvar['grades_id'][$chave_item] : null) : null;
                        $grade_item = ((string)strlen($grade_item) == 0) ? null : $grade_item;
                        $item_item = $chave_item + 1;

                        $valor_pagto += $total_item;

                        $campos_adicionar_pre_item = ['produto_pre_venda_id', 'produto_estoque_grade_id', 'produto_id',
                            'quantidade', 'preco_venda', 'vendedor_id', 'item','desconto_total','acrescimo_total'];
                        $valores_campos_adicionar_pre = [$id_ultima_pre, $grade_item, $codigo_item, $quant_item, $preco_item,
                            $vendedor_item, $item_item, $desconto_item, $acrescimo_item];

                        $cod_item_att = false;

                        if(isset($dados_salvar['cod_item'])) {
                            if(isset($dados_salvar['cod_item'][$chave_item])) {
                                $cod_item_att = $dados_salvar['cod_item'][$chave_item];
                            }
                        }

                        if(!$cod_item_att) {
                            $this->inserir_bd1_produto_pre_venda_item($campos_adicionar_pre_item, $valores_campos_adicionar_pre);
                        } else {
                            $this->atualizar_bd1_produto_pre_venda_item($campos_adicionar_pre_item, $valores_campos_adicionar_pre,
                                function($where) use ($cod_item_att) {
                                    $where->where('id', '=', (int) $cod_item_att);
                                }
                            );
                        }
                    }
                }

                $valor_pagto = ($valor_pagto + $acrescimos) - $descontos;
                $valor_pagto = $valor_pagto < 0 ? ($valor_pagto + $acrescimos) : $valor_pagto;

                foreach ($forma_pagto as $chave_pagto => $id_pagto) {
                    if(Genericos::verificarCampoPreenchido($dados_salvar, 'valor_forma_pagto')) {
                        $valor_forma_pagto = isset($dados_salvar['valor_forma_pagto'][$chave_pagto]) ? $dados_salvar['valor_forma_pagto'][$chave_pagto] : $valor_pagto;
                    }

                    //$valor_forma_pagto = strlen((string) $valor_forma_pagto) == 0 ? $valor_pagto : $valor_forma_pagto;

                    $this->inserir_bd1_produto_pre_venda_pagto(['produto_pre_venda_id', 'forma_pagto_id', 'valor'],
                        [$id_ultima_pre, $id_pagto, $valor_forma_pagto]);
                }

                /*$salvar = 'ID_Pedido = '.$id_ultima_pre.' || '.
                    'Documento_Pedido = '.$documento.' || '.
                    'Entidade_id = '.$entidade_id.' || '.
                    'Data_SaidaEntrada = '.$saida.' || '.
                    'Valor_Pedido = '.number_format($valor_pagto, 2, ',','.');
                $this->gravarLogSC('insert',false, $salvar);*/
                $adicionar_pre->commit();
                return $retorno;
            } catch (AppException $e) {
                $this->deletar_bd1_produto_pre_venda(function($where) use ($id_ultima_pre) {
                    $where->where('id', '=', $id_ultima_pre);
                });
                $adicionar_pre->commit();

                throw new AppException($e->getMessage(), $e->getCode());
            }
        } else {
            $adicionar_pre->commit();
            return $retorno;
        }
    }

    /**
     * Objetivo: realizar uma venda no pdv
     * Recebe: Dados para inserção na tabela pre-vendas
     * Retorna:  Mensagem de sucesso na operação de venda
     * Autor: Nathan Feitoza
     * Nome Método: setRealizarVendaPDV
     *
     * @param $dados_para_insercao
     * @return string
     * @throws Exception
     * @autor Nathan Feitoza
     */
    /*public function setRealizarVendaPdv($dados_para_insercao)
    {
        Genericos::camposVazios($dados_para_insercao, ['data_mov','entidade_id','total_documento','documento','modelo_documento',
            'data_emissao','total_produtos','setor_id','pre_venda_id','desconto_total',
            'acrescimo_total','usuario_id','vendedor_id','pdv', 'produto_id','total_produto',
            'forma_pagamento_id','valor']);

        /--if($dados_para_insercao['pre_venda_id'] != 0) {

            $verificar_pre_venda = $this->container->model->getConBD()
                ->tabela($this->getSchema().'produto_pre_venda')
                ->campos(['id'])
                ->where('id','=',$dados_para_insercao['pre_venda_id'])
                ->whereAnd('cancelado','=','0')
                ->setMsgNaoEncontrado('Pré-venda/Comanda não encontrada')
                ->buildQuery('select');

            $update_pre_venda = $this->container->model->getConBD()
                ->tabela($this->getSchema().'produto_pre_venda')
                ->campos(['cancelado'],['1'])
                ->where('id','=',$dados_para_insercao['pre_venda_id'])
                ->buildQuery('update');

            $update_pre_venda_item = $this->container->model->getConBD()
                ->tabela($this->getSchema().'produto_pre_venda_item')
                ->campos(['cancelado'],['1'])
                ->where('produto_pre_venda_id','=',$dados_para_insercao['pre_venda_id'])
                ->buildQuery('update');
        }--/

        $objDb = $this->db();

        $objDb->iniciarTransacao();

        $this->inserir_bd1_estoque_mov(['entidade_id', 'data_mov', 'documento',
                'modelo_documento', 'data_emissao', 'total_documento',
                'total_produtos', 'pre_venda_id', 'desconto_total',
                'acrescimo_total', 'usuario_id', 'caixa_id', 'pdv'],
                [$dados_para_insercao['entidade_id'],$dados_para_insercao['data_mov'], $dados_para_insercao['documento'], $dados_para_insercao['modelo_documento'],
                    $dados_para_insercao['data_emissao'], $dados_para_insercao['total_documento'], $dados_para_insercao['total_produtos'], $dados_para_insercao['pre_venda_id'],
                    $dados_para_insercao['desconto_total'], $dados_para_insercao['acrescimo_total'], $dados_para_insercao['usuario_id'], $dados_para_insercao['caixa_id'], $dados_para_insercao['pdv']]);

        for($i = 0; $i < count($dados_para_insercao['produto_id']['produtos']); $i++) {
            $produto_relacao = $dados_para_insercao['produto_id']['produtos'][$i];
            $quantidade_add = str_replace('"', "", $produto_relacao['qntd_produto']);
            $quantidade_add = str_replace(".", "", $quantidade_add);
            $quantidade_add = str_replace(",", ".", $quantidade_add);
            $quantidade_add = str_replace(" ", "", $quantidade_add);
            $inserir_estoque_mov_item = $objDb->executarSQL('INSERT INTO '.Genericos::getSchema().'estoque_mov_item(
          cfop,
          estoque_mov_id,
		  item,
		  quantidade,
		  produto_id,
		  preco_venda,
		  total_produto,
		  entidade_id,
		  data_mov,
		  setor_id, 
		  vendedor_id,
		  preco_compra) VALUES(5102,(select id from '.Genericos::getSchema().'estoque_mov ORDER BY id DESC LIMIT 1), ?,?,?,?,?,?,?,?,?,?)',
                [$i, $quantidade_add, $produto_relacao['cod_produto'], $produto_relacao['preco'],
                    $produto_relacao['preco_total'], $dados_para_insercao['entidade_id'], $dados_para_insercao['data_mov'],
                    $dados_para_insercao['setor_id'], $dados_para_insercao['vendedor_id'], $produto_relacao['preco']]);
        }

        $msg = 0;

        for($p = 0; $p < count($dados_para_insercao['forma_pagamento_id']); $p++) {
            $valor_pago = str_replace(".", "", $dados_para_insercao['valor'][$p]);
            $valor_pago = str_replace(",", ".", $valor_pago);
            $forma_pgto = $dados_para_insercao['forma_pagamento_id'][$p];
            $inserir_estoque_mov_pgto = $objDb->executarSQL('INSERT INTO
            '.Genericos::getSchema().'estoque_mov_pagto(estoque_mov_id,forma_pagamento_id,documento,valor)
            VALUES((select id from '.Genericos::getSchema().'estoque_mov ORDER BY id DESC LIMIT 1),?,?,?)', [$forma_pgto, $dados_para_insercao['documento'], $valor_pago]);
        }

        $objDb->commit();
        return 'Venda concluída com sucesso';
    }*/

    /**
     * Objetivo: Receber o pagamento de uma pre-venda e gerar uma NFC-e no final
     * Recebe: Dados do pagamento
     * Retorna: Um PDF (genérico) de uma NFe
     * Autor: Nathan Feitoza
     * Nome Método: setReceberPagamentoPDV
     *
     * @param $dados_pagamento
     * @return array
     * @throws Exception
     * @throws \Mpdf\MpdfException
     * @autor Nathan Feitoza
     */
    /*public function setReceberPagamentoPdv($dados_pagamento)
    {
        $this->loadModel('pagamento/pagamento');
        $this->loadModel('entidade/vendedor');

        $pagamentos = $this->model_pagamento_pagamento;
        $vendedores = $this->model_entidade_vendedor;

        $validar = Genericos::camposVazios($dados_pagamento,['nome_p_send','cod_p_send', 'preco_p_send', 'qntd_p_send',
            'sbt_p_send', 'itens', 'total', /'pagamento',/ 'vendedor','valor_pago',
            'tipo_pgto','vls_pagos','desconto','acrescimo','enviado_de'], true);
        $txt_cabecalho = '';
        $txt_itens = '';
        $txt_valor_total = '';
        $txt_rodape = [];
        $valor_total_enviado = Genericos::retornarFloat($dados_pagamento['total']);
        $desconto = number_format( Genericos::retornarFloat($dados_pagamento['desconto']), 2, '.','');
        $acrescimo = number_format( (Genericos::retornarFloat($dados_pagamento['acrescimo'])),2,'.','' );
        $novo_valor = ($valor_total_enviado + $acrescimo) -  $desconto;
        $troco = Genericos::retornarFloat($dados_pagamento['valor_pago']) - $novo_valor;
        $valor_pago_check = 0;
        for($t = 0; $t < count($dados_pagamento['vls_pagos']); $t++) {
            $valor_pago_check +=  Genericos::retornarFloat($dados_pagamento['vls_pagos'][$t]);
        }
        $troco2 = $valor_pago_check - $novo_valor;
        $liberar_recebimento = true;
        if($troco < 0) {
            $liberar_recebimento = false;
        } elseif($troco2 < 0) {
            $liberar_recebimento = false;
            $troco = $troco2;
        }
        if($liberar_recebimento) {
            $txt_cabecalho .= '<div style="text-align:center;"><strong>Nathan</strong><br>';
            $txt_cabecalho .= ' <div style="font-size: 12px"> 07684607000187 Inscrição Estadual: 271190221<br>';
            $txt_cabecalho .= '  RUA SANTA TEREZINHA 157 Bairro: PONTO NOVO<br>';
            $txt_cabecalho .= '  ARACAJU SE Fone: 7932144343</div>';
            // força pular uma linha entre o cabeçalho e os itens
            $txt_cabecalho .= ' </div>'; // força pular uma linha entre o cabeçalho e os itens
            for($i = 0; $i < (count($dados_pagamento['nome_p_send'])); $i++) {
                $preco = str_replace("R$", '', $dados_pagamento['preco_p_send'][$i]);
                $pr_total = str_replace("R$", '', $dados_pagamento['sbt_p_send'][$i]);
                $preco_a = str_replace(".", "", $preco);
                $preco_a = str_replace(",", ".", $preco_a);
                $pr_total_a = str_replace(",", ".", $pr_total);
                $pr_total_a = str_replace(",", ".", $pr_total_a);
                $produto_dados[] = array(
                    'cod_produto' => $dados_pagamento['cod_p_send'][$i],
                    'nome_produto' => $dados_pagamento['nome_p_send'][$i],
                    'qntd_produto' => $dados_pagamento['qntd_p_send'][$i],
                    'preco' => $preco_a,
                    'preco_total' => $preco_a * $dados_pagamento['qntd_p_send'][$i]
                );
                $txt_itens .= '<tr>';
                $txt_itens.= '<td>'.$dados_pagamento['cod_p_send'][$i].'</td>';
                $txt_itens .= '<td>'.$dados_pagamento['nome_p_send'][$i].'</td>';
                $txt_itens .= '<td>'.$dados_pagamento['qntd_p_send'][$i].'</td>';
                $txt_itens .= '<td>'.number_format($preco,2,',','.').'</td>';
                $txt_itens .= '<td>'.number_format($pr_total,2,',','.').'<td>';
                $txt_itens .= '</tr>';
            }
            $pagamento = [];
            for($p = 0; $p < count($dados_pagamento['tipo_pgto']); $p++) {
                array_push($pagamento,$pagamentos->getFormaPagamento($dados_pagamento['tipo_pgto'][$p]) );
            }
            $prevenda_id = Genericos::camposVazios($dados_pagamento, ['prevenda_id']) == 1 ? $dados_pagamento['prevenda_id'] : 0;
            $dados_enviar = ["produtos"=>$produto_dados];
            $pagamento_enviar = $dados_pagamento['tipo_pgto'];
            $total_send = str_replace("R$", "", $dados_pagamento['total']);
            $total_send = str_replace(".", "", $total_send);
            $total_send = str_replace(",", ".", $total_send);
            $total_send = str_replace(" ", "", $total_send);
            $parametros_mov = [
                'data_mov' => date("Y-m-d H:i"),
                'entidade_id' => $dados_pagamento['vendedor'],
                'total_documento' => $novo_valor,
                'documento' => rand(),
                'modelo_documento' => 65,
                'data_emissao' => date("Y-m-d H:i"),
                'total_produtos' => $total_send,
                'setor_id' => 1,
                'pre_venda_id' => $prevenda_id,
                'desconto_total' => $dados_pagamento['desconto'],
                'acrescimo_total' => $dados_pagamento['acrescimo'],
                'usuario_id' => $dados_pagamento['enviado_de'],
                'caixa_id' => $dados_pagamento['enviado_de'],
                'pdv' => 1,
                //'estoque_mov_item' => $dados_pagamento[''],
                //'item' => $dados_pagamento[''],
                'produto_id' => $dados_enviar,
                //'quantidade' => $dados_pagamento[''],
                //'preco_unitario' => $dados_pagamento[''],
                'total_produto' => $total_send,
                'vendedor_id' => $dados_pagamento['vendedor'],
                'forma_pagamento_id' => $pagamento_enviar,
                'valor' => $dados_pagamento['vls_pagos']
            ];

            $movimentação = $this->setRealizarVendaPdv($parametros_mov);

            foreach ($pagamento as $tipo) {
                $tipo_pgto[] = $tipo[0]->NOME;
            }
            /-*-/ $tipo_pgto = implode(",", $tipo_pgto);
            $path_n = $this->getPastaArquivos('vendas',true);
            $tmp_qrcode = $this->getPastaArquivos('vendas/tmp',true);
            $qrCode_path = $tmp_qrcode.'/'.time().uniqid().'.png';
            $qrCode_save = \QRcode::png('http://www.hom.nfe.se.gov.br/portal/consultarNFCe.jsp?chNFe=28170407684607000187650020000000051000000059&nVersao=100&tpAmb=2&dhEmi=323031372D30342D30335431353A33323A35382D30333A3030&vNF=3.20&vICMS=0.00&digVal=58334E5876674F4F5A55347336376B77452B4A61546845515076633D&cIdToken=000001&cHashQRCode=421a8cac3e15ec33b920e6918cf4f1cf2a06d249',$qrCode_path); // creates file
            $qrCode = 'data:image/png;base64,'.base64_encode(file_get_contents($qrCode_path));
            unlink($qrCode_path);
            $vendedor = $vendedores->getVendedor($dados_pagamento['vendedor']);
            $pdf = $this->getMpdf();
            $pdf->WriteHTML('
                                    <html>
                                    <head>
                                    <meta charset="UTF-8">
                                    
                                    <style>
                                    @page *{
                                        margin-top: 2.54mm;
                                        margin-bottom: 2.54cm;
                                        margin-left: 40mm;
                                        margin-right: 40mm;
                                    }
                                    </style>
                                    
                                    </head>
                                    
                                    <body style="width: 332px; float:left;">
                                    
                                    '.$txt_cabecalho.'
                                    <div style="text-align: center;">---------------------------------------------------------------------</div>
                                    <table style="text-align: center;font-size: 12px;" border="0" width="100%">
                                    <thead>
                                    <tr>
                                    <td>Código</td>
                                    <td>Produtos</td>
                                    <td>Qtd</td>
                                    <td>V. UN</td>
                                    <td>Total</td>
                                    </tr>
                                    </thead>
                                    
                                    <tbody>
                                    '.$txt_itens.'
                                    </tbody>
                                    
                                    </table>
                                    <div style="text-align: center;">---------------------------------------------------------------------</div>
                                    
                                    <table border="0" style="font-size: 10px; margin-left: 4mm;">
                                    
                                    <tbody>
                                    <tr>
                                    <td style="width: 50%;">QTD. TOTAL DE ITENS</td>
                                    <td style="text-align: right; float: right; width: 50%;">'.$dados_pagamento['itens']
                .'</td>
                                    </tr>
                                    <tr>
                                    <td style="width: 50%;">VALOR TOTAL R$</td>
                                    <td style="text-align: right; float: right; width: 50%;">'.number_format($novo_valor,2,",",".").'</td>
                                    </tr>
                                    <tr>
                                    <td style="width: 50%;">FORMA DE PAGAMENTO</td>
                                    <td style="text-align: right; float: right; width: 50%;">'.$tipo_pgto.'</td>
                                    </tr>
                                    <tr>
                                    <td style="width: 50%;">VALOR PAGO</td>
                                    <td style="text-align: right; float: right; width: 50%;"> '.number_format($dados_pagamento['valor_pago'],2,",",".").'</td>
                                    </tr>
                                    <tr>
                                    
                                    <tr>
                                    <td style="width: 50%;">TROCO</td>
                                    <td style="text-align: right; float: right; width: 50%;"> '.number_format($troco,2,",",".").'</td>
                                    </tr>
                                    <tr>
                                    <td style="width: 50%;">VENDEDOR</td>
                                    <td style="text-align: right; float: right; width: 50%;">'.$vendedor[0]->NOME.'</td>
                                    </tr>
                                    </tbody>
                                    
                                    </table>
                                    
                                    
                                    <div style="text-align: center;">---------------------------------------------------------------------</div>
                                    <div style="font-size: 12px; margin-left: 6mm;">
                                    <p>
                                    NFC-e n° 00005 Série 02 Emissão '.date("d/m/Y H:i:s").'
                                    N. Controle: 0000000056502 - Rend: 999 Vend: 999
                                    
                                    <div style="text-align: center; font-size: 12px;"><strong>Via Consumidor</strong></div>
                                    <div style="text-align: center;">Consulte pela Chave de Acesso em</div> 
                                    http://www.hom.nfe.se.gov.br/portal/consultarNFCe.jsp?
                                    </p>
                                    <p style="text-align: center;">
                                    <strong>CHAVE DE ACESSO - Modo Homologação</strong>
                                    2817054875102546778971320015640216540000009
                                    </p>
                                    </div>
                                    <div style="text-align: center;">---------------------------------------------------------------------</div>
                                    
                                    <div style="text-align: center; font-size: 12px;"><strong>CONSUMIDOR NÃO IDENTIFICADO</strong></div>
                                    </div>
                                    
                                    <div style="text-align: center;">---------------------------------------------------------------------</div>
                                    <div style="text-align: center; font-size: 12px;"><strong>Consulta via leitor de QR Code</strong></div>
                                    <p style="text-align: center;"><img width="110" height="110" src="'.$qrCode.'"></p>
                                    <div style="text-align: center; font-size: 12px;">Protocolo de Autorização: 328170000000001551</div>
                                    <div style="text-align: center; font-size: 12px;">'.date("d/m/Y H:i:s").'</div>
                                    <div style="text-align: center;">---------------------------------------------------------------------</div>
                                    <div style="text-align: center; font-size: 10px;">Nathan 79 3214-4343</div>
                                    </body> 
                                    </html>');
            ob_clean();
            $vd = 'venda-'.md5(time()+date('h:i:s')+uniqid());
            $caminho_retorno = $path_n.'/'.$vd.'.pdf';
            $pdf->Output($caminho_retorno,'F');
            $url_acessar = 'http://'.$_SERVER['SERVER_NAME'].str_replace('index.php','ver_pdf.php',$_SERVER['PHP_SELF']);
            return ["msg"=>"PDF gerado com sucesso","caminho" => $url_acessar.'?pdf='.base64_encode($caminho_retorno)];
            //-/

            return 'Venda realizada';
        } else {
            throw new AppException('Valor pago menor que o valor total - Valor Total: '.$novo_valor.' - Troco retornado: '.$troco, 203);
        }
    }*/

    /**
     * Objetivo: Retornar o status de uma comanda ou mesa para verificar se a mesma está disponível para consumo ou não
     * Recebe: numero da mesa ou comanda, o tipo de busca (comanda ou mesa), e uma opção para saber se quer retornar os itens e pagamentos
     * Retorna: os dados da mesa ou comanda buscada ou false caso não encontre nada
     * Autor: Nathan Feitoza
     * Data: 07/06/19 11:24
     * Nome Método: getComandaMesaConsumindo
     *
     * @param $comanda_mesa
     * @param string $tipoBuscar
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getComandaMesaConsumindo($comanda_mesa, $tipo='pre-vendas', $tipoBuscar='comanda', $trazerItensEPagamentos=false)
    {
        switch (strtolower($tipo)) {
            case 'pre-vendas':
                $tipo = 0;
                break;
            default:
                $tipo = 1;
                break;
        }

        $tipoBuscar = strtolower($tipoBuscar);
        $isComanda = $tipoBuscar == 'comanda';

        $pedido = $this->setFalseException(true)
                ->db()->tabela(Genericos::getSchema().'produto_pre_venda a')
                ->campos(['a.id','a.vendedor_id','a.total_produtos','a.total_pedido','b.nome as vendedor_nome'])
                ->where( ($isComanda ? 'comanda' : 'mesa_id'), '=', $comanda_mesa )
                ->leftJoin('entidade b','a.vendedor_id = b.id')
                ->whereAnd( 'a.status', '=', 0 )
                ->whereAnd( 'a.tipo', '=', $tipo )
                ->setGerarLog(true)
                ->buildQuery('select');

        if($pedido == false) return false;

        if($trazerItensEPagamentos) {
            $dadosItens = $this->setFalseException(true)->db()
                ->tabela(Genericos::getSchema().'produto_pre_venda_item a')
                ->campos(['a.*', 'a.quantidade * a.preco_venda as total','b.nome'])
                ->leftJoin(Genericos::getSchema().'produto b','a.produto_id = b.id')
                ->where('produto_pre_venda_id', '=', $pedido[0]->ID)
                ->whereAnd('cancelado', '=', 0)
                ->buildQuery('select');

            $dadosPagamentos = $this->setFalseException(true)->db()
                ->tabela(Genericos::getSchema().'produto_pre_venda_pagto a')
                ->campos(['a.*','b.nome','b.REQUER_DOCUMENTO','b.FORMA_PAGAMENTO_TIPO_ID','b.DESCONTO_MAXIMO'])
                ->where('a.produto_pre_venda_id', '=', $pedido[0]->ID)
                ->leftJoin('forma_pagamento b', 'b.id = a.forma_pagto_id')
                ->buildQuery('select');

            $pedido['PEDIDO'] = $pedido[0];
            unset($pedido[0]);
            $pedido['ITENS'] = $dadosItens;
            $pedido['PAGAMENTO'] = $dadosPagamentos;
        }

        return $pedido;
    }

    public function setSalvarPedido($dados_pre_venda) {
        $necessarios = ['cabecalho','produtos'];
        $usam_pre_venda = ['PV','DVL'];
        $sempre_gerar_novo_id = ['PDV'];

        Genericos::camposVazios($dados_pre_venda, $necessarios, true);

        $cabecalho_pre = $dados_pre_venda['cabecalho'];
        $produtos_pre = $dados_pre_venda['produtos'];

        $necessarios_cabecalho = ['modo_operacao','vias_pre_conta','vias_producao',
                                 'impressora','setor','taxa_servico','tipo_impressora',
                                 'modelo_pedido_impresso','impressora_expedicao',
                                 'caixa_id','usuario_logado','estacao'];

        Genericos::camposVazios($cabecalho_pre,$necessarios_cabecalho, true);

        $necessarios_pre_venda = ['vendedor_id','comanda_mesa'];

        if($cabecalho_pre['modo_operacao'] != 'PDV') {
            Genericos::camposVazios($cabecalho_pre, $necessarios_pre_venda, true);
        }

        $cabecalho_pre['data_venda'] = Genericos::verificarCampoPreenchido($cabecalho_pre,'data_venda') ? $cabecalho_pre['data_venda'] : date('Y-m-d');
        $cabecalho_pre['data_entrega'] = Genericos::verificarCampoPreenchido($cabecalho_pre,'data_entrega') ? $cabecalho_pre['data_entrega'] : date('Y-m-d');
        $cabecalho_pre['tipo_venda'] = in_array($cabecalho_pre['modo_operacao'],$usam_pre_venda) ? 0 : 1;

        $necessarios_produtos = ['id','preco_venda','quantidade',/*'grade_id',*/];
        $necessarios_pagamento = ['forma_pagto_id','valor'];

        if(@empty($cabecalho_pre['vendedor_id'])) {
            $cabecalho_pre['vendedor_id'] = $cabecalho_pre['caixa_id'];
        }

        if(@empty($cabecalho_pre['comanda_mesa'])) {
            $cabecalho_pre['comanda_mesa'] = 0;
        }

        $gravar = $this->db();

        $gravar->iniciarTransacao();

        $gravar_pre_venda = [
            /*'acrescimo_item' => '',
            'acrescimo_pagto' => '',*/
            /*'desconto_item' => '',
            'desconto_pagto' => '',*/
            'comanda' => $cabecalho_pre['comanda_mesa'],
            'data' => $cabecalho_pre['data_venda'],
            'data_entrega' => $cabecalho_pre['data_entrega'],
            'entidade_id' => $cabecalho_pre['usuario_logado'],
            'mesa_id' => $cabecalho_pre['comanda_mesa'],
            'status' => 0,
            'tipo' => $cabecalho_pre['tipo_venda'],
            'vendedor_id' => $cabecalho_pre['vendedor_id'],
        ];

        if(Genericos::verificarCampoPreenchido($cabecalho_pre, 'pre_venda_id') && !in_array($cabecalho_pre['modo_operacao'], $sempre_gerar_novo_id) ) {
            $pre_venda_id = $cabecalho_pre['pre_venda_id'];

            $gravar_pre_venda['id'] = $pre_venda_id;

            $this->deletar_bd1_produto_pre_venda(function($where) use ($pre_venda_id) {
                $where->where('id', '=',$pre_venda_id);
            });
        }

        $this->inserir_bd1_produto_pre_venda(array_keys($gravar_pre_venda), array_values($gravar_pre_venda));

        if(!isset($pre_venda_id)) {

            if(!in_array($cabecalho_pre['modo_operacao'], $sempre_gerar_novo_id)) {
                $pre_venda_id = $gravar->tabela(Genericos::getSchema() . 'produto_pre_venda')
                    ->campos(['id'])
                    ->where('comanda', '=', $cabecalho_pre['comanda_mesa'])
                    ->whereAnd('status', '=', 0)
                    ->whereAnd('tipo', '=', $cabecalho_pre['tipo_venda'])
                    ->whereAnd('data', '=', $cabecalho_pre['data_venda'])
                    ->setMsgNaoEncontrado('Houve um erro recuperar o id da pré-venda ao tentar salvá-la')
                    ->buildQuery('select')[0]->ID;
            } else {
                $pre_venda_id = $this->getUltimoIdPrevenda();
            }
        }

        foreach($produtos_pre as $i => $produto) {
            Genericos::camposVazios($produto,$necessarios_produtos, true);
            $dados_produto = [
                /*'acrescimo_item' => '',
                'acrescimo_pagto' => '',
                'acrescimo_total' => '',*/
                /*'desconto_item' => '',
                'desconto_pagto' => '',
                'desconto_total' => '',*/
                'estacao' => $cabecalho_pre['estacao'],
                'item' => ($i + 1),
                'preco_venda' => $produto['preco_venda'],
                //'produto_estoque_grade_id' => is_numeric($produto['grade_id']) ? $produto['grade_id'] : null,
                'produto_id' => $produto['id'],
                'produto_pre_venda_id' => $pre_venda_id,
                'quantidade' => $produto['quantidade'],
                'vendedor_id' => $cabecalho_pre['vendedor_id'],
            ];

            $this->inserir_bd1_produto_pre_venda_item(array_keys($dados_produto), array_values($dados_produto));
        }

        $gravar->commit();

        return ['pre_venda_id' => $pre_venda_id];
    }

    public function setPagamentoPedido($dados) {
        $necessarios = ['produto_pre_venda_id','pagamento','desconto','acrescimo'];

        Genericos::camposVazios($dados, $necessarios, true);

        $produto_pre_venda_id = $dados['produto_pre_venda_id'];
        $pagamento = $dados['pagamento'];
        $desconto = $dados['desconto'];
        $acrescimo = $dados['acrescimo'];

        $verificarPreVenda = $this->setFalseException(true)->getPreVenda($produto_pre_venda_id);

        if(!$verificarPreVenda) {
            throw new AppException('O pedido solicitado a ser pago não existe', 10580);
        }

        $conBd = $this->db();

        $conBd->iniciarTransacao();

        $pedidoSalvo = $verificarPreVenda[0];

        $novoTotal = ($pedidoSalvo->TOTAL_PEDIDO - $desconto) + $acrescimo;

        $totalPago = 0;

        $this->deletar_bd1_produto_pre_venda_pagto(function($where) use ($produto_pre_venda_id) {
            $where->where('produto_pre_venda_id','=',$produto_pre_venda_id);
        });

        foreach ($pagamento as $i => $pagamento_add) {
            $dados_pagamento = [
                'forma_pagto_id' => $pagamento_add['forma_pagamento']['ID'],
                'produto_pre_venda_id' => $produto_pre_venda_id,
                'valor' => $pagamento_add['valor']
            ];

            $totalPago += $pagamento_add['valor'];

            $this->inserir_bd1_produto_pre_venda_pagto(array_keys($dados_pagamento), array_values($dados_pagamento));
        }

        if($novoTotal > $totalPago) {
            $conBd->rollback();

            throw new AppException('O valor pago de R$ '.number_format($totalPago,2,',','.').' não é suficiente para o valor total de R$ '.number_format($novoTotal,2,',','.'),10581);
        }

        $this->atualizar_bd1_produto_pre_venda(['DESCONTO_PAGTO','ACRESCIMO_PAGTO','TOTAL_PEDIDO'],[$desconto, $acrescimo, $novoTotal], function($where) use ($produto_pre_venda_id) {
            $where->where('id','=', $produto_pre_venda_id);
        });

        $conBd->commit();

        return ['pre_venda_id' => $produto_pre_venda_id, 'msg' => 'Pagamento recebido'];
    }
}