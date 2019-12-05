<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 19/03/19
 * Time: 09:28
 */

namespace AppModel\estoque_mov;


use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;

class EstoqueMov extends Model
{
    /**
     * Objetivo: Buscar dados na tabela estoque_mov
     * Recebe: id do estoque mov ou chave de uma nfe
     * Retorna: dados do estoque mov
     * Autor: Nathan Feitoza
     * Nome Método: getEstoqueMov
     *
     * @param $estoqueMovIdChaveNf
     * @param bool $callback
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function getEstoqueMov($estoqueMovIdChaveNf)
    {
        $retornar = $this->db()->tabela(Genericos::getSchema().'estoque_mov '.$this->getAliasTabela());

        if(strlen($estoqueMovIdChaveNf) == 44) {
            $retornar->where($this->getAliasCampo().'chave_nfe', '=', $estoqueMovIdChaveNf);
        } else {
            $retornar->where($this->getAliasCampo().'id', '=', $estoqueMovIdChaveNf);
        }

        $retornar = $retornar->buildQuery('select');

        return $retornar;
    }

    /**
     * Objetivo: Buscar dados na tabela estoque_mov_item
     * Recebe: id do estoque_mov_item
     * Retorna: dados dos itens de estoque mov
     * Autor: Nathan Feitoza
     * Nome Método: getEstoqueMovItem
     *
     * @param $estoqueMovIdItem
     * @param bool $callback
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function getEstoqueMovItem($estoqueMovIdItem, $produto_id=false)
    {
        $dados = $this->db()->tabela(Genericos::getSchema().'estoque_mov_item '.$this->getAliasTabela())
            ->where($this->getAliasCampo().'estoque_mov_id', '=', $estoqueMovIdItem)
            ->whereOr($this->getAliasCampo().'id', '=', $estoqueMovIdItem);

        if($produto_id != false) {
            $dados->whereAnd($this->getAliasCampo().'produto_id','=',$produto_id);
        }

        $dados = $dados->buildQuery('select');
        return $dados;
    }

    /**
     * Objetivo: Buscar dados na tabela estoque_mov_item
     * Recebe: id do estoque_mov_item
     * Retorna: dados dos itens de estoque mov
     * Autor: Nathan Feitoza
     * Nome Método: getEstoqueMovItem
     *
     * @param $estoqueMovIdItem
     * @param bool $callback
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function getEstoqueMovPagto($estoqueMovIdPagto)
    {
        return $this->db()->tabela(Genericos::getSchema().'estoque_mov_pagto '.$this->getAliasTabela())
            ->where($this->getAliasCampo().'estoque_mov_id', '=', $estoqueMovIdPagto)
            ->whereOr($this->getAliasCampo().'id', '=', $estoqueMovIdPagto)
            ->buildQuery('select');
    }

    /**
     * Objetivo: Retornar o último id da tabela estoque mov
     * Retorna: O último id de estoque mov ou false, se não encontrar nada
     * Autor: Nathan Feitoza
     * Nome Método: getUltimoEstoqueMovId
     *
     * @return bool
     * @throws Exception
     * @autor Nathan Feitoza
     */
    protected function getUltimoEstoqueMovId()
    {
        $sql = $this->setUsarException(false)
            ->db()
            ->tabela(Genericos::getSchema().'estoque_mov_id_seq')
            ->campos(["last_value"])
            ->buildQuery('select');

        if(is_int($sql)) {
            return false;
        }

        return $sql[0]->LAST_VALUE;
    }

    /**
     * Objetivo: Retornar dados referentes a estoque mov salvos na base buscando pelo id
     * Recebe: Id do estoque mov
     * Retorna: Dados de um estoque mov completo
     * Autor: Nathan Feitoza
     * Data: 25/03/19 17:57
     * Nome Método: getEstoqueMovSalvoId
     *
     * @param $estoque_mov_id
     * @return array|int
     * @throws \Exception
     */
    public function getEstoqueMovSalvoId($estoque_mov_id)
    {
        $cabecalho_nota = $this->setAliasTabela('a')
            ->setCamposRetornar(['a.ID','a.documento','a.modelo_documento as modelo_doc','a.chave_nfe','a.autorizacao_nfe',
                'a.data_emissao','a.serie','a.turno','a.pdv','a.vendedor_id','a.caixa_id',
                'a.total_documento','a.base_calc_icms','a.total_icms', 'a.base_calc_icms_st',
                'a.total_icms_st','a.total_frete','a.total_outras_despesas','a.total_seguro',
                'a.total_ipi','a.total_isentos','a.total_pis','a.total_cofins','a.desconto_total',
                'a.acrescimo_total','a.total_produtos','a.usuario_id','a.tipo_mov','a.data_mov',
                'a.pre_venda_id','a.entidade_id','b.nome as nome_cliente','b.cnpj as cnpj_cliente','b.cep as cep_cliente',
                'b.logradouro as logradouro_cliente','b.numero as numero_cliente','b.email as email_cliente',
                'b.telefone1 as telefone_cliente','b.bairro','b.cidade','b.uf'])
            ->setFalseException(true)
            ->setMsgNaoEncontrado('Nenhuma nota encontrada com este id');

        $db = $this->db()->leftJoin('entidade b','a.entidade_id = b.id');

        $cabecalho_nota = $cabecalho_nota->setObjDb($db)->getEstoqueMov($estoque_mov_id);

        if(is_bool($cabecalho_nota)) return -1;

        $cabecalho_nota[0]->PAGTO = $this->setCamposRetornar(['forma_pagamento_id as FORMA_PAGTO_ID', 'valor', 'id'])
            ->setFalseException(true)
            ->getEstoqueMovPagto($estoque_mov_id);

        if(is_bool($cabecalho_nota[0]->PAGTO)) {
            $cabecalho_nota[0]->PAGTO = [];
        }

        $produtos_nfe = $this->setAliasTabela('a')
            ->setCamposRetornar(['a.ID','a.ITEM','a.produto_id','a.setor_id','a.codigo_barras','a.preco_compra','a.preco_venda',
                'a.quantidade','a.total_produto','a.setor_id','a.unidade_id as unidade','b.nome as nome_produto',
                'a.fator','a.cfop','a.aliquota_icms', 'a.valor_ipi','a.ncm','a.entidade_id','a.cst_icms',
                'a.valor_icms_st','a.base_calc_icms','a.data_mov','a.vendedor_id','a.produto_grade_id'])
            ->setFalseException(true)
            ->setMsgNaoEncontrado('Nenhum produto encontrado para esta nota');

        $db = $this->db()->leftJoin(Genericos::getSchema().'view_produtos b','a.produto_id = b.id')
            ->orderBy('id','asc');

        $produtos_nfe = $produtos_nfe->getEstoqueMovItem($estoque_mov_id);

        if(is_bool($produtos_nfe)) return -2;

        $this->loadModel('produto/produto');
        $produto = $this->model_produto_produto;

        foreach ($produtos_nfe as $key => $valor) {
            $grade = $valor->PRODUTO_GRADE_ID;

            if($grade != null) {
                $valor->GRADE = $produto->setFalseException(false)->getProdutoGrade($grade, true);
            }

            $unidade = $produto->getProdutoUnidadeMedida($valor->UNIDADE);
            $valor->UNIDADE = $unidade == false ? false : $unidade[0]->CODIGO;
            unset($valor->PRODUTO_GRADE_ID);
        }

        return ["CABECALHO"=>$cabecalho_nota[0], "PRODUTOS"=>$produtos_nfe];
    }

