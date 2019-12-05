<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 17/03/19
 * Time: 03:07
 */

namespace AppModel\produto;


use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;

class Produto extends Model
{

    /**
     * Objetivo: Listar os produtos cadastrados
     * Recebe:
     * Retorna: os produtos paginados ou totalmente
     * Autor: Nathan Feitoza
     * Data: 17/03/19 03:31
     * Nome Método: geProdutos
     *
     * @return \AppCore\bd\BD|array|bool|mixed
     * @throws \AppCore\errors\AppException
     */
    public function geProdutos()
    {
        return $this->getDadosPaginadosGenerico(
            Genericos::getSchema().'view_produtos',
            function($produto) {
                $produto->orderBy('nome','asc');
            }
        );
    }

    /**
     * Objetivo: Recuperar um produto por seu id
     * Recebe: O id do produto
     * Retorna: O produto filtrado ou um callback do buildquery
     * Autor: Nathan Feitoza
     * Data: 17/03/19 03:31
     * Nome Método: getProduto
     *
     * @param $produto_id
     * @return mixed
     */
    public function getProduto($produto_id)
    {
        return $this->db()->tabela(Genericos::getSchema().'view_produtos')
            ->where('id','=',$produto_id)
            ->setMsgNaoEncontrado('Nenhum produto encontrado com o id '.$produto_id)
            ->buildQuery('select');
    }


    /**
     * Objetivo: Recuperar produtos por nome
     * Recebe: O nome do produto
     * Retorna: Os produtos condizentes com o nome
     * Autor: Nathan Feitoza
     * Data: 17/03/19 03:29
     * Nome Método: getProdutoNome
     *
     * @param $produto_nome
     * @return \AppCore\bd\BD|array|bool|mixed
     * @throws \AppCore\errors\AppException
     */
    public function getProdutoNome($produto_nome)
    {

        return $this->getDadosPaginadosGenerico(
            Genericos::getSchema().'view_produtos',
            function($produto) use($produto_nome) {
                $produto
                    ->setMsgNaoEncontrado('Nenhum produto encontrado com o nome '.$produto_nome)
                    ->orderBy('nome','asc');
            },
            function ($where) use ($produto_nome) {
                $where->where('nome','ilike','%'.$produto_nome.'%');
            }
        );
    }

    /**
     * Objetivo: Recuperar um produto por seu codigo_barras
     * Recebe: O codigo de barras do produto
     * Retorna: O produto filtrado
     * Autor: Nathan Feitoza
     * Data: 17/03/19 03:29
     * Nome Método: getProdutoCodigoBarras
     *
     * @param $produto_codigo_barras
     * @return mixed
     */
    public function getProdutoCodigoBarras($produto_codigo_barras)
    {
        return $this->db()->tabela(Genericos::getSchema().'view_produtos')
            ->where('codigo_barras','=',$produto_codigo_barras)
            ->setMsgNaoEncontrado('Nenhum produto encontrado com o codigo de barras '.$produto_codigo_barras)
            ->buildQuery('select');
    }

