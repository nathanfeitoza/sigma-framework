<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 10/03/19
 * Time: 19:15
 */

namespace AppCore;


use AppCore\bd\BD;
use AppCore\errors\AppException;

abstract class Model
{
    use ControllerModelTrait;

    private $db;
    protected $usarException = true, $msgNaoEncontrado = false, $falseException = false;
    protected $alias = false;
    protected $campos_retornar = ['*'];
    protected $pagina = 1, $max_por_pag = 30;

    public function __construct()
    {
        $this->initBD();
    }

    private function initBD()
    {
        $bancoConfig = Configuracoes::get('BANCO_DADOS');
        $opcoes = isset($bancoConfig['OPCOES']) 
            ? $bancoConfig['OPCOES']
            : [];

        if (isset($opcoes['dir_log'])) $opcoes['dir_log'] = Configuracoes::get('ROOTDIR').$opcoes['dir_log'];    
    
        $this->db = BD::init(
            $bancoConfig ['TYPE'], 
            $bancoConfig ['HOST'], 
            $bancoConfig ['DATABASE'], 
            $bancoConfig ['USER'], 
            $bancoConfig ['PASS'],
            $opcoes
        );
        return $this->db;
    }

    public function setObjDb(BD $db) {
        $this->db = $db;
        return $this;
    }

    public function getObjDb()
    {
        return is_null($this->db) ? $this->initBD() : $this->db;
    }

    public function db()
    {
        $db = $this->getObjDb()->campos($this->getCamposRetornar())
            ->setUsarExceptionNaoEncontrado($this->usarException)
            ->setMsgNaoEncontrado($this->msgNaoEncontrado)
            ->setFalseNaoEncontrado($this->falseException)
            ->setEventosGravar(['INSERT','DELETE','UPDATE']);

        return $db;
    }

    public function setAliasTabela($alias)
    {
        $this->alias = $alias;
        return $this;
    }

    public function getAliasTabela($alias='')
    {
        if ($this->alias == false) {
            return $alias;
        }

        return $this->alias;
    }

    public function getAliasCampo()
    {
        $alias = $this->getAliasTabela();
        return (strlen($alias) > 0) ? $alias.'.' : '';
    }

    /**
     * @return mixed
     */
    public function getUsarException()
    {
        return $this->usarException;
    }