    /**
     * Objetivo: Retornar dados referentes a estoque mov salvos na base buscando pela chave da nfe
     * Recebe: chave da nfe
     * Retorna: Dados de um estoque mov completo
     * Autor: Nathan Feitoza
     * Data: 25/03/19 17:58
     * Nome Método: getEstoqueMovSalvosChaveNfe
     *
     * @param $chave_nfe
     * @param bool $estoque_id_somente
     * @param bool $sem_itens
     * @param bool $produto_id
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws \Exception
     */
    public function getEstoqueMovSalvosChaveNfe($chave_nfe, $estoque_id_somente = false, $sem_itens = false, $produto_id = false)
    {
        $verificar_nota = $this->setCamposRetornar(['id','documento','entidade_id','modelo_documento','chave_nfe','autorizacao_nfe','data_emissao','data_mov'])
            ->setMsgNaoEncontrado('Nota '.$chave_nfe.' não encontrada na base de dados')
            ->getEstoqueMov($chave_nfe);

        if(is_int($verificar_nota)) return false;

        $estoque_mov_id_chave_nfe = $verificar_nota[0]->ID;

        if($estoque_id_somente) return $estoque_mov_id_chave_nfe;

        if($sem_itens && !is_int($verificar_nota)) {
            $db = $this->db()->leftJoin(Genericos::getSchema().'produto_grade b', 'a.produto_grade_id = b.id');
            $verificar_nota = $this->setAliasTabela('a')
                ->setCamposRetornar(['a.id','a.produto_id','a.produto_grade_id','b.cor_id', 'b.tamanho_id']) // 'b.cor', 'b.tamanho'
                ->setMsgNaoEncontrado('Items não encontrados para a nota de chave '.$chave_nfe)
                ->setObjDb($db)
                ->getEstoqueMovItem($estoque_mov_id_chave_nfe, $produto_id);
        }

        return $verificar_nota;
    }

    /**
     * Objetivo: Recuperar as informações do banco de dados de produtos de uma nota fiscal lida
     * Recebe: objeto lido da tag "det" do arquivo xml da nota fiscal
     * Retorna: Array com as informações encontradas dos produtos encontrados na base de dados ou null caso não ache nada
     * Autor: Nathan Feitoza
     * Nome Método: getDadosProdutosNFe
     *
     * @param $produtos_nfe
     * @param $cnpj_entidade
     * @param bool $quant_produtos
     * @return array|null
     * @throws Exception
     * @autor Nathan Feitoza
     */
    protected function getDadosProdutosNFe($produtos_nfe,$cnpj_entidade,$quant_produtos=false)
    {
        $this->loadModel('produto/produto');
        $model_produto = $this->model_produto_produto;

        $produtos_nfe = (isset($produtos_nfe[0])) ? $produtos_nfe  : [$produtos_nfe];
        $produto_bd = null;

        foreach ($produtos_nfe as $i => $produto_nfe){
            $produto_nfe = (object) $produto_nfe;
            $n_item = $produto_nfe->attributes->nItem;

            // Produtos(s) NFe
            $prod = $produto_nfe->prod;
            $produto_id = $prod->cProd;
            $cEan = ( is_string($prod->cEAN) ) ? $prod->cEAN : 0; //cProd
            $produto_bd = $model_produto->setUsarException(false)->getProdutoNFE(['cnpj'=>$cnpj_entidade, 'id_emitente'=>$produto_id]);

            if(is_int($produto_bd)) {
                $produto_bd = $model_produto->setUsarException(false)->getProdutoNFE(['cnpj'=>$cnpj_entidade, 'cod_barras'=>$cEan]);
            }

            if(!is_int($produto_bd)) {
                $produto_bd = $model_produto->setUsarException(false)->getProduto($produto_bd[0]->PRODUTO_ID);
                $produto_bd = is_int($produto_bd) ? false : $produto_bd;
            } else {
                $produto_bd = false;
            }

            //vBCSTRet e vICMSSTRet
            if($quant_produtos == false) {
                if($produto_bd != false) {

                    $produto_bd = $produto_bd[0];
                    $dados_bd[] = [
                        "n_item" => $n_item,
                        "cEAN" => $cEan,
                        "cProd" => $produto_id,
                        "id" => $produto_bd->ID,
                        "descricao" => $produto_bd->NOME,
                        "unidade" => $produto_bd->UNIDADE,
                        "saldo_geral" => $produto_bd->SALDO_GERAL,
                        "cfop" => $produto_bd->CFOP_VENDA,
                        "grade" => $produto_bd->PRODUTO_GRADE,
                        "preco_compra" => $produto_bd->PRECO_COMPRA,
                        "preco_venda" => $produto_bd->PRECO_VENDA,
                    ];

                }
            }
        }

        return isset($dados_bd) ? $dados_bd : null;
    }