    /**
     * Objetivo: Recuperar os setores cadastrados
     * Retorna: Os setores cadastrados
     * Autor: Nathan Feitoza
     * Nome Método: getListarSetor
     *
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getListarSetor()
    {
        return $this->db()->tabela(Genericos::getSchema().'view_setores')->buildQuery('select');
    }

    /**
     * Objetivo: Recuperar os CST's cadastrados
     * Retorna: Os CST's cadastrados
     * Autor: Nathan Feitoza
     * Nome Método: getListarProdutoCST
     *
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getListarProdutoCST()
    {
        return $this->db()->tabela(Genericos::getSchema().'view_cst_icms')->buildQuery('select');
    }

    /**
     * Objetivo: Retornar os tamanhos cadastrados
     * Retorna: Os tamanhos cadastrados
     * Autor: Nathan Feitoza
     * Nome Método: getListarProdutoTamanho
     *
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getListarProdutoTamanho()
    {
        return $this->db()->tabela('produto_tamanho')
            ->setMsgNaoEncontrado('Nenhum tamanho encontrado')
            ->buildQuery('select');
    }

    /**
     * Objetivo: Recuperar uma uma unidade de medida por seu codigo ou id
     * Recebe: A unidade a ser recuperada
     * Retorna: Os dados referentes a unidade
     * Autor: Nathan Feitoza
     * Nome Método: getProdutoUnidadeMedida
     *
     * @param $unidade
     * @return $this|array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getProdutoUnidadeMedida($unidade)
    {
        $campo_filtrar = 'lower(codigo)';
        $filtro = strtolower("".$unidade);

        if(is_numeric($unidade)) {
            $campo_filtrar = 'id';
            $filtro = (int) $unidade;
        }

        $sql = $this->db()->tabela('produto_unidade_medida')
            ->campos(['*'])
            ->where($campo_filtrar, '=', $filtro)
            ->setUsarExceptionNaoEncontrado(false)
            ->buildQuery('select');

        if(is_int($sql)) return false;

        return $sql;
    }

    public function getProdutoTodasUnidadesMedidas()
    {
        return $this->setFalseException(true)->db()
            ->tabela('produto_unidade_medida')
            ->campos(['*'])
            ->orderBy('nome','desc')
            ->buildQuery('select');
    }

    /**
     * Objetivo: Retornar as cores cadastradas
     * Recebe:  Cores cadastradas
     * Retorna:
     * Autor: Nathan Feitoza
     * Nome Método: getListarProdutoCor
     *
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getListarProdutoCor()
    {
        return $this->db()->tabela('produto_cor')
            ->setMsgNaoEncontrado('Nenhuma cor encontrada')
            ->buildQuery('select');
    }

    /**
     * Objetivo: Recuperar as grades de um produto e junto os tamanhos e cores para,
     * caso o usuário deseje, seja criada novas grades
     * Recebe: O id do produto buscado ou o id de um item de produto_grade especifico
     * Retorna: Os dados do produto_grade encontrado
     * Autor: Nathan Feitoza
     * Nome Método: getProdutoGrade
     *
     * @param $produto_grade_id
     * @param bool $usar_id
     * @return $this|array|bool|\Info\classes\BD\BuildQuery|int|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getProdutoGrade($produto_grade_id, $usar_id=false)
    {
        $campo_filtrar = $usar_id ? 'id' : 'produto_id';

        $dadosGrades = $this->db()->tabela(Genericos::getSchema().'view_produto_grades')
            ->where($campo_filtrar,'=',$produto_grade_id)
            ->setGerarLog(true)
            ->setMsgNaoEncontrado('Nenhuma grade está cadastrada para o produto '.$produto_grade_id)
            ->buildQuery('select');

        $dados['DADOS'] = $dadosGrades;

        if(is_int($dados) OR is_bool($dados)) {
            $dados = [];
        }

        if(!$usar_id) {
            $tamanhos = $this->getListarProdutoTamanho();
            $cores = $this->getListarProdutoCor();
            $dados['TAMANHOS'] = $tamanhos;
            $dados['CORES'] = $cores;
        }

        return $dados;
    }

    /**
     * Objetivo: Listar os cfops cadastrados
     * Recebe: tipo do cfop a ser listado se é de compra, venda ou geral
     * Retorna: Os cfops requisitados
     * Autor: Nathan Feitoza
     * Nome Método: getListarProdutoCfop
     *
     * @param int|array $tipo_listar
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getListarProdutoCfop($tipo_listar=3)
    {
        $tabela_view = 'produto_cfop';

        switch ($tipo_listar) {
            case 0:
                $tabela_view = 'view_cfop_vendas';
                break;
            case 1:
                $tabela_view = 'view_cfop_compras';
                break;
        }

        return $this->setCamposRetornar(['id as id_cfop','nome','mov_estoque'])
            ->db()
            ->tabela($tabela_view)
            ->buildQuery('select');
    }

    /**
     * Objetivo: Recuperar um cfop pelo seu id
     * Recebe: Id do cfop a ser recuperado
     * Retorna: O cfrop caso encontrado
     * Autor: Nathan Feitoza
     * Data: 30/04/19 13:46
     * Nome Método: getProdutoCfop
     *
     * @param $id_cfop
     * @return mixed
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function getProdutoCfop($cfop)
    {

        $buscarPor = 'id';
        $compararPor = '=';

        if(!is_numeric($cfop)) {
            $buscarPor = 'nome';
            $compararPor = 'ilike';
            $cfop = '%'.$cfop.'%';
        }

        return $this->db()
            ->tabela('produto_cfop')
            ->campos(["id","tipo","nome","mov_estoque"])
            ->where($buscarPor,$compararPor,$cfop)
            ->buildQuery('select');
    }

    private function getTamanhoCor($tipo, $buscar, $campo_buscar = false, $comparador = '=')
    {
        $tabela = $tipo == 'tamanho' ? 'produto_tamanho' : 'produto_cor';
        $campo_buscar = !$campo_buscar ? 'id' : $campo_buscar;


        return $this->db()
                ->tabela($tabela)
                ->where($campo_buscar, $comparador, $buscar)
                ->buildQuery('select');
    }

    public function getProdutoTamanho($tamanho_id)
    {
        return $this->getTamanhoCor('tamanho', $tamanho_id);
    }

    public function getProdutoTamanhoNome($tamanho_nome)
    {
        return $this->getTamanhoCor('tamanho', '%'.$tamanho_nome.'%', 'tamanho', 'ilike');
    }

    public function getProdutoCor($cor_id)
    {
        return $this->getTamanhoCor('cor', $cor_id);
    }

    public function getProdutoCorNome($cor_nome)
    {
        return $this->getTamanhoCor('cor', '%'.$cor_nome.'%', 'cor', 'ilike');
    }

    public function criarTamanhoCor($tipo, $campo, $valor)
    {
        if($tipo == 'tamanho') {
            $existe = $this->setFalseException(true)->getProdutoTamanhoNome($valor);
            $method = 'inserir_bd_produto_tamanho';
            $buscar = 'getProdutoTamanhoNome';
        } else {
            $existe = $this->setFalseException(true)->getProdutoCorNome($valor);
            $method = 'inserir_bd_produto_cor';
            $buscar = 'getProdutoCorNome';
        }

        if(!is_bool($existe)) throw new AppException(ucfirst($tipo).' já existente', 281);

        $this->$method($campo, $valor);

        return (array) $this->$buscar($valor);
    }

    /**
     * Objetivo: Criar as grades de um produto
     * Recebe: Os dados para criação da grade
     * Retorna: Os dados das grades criadas
     * Autor: Nathan Feitoza
     * Data: 16/05/19 10:38
     * Nome Método: criarGrade
     *
     * @param $produto_id
     * @param $tamanho_id
     * @param $cor_id
     * @return mixed
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function criarGrade($produto_id, $tamanho_id, $cor_id)
    {
        $campos_add = ['produto_id','tamanho_id','cor_id'];
        $quantidade_adicionar = count($tamanho_id);

        // Validar Produto
        $this->getProduto($produto_id);

        $tamanho_arr = [];
        $cor_arr = [];

        foreach($tamanho_id as $i => $tamanho) {
            $cor = $cor_id[$i];
            // Validar Tamanho
            $tamanho_arr[] = $this->getProdutoTamanho($tamanho);
            // Validar Cor
            $cor_arr[] = $this->getProdutoCor($cor);
        }

        $transacao = $this->db();
        $transacao->iniciarTransacao();

        foreach($tamanho_id as $i => $tamanho) {
            $cor = $cor_id[$i];
            // Validar Tamanho
            $tamanho_v = $tamanho_arr[$i];
            // Validar Cor
            $cor_v = $cor_arr[$i];

            $verificar_grade = $transacao->tabela(Genericos::getSchema().'produto_grade')
                ->campos(['ID'])
                ->where('produto_id','=',$produto_id)
                ->whereAnd('tamanho_id','=',$tamanho)
                ->whereAnd('cor_id','=',$cor)
                ->setUsarExceptionNaoEncontrado(false);

            if(is_int($verificar_grade->buildQuery('select'))) {
                $this->inserir_bd1_produto_grade($campos_add, [$produto_id, $tamanho, $cor]);

            } else {
                throw new AppException("Grade com o produto ".$produto_id.",
                        tamanho: ".$tamanho_v[0]->TAMANHO." e cor: 
                        ".$cor_v[0]->COR." já criada",282);
            }
        }

        $transacao->commit();

        // Retornar ID da grade
        $grades_id =  $this->db()->tabela(Genericos::getSchema().'produto_grade')
            ->campos(['ID'])
            ->limit($quantidade_adicionar)
            ->orderBy('ID','DESC')
            ->buildQuery('select');

        return $grades_id;
    }

    /**
     * Objetivo: Buscar um produto que vem em uma nfe na base de dados através
     * do relacionamento da tabela produto_de_para_nfe
     * Recebe: um array com os dados a serem buscados
     * [id_produto_de_para_nfe,id_emitente,cod_barras,id_info, buscando_nfe]
     * id_produto_de_para_nfe = Id de um item em produto_de_para_nfe para ser buscado
     * id_emitente = Id do item da nota fiscal
     * cod_barras = codigo de barras do item da nota fiscal
     * id_info = id do produto cadastrado na base de dados
     * buscando_nfe = se está buscando os itens na NFE
     * Retorna: Os dados do produto cadastrado na base ou um erro de não encontrado
     * Autor: Nathan Feitoza
     * Data: 16/05/19 10:38
     * Nome Método: getProdutoNFE
     *
     * @param $parametros_busca
     * @return mixed
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function getProdutoNFE($parametros_busca)
    {
        $cod_barras = false;
        $id_emitente = false;

        if(!Genericos::verificarCampoPreenchido($parametros_busca,'id_produto_de_para_nfe')) {
            $necessario = 'cnpj';
            Genericos::verificarCampoPreenchido($parametros_busca, $necessario, true);
            $id_info = false;
            $cnpj_emit = $parametros_busca[$necessario];
            $id_emitente = Genericos::verificarCampoPreenchido($parametros_busca, 'id_emitente') ? $parametros_busca['id_emitente'] : false;
            $cod_barras = Genericos::verificarCampoPreenchido($parametros_busca, 'cod_barras') ? $parametros_busca['cod_barras'] : false;

            if(Genericos::verificarCampoPreenchido($parametros_busca, 'id_info') && !Genericos::verificarCampoPreenchido($parametros_busca, 'busca_relacao')) {
                $id_info = $parametros_busca['id_info'];
                return $this->setUsarException(false)->getProduto($id_info);
            }

        } else {
            // Irá buscar pelo campo id do produto_de_para_nfe
            $id_produto_de_para_nfe = $parametros_busca['id_produto_de_para_nfe'];
        }

        $buscar = $this->setMsgNaoEncontrado('Produto não encontrado com as relações passadas')
            ->db()->tabela('produto_de_para_nfe')
            ->campos(['id','produto_id','produto_nfe','cnpj','fator','codigo_barras']);

        if(isset($id_produto_de_para_nfe)) {
            $buscar->where('id', '=', $id_produto_de_para_nfe);
            $buscar = $buscar->buildQuery('select');
        } else {
            $buscar->where('cnpj', '=', $cnpj_emit);

            if(isset($id_emitente) != false && $cod_barras != false && Genericos::camposVazios((array) $parametros_busca, ['buscando_nfe']) == 1) {
                $buscar->whereComplex(['produto_nfe','codigo_barras'],['=','='],[$id_emitente, $cod_barras],['AND','OR']);
            } else {

                if ($id_emitente != false) {
                    $buscar->whereAnd('produto_nfe', '=', $id_emitente);
                }

                if ($id_info != false) {
                    $buscar->whereAnd('produto_id', '=', $id_info);
                }

                if ($cod_barras != false) {
                    $buscar->whereAnd('codigo_barras', '=', $cod_barras);
                }
            }

            $buscar = $buscar->buildQuery('select');
        }

        if(!is_int($buscar) && !is_bool($buscar)) {
            foreach ($buscar as $i => $busca) {
                $produto_info = isset($verificar_produto) ? $verificar_produto : $this->setUsarException(false)->getProduto($busca->PRODUTO_ID);
                $produto_info = is_int($produto_info) ? false : $produto_info;

                if($produto_info != false) {
                    $busca->PRODUTO_GRADE = $produto_info[0]->PRODUTO_GRADE;
                    $busca->PRODUTO_GERAL = $produto_info[0];
                }
            }
        }

        return $buscar;
    }

    /**
     * Objetivo: Cadastrar uma unidade de medida e retornar seus dados em caso de sucesso
     * Recebe: um array com os dados a cadastrar [codigo_und, fator, nome]
     * Retorna: Os dados que foram cadastrados da unidade
     * Autor: Nathan Feitoza
     * Data: 16/05/19 10:38
     * Nome Método: setCadastrarProdutoUnidadeMedida
     *
     * @param $dados_cadastrar
     * @param bool $usar_exception_erro
     * @return Produto|array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function setCadastrarProdutoUnidadeMedida($dados_cadastrar, $usar_exception_erro=true)
    {
        $necessarios = ['codigo_und','fator','nome'];
        Genericos::camposVazios($dados_cadastrar, $necessarios, true);
        $codigo_und = $dados_cadastrar[$necessarios[0]];
        $fator = $dados_cadastrar[$necessarios[1]];
        $nome = $dados_cadastrar[end($necessarios)];

        $und = $this->getProdutoUnidadeMedida($codigo_und);

        if(!$und) {
            $this->inserir_bd_produto_unidade_medida(['nome', 'fator_conversao', 'codigo'],
                [$nome, $fator, $codigo_und]);

            $und = $this->getProdutoUnidadeMedida($codigo_und);
            return $und;
        }

        if($usar_exception_erro && !is_string($usar_exception_erro)) throw new AppException('Unidade já cadastrada', 401);
        elseif ($usar_exception_erro == 'cod') return $und;
        return false;
    }

    /**
     * Objetivo: Gravar um ou mais produtos na base de dados
     * Recebe:
     * Retorna:
     * Autor: Nathan Feitoza
     * Data: 16/05/19 10:39
     * Nome Método: setSalvarProduto
     *
     * @param $dados_produto
     * @return array
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function setSalvarProduto($dados_produto)
    {
        $necessarios_produto = ['nome_produto','ncm','cfop_compra','cfop_venda','unidade_venda',
            'unidade_compra_id','preco_compra','preco_venda', 'saldo_geral','ipi',
            'icms_compra','icms_venda','bc_icms_st','icms_st'];

        $opcionais = ['desconto_maximo','custo_compra','custo_venda','lucro_bruto',
            'comissao','situacao','bc_icms','preco_atacado','gtin','cst_icms_venda',
            'cst_icms_compra','cst_pis_cofins_compra','cst_ipi','codigo_anp','finalidade',
            'natureza_receita','saldo_minimo','referencia','fator_conversao','impressora_producao',
            'imagem','icms_fcp','tamanho_grade','cor_grade','cst_pis_cofins_venda','codigo_barras',
            'situacao_grade'];

        $campos_produto_bd = ['nome','unidade_venda_id','unidade_compra_id','desconto_maximo','preco_compra',
            'preco_venda','saldo_geral','custo_compra','custo_venda','ipi',
            'aliquota_icms_compra','aliquota_icms_venda','lucro_bruto','situacao',
            'base_calculo_icms','preco_atacado','cfop_compra','cfop_venda','gtin',
            'cst_icms_venda','cst_icms_compra','cst_pis_cofins_compra','ncm',
            'cst_pis_cofins_venda','cst_ipi','codigo_anp','finalidade','natureza_receita',
            'produto_grade','saldo_minimo','codigo_barras','referencia','fator_conversao',
            'impressora_producao','imagem1','aliquota_icms_fcp','base_calc_icms_st',
            'aliquota_icms_st'];


        $produtos_grades_criar = [];
        $und_venda_arr = [];
        $und_compra_id_arr = [];

        foreach ($dados_produto as $i => $produto){
            $produto = (array) $produto;
            $und_venda = $produto[$necessarios_produto[4]];
            $und_compra_id = $produto[$necessarios_produto[5]];

            $und_venda_arr[] = !is_numeric($und_venda) ? $this->setCadastrarProdutoUnidadeMedida(['codigo_und' => $und_venda,'fator'=>1,'nome'=>$und_venda], 'cod')[0]->ID : $und_venda;
            $und_compra_id_arr[] = !is_numeric($und_compra_id) ? $this->setCadastrarProdutoUnidadeMedida(['codigo_und' => $und_compra_id,'fator'=>1,'nome'=>$und_compra_id], 'cod')[0]->ID : $und_compra_id;

        }

        $con_bd = $this->db();
        $con_bd->iniciarTransacao();

        $tabela_produto = Genericos::getSchema().'produto';

        $produtoNaoCadastrados = [];

        foreach ($dados_produto as $i => $produto) {
            $produto = (array) $produto;
            $campos_validar = Genericos::camposVazios($produto, $necessarios_produto);

            if($campos_validar != 1)  throw new AppException('Houve um erro ao tentar adicionar o produto de posicao '.$i.'. '.$campos_validar,401);

            // Necessários
            $nome_produto = $produto[$necessarios_produto[0]];

            $verificarSeJaExistePorNome = $this->setFalseException(true)->getProdutoNome($nome_produto);

            if($verificarSeJaExistePorNome['DADOS']) {
                $produtoNaoCadastrados[] = $produto;
                continue;
            }

            $ncm = $produto[$necessarios_produto[1]];
            $cfop_compra = $produto[$necessarios_produto[2]];
            $cfop_venda = $produto[$necessarios_produto[3]];
            $und_venda = $und_venda_arr[$i];
            $und_compra_id = $und_compra_id_arr[$i];
            $preco_compra = $produto[$necessarios_produto[6]];
            $preco_venda = $produto[$necessarios_produto[7]];
            $saldo_geral = $produto[$necessarios_produto[8]];
            $ipi = $produto[$necessarios_produto[9]];
            $icms_compra = $produto[$necessarios_produto[10]];
            $icms_venda = $produto[$necessarios_produto[11]];
            $bc_icms_st = $produto[$necessarios_produto[12]];
            $icms_st = $produto[end($necessarios_produto)];

            // Opcionais
            $desconto_maximo = Genericos::verificarCampoPreenchido($produto, $opcionais[0]) ? $produto[$opcionais[0]] : 0;
            $custo_compra = Genericos::verificarCampoPreenchido($produto, $opcionais[1]) ? $produto[$opcionais[1]] : 0;
            $custo_venda = Genericos::verificarCampoPreenchido($produto, $opcionais[2]) ? $produto[$opcionais[2]] : 0;
            $lucro_bruto = Genericos::verificarCampoPreenchido($produto, $opcionais[3]) ? $produto[$opcionais[3]] : 0;
            $comissao = Genericos::verificarCampoPreenchido($produto, $opcionais[4]) ? $produto[$opcionais[4]] : 0;
            $situacao = Genericos::verificarCampoPreenchido($produto, $opcionais[5]) ? $produto[$opcionais[5]] : 0;
            $bc_icms = Genericos::verificarCampoPreenchido($produto, $opcionais[6]) ? $produto[$opcionais[6]] : 0;
            $preco_atacado = Genericos::verificarCampoPreenchido($produto, $opcionais[7]) ? $produto[$opcionais[7]] : null;
            $gtin = Genericos::verificarCampoPreenchido($produto, $opcionais[8]) ? $produto[$opcionais[8]] : null;
            $cst_icms_venda = Genericos::verificarCampoPreenchido($produto, $opcionais[9]) ? $produto[$opcionais[9]] : null;
            $cst_icms_compra = Genericos::verificarCampoPreenchido($produto, $opcionais[10]) ? $produto[$opcionais[10]] : null;
            $cst_pis_cofins_compra = Genericos::verificarCampoPreenchido($produto, $opcionais[11]) ? $produto[$opcionais[11]] : null;
            $cst_pis_cofins_venda = Genericos::verificarCampoPreenchido($produto, $opcionais[24]) ? $produto[$opcionais[24]] : null;
            $cst_ipi = Genericos::verificarCampoPreenchido($produto, $opcionais[12]) ? $produto[$opcionais[12]] : null;
            $codigo_anp = Genericos::verificarCampoPreenchido($produto, $opcionais[13]) ? $produto[$opcionais[13]] : null;
            $finalidade = Genericos::verificarCampoPreenchido($produto, $opcionais[14]) ? $produto[$opcionais[14]] : 0;
            $natureza_receita = Genericos::verificarCampoPreenchido($produto, $opcionais[15]) ? $produto[$opcionais[15]] : null;
            $saldo_minimo = Genericos::verificarCampoPreenchido($produto, $opcionais[16]) ? $produto[$opcionais[16]] : 0;
            $referencia = Genericos::verificarCampoPreenchido($produto, $opcionais[17]) ? $produto[$opcionais[17]] : null;
            $fator_conversao = Genericos::verificarCampoPreenchido($produto, $opcionais[18]) ? $produto[$opcionais[18]] : 0;
            $impressora_producao = Genericos::verificarCampoPreenchido($produto, $opcionais[19]) ? $produto[$opcionais[19]] : null;
            $imagem = Genericos::verificarCampoPreenchido($produto, $opcionais[20]) ? $produto[$opcionais[20]] : null;
            $codigo_barras = Genericos::verificarCampoPreenchido($produto, $opcionais[24]) ? $produto[$opcionais[24]] : null;
            $icms_fcp = Genericos::verificarCampoPreenchido($produto, $opcionais[21]) ? $produto[$opcionais[21]] : 0;

            // Para grade
            $produto_grade = Genericos::verificarCampoPreenchido($produto, 'criar_grade') ? (int) $produto['criar_grade'] : 0;
            $tamanho_grade = Genericos::verificarCampoPreenchido($produto, $opcionais[22]) ? $produto[$opcionais[22]] : false;
            $cor_grade = Genericos::verificarCampoPreenchido($produto, $opcionais[23]) ? $produto[$opcionais[23]] : false;
            $situacao_grade = Genericos::verificarCampoPreenchido($produto, end($opcionais)) ? $produto[end($opcionais)] : 0;


            if($tamanho_grade != false AND $cor_grade != false) {
                $produto_grade = 1;
                $produtos_grades_criar[] = [$tamanho_grade, $cor_grade, $situacao_grade];
            }

            $nome_produto = substr($nome_produto, 0, 50);

            $valores_produto_bd = [$nome_produto, $und_venda, $und_compra_id, $desconto_maximo, $preco_compra,
                $preco_venda, $saldo_geral, $custo_compra, $custo_venda, $ipi,
                $icms_compra, $icms_venda, $lucro_bruto, $situacao, $bc_icms,
                $preco_atacado, $cfop_compra, $cfop_venda, $gtin, $cst_icms_venda,
                $cst_icms_compra, $cst_pis_cofins_compra, $ncm,$cst_pis_cofins_venda,
                $cst_ipi,$codigo_anp,$finalidade,$natureza_receita,$produto_grade,
                $saldo_minimo, $codigo_barras, $referencia, $fator_conversao,
                $impressora_producao, $imagem, $icms_fcp, $bc_icms_st, $icms_st];

            $this->inserir_bd1_produto($campos_produto_bd,$valores_produto_bd);
        }

        if(count($produtos_grades_criar) > 0) {
            // Recuperar os ultimos itens adicionados com produto_grade = 1 em order by id desc limit count($produtos_grades_criar)
            // select id,produto_grade from empresa01.produto where produto_grade = 1 order by id desc limit 5
            // array_reverse
            // Depois de recuperar os codigos inverter o array para sincronizar com o que foi criado pelo produtos_grades_criar
            // Colocar grade após inserção do produto
            // $this->setCriarGrade(['produto_id','tamanho_id','cor_id'])

            $dados_produtos = $this->db()->tabela($tabela_produto)
                ->campos(['id'])
                ->where('produto_grade','=','1')
                ->orderBy('id','desc')
                ->limit(count($produtos_grades_criar));

            $dados_produto = $dados_produto->buildQuery('select');

            $dados_produtos = array_reverse($dados_produtos);

            foreach ($produtos_grades_criar as $i => $grade) {
                $produto_id = $dados_produtos[$i]->ID;
                $tamanho = $grade[0];
                $cor = $grade[1];
                // Colocar uma transacao aqui
                $this->criarGrade($produto_id, $tamanho, $cor);
            }
        }

        $msg = count($dados_produto) == 1 ? 'Produtos cadastrado' : 'Produtos Cadastrados';
        $produtos_retornar = $this->db()->tabela($tabela_produto)
            ->campos(['id'])
            ->orderBy('id','desc');

        $produtos_retornar = $produtos_retornar->buildQuery('select');

        $con_bd->commit();

        $produtoNaoCadastrados = count($produtoNaoCadastrados) == 0 ? null : $produtoNaoCadastrados;

        return ['msg'=>$msg.' com sucesso','produtos'=>[$produtos_retornar],'nao_cadastrados' => $produtoNaoCadastrados];
    }

    /**
     * Objetivo: Cadastrar ou Atualizar a relação do item (produto) da NFE com o produto da nossa base
     * Recebe: Um array com os dados do produto a serem cadastrados.
     * O segundo parâmetro serve para transações, pois é passado o objeto executor do buildquery
     * [id_produto,id_nfe,cnpj]
     * O elemento id_item deve ser usado no array para atualizar a relação
     * Retorna: Se o produto teve a relação cadastrada ou atualizada
     * Autor: Nathan Feitoza
     * Data: 07/05/19 14:23
     * Nome Método: setCadastrarAtualizarRelacaoProdutoNfe
     *
     * @param $dados_cadastrar
     * @return array
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function setCadastrarAtualizarRelacaoProdutoNfe($dados_cadastrar)
    {
        $necessarios = ['id_produto','id_nfe','cnpj'];

        if(!Genericos::verificarCampoPreenchido($dados_cadastrar, 'id_item')) {
            Genericos::camposVazios($dados_cadastrar, $necessarios, true);
        } else {
            $id_item = $dados_cadastrar['id_item'];
        }

        $id_produto = isset($dados_cadastrar[$necessarios[0]]) ? $dados_cadastrar[$necessarios[0]] : null;
        $id_nfe = isset($dados_cadastrar[$necessarios[1]]) ? $dados_cadastrar[$necessarios[1]] : null ;
        $cnpj = isset($dados_cadastrar[end($necessarios)]) ? $dados_cadastrar[end($necessarios)] : null;
        $fator = Genericos::verificarCampoPreenchido($dados_cadastrar, 'fator') ? $dados_cadastrar['fator'] : 1;
        $codigo_barras = Genericos::verificarCampoPreenchido($dados_cadastrar, 'codigo_barras') ? $dados_cadastrar['codigo_barras'] : null;
        $codigo_barras = ( !$codigo_barras OR $codigo_barras == "false" ) ? null : $codigo_barras;

        if(!isset($id_item)) {
            $buscar = [
                'cod_barras' => $codigo_barras,
                'id_emitente' => $id_nfe,
                'cnpj' => $cnpj
            ];
        } else {
            $buscar = ['id_produto'=>$id_item];
        }

        $checar_produto = $this->setUsarException(false)->getProdutoNFE($buscar);
        $buscar_info_prod = $this->setUsarException(false)->getProduto($id_produto);
        $acao = is_int($checar_produto) ? 'insert' : 'update';
        $campos_tabela = ['produto_id','produto_nfe','cnpj','fator','codigo_barras'];
        $valor_campos = [$id_produto, $id_nfe, $cnpj, $fator, $codigo_barras];

        if($acao == 'update') {
            $campos = [];
            $valores = [];

            if(!is_null($id_produto)) {
                $campos[] = $campos_tabela[0];
                $valores[] = $valor_campos[0];
            }

            if(!is_null($id_nfe)) {
                $campos[] = $campos_tabela[1];
                $valores[] = $valor_campos[1];
            }

            if(!is_null($cnpj)) {
                $campos[] = $campos_tabela[2];
                $valores[] = $valor_campos[2];
            }

            $campos[] = $campos_tabela[3];
            $valores[] = $valor_campos[3];
            $campos[] = end($campos_tabela);
            $valores[] = end($valor_campos);
            $campos_tabela = $campos;
            $valor_campos = $valores;
        }

        $executar_sql = $this->db()
            ->tabela('produto_de_para_nfe')
            ->campos($campos_tabela,$valor_campos);

        if($acao == 'update') $executar_sql->where('id', '=', $checar_produto[0]->ID);

        $executar_sql = $executar_sql->buildQuery($acao);

        return [(($acao == 'insert') ? 'Inserido' : 'Atualizado' ).' com sucesso', 'PRODUTO'=>$buscar_info_prod];
    }

    /**
     * Objetivo: Este método cadastra ou atualiza um lote da relação de itens (produtos) da nfe
     * com os produtos na nossa base. O que ela fazer é receber o lote e lançar um loop
     * para o método de cadastro da relação
     * Recebe: Array com o json dos produtos a serem cadastrados. O json deve ter internamente
     * um array com os mesmos dados solicitados por setCadastrarAtualizarRelacaoProdutoNFE
     * para cadastrar
     * Autor: Nathan Feitoza
     * Data: 07/05/19 14:26
     * Nome Método: setCadastrarAtualizarLoteRelacaoProdutoNfe
     *
     * @param $dados_cadastrar
     * @return array
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function setCadastrarAtualizarLoteRelacaoProdutoNfe($dados_cadastrar)
    {
        $necessarios = 'lote';
        Genericos::verificarCampoPreenchido($dados_cadastrar, $necessarios, true);

        $lote = $dados_cadastrar[$necessarios];
        $produtos = Genericos::jsonDecode($lote, 'O JSON passado com o lote de produtos não é válido');
        $necessarios_produtos = ['id_produto','id_nfe','cnpj'];
        $retorno = [];

        $exec = $this->db();
        $exec->iniciarTransacao();

        foreach($produtos as $i => $item) {
            $item = (array) $item;
            $check_item = Genericos::camposVazios($item,$necessarios_produtos);

            if($check_item != 1) throw new AppException('Erro no item de posição '.$i.'. '.$check_item,403);

            $retorno[] = $this->setCadastrarAtualizarRelacaoProdutoNFE($item);
        }

        $exec->commit();

        return ["relacao"=>$retorno];
    }
}