    /**
     * @param mixed $usarException
     */
    public function setUsarException($usarException)
    {
        $this->usarException = $usarException;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getMsgNaoEncontrado()
    {
        return $this->msgNaoEncontrado;
    }

    /**
     * @param mixed $msgNaoEncontrado
     */
    public function setMsgNaoEncontrado($msgNaoEncontrado)
    {
        $this->msgNaoEncontrado = $msgNaoEncontrado;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getFalseException()
    {
        return $this->falseException;
    }

    /**
     * @param mixed $falseException
     */
    public function setFalseException($falseException)
    {
        $this->usarException = false;
        $this->falseException = $falseException;
        return $this;
    }

    /**
     * Objetivo:
     * Recebe:
     * Retorna:
     * Autor: nathan
     * Data: 16/03/19 22:22
     * Nome Método: getCamposRetornar
     *
     * @return array
     */
    public function getCamposRetornar()
    {
        return $this->campos_retornar;
    }

    /**
     * Objetivo:
     * Recebe:
     * Retorna:
     * Autor: nathan
     * Data: 16/03/19 22:22
     * Nome Método: setCamposRetornar
     *
     * @param $campos_retornar
     * @return $this
     */
    public function setCamposRetornar($campos_retornar)
    {
        $this->campos_retornar = $campos_retornar;
        return $this;
    }

    /**
     * Objetivo:
     * Recebe:
     * Retorna:
     * Autor: nathan
     * Data: 16/03/19 22:17
     * Nome Método: setPagina
     *
     * @param $pagina
     * @return $this
     */
    public function setPagina($pagina)
    {
        $this->pagina = is_numeric($pagina) ? (int) $pagina : $pagina;
        return $this;
    }

    /**
     * Objetivo:
     * Recebe:
     * Retorna:
     * Autor: nathan
     * Data: 16/03/19 22:17
     * Nome Método: setMaxPorPag
     *
     * @param $max_por_pag
     * @return $this
     */
    public function setMaxPorPag($max_por_pag)
    {
        $this->max_por_pag = is_numeric($max_por_pag) ? (int) $max_por_pag : $this->max_por_pag;
        return $this;
    }

    public function setPaginacao($dados_paginacao)
    {
        if (Genericos::verificarCampoPreenchido($dados_paginacao, 'pagina')) {
            $this->setPagina($dados_paginacao['pagina']);
        }

        if (Genericos::verificarCampoPreenchido($dados_paginacao, 'max_por_pag')) {
            $this->setMaxPorPag($dados_paginacao['max_por_pag']);
        }

        return $this;
    }

    /**
     * Objetivo: Exibição genérica de dados e já é feito a paginação. Ex: Vendedor
     * Recebe: Os dados para iniciar a paginação
     * Retorna: Os dados de forma paginada
     * Autor: Nathan Feitoza
     * Data: 16/03/19 22:22
     * Nome Método: getDadosPaginadosGenerico
     *
     * @param $tabela_view
     * @param bool $callback
     * @return BD|array|bool|mixed
     * @throws errors\AppException
     */
    public function getDadosPaginadosGenerico($tabela_view, $callback = false, $where = false)
    {
        $pagina = $this->pagina;
        $max_por_pagina = $this->max_por_pag;

        $listar_todos = $pagina == 'all';
        $pagina = is_int($pagina) ? $pagina : 1;
        $max_por_pagina = is_int($max_por_pagina) ? $max_por_pagina : 30;

        $busca_pre = $this->db()->tabela($tabela_view)
            ->campos(['count(*) as total_regs']);

        if (is_callable($where)) $where($busca_pre);
        
        $busca_pre = $busca_pre->orderBy(false, false)->buildQuery('select');

        $qntd_retornada = $busca_pre[0]->total_regs;

        $usar_limite = false;
        $usar_offset = false;

        /* Paginação */
        $start = $pagina - 1;
        $offset = $start * $max_por_pagina;
        $max_pag = ceil($qntd_retornada/$max_por_pagina);

        if (!$listar_todos) {
            $usar_limite = $max_por_pagina;
            $usar_offset = $offset;
        }

        $obj_query_builder = $this->db()
            ->limit($usar_limite,$usar_offset);


        $obj_query_builder->tabela($tabela_view);

        if (is_callable($where)) $where($obj_query_builder);
        if (is_callable($callback)) $callback($obj_query_builder);

        $retornoPersonalizado = [
            "registros_totais" => $qntd_retornada,
            "max_por_pag" => $max_por_pagina,
            "max_pag" => $max_pag,
            "pagina" => $pagina
        ];
        
        $orderBy = $obj_query_builder->getOrderBy();

        if (!$orderBy) {
            $retornoPersonalizado['ordem'] = [
                'campo' => $this->getChavePrimariaTabela($tabela_view),
                'tipo' => 'ASC'
            ];
        } else {
            $ordemAjustar = str_replace('ORDER BY ', '', $orderBy);
            $ordemAjustar = explode(' ', $ordemAjustar);

            $retornoPersonalizado['ordem'] = [
                'campo' => $ordemAjustar[0],
                'tipo' => $ordemAjustar[1]
            ];
        }

        if (!$listar_todos) {
            $obj_query_builder->setRetornoPersonalizado($retornoPersonalizado);
        }

        $buscar = $obj_query_builder->buildQuery('select');

        return $buscar;
    }

    protected final function getChavePrimariaTabela($tabela, $schema = 'public')
    {
        $schema = empty($schema) ? 'public.' : $schema.'.';

        if (strpos($tabela, '.') != false) $schema = '';

        $primaria = $this->db()->executarSQL('SELECT A.attname as primaria
                            FROM
                                pg_index i
                                JOIN pg_attribute A ON A.attrelid = i.indrelid 
                                AND A.attnum = ANY ( i.indkey ) 
                            WHERE
                                i.indrelid = ?::regclass 
                                AND i.indisprimary',
                            [$schema.$tabela]
                    );
        
        return $primaria[0]->primaria;
    }

    public final function getCamposTabela($tabela, $schema = 'public')
    {
        $schema = empty($schema) ? 'public' : $schema;
        
        $campos = $this->db()
                ->tabela('information_schema.columns')
                ->campos(['column_name as campo_tabela'])
                ->where('table_schema','=', str_replace('.', '', $schema))
                ->whereAnd('table_name', '=', $tabela)
                ->setUsarExceptionNaoEncontrado(false)
                ->setGerarLog(true)
                ->buildQuery('select');

        if (is_bool($campos)) return [];

        return array_map(function($valor) {
            return $valor->campo_tabela;
        },(array) $campos);
    }

    private function factoryCrud($tipo, $tabela, $campos=false, $valores=false, $where = false)
    {
        $obj_bd = $this->db()->tabela($tabela);

        if ($valores != false) $obj_bd->campos($campos, $valores);

        if (is_callable($where)) {
            if ($tipo == 'select') {
                $chave_primaria = $this->getChavePrimariaTabela($tabela);
                $obj_bd->orderBy($chave_primaria, 'ASC');
            }

            $where($obj_bd);
        }

        $executar = $obj_bd->buildQuery($tipo);

        if ($tipo == 'select') return $executar;

        return $this->db();
    }

    protected final function filtrarCamposCrud(Array $filtrar, Array $campos_input, $usar_keys = true)
    {
        if ($filtrar[0] == '*') return $filtrar;

        return array_filter($campos_input, function($valor) use ($filtrar) {
            return in_array($valor, $filtrar);
        }, ($usar_keys ? ARRAY_FILTER_USE_KEY : null) );
    }

    protected final function whereOfQuery($query, BD $objBd)
    {
        if (!is_array($query)) return;
        
        $verificar = Genericos::verificarCampoPreenchido($query, 'query', false);

        if (!$verificar) return;
        
        $contador = -1;
        $quantidadeCampos = count($query['query']);

        foreach($query['query'] as $indexQuery => $dadosQuery) {
            $contador++;

            if (strtolower($indexQuery) == 'ordem' && is_array($dadosQuery)) {
                $campo = array_keys($dadosQuery)[0];
                $tipoOrdem = @strtoupper($dadosQuery[$campo]);
                $aceitos = ['ASC','DESC'];

                if (in_array($tipoOrdem, $aceitos)) $objBd->orderBy($campo, $tipoOrdem);

                continue;
            }

            $verificarCorreto = Genericos::camposVazios($dadosQuery, ['comparador','valor'], false);
            
            if (is_string($verificarCorreto)) continue;
            
            $valor = $dadosQuery['valor'];

            $usarLogico = Genericos::verificarCampoPreenchido($dadosQuery, 'logico', false);
            $logico = 'AND';

            if ($usarLogico != false) $logico = strtolower($dadosQuery['logico']) == 'o' ? 'OR' : $logico;
            
            switch(strtolower($dadosQuery['comparador'])) {
                case 'i':
                    $comparador = '=';
                    break;
                case 'isnt':
                    $comparador = 'IS NOT NULL';
                    $valor = '';
                    break;
                case 'is':
                    $comparador = 'IS';
                    break;
                case 'in':
                    $comparador = 'IN';
                    break;
                case 'li':
                    $comparador = 'LIKE';
                    $valor = '%'.$valor.'%';
                    break;
                case 'diff':
                    $comparador = '<>';
                    break;
                case 'maq':
                    $comparador = '>=';
                    break;
                case 'meq':
                    $comparador = '<=';
                    break;
                default:
                    $comparador = '=';
            }

            if ($contador == 0) {
                $objBd->where($indexQuery, $comparador, $valor);
                continue;
            }

            if ($logico == 'OR') {
                $objBd->whereOr($indexQuery, $comparador, $valor);
                continue;
            }

            $objBd->whereAnd($indexQuery, $comparador, $valor);
        }

        return $objBd;
    }

    protected final function atualizarTabela($tabela, $campos, $valores, $where=false)
    {
        return $this->factoryCrud('update',$tabela,$campos, $valores, $where);
    }

    protected final function inserirTabela($tabela, $campos, $valores)
    {
        return $this->factoryCrud('insert', $tabela, $campos, $valores);
    }

    protected final function deletarTabela($tabela, $where = false)
    {
        return $this->factoryCrud('delete', $tabela, false, false, $where);
    }

    protected final function listarTabela($tabela, $where = false)
    {
        return $this->factoryCrud('select', $tabela, $this->getCamposRetornar(), false, $where);
    }

    public function __call($call, $arguments)
    {
        $validar = preg_grep('/(inserir|atualizar|deletar|listar)_bd/i', [$call]);

        if (count($validar) > 0) {
            $usa_schema = preg_grep('/(inserir|atualizar|deletar|listar)_bd+\d/i', [$call]);
            $usa_schema = count($usa_schema) > 0;
            $schema = $usa_schema ? Genericos::getSchema() : '';

            $is_inserir = preg_grep('/^inserir/i', [$call]);
            $is_inserir = count($is_inserir) > 0;

            $is_atualizar = preg_grep('/^atualizar/i', [$call]);
            $is_atualizar = count($is_atualizar) > 0;

            $is_listar = preg_grep('/^listar/i', [$call]);
            $is_listar = count($is_listar) > 0;

            $tabela = preg_replace('/(inserir|atualizar|deletar|listar)_bd+\d?_/i', '', $call);
            $tabela = strtolower($schema.$tabela);

            if (count($arguments) < 1 and ($is_inserir OR $is_atualizar) ) {
                throw new AppException('Não informado os campos e/ou valores 
                                        para inserir na tabela '
                                        .$tabela, 1036, 500, 'Erro interno');
            }
            
            $where = isset($arguments[0]) ? $arguments[0] : false;

            if (!is_callable($where)) {
                $campos = isset($arguments[0]) ? array_keys($arguments[0]) : false;
                $valores = isset($arguments[0]) ? array_values($arguments[0]) : false;
                
                $campos = !is_array($campos) ? [$campos] : $campos;
                $valores = !is_array($valores) ? [$valores] : $valores;

                $where = false;
            }

            if (!$is_inserir and isset($arguments[1])) {
                $where = is_callable($arguments[1]) ? $arguments[1] : false;
            }

            if ($is_inserir) {
                return $this->inserirTabela($tabela, $campos, $valores);
            } 
            
            if ($is_atualizar) {
                return $this->atualizarTabela($tabela, $campos, $valores, $where);
            }

            if ($is_listar) {
                
                if (!($this->getCamposRetornar() == ['*'])) {
                    $camposTabela = $this->getCamposTabela($tabela, $schema);
                    $campos_retornar = $this->filtrarCamposCrud(
                                        $camposTabela, 
                                        $this->getCamposRetornar(), 
                                        false
                                    );
                    $this->setCamposRetornar($campos_retornar);
                }

                return $this->listarTabela($tabela, $where);
            }

            return $this->deletarTabela($tabela, $where);

        } else {
            throw new AppException('Método '.$call.' não encontrado', 40035);
        }
    }

}