    /**
     * Objetivo: Analisar os dados que vem no xml da nota e recuperar as informações cadastradas no banco sobre a mesma
     * Recebe: Objeto retornado ao ler um xml da nfe
     * Retorna: array com as informações encontradas no banco após analisar o objeto da nfe
     * Autor: Nathan Feitoza
     * Nome Método: getAnalisarNFeEnviada
     *
     * @param $objeto_nfe
     * @return array
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getAnalisarNFeEnviada($objeto_nfe)
    {
        $this->loadModel('nfe/nfe_core');
        $this->loadModel('entidade/fornecedor');

        $model_nfe = $this->model_nfe_nfe_core;
        $model_fornecedor = $this->model_entidade_fornecedor;

        $chave_nfe = $model_nfe->getChaveNFe((object) $objeto_nfe);

        if(isset($objeto_nfe->NFe)) {
            $objeto_nfe = $objeto_nfe->NFe->infNFe;
        } elseif(isset($objeto_nfe->infNFe)) {
            $objeto_nfe = $objeto_nfe->infNFe;
        }

        if(isset($objeto_nfe)) {
            $destinatario = $objeto_nfe->dest;
            $emitente = $objeto_nfe->emit;

            // Destinatário informações
            $cnpj_destinatario = isset($destinatario->CNPJ) ? $destinatario->CNPJ : $destinatario->CPF; // Recupera o cnpj do destinatário

            // Empresa informações
            $cnpj_emit = $emitente->CNPJ; // Recupera o cnpj do destinatário

            $nome_emitente = $emitente->xNome;
            $nome_fantasia_emitente = (isset($emitente->xFant)) ? $emitente->xFant : $emitente->xNome;

            // Verificação de CNPJ
            #$verificar_cnpj_destinatario = $this->fornecedor->getFornecedorCNPJ(["cnpj"=>$cnpj_destinatario], false); // Armazena o retorno da função que verifica se o cnpj é o da empresa destinatário, no caso a que recebe a nota

            $verificar_cnpj_emitente = $model_fornecedor->setFalseException(true)->getFornecedorCNPJ($cnpj_emit); //Faz o mesmo que a variável acima, só que com o emitente

            //if("ok" == "ok") { //$verificar_cnpj_destin == "ok" -- Fazer critica para o usuário que tem um destinatario diferente
            if($verificar_cnpj_emitente == false) {
                $dados_emitente = $objeto_nfe->emit;
                // Passar o array que irá fazer a autorização para cadastrar fornecedor
                $autorizar_cadastrar_fornecedor = ["dados_fornecedor" => $dados_emitente];
            }

            // Total da Nota
            $total_nota = $objeto_nfe->total;

            $cadastrar_fornecedor = (isset($autorizar_cadastrar_fornecedor)) ? $autorizar_cadastrar_fornecedor : false;

            $fornecedor_encontrado = (!isset($autorizar_cadastrar_fornecedor)) ? ["id"=>$verificar_cnpj_emitente[0]->ID,"nome"=>$nome_emitente, "cnpj_cpf"=>$cnpj_emit] : false;

            $produtos = $this->getDadosProdutosNFe( (array) $objeto_nfe->det,$cnpj_emit,$cadastrar_fornecedor);

            $estoque = $this->setUsarException(false)->getEstoqueMovSalvosChaveNfe($chave_nfe,true);

            if($estoque != false) {
                $estoque = $this->setUsarException(false)->getEstoqueMovSalvoId($estoque);
            } else {
                $estoque = null;
            }

            if(!is_null($produtos)) {
                foreach ($produtos as $i => $prods) {
                    $dados = $this->setUsarException(false)->getEstoqueMovSalvosChaveNfe($chave_nfe,false,$prods['id']);
                    $produtos[$i]['estoque'] = is_int($dados) ? null : $dados[0];
                }
            }

            return [
                "cadastrar_fornecedor"=>$cadastrar_fornecedor,
                "produtos"=> $produtos,
                "fornecedor_cadastrado" => $fornecedor_encontrado,
                "estoque_dados" => $estoque
            ];

            /*} else {
                throw new AppException("Erro CNPJ destinatário: ".$verificar_cnpj_destin,275);
            }*/
        } else {
            throw new AppException("Esta nota não é uma nota fiscal, por favor envie outro arquivo", 274);
        }
    }

    /**
     * Objetivo: Gravar ou atualizar os dados de uma nota em estoque mov
     * Recebe: Array com os campos da URL que serão usados para gravar seus dados na tabela estoque_mov
     * Retorna: Mensagem informando que a nota foi gravada
     * Autor: Nathan Feitoza
     * Nome Método: setGravarAtualizarEstoqueMovItemManual
     *
     * @param $dados_cadastrar_atualizar
     * @return string
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function setGravarAtualizarEstoqueMovItemManual($dados_cadastrar_atualizar)
    {
        $this->loadModel('produto/produto');
        $model_produto = $this->model_produto_produto;

        $necessarios = ['inscr_estadual','saida','vendedor','icms','total_ipi',
            'out_despesas','valor_frete','base_de_calc_subst',
            'icms_subst','base_de_calc','desconto','total_produtos',
            'total_nfe','tipo_mov','modelo_doc','caixa','documento'];

        $necessarios_itens = ['codigo','desc_produto','ncm','unidade','preco_compra',
            'quantidade','total','st','base','ipi','cfop',
            'icms_prod','preco_venda','cest','setor_id'];

        $necessarios_vai_validar = $necessarios;
        $necessarios_vai_validar[] = $necessarios_itens[0];
        
        $poderao_vir = ['nome_cliente','cpf_cnpj','id_entidade','cep','endereco',
            'numero','tel','bairro','cidade','turno','pdv','f_nfe','uf'];
        
        //$entidade_id = cpf_cnpj pegar;
        $cpf_cnpj = Genericos::camposVazios($dados_cadastrar_atualizar, [$poderao_vir[1]]) == 1 ? preg_replace("/\D+/", "", $dados_cadastrar_atualizar[$poderao_vir[1]]) : '';
        $data_mov = date('Y-m-d');
        $atualizar_itens = Genericos::camposVazios($dados_cadastrar_atualizar, ['atualizar']) == 1;

        Genericos::camposVazios($dados_cadastrar_atualizar, ['id_estoque'], $atualizar_itens);

        $campos_add = ['documento','entidade_id','modelo_documento','data_emissao',
            'total_documento','base_calc_icms','total_icms', 'base_calc_icms_st',
            'total_icms_st','total_frete','total_outras_despesas','total_seguro',
            'total_ipi','total_isentos','total_pis','total_cofins','desconto_total',
            'acrescimo_total','total_produtos','usuario_id','tipo_mov','data_mov',
            'caixa_id','turno','pdv', 'chave_nfe','autorizacao_nfe','serie',
            'pre_venda_id','vendedor_id'];

        $modelo_documento = $dados_cadastrar_atualizar[$necessarios[14]];
        $caixa_id = $dados_cadastrar_atualizar[$necessarios[15]];
        $turno = Genericos::verificarCampoPreenchido($dados_cadastrar_atualizar, $poderao_vir[9]) ? $dados_cadastrar_atualizar[$poderao_vir[9]] : null;
        $pdv = Genericos::verificarCampoPreenchido($dados_cadastrar_atualizar, $poderao_vir[10]) ? $dados_cadastrar_atualizar[$poderao_vir[10]] : null;
        $forma_pagto = Genericos::camposVazios($dados_cadastrar_atualizar, ['forma_pagto']) == 1 ? $dados_cadastrar_atualizar['forma_pagto'] : null;
        $valor_forma_pagto = Genericos::camposVazios($dados_cadastrar_atualizar, ['valor_forma_pagto']) == 1 ? $dados_cadastrar_atualizar['valor_forma_pagto'] : null;
        $chave_nfe = Genericos::camposVazios($dados_cadastrar_atualizar, ['chave_nfe']) == 1 ? $dados_cadastrar_atualizar['chave_nfe'] : null;

        if(!is_null($chave_nfe)) {
            $chave_nfe = substr($chave_nfe, 0, 44);
        }

        $autorizacao_nfe = Genericos::camposVazios($dados_cadastrar_atualizar, ['autorizacao_nfe']) == 1 ? $dados_cadastrar_atualizar['autorizacao_nfe'] : null;

        if(!is_null($autorizacao_nfe)) {
            $autorizacao_nfe = substr($autorizacao_nfe, 0, 10);
        }

        $serie = Genericos::camposVazios($dados_cadastrar_atualizar, ['serie']) == 1 ? $dados_cadastrar_atualizar['serie'] : null;
        $pre_venda_id = Genericos::camposVazios($dados_cadastrar_atualizar, ['pre_venda_id']) == 1 ? $dados_cadastrar_atualizar['pre_venda_id'] : null;
        $valor_seguro = 0;
        $valor_ipi = 0;
        $valor_isentos = 0;
        $valor_pis = 0;
        $valor_cofins = 0;
        $usuario_id = 1791; // por enquanto
        $documento = $dados_cadastrar_atualizar[end($necessarios)];
        $data_emissao = $dados_cadastrar_atualizar[$necessarios[1]];
        $total_documento = 0; // $dados_cadastrar_atualizar[$necessarios[12]]
        $base_calc_icms = 0; // $dados_cadastrar_atualizar[$necessarios[9]]
        $valor_icms = $dados_cadastrar_atualizar[$necessarios[3]]; // 23
        $base_calc_icms_st = 0; // $dados_cadastrar_atualizar[$necessarios[7]]
        $valor_icms_st = $dados_cadastrar_atualizar[$necessarios[8]]; // 21
        $valor_frete = $dados_cadastrar_atualizar[$necessarios[6]]; // 19
        $valor_outras_despesas = $dados_cadastrar_atualizar[$necessarios[5]]; // 18
        $desconto_total = 0; // $dados_cadastrar_atualizar[$necessarios[10]]
        $acrescimo_total = 0; // por ahora
        $total_produtos = 0; // $dados_cadastrar_atualizar[$necessarios[11]]
        $tipo_mov = $dados_cadastrar_atualizar[$necessarios[13]]; // 29
        $data_mov = date('Y-m-d');
        $entidade_id = Genericos::camposVazios($dados_cadastrar_atualizar, [$poderao_vir[2]]) ? $dados_cadastrar_atualizar[$poderao_vir[2]] : 0;//$this->fornecedor->getFornecedorCNPJ(["cnpj"=>$cpf_cnpj, "fornecedor"=>1], false);
        $email = Genericos::camposVazios($dados_cadastrar_atualizar, ["email"]) == 1 ? $dados_cadastrar_atualizar["email"] : null;


        $vazio_zero = function($dado) {
            return (strlen($dado) == 0) ? 0 : Genericos::converterNumero($dado);
        };

        $fator = 1; // por enquanto
        $vendedor_id = $dados_cadastrar_atualizar[$necessarios[2]];
        $estoque_mov_id = ((int) $this->getUltimoEstoqueMovId()) + 1;

        /*$campos_add_itens = ['estoque_mov_id','item','produto_id','quantidade',
            'quantidade_documento','preco_compra','total_produto','setor_id',
            'unidade_id','fator','cfop', 'aliquota_icms', 'valor_ipi',
            'ncm','entidade_id','data_mov','vendedor_id','produto_grade_id',
            'valor_icms_st','base_calc_icms','cst_icms','preco_venda','cest'];*/

        $regular = 0;
        $usar_item = Genericos::camposVazios($dados_cadastrar_atualizar, ['itens']) == 1;

        $unidades = [];
        $produtos_enviados = Genericos::camposVazios($dados_cadastrar_atualizar,[$necessarios_itens[0]]) == 1;

        if($produtos_enviados) {
            Genericos::camposVazios($dados_cadastrar_atualizar, $necessarios_itens, true);
            foreach ($dados_cadastrar_atualizar[$necessarios_itens[0]] as $chave_pre => $valor_pre) {
                if (strlen($valor_pre) != 0) {
                    $unidades[$chave_pre] = $model_produto->getProdutoUnidadeMedida($dados_cadastrar_atualizar[$necessarios_itens[3]][$chave_pre]);
                }
            }
        }

        $transacao_p = $this->db();
        $transacao_p->iniciarTransacao();

        $id_estoque = $atualizar_itens ? $dados_cadastrar_atualizar['id_estoque'] : $estoque_mov_id;
        $verificar_existe = $this
            ->setCamposRetornar(['id'])
            ->setUsarException(false)
            ->db()
            ->tabela(Genericos::getSchema().'estoque_mov')
            ->where('documento','=',$documento)
            ->whereAnd('entidade_id','=', $entidade_id,$id_estoque)
            ->whereAnd('id', '<>', $id_estoque);

        if(!is_int($verificar_existe->buildQuery('select'))) {
            throw new AppException(json_encode(['msg'=>'Já existe uma nota com este documento e fornecedor', 'id_nota'=>$verificar_existe[0]->ID]),325);
        }

        $valores_add_estoque_mov = [$documento, $entidade_id, $modelo_documento,
            $data_emissao, $total_documento, $base_calc_icms, $valor_icms,
            $base_calc_icms_st, $valor_icms_st, $valor_frete, $valor_outras_despesas,
            $valor_seguro, $valor_ipi, $valor_isentos, $valor_pis, $valor_cofins,
            $desconto_total, $acrescimo_total, $total_produtos, $usuario_id, $tipo_mov,
            $data_mov, $caixa_id,$turno, $pdv, $chave_nfe, $autorizacao_nfe,$serie,
            $pre_venda_id, $vendedor_id];

        if($atualizar_itens) {
            $estoque_mov_id = $dados_cadastrar_atualizar['id_estoque'];

            $this->deletar_bd1_estoque_mov(function($where) use ($estoque_mov_id){
                $where->where('id','=', $estoque_mov_id);
            });

            $campos_add[count($campos_add)] = 'id';
            $valores_add_estoque_mov[count($valores_add_estoque_mov)] = $estoque_mov_id;
        }

        $this->inserir_bd1_estoque_mov($campos_add, $valores_add_estoque_mov);

        try {

            if($produtos_enviados) {
                for ($i = 0, $dados_qntd = count($dados_cadastrar_atualizar[$necessarios_itens[0]]); $i < $dados_qntd; $i++) {
                    $item = ($i + 1);
                    $produto_id = $dados_cadastrar_atualizar[$necessarios_itens[0]][$i];
                    if (strlen($produto_id) != 0) {
                        $quantidade = $vazio_zero($dados_cadastrar_atualizar[$necessarios_itens[5]][$i]);
                        $quantidade_documento = $vazio_zero($quantidade);
                        $preco_compra = $vazio_zero($dados_cadastrar_atualizar[$necessarios_itens[4]][$i]);
                        $preco_venda = $vazio_zero($dados_cadastrar_atualizar[$necessarios_itens[12]][$i]);
                        $cest = $vazio_zero($dados_cadastrar_atualizar[$necessarios_itens[13]][$i]);
                        $total_produto = $vazio_zero($dados_cadastrar_atualizar[$necessarios_itens[6]][$i]);
                        $unidade_id = $unidades[$i];//$this->produtos->getProdutoUnidadeMedida($dados_cadastrar_atualizar[$necessarios[8]][$i]);
                        $unidade_id = $unidade_id == false ? 0 : $unidade_id[0]->ID;
                        $cfop = $vazio_zero($dados_cadastrar_atualizar[$necessarios_itens[10]][$i]);
                        $aliquota_icms = $vazio_zero($dados_cadastrar_atualizar[$necessarios_itens[11]][$i]);
                        $valor_ipi = $vazio_zero($dados_cadastrar_atualizar[$necessarios_itens[9]][$i]);
                        $ncm = $vazio_zero($dados_cadastrar_atualizar[$necessarios_itens[2]][$i]);
                        $grade_id = Genericos::camposVazios($dados_cadastrar_atualizar, ['grades_id']) == 1 ? (int)(isset($dados_cadastrar_atualizar['grades_id'][$i]) ? $dados_cadastrar_atualizar['grades_id'][$i] : -1) : -1;
                        $grade_id = ($grade_id == -1 || $grade_id == 0) ? null : $grade_id;
                        $setor_id = $dados_cadastrar_atualizar[end($necessarios_itens)][$i];
                        $st = isset($dados_cadastrar_atualizar[$necessarios_itens[7]][$i]) ? $dados_cadastrar_atualizar[$necessarios_itens[7]][$i] : null;
                        $base_calc_icms = $vazio_zero($dados_cadastrar_atualizar[$necessarios_itens[8]][$i]);
                        $transacao = is_null($forma_pagto) ? false : true;

                        $adicionarEstoqueMovItem = [
                            'estoque_mov_id' => $estoque_mov_id,
                            'item' => $item,
                            'produto_id' => $produto_id,
                            'quantidade' => $quantidade,
                            'quantidade_documento' => $quantidade_documento,
                            'preco_compra' => $preco_compra,
                            'total_produto' => $total_produto,
                            'setor_id' => $setor_id,
                            'unidade_id' => $unidade_id,
                            'fator' => $fator,
                            'cfop' => $cfop,
                            'aliquota_icms' => $aliquota_icms,
                            'valor_ipi' => $valor_ipi,
                            'ncm' => $ncm,
                            'entidade_id' => $entidade_id,
                            'data_mov' => $data_mov,
                            'vendedor_id' => $vendedor_id,
                            'produto_grade_id' => $grade_id,
                            'valor_icms_st' => 0,
                            'base_calc_icms' => $base_calc_icms,
                            'cst_icms' => $st,
                            'preco_venda' => $preco_venda,
                        ];

                        $this->inserir_bd1_estoque_mov_item(array_keys($adicionarEstoqueMovItem), array_values($adicionarEstoqueMovItem));

                        /*$this->inserir_bd1_estoque_mov_item($campos_add_itens,
                            [$estoque_mov_id, $item, $produto_id, $quantidade,
                                $quantidade_documento, $preco_compra, $total_produto,
                                $setor_id, $unidade_id, $fator, $cfop, $aliquota_icms,
                                $valor_ipi, $ncm, $entidade_id, $data_mov, $vendedor_id,
                                $grade_id, 0, $base_calc_icms, $st, $preco_venda, $cest]);*/

                    }
                    $regular++;
                }
            }
            if(!is_null($forma_pagto)) {

                $this->deletar_bd1_estoque_mov_pagto(function($where) use ($estoque_mov_id){
                    $where->where('estoque_mov_id', '=', $estoque_mov_id);
                });

                foreach ($forma_pagto as $chave_pagto => $id_forma) {
                    $transacao = ((count($forma_pagto) - 1) == $chave_pagto) ? false : true;

                    if(!is_null($valor_forma_pagto)){
                        if(isset($valor_forma_pagto[$chave_pagto])) {
                            $valor_pagto = is_array($valor_forma_pagto) ? $valor_forma_pagto[$chave_pagto] : $valor_forma_pagto;
                        } else {
                            $valor_pagto = $total_documento;
                        }
                    } else {
                        $valor_pagto = $total_documento;
                    }

                    $valor_pagto = (double) $valor_pagto;

                    $this->inserir_bd1_estoque_mov_pagto(['estoque_mov_id','forma_pagamento_id','documento','valor'],
                        [$estoque_mov_id, (int) $id_forma,$documento,$valor_pagto]);
                }
            }
        } catch (AppException $e) {
            $transacao_p->rollback();
            // Para limpar quando der erro em algo nas transações
            throw new AppException($e->getMessage(), $e->getCode());
        }
        $transacao_p->commit();


        $salvar = 'ID_Nota = '.$estoque_mov_id.' || '.
            'Documento_Nota = '.$documento.' || '.
            'Data_Emissao = '.date('Y-m-d H:i:s').' || '.
            'Data_Saida_Entrada = '.$data_emissao.' || '.
            'Valor_NF = '.number_format($total_documento, 2, ',','.').' || '.
            'Entidade = '.$entidade_id;
        //$this->gravarLogSC('insert',false, $salvar);

        return ['msg' => "Nota ID: ".$estoque_mov_id." gravada com sucesso", 'estoque_mov_id' => $estoque_mov_id];
    }

    /**
     * Objetivo: Gravar ou atualizar o estoque mov com dados vindos de uma leitura de um xml na tela de entrada de notas
     * Recebe: dados do json da nota
     * Retorna: Mensagem informando que a nota foi salva
     * Autor: Nathan Feitoza
     * Nome Método: setGravarAtualizarEstoqueMovItemXML
     *
     * @param $dados_json_xml_nota
     * @return string
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function setGravarAtualizarEstoqueMovItemXML($dados_json_xml_nota)
    {
        $this->loadModel('produto/produto');
        $model_produto = $this->model_produto_produto;

        if(is_string($dados_json_xml_nota)) {
            $dados_json_xml_nota = json_decode($dados_json_xml_nota, true);
            if(is_null($dados_json_xml_nota) OR !$dados_json_xml_nota) throw new AppException('JSON enviado não é válido', 321);
        } else {
            throw new AppException('JSON enviado não é válido', 321);
        }

        $validar = ["cabecalho_nfe", "destinatario", "emitente", "produtos","rodape_nota"];
        Genericos::camposVazios((array) $dados_json_xml_nota, $validar,true);

        if(!isset($dados_json_xml_nota["grades_produtos"])) {
            throw new AppException('Não foram passadas informações sobre as grades dos produtos', 1564, 401);
        }

        $cabecalho_nfe = (object) $dados_json_xml_nota[$validar[0]];
        $destinatario = (object) $dados_json_xml_nota[$validar[1]];
        $emitente = (object) $dados_json_xml_nota[$validar[2]];
        $produtos_nfe = (object) $dados_json_xml_nota[$validar[3]];
        $grades_produtos = (object) $dados_json_xml_nota["grades_produtos"];
        $rodape_nfe = (object) $dados_json_xml_nota[end($validar)];


        $campos_estoque_mov = ['documento', 'entidade_id', 'modelo_documento', 'chave_nfe', 'autorizacao_nfe', 'data_emissao', 'data_mov', 'serie', 'total_documento', 'base_calc_icms', 'total_icms', 'base_calc_icms_st', 'total_icms_st', 'total_frete', 'total_seguro', 'total_outras_despesas', 'total_ipi', 'total_isentos', 'total_pis', 'total_cofins', 'tipo_frete', 'desconto_total', 'acrescimo_total', 'total_produtos', 'usuario_id'];
        $campos_estoque_mov_item = ['item', 'produto_id', 'codigo_barras', 'quantidade', 'quantidade_documento', 'preco_compra', 'total_produto', 'setor_id', 'unidade_id', 'fator', 'cfop', 'cst_icms', 'cst_pis_cofins', 'cst_ipi', 'base_calc_icms', 'aliquota_icms', 'valor_icms', 'base_calc_icms_st', 'valor_icms_st', 'valor_ipi', 'desconto_item', 'acrescimo_item', 'inserido', 'ncm', 'entidade_id', 'data_mov', 'valor_frete', 'valor_seguro', 'vendedor_id', 'comissao', 'estoque_mov_id','produto_grade_id'];
        $total_produtos = 0;
        $produtos_add = [];
        $id_fornecedor = $emitente->id_fornecedor;

        foreach($produtos_nfe->quant_estoque as $i => $dados_produtos) {
            $produto_id = $produtos_nfe->codigo_produto[$i];

            if (strlen($produto_id) > 0) {
                $quantidade_prod = str_replace('.', '', $dados_produtos);
                $quantidade_prod = (float)str_replace(',', '.', $quantidade_prod);

                $valor_und = (float)$produtos_nfe->valor_und[$i];
                $produto_id_bd = $produtos_nfe->codigo_produto[$i];
                $n_item = ($i + 1);
                $cEAN = $produtos_nfe->cEAN[$i];
                $qntd_doc = $produtos_nfe->qCom[$i];
                $unidade_id = $model_produto->getProdutoUnidadeMedida($produtos_nfe->unidade[$i]);//1;
                $unidade_id = $unidade_id == false ? 1 : $unidade_id[0]->ID;

                $setor_prod = $produtos_nfe->setor[$i];
                $fator = 1;
                $cfop = $produtos_nfe->cfop_compra[$i];
                $icms_cst = $produtos_nfe->icms_CST[$i];
                $cofins_cst = $produtos_nfe->cofins_CST[$i];
                $ipi_cst = $produtos_nfe->ipi_CST[$i];
                $cms_vBC = $produtos_nfe->icms_vBC[$i];
                $icms_pICMS = $produtos_nfe->icms_pICMS[$i];
                $icms_vICMS = $produtos_nfe->icms_vICMS[$i];
                $icms_vBCSTRet = $produtos_nfe->icms_vBCSTRet[$i];
                $icms_vICMSSTRet = $produtos_nfe->icms_vICMSSTRet[$i];
                $ipi_vIPI = $produtos_nfe->ipi_vIPI[$i];
                $desconto_prod = $produtos_nfe->desconto_prod[$i];
                $vOutro = $produtos_nfe->vOutro[$i];
                $NCM = $produtos_nfe->NCM[$i];
                $vFrete = $produtos_nfe->vFrete[$i];
                $vSeg = $produtos_nfe->vSeg[$i];
                $vendedor_id = 1791;
                $comissao = 0;
                $tipo_mov = 1;
                $total_produto = $quantidade_prod * $valor_und;

                $produtos_add[] = [$n_item, $produto_id_bd, $cEAN, $quantidade_prod, $qntd_doc,
                    $valor_und, $total_produto, $setor_prod, $unidade_id, $fator, $cfop, $icms_cst, $cofins_cst,
                    $ipi_cst, $cms_vBC, $icms_pICMS, $icms_vICMS, $icms_vBCSTRet, $icms_vICMSSTRet,
                    $ipi_vIPI, $desconto_prod, $vOutro, date('Y-m-d H:i:s'), $NCM,
                    $id_fornecedor, date('Y-m-d'), $vFrete, $vSeg, $vendedor_id, $comissao];
                $total_produtos += $total_produto;
            }
        }

        if (count($produtos_add) > 0) {
            $acrescimo_total = 0.00; // Definir ainda onde irá buscar
            $chave_nfe = $cabecalho_nfe->chave_nfe;
            $documento = $cabecalho_nfe->nNf;
            $add_estoque_mov = [$documento, $id_fornecedor, $cabecalho_nfe->modelo,
                $chave_nfe, $cabecalho_nfe->autorizacao,
                $cabecalho_nfe->data_emissao, $cabecalho_nfe->data_entrada,
                $cabecalho_nfe->serie, $cabecalho_nfe->vNF, $cabecalho_nfe->vBC,
                $cabecalho_nfe->vICMS, $cabecalho_nfe->vST, $cabecalho_nfe->vICMS,
                $cabecalho_nfe->vFrete, $cabecalho_nfe->vSeg, $cabecalho_nfe->vOutro,
                $cabecalho_nfe->vIPI, $cabecalho_nfe->vII, $cabecalho_nfe->vPIS,
                $cabecalho_nfe->vCOFINS, $cabecalho_nfe->tipo_frete,
                $cabecalho_nfe->vDesc, $acrescimo_total, $total_produtos, $vendedor_id];

            $estoque_mov_id = $this->getUltimoEstoqueMovId() + 1;
            $verificar_estoque_mov_id = $this->setUsarException(false)->getEstoqueMovSalvosChaveNfe($chave_nfe,true);

            if($verificar_estoque_mov_id != false) {
                $estoque_mov_id = $verificar_estoque_mov_id;
                $campos_estoque_mov[count($campos_estoque_mov)] = 'id';
                $add_estoque_mov[count($add_estoque_mov)] = $estoque_mov_id;
            }

            $adicionar_prod = $this->db();
            $adicionar_prod->iniciarTransacao();

            $this->deletar_bd1_estoque_mov(function($where) use ($chave_nfe){
                $where->where('chave_nfe','=',$chave_nfe);
            });

            $this->inserir_bd1_estoque_mov($campos_estoque_mov, $add_estoque_mov);

            foreach ($produtos_add as $i => $produto) {
                $produto[count($produto)] = $estoque_mov_id;
                $grades_produtos = (array) $grades_produtos;
                $usar_grade = isset($grades_produtos[$i]) ? $grades_produtos[$i] : null;
                $usar_grade = strlen((string) $usar_grade) == 0 ? null : $usar_grade;

                $produto[count($produto)] = $usar_grade;

                $this->inserir_bd1_estoque_mov_item($campos_estoque_mov_item, $produto);
            }

            foreach($cabecalho_nfe->forma_pagto as $i => $formas_pagto) {
                $valor_forma_pagto = $cabecalho_nfe->valor_forma_pagto[$i];

                $this->inserir_bd1_estoque_mov_pagto(['estoque_mov_id','forma_pagamento_id','documento','valor'],
                    [$estoque_mov_id, $formas_pagto, $documento , $valor_forma_pagto]);
            }

            $adicionar_prod->commit();

            return 'Nota de chave: '.$chave_nfe.' salva com sucesso';

        } else {

            throw new AppException('Nenhum produto enviado', 404);
        }

    }

    /**
     * Objetivo: Excluir um item da tabela estoque mov e, em cascata, seus relacionados em //_item e //_pagto
     * Recebe: Id da nota
     * Retorna: mensagem informando que a nota foi excluida
     * Autor: Nathan Feitoza
     * Nome Método: setExcluirEstoqueMov
     *
     * @param $nota_id
     * @param bool $usar_chave
     * @param bool $objeto_buildquery
     * @return string
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function setExcluirEstoqueMov($nota_id, $usar_chave=false)
    {
        $this->loadModel('entidade/empresa');
        $this->loadModel('nfe/nfe_core');
        $campo_buscar = 'id';

        if($usar_chave != false) {
            $campo_buscar = 'chave_nfe';
            $cnpj = $this->model_entidade_empresa->CNPJ;

            $emissao_formatar = $this->model_nfe_nfe_core->getDataEmissaoNFeChave($nota_id);
            $ano = $emissao_formatar['ano'];
            $mes = $emissao_formatar['mes'];

            $pasta_enviar = $this->model_nfe_nfe_core->getPastaXMLNFe($cnpj, $ano, $mes);
            $arquivo = $pasta_enviar.$nota_id.'.xml';
        }

        $this->deletar_bd1_estoque_mov(function($where) use ($campo_buscar, $nota_id){
            $where->where($campo_buscar,'=', $nota_id);
        });

        if(isset($arquivo)) {
            if(file_exists($arquivo)) unlink($arquivo);
        }

        return 'Estoque mov '.$nota_id.' removida com sucesso';
    }

    /**
     * Objetivo: Buscar os dados de um xml já salvo e retornar suas informações no padrão para leitura
     * Recebe: A chave da NFE
     * Retorna: array com dados lidos e convertidos para objeto do xml
     * Autor: Nathan Feitoza
     * Nome Método: getDadosXMLNFe
     *
     * @param $chave_nfe
     * @return array
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getDadosXMLNFe($chave_nfe)
    {
        $this->loadModel('nfe/nfe_core');
        $nfe_core = $this->model_nfe_nfe_core;

        if(strlen($chave_nfe) != 44) return 322;

        $dir_xml = $nfe_core->getCaminhoArquivoChave($chave_nfe);

        if(!$dir_xml) return 404;

        $ler = $nfe_core->setLerXML($dir_xml);
        $ja_cadastrados[] = $this->getAnalisarNFeEnviada($ler);

        return $nfe_core->getFormatacaoNotaLida('Lido',$ler,$ja_cadastrados);
    }

    public function getProdutosSaidas()
    {
        $dados = $this->db()->tabela(Genericos::getSchema() . 'view_produtos_saidas')
            ->setMsgNaoEncontrado('Nenhum produto encontrado para a movimentação')
            ->buildQuery('select');

        return $dados;
    }

    public function vendaPdv($dados_venda)
    {
        $this->loadModel('produto/produto');
        $model_produto = $this->model_produto_produto;

        $necessarios = ['cabecalho','produtos','pagamento'];

        Genericos::camposVazios($dados_venda, $necessarios, true);

        $cabecalho = $dados_venda['cabecalho'];
        $produtos = $dados_venda['produtos'];
        $pagamento_venda = $dados_venda['pagamento'];

        $necessarios_cabecalho = ['modo_operacao','vias_pre_conta','vias_producao',
            'impressora','setor','taxa_servico','tipo_impressora',
            'modelo_pedido_impresso','impressora_expedicao',
            'caixa_id','usuario_logado','estacao','modelo_documento'];

        Genericos::camposVazios($cabecalho, $necessarios_cabecalho, true);

        $necessarios_pagamentos = ['acrescimo','desconto', 'pagamento'];

        Genericos::camposVazios($pagamento_venda, $necessarios_pagamentos, true);

        $transacao = $this->db();
        $transacao->iniciarTransacao();

        $adicionar_estoque_mov = [
            'data_emissao' => date('Y-m-d'),
            'data_mov' => date('Y-m-d'),
            'documento' => substr(uniqid() . time(), 0,10),
            'entidade_id' => $cabecalho['usuario_logado'],
            'modelo_documento' => $cabecalho['modelo_documento'],
            'pdv' => $cabecalho['estacao'],
            'tipo_mov' => 0,
            'usuario_id' => $cabecalho['usuario_logado']
        ];

        $this->inserir_bd1_estoque_mov(array_keys($adicionar_estoque_mov), array_values($adicionar_estoque_mov));

        $estoque_mov_id = $this->getUltimoEstoqueMovId();

        $necessarios_produtos = ['id','preco_venda','quantidade'];

        foreach ($produtos as $i => $produto) {
            Genericos::camposVazios($produto, $necessarios_produtos, true);
            $produto = (object) $produto;

            $produto_dados = $model_produto->getProduto($produto->id)[0];
            $quantidade_produto = Genericos::converterNumero($produto->quantidade);

            $adicionar_estoque_mov_item = [
                'cfop' => $produto_dados->CFOP_VENDA,
                'codigo_barras' => $produto_dados->CODIGO_BARRAS,
                'entidade_id' => $cabecalho['usuario_logado'],
                'estoque_mov_id' => $estoque_mov_id,
                'item' => $i + 1,
                'mov_estoque' => 1,
                'preco_venda' => $produto_dados->PRECO_VENDA,
                'preco_compra' => $produto_dados->PRECO_COMPRA,
                'produto_composto' => 0, // Modificar depois
                'produto_grade_id' => (strlen($produto->grade_id) > 0) ? $produto->grade_id : null,
                'produto_id' => $produto->id,
                'quantidade' => $quantidade_produto,
                'setor_id' => (int) $cabecalho['setor'],
                'total_produto' => $quantidade_produto * $produto_dados->PRECO_VENDA,
                'unidade_id' => $produto_dados->UNIDADE_MEDIDA,
                'vendedor_id' => $cabecalho['usuario_logado']
            ];

            $this->inserir_bd1_estoque_mov_item(array_keys($adicionar_estoque_mov_item), array_values($adicionar_estoque_mov_item));
        }

        $necessarios_pagamentos_formas = ['forma_pagamento', 'valor'];

        //$pagamento_venda['acrescimo']
        foreach ($pagamento_venda['pagamento'] as $i => $pagamento) {
            Genericos::camposVazios($pagamento, $necessarios_pagamentos_formas, true);

            $pagamento = (object) $pagamento;

            $adicionar_estoque_mov_pagto = [
                'desconto' => $pagamento_venda['desconto'],
                'documento' => $pagamento->documento[0],
                'estoque_mov_id' => $estoque_mov_id,
                'forma_pagamento_id' => $pagamento->forma_pagamento['ID'],
                'valor' => Genericos::converterNumero($pagamento->valor)
            ];

            $this->inserir_bd1_estoque_mov_pagto(array_keys($adicionar_estoque_mov_pagto), array_values($adicionar_estoque_mov_pagto));
        }

        $transacao->commit();

        return ['msg' => 'Venda registrada', 'estoque_mov_id' => $estoque_mov_id];
    }
}