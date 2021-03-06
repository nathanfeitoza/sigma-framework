<?php
/**
 * Created by Nathan Feitoza.
 * User: nathan
 * Date: 11/09/17
 * Time: 23:55
 */

namespace AppCore\bd;

use AppCore\Event;
use PDO;
use AppCore\errors\AppException;

class BD implements iBD
{
    private static $con;
    private static $driver;
    private static $dbname;
    private static $host;
    private static $user;
    private static $pass;
    private static $opcoes;

    private $method;
    private $util;
    private $table;
    private $table_in;
    private $campos_table;
    private $where = false;
    private $whereOr = false;
    private $whereAnd = false;
    private $whereComplex = false;
    private $rightJoin = false;
    private $innerJoin = false;
    private $leftJoin = false;
    private $fullOuterJoin = false;
    private $groupBy = false;
    private $orderBy = false;
    private $valores_add = false;
    private $list_inter = false;
    private $valores_insert = [];
    private $valores_insert_bd = [];
    private $valores_insert_final = [];
    private $insertSelect = false;
    private $union = false;
    private $unionAll = false;
    private $posTransaction = 'a';
    private $fimTransaction = 'b';
    private $iniciar_transacao = false;
    private $nao_encontrado_per = false;
    private $limite = false;
    private $offset = false;
    private $gerar_log = false;
    private $exception_not_found = true;
    private $retornar_false_not_found = false;
    private $msg_erro = false;
    private $query_union = '';
    private $retorno_personalizado = false;
    private $linhas_afetadas = 0;
    private $transacao_multipla = false;
    private $pos_multipla = 0;
    private $finalizar_multipla = false;
    protected $pdo_obj_usando = false; 
    private $eventos_gravar = false;
    protected $pdo_padrao = false;
    private $gravar_log_complexo = false;
    private static $logger = false;
    private static $file_handler = false;
    private $count_afetadas_insert = 0;
    private $query;
    public $gravarsetLogComplexo;

    private function __construct(){}

    public static function init(
        $driver, 
        $host, 
        $dbname, 
        $user, 
        $pass, 
        $opcoes = false
    ) {
        self::$driver = $driver;
        self::$host = $host;
        self::$dbname = $dbname;
        self::$user = $user;
        self::$pass = $pass;
        self::$opcoes = $opcoes;
        self::$logger = new \Monolog\Logger('BDLOG');
        
        $local_logs = isset($opcoes['dir_log']) 
            ? $opcoes['dir_log'] 
            : __DIR__ . DIRECTORY_SEPARATOR;
        
        $nome_arquivo = date('d-m-Y');
        $local_logs .= $nome_arquivo.'_BuildQuery.log';
        self::$file_handler = new \Monolog\Handler\StreamHandler($local_logs);

        switch (self::$driver) {
            case "postgres":
                $db = "pgsql:";
                break;
            case "mysql":
                $db = "mysql:";
                break;
            case "firebird":
                $db = "firebird:";
                break;
            case "sqlite":
                $db = "sqlite:";
                break;
            default:
                $err = "Driver inválido";
                break;
        }

        if (!isset($err)) {
            try {
                $dsn = self::$dbname != false 
                    ? $db . "host=" . self::$host . ";dbname=" . self::$dbname 
                    :  $db . "host=" . self::$host;
                
                switch($db) {
                    case "firebird:":
                        $dsn = $db."dbname=".self::$host.':'.self::$dbname;
                    break;
                    case "sqlite:":
                        $dsn = $db."".self::$host;
                    break;
                }    
                
                if (isset(self::$opcoes['port'])) {
                    $porta = self::$opcoes['port'];

                    if (is_numeric($porta)) $dsn .= ";port=" . (int) $porta;
                }

                $pdo_case = PDO::CASE_NATURAL;
                if (isset(self::$opcoes['nome_campos'])) {
                    $nome_campos = self::$opcoes['nome_campos'];

                    if (!empty($nome_campos)) {
                        switch ( strtolower( $nome_campos ) ) {
                            case 'mai':
                                $pdo_case = PDO::CASE_UPPER;
                                break;
                            case 'min':
                                $pdo_case = PDO::CASE_LOWER;
                                break;
                        }
                    }
                }

                $opcs = [
                    PDO::ATTR_CASE => $pdo_case,
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ];

                if ($db == "mysql:") {
                    $usar = isset(self::$opcoes['name_utf8_mysql']) 
                        ? self::$opcoes['name_utf8_mysql'] 
                        : false;

                    if ((boolean) $usar) {
                        $opcs[] = [
                            PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES UTF8'
                        ];
                    }
                }

                self::$con = new PDO($dsn, self::$user, self::$pass, $opcs);

                return new self;

            } catch (PDOException $e) {
                $msg = "ERRO DE CONEXÃO " . $e->getMessage();
                throw new AppException($msg, $e->getCode());
            }
        } else {
            $msg = "DRIVER INVÁLIDO";
            throw new AppException($msg, 001);
        }
    }

    protected function setLog($msg, $type)
    {
        self::$logger->pushHandler(self::$file_handler);

        $configs_db = [ self::$driver,
            self::$host,
            self::$dbname,
            self::$user];

        $msg .= ' - DADOS DB: '.json_encode($configs_db);
        
        switch( strtolower( $type ) ) {
            case 'error':
                self::$logger->addError($msg);
                break;
            case 'alert':
                self::$logger->addAlert($msg);
                break;
            case 'critical':
                self::$logger->addCritical($msg);
                break;
            case 'debug':
                self::$logger->addDebug($msg);
                break;
            case 'emergency':
                self::$logger->addEmergency($msg);
                break;
            case 'notice':
                self::$logger->addNotice($msg);
                break;
            case 'record':
                self::$logger->addRecord($msg);
                break;
            case 'warning':
                self::$logger->addWarning($msg);
                break;
            default:
                self::$logger->addInfo($msg);
        }
    }

    protected function setPDO($pdo)
    {
        $this->pdo_padrao = $pdo;
    }

    protected function pdo()
    {
        $this->pdo_padrao = !$this->pdo_padrao ? self::$con : $this->pdo_padrao;
        return $this->pdo_padrao;
    }

    public function iniciarTransacao()
    {
        $this->iniciar_transacao = true;
        return $this;
    }

    public function rollback()
    {
        if ($this->pdo()->inTransaction()) $this->pdo()->rollback();
    }

    public function commit()
    {
        if ($this->pdo()->inTransaction()) $this->pdo()->commit();
    }

    public function getQuery()
    {
        return $this->query;    
    }

    public function executarSQL($query, $parametros=false)
    {
        $exception_nao_encontrado = $this->exception_not_found;
        $retornar_false_nao_encontrado = $this->retornar_false_not_found;
        $msg_nao_encontrado = $this->nao_encontrado_per;

        if (!is_string($query)) throw new AppException('A query informada não é uma string', 4578);

        $query_analize = explode(" ", $query);
        $tipo = strtolower($query_analize[0]);

        $pdo_obj = $this->pdo();


        if ($this->iniciar_transacao and !$pdo_obj->inTransaction()) {
            if (strtolower(self::$driver) == "firebird") $pdo_obj->setAttribute(PDO::ATTR_AUTOCOMMIT, 0);

            $pdo_obj->beginTransaction();

            $this->setPDO($pdo_obj);
        }

        try {
            $not_enabled = ['firebird', 'sqlite'];

            if (!in_array(self::$driver, $not_enabled)) {
                $data1 = $pdo_obj->prepare("SET NAMES 'UTF8'");
            }

            $data = $pdo_obj->prepare($query);

            if ($parametros != false) {
                if (!(is_array($parametros) AND count($parametros) != 0)) {
                    $msg = 'É necessário passar um array não nulo';
                    $this->setLog($msg, 'error');

                    throw new AppException($msg, 002);
                }

                for ($i = 0; $i < count($parametros); $i++) {
                    $dados_query = $parametros[$i];

                    if (is_integer($dados_query)) $is_int = PDO::PARAM_INT;
                    elseif (is_bool($dados_query)) $is_int = PDO::PARAM_BOOL;
                    elseif (is_null($dados_query)) $is_int = PDO::PARAM_NULL;
                    else $is_int = PDO::PARAM_STR;

                    $data->bindValue(($i + 1), $parametros[$i], $is_int);
                }

            }

            if (isset($data1)) $data1->execute();
        
            $exec = $data->execute();

            if ($tipo == 'select') {
                $tipo_retorno = PDO::FETCH_OBJ; // Retorna tipo objetos
                
                if (isset(self::$opcoes['return_type'])) {
                    if ((int) self::$opcoes['return_type'] == 2) {
                        $tipo_retorno = PDO::FETCH_NAMED; // Retorna Tipo array
                    }
                }

                $data_return = $data->fetchAll($tipo_retorno);
                $retorno_suc = $data_return;

                if (count($data_return) == 0) {
                    $retorno_err = ["Nada encontrado", 710];

                    if ($exception_nao_encontrado) {
                        //GERAR EXCEPTION
                        $msgUsuario = !$msg_nao_encontrado ? $retorno_err[0] : $msg_nao_encontrado;
                        
                        $this->setLog(
                            $retorno_err[0] . ' - QUERY: ' . $query . ' - VALORES: ' 
                            . json_encode($parametros), 
                            'error'
                        );

                        $erro = [$retorno_err[0], $retorno_err[1], 404, $msgUsuario];
                    }

                    $this->setLog(
                        $retorno_err[1] . ' - QUERY: ' . $query . ' - VALORES: ' . 
                        json_encode($parametros), 
                        'error'
                    );
                    
                    //NÃO GERAR EXCEPTION
                    $retorno_suc = !$retornar_false_nao_encontrado ? $retorno_err[1] : false;
                }
            }

            if ($tipo != 'select') {

                $usar = $data->rowCount();

                if (strcmp(strtolower($query_analize[0]), "insert") == 0) {
                    $this->count_afetadas_insert += $data->rowCount();
                    $usar = $this->count_afetadas_insert;
                }

                $this->setLinhasAfetadas($usar);

                $retorno_suc = $exec;
            }

        } catch (AppException $e) {
            $this->rollback();

            $this->count_afetadas_insert = 0;
            $code = $e->getCode() == 710 ? $e->getCode() : 503;
            $msg = $e->getMessage().' - Query executarSQL: '.$query;
            $retorno_err = [$msg, $code];
            
            $this->setLog(
                $msg . ' - VALORES: ' . json_encode($parametros), 
                'critical'
            );

            throw new AppException($retorno_err[0], $retorno_err[1]);
        }

        if (isset($erro)) {
            $erro_msg = $erro[0];
            $cod_erro = $erro[1];
            $cod_http_erro = isset($erro[2]) ? $erro[2] : 500;
            $msg_usuario_erro = isset($erro[3]) ? $erro[3] : '';

            if ($cod_erro == 710) {
                $erro_msg = 'Nada encontrado na query: ' . $query 
                . ' com os valores = ' . json_encode($parametros);
            }

            throw new AppException(
                $erro_msg, 
                $cod_erro, 
                $cod_http_erro, 
                $msg_usuario_erro
            );
        }

        if ($this->gravar_log_complexo == false) {
            $this->setLogComplexo($query, $parametros);
            $this->gravar_log_complexo = true;
        }

        if ($this->gerar_log) {
            $this->setLog(
                json_encode(
                    [
                        $retorno_suc, 
                        "query_sql" => $query, 
                        "valores_query" => $parametros
                    ]
                ),
                'info'
            );
        }

        return $retorno_suc;

    }

    protected function limparValores($union = false)
    {
        $array_valores = [
            'table',
            'table_in',
            'string_build',
            'campos_table',
            'where',
            'whereOr',
            'whereAnd',
            'whereComplex',
            'rightJoin',
            'innerJoin',
            'leftJoin',
            'fullOuterJoin',
            'groupBy',
            'orderBy',
            'valores_add',
            'list_inter',
            'insertSelect',
            'union',
            'unionAll',
            'comTransaction',
            'fazer_rollback',
            'posTransaction'=> ['a'],
            'fimTransaction'=>['b'],
            'limite',
            'offset',
            'retorno_personalizado',
            'query_union',
            'valores_insert_bd' => [[]],
            'valores_insert' => [[]],
            'valores_insert_final' => [[]],
            'exception_not_found' => [true]];

        if ($union != false) {
            $array_valores = ['table',
                'table_in',
                'string_build',
                'retorno_personalizado',
                'campos_table',
                'where',
                'whereOr',
                'whereAnd',
                'whereComplex',
                'rightJoin',
                'innerJoin',
                'leftJoin',
                'fullOuterJoin',
                'groupBy',
                'orderBy',
                'valores_add',
                'list_inter',
                'insertSelect',
                'union',
                'unionAll',
                'valores_insert' => [[]],
                'valores_insert_final' => [[]],
                'comTransaction',
                'fazer_rollback',
                'posTransaction'=> ['a'],
                'fimTransaction'=>['b'],
                'limite',
                'offset'];
        }

        $novo_array = [];

        if ($this->finalizar_multipla) {
            $this->pos_multipla = 0;
            $this->transacao_multipla = false;
            $this->finalizar_multipla = false;
        }

        if ($this->posTransaction == $this->fimTransaction) {
            $this->pdo_obj_usando = false;
        }

        foreach ($this as $key => $value) {
            if (in_array($key, $array_valores) 
                || array_key_exists($key, $array_valores)
            ) {
                $valor = false;
                
                if (array_key_exists($key, $array_valores)) {
                    $valor = $array_valores[$key][0];
                }

                $this->$key = $valor;
            }
        }

        return $this;
    }

    protected function create($tipo, $table)
    {
        $this->table = $table;

        switch ($tipo) {
            case "select":
                $this->method = 'SELECT';
                $this->util = 'FROM';
                break;
            case "insert":
                $this->method = 'INSERT';
                $this->util = 'INTO';
                break;
            case "update":
                $this->method = 'UPDATE';
                $this->util = 'SET';
                break;
            case "delete":
                $this->method = 'DELETE';
                $this->util = 'FROM';
                break;
            default:
                $this->msg_erro = "Metódo Inválido";
        }

        return $this;
    }

    protected function ajustarWhere(
        $tipo,
        $campo,
        $operador_comparacao,
        $valor,
        $status_where = false
    ) {
        if (!is_string($campo)) {
            $msg_erro = "O campo precisa ser uma string";
        } elseif (!is_string($operador_comparacao)) {
            $msg_erro = "O operador precisa ser uma string";
        } else {
            if ($tipo == "where") {
                $where = "WHERE " . $campo 
                . " " . $operador_comparacao
                . " " . $valor;

            } elseif ($tipo == "or" OR $tipo == "and") {
                if ($status_where == false) {
                    $msg_erro = "É necessário informar o parâmetro where antes";
                } else {
                    if ($tipo == "or") {
                        $whereOr = "OR " . $campo . " " . $operador_comparacao 
                            . " " . $valor;
                    } else {
                        $whereAnd = "AND " . $campo . " " . $operador_comparacao 
                            . " " . $valor;
                    }
                }
            } else {
                $msg_erro = "Parâmetro Where interno errado";
            }
        }

        if (isset($msg_erro)) {
            return $this->msg_erro = $msg_erro;
        } elseif (isset($where)) {
            return $this->where = $where;
        } elseif (isset($whereAnd)) {
            return $this->whereAnd[] = $whereAnd;
        } elseif (isset($whereOr)) {
            return $this->whereOr[] = $whereOr;
        }

    }

    // O comparativo dever ser feita em uma string da seguinte forma "a.tabela1 = b.tabela2"
    protected function ajustarJoin(
        $tipo, 
        $tabela,
        $tabela_join,
        $comparativo
    )
    {
        if (!is_string($tipo)) {
            $msg_erro = "O tipo precisa ser uma string";
        } elseif (!is_string($tabela_join)) {
            $msg_erro = "A tabela do join precisa ser uma string";
        } elseif (!is_string($comparativo)) {
            $msg_erro = "O comparativo precisa ser uma string";
        } else {
            if ($tipo == "leftJoin") {
                $leftjoin = " LEFT JOIN ".$tabela_join." ON ".$comparativo." ";
            } elseif ($tipo == "rightJoin") {
                $rightjoin = " RIGHT JOIN ".$tabela_join." ON ".$comparativo." ";
            } elseif ($tipo == "innerJoin") {
                $innerjoin = " INNER JOIN ".$tabela_join." ON ".$comparativo." ";
            } elseif ($tipo == "fullOuterJoin") {
                $fullouterjoin = " FULL OUTER JOIN ".$tabela_join." ON ".$comparativo." ";
            } else {
                $msg_erro = "Método desconhecido, por favor, selecione: " 
                    . "leftJoin, rightJoin, innerJoin ou fullOuterJoin";
            }
        }

        if (isset($msg_erro)) {
            return $this->msg_erro = $msg_erro;
        } elseif (isset($leftjoin)) {
            return $this->leftJoin[] = $leftjoin;
        } elseif (isset($rightjoin)) {
            return $this->rightJoin[] = $rightjoin;
        } elseif (isset($innerjoin)) {
            return $this->innerJoin[] = $innerjoin;
        } elseif (isset($fullouterjoin)) {
            return $this->fullOuterJoin[] = $fullouterjoin;
        } else {
            return $this->msg_erro = "Erro interno na funcção que gera os joins";
        }

    }

    protected function ajustarGroupBy($tabela, $having = false)
    {
        if (!is_string($tabela)) {
            $msg = "A tabela do groupBy precisa ser uma string";
        } elseif ($having != false &&  !is_string($having)) {
            $msg = "O having precisa ser uma string";
        } else {
            $use_having = ($having != false) ? " HAVING ".$having : "";
            $group = " GROUP BY ".$tabela.$use_having;
        }

        if (isset($msg)) {
            return $this->msg_erro = $msg;
        } else {
            return $this->groupBy = $group;
        }
    }

    public function tabela($tabela)
    {
        $this->table_in = $tabela;
        return $this;
    }

    public function campos($campos,$update=false)
    {
        if (!is_array($campos)) {
            throw new AppException("É necessário que os campos sejam passados em um array", 853);
        } else {
            if ($update != false) {
                if (!is_array($update)) {
                    $this->msg_erro = "Os valores a serem inseridos precisam ser um array";
                } else {
                    if (count($update) == count($campos)) {
                        $interrogas = str_pad('', (count($update) * 2), "?,", STR_PAD_LEFT);
                        $interrogas = substr($interrogas, 0 , strlen($interrogas) - 1 );

                        $this->valores_insert = $update;
                        $this->valores_add = $update;
                        $this->list_inter = $interrogas;
                    } else {
                        throw new AppException("A quantidade de campos e de valores não coincidem -> ".json_encode( $campos ),109);
                    }
                }
            }

            $this->campos_table = $campos;
        }

        return $this;
    }

    // $insert = true, é para ser adicionado no banco, então retorna a ?
    protected function verificarParentese($valor, $insert = false)
    {
        preg_match("/\((.*?)\)/", $valor, $in_parenthesis);
        $qntd_in_parenthesis = count($in_parenthesis);
        $params_subs = $qntd_in_parenthesis >= 1 ? explode(',',$in_parenthesis[1]) : [];
        $qntd_params = count($params_subs);
        
        $valor = $qntd_params > 0 ? $params_subs : $valor;

        if ($insert) {
            $parametrosAjustar = str_pad(
                '?', 
                ($qntd_params + ($qntd_params - 1)), 
                ',?', 
                STR_PAD_RIGHT
            );

            $valor = $qntd_params > 0 
                ? "(" . $parametrosAjustar
                    . ")" 
                : '?';
        }

        return $valor;
    }

    protected function addArrayValoresInsert($array, $delimitador = false)
    {
        $array = $delimitador != false ? explode($delimitador, $array) : $array;
        for($i = 0; $i < count($array); $i++) {
            $this->valores_insert[] = $array[$i];
        }
        return $this->valores_insert;
    }

    protected function preAdjustWhere(
        $tipo, 
        $campo, 
        $operador_comparacao, 
        $valor, 
        $status_where = false
    ) {
        $valor_campo = "";

        if (strcmp($operador_comparacao, 'is') != 0) {
            $valor_add = $this->verificarParentese($valor);
            
            if (is_array($valor_add)) {
                $this->valores_insert = $this->addArrayValoresInsert($valor_add);
            } else {
                $this->valores_insert[] = $valor_add;
            }

            $valor_campo = $this->verificarParentese($valor, true);
        } else {
            $valor = is_null($valor) ? 'null' : $valor;
            $operador_comparacao .= ' '.$valor;
        }

        $this->ajustarWhere(
            $tipo,
            $campo,
            $operador_comparacao,
            $valor_campo, 
            $status_where
        );
    }

    public function where(
        $campo,
        $operador_comparacao,
        $valor
    ) {

        $this->preAdjustWhere(
            "where",
            $campo,
            $operador_comparacao,
            $valor
        );
        return $this;
    }

    public function whereOr(
        $campo,
        $operador_comparacao,
        $valor
    ) {

        $this->preAdjustWhere(
            "or",
            $campo,
            $operador_comparacao,
            $valor,
            $this->where
        );

        return $this;
    }

    public function whereAnd(
        $campo,
        $operador_comparacao,
        $valor
    ) {

        $this->preAdjustWhere(
            "and",
            $campo,
            $operador_comparacao,
            $valor,
            $this->where
        );

        return $this;
    }

    public function whereComplex(
        $campos, 
        $operadores, 
        $valores, 
        $oper_logicos = false
    ) {

        if (!is_array($campos)) {
            $this->msg_erro = "No where complexo os campos precisam ser um array";
        } elseif (!is_array($operadores)) {
            $this->msg_erro = "No where complexo os operadores precisam ser um array";
        } elseif (!is_array($valores)) {
            $this->msg_erro = "No where complexo os valores precisam ser um array";
        } elseif (!is_array(@$oper_logicos)) {
            $this->msg_erro = "No where complexo os operadores lógicos precisam ser um array";
        } else {
            if ($this->where == false) {
                $this->msg_erro = "Para utilizar o where complexo, é necessário instanciar o where primeiro";
            } else {
                $cont_campos = count($campos);
                $cont_operadores = count($operadores);
                $cont_valores = count($valores);
                $cont_logicos = count($oper_logicos);

                $tudo = [
                    $cont_campos,
                    $cont_operadores,
                    $cont_valores,
                    $cont_logicos
                ];

                foreach ($tudo as $key => $comp) {
                    if ($tudo[0] != $comp) {
                        $this->msg_erro = "As quantidade de valores não são " 
                            . "equivalentes, por favor corrija";
                    }
                }

                if ($this->msg_erro == false) {
                    $s = '';

                    for($i = 0; $i < count($campos); $i++) {
                        $interrogacoes = "";

                        if (strcmp($operadores[$i], 'is') != 0) {
                            $valor_add = $this->verificarParentese($valores[$i]);
                            $interrogacoes = $this->verificarParentese($valores[$i], true);

                            if (is_array($valor_add)) {
                                $this->valores_insert = $this->addArrayValoresInsert($valor_add);
                            } else {
                                $this->valores_insert[] = $valor_add;
                            }

                        } else {
                            $valor_opera = is_null($valores[$i]) ? 'null' : $valores[$i];
                            $operadores[$i] .= ' '.$valor_opera;
                        }

                        if ($i == 0) {
                            $s .= $oper_logicos[0] 
                                . " (" . $campos[0] . " " . $operadores[0] . " " 
                                . $interrogacoes . " ";
                        } elseif ($i == count($campos) - 1) {
                            $s .=	$oper_logicos[$i] . " " . $campos[$i] . " " 
                                . $operadores[$i] . " " . $interrogacoes . " )";
                            $this->whereComplex[] = $s;
                        } else {
                            $s .= $oper_logicos[$i] . " " . $campos[$i] . " "
                            . $operadores[$i] . " " . $interrogacoes . " ";
                        }
                    }
                }
            }
        }

        return $this;
    }

    public function leftJoin($tabela_join, $comparativo)
    {
        $this->ajustarJoin(
            "leftJoin", 
            $this->table_in,
            $tabela_join,
            $comparativo
        );

        return $this;
    }

    public function rightJoin($tabela_join, $comparativo)
    {
        $this->ajustarJoin(
            "rightJoin", 
            $this->table_in,
            $tabela_join,
            $comparativo
        );

        return $this;
    }

    public function innerJoin($tabela_join, $comparativo)
    {
        $this->ajustarJoin(
            "innerJoin", 
            $this->table_in,
            $tabela_join,
            $comparativo
        );

        return $this;
    }

    public function fullOuterJoin($tabela_join, $comparativo)
    {
        $this->ajustarJoin(
            "fullOuterJoin", 
            $this->table_in,
            $tabela_join,
            $comparativo
        );

        return $this;
    }

    public function groupBy($tabela)
    {
        $this->ajustarGroupBy($tabela);
        return $this;
    }

    public function groupByHaving($tabela, $clausula)
    {
        $this->ajustarGroupBy($tabela, $clausula);
        return $this;
    }

    public function orderBy($campo, $tipo)
    {
        if ($campo == false) {
            $this->orderBy = false;
            return $this;
        }

        if (!is_string($campo)) {
            $this->msg_erro = "O campo precisa ser uma string";
        }
        elseif (!is_string($tipo) 
            AND (strtoupper($tipo) == "ASC" 
            OR strtoupper($tipo) == "DESC")
        ) {
            $this->msg_erro = "O tipo precisa ser uma string, sendo ou ASC ou DESC ";
        } else {
            if ($this->orderBy == false) {
                $this->orderBy = "ORDER BY " . $campo . " " . $tipo;
            } else {
                $this->orderBy = $this->orderBy.', '.$campo.' '.$tipo;
            }
        }

        return $this;
    }

    public function getOrderBy()
    {
        return $this->orderBy;
    }

    public function insertSelect($tabela,$campos)
    {
        if (!is_array($campos)) {
            throw new AppException("Os campos do insertSelect precisam ser passados em um array");
        } elseif (!is_string($tabela)) {
            throw new AppException("A tabela do insertSelect precisa ser uma String");
        } else {
            $campos_usar = implode(",",$campos);
            $this->insertSelect = "SELECT ".$campos_usar." FROM ".$tabela;
        }

        return $this;
    }

    public function union($tipo=false)
    {
        $this->limparValores(true);

        switch( strtolower($tipo) ) {
            case 'all':
                $this->unionAll = ' UNION ALL ';
                break;
            case 'union':
                $this->union = ' UNION ';
                break;
            case 'unionall':
                $this->unionAll = ' UNION ALL ';
                break;
            default:
                $this->union = ' UNION ';
        }

        return $this;
    }

    public function setMsgNaoEncontrado($msg)
    {
        $this->nao_encontrado_per = $msg;
        return $this;
    }

    public function limit($limite, $offset = false)
    {
        if ($limite != false) {
            $this->limite = $limite;
            $this->offset = $offset;

            $this->valores_insert_final[] = (int) $limite;
        }

        if ($offset != false) {
            $this->valores_insert_final[] = (int) $offset;
        }

        return $this;
    }

    public function setGerarLog($gerar=true)
    {
        $this->gerar_log = $gerar;
        return $this;
    }

    public function setUsarExceptionNaoEncontrado($usar=true)
    {
        $this->exception_not_found = $usar;
        return $this;
    }

    public function setFalseNaoEncontrado($usar = true)
    {
        $this->retornar_false_not_found = $usar;
        return $this;
    }

    protected function setLinhasAfetadas($linhas_afetadas)
    {
        $this->linhas_afetadas = $linhas_afetadas;
    }

    public function getLinhasAfetadas()
    {
        return $this->linhas_afetadas;
    }

    public function setRetornoPersonalizado($retorno)
    {
        if (!is_array($retorno)) {
            throw new AppException('Tipo de retorno personalizado não é um array', 8);
        }

        $this->retorno_personalizado = $retorno;
        return $this;
    }

    public function setEventosGravar($eventos)
    {
        if (is_array($eventos)) {
            $this->eventos_gravar = @array_map('strtoupper', $eventos);
        } else {
            throw new AppException('Os tipos de eventos passados não são um array', 15165);
        }

        return $this;
    }

    public function setLogandoComplexo()
    {
        $this->gravar_log_complexo = true;
        return $this;
    }

    protected function setLogComplexo($query, $parametros)
    {
        $event = new Event();
        $event->addEvent('logdb','salvar','api/index/index/evento_salvar_log_bd');

        if ($this->eventos_gravar != false){
            if (in_array($this->method, $this->eventos_gravar)) {
                $event->trigger(
                    'logdb.salvar',
                    [$this->method, $query, $parametros]
                );
            }
        }
    }

    public function getFullWhere()
    {
        $where = ($this->where != false) ? " ".$this->where : "";
        
        $whereComplex = ($this->whereComplex != false) 
            ? " " . implode(" ",$this->whereComplex) 
            : "";

        $whereAnd = $this->whereAnd != false 
            ? " " . implode(" ", $this->whereAnd) 
            : '';

        $whereOr = $this->whereOr != false 
            ? " " . implode(" ",$this->whereOr) 
            : '';

        return $where
            . $whereOr
            . $whereAnd
            . $whereComplex;
    }

    public function buildQuery($tipo, $usando_union = false)
    {
        $this->create($tipo,$this->table_in);

        if (isset($this->campos_table) 
            AND !is_array($this->campos_table) 
            AND $this->method != "DELETE"
        ) {
            $this->msg_erro = "Os campos não são um array";
            $code_error = 005;

        } elseif (!is_string($this->table)) {
            $this->msg_erro = "A tabela precisa ser uma string";
            $code_error = 006;
        }

        if (isset($this->msg_erro)) {
            if ($this->msg_erro != false) {
                $msg = (isset($msg)) ? $msg : $this->msg_erro;
                $code_erro_return = isset($code_error) ? $code_error : 405;
                throw new AppException($msg, $code_erro_return);
            }

        }

        $campos_usar = (isset($this->campos_table) && $this->campos_table != false) 
            ? implode(",",$this->campos_table) 
            : "*";

        $orderby = ($this->orderBy != false) ? " ".$this->orderBy : "";

        $union = ($this->union != false && $this->unionAll == false) 
            ? $this->union 
            : '';

        $unionAll = ($this->union == false && $this->unionAll != false) 
            ? $this->unionAll 
            : '';

        $msg_nao_encontrado = ($this->nao_encontrado_per != false) 
            ? $this->nao_encontrado_per 
            : 'Nada Encontrado';

        // Joins
        $leftjoin = ($this->leftJoin != false) 
            ? implode(' ', $this->leftJoin) 
            : "";

        $rightjoin = ($this->rightJoin != false) 
            ? implode(' ', $this->rightJoin) 
            : "";

        $innerjoin = ($this->innerJoin != false) 
            ? implode(' ', $this->innerJoin) 
            : "";

        $fullouterjoin = ($this->fullOuterJoin != false) 
            ? implode(' ', $this->fullOuterJoin) 
            : "";
        // Fim Joins

        $groupby = ($this->groupBy != false) ? $this->groupBy." " : "";
        $limite = ((string) $this->limite != false) ? ' LIMIT ?' : "";
        $limite = ( (string) $this->offset != false) ? $limite.' OFFSET ?' : $limite;

        $retorno_personalizado = $this->retorno_personalizado;

        if ($this->method == "SELECT") {
            $is_select = true;

            switch (self::$driver) {
                case "firebird":
                    $limitar = ((string) $this->limite != false) ? ' FIRST ? ' : "";
                    $limitar = ( (string) $this->offset != false) ? $limitar.' SKIP ? ' : $limitar;

                    $campos_usar = (strlen($limitar) > 0) ? $limitar.$campos_usar : $campos_usar;
                    $limite = "";
                break;
                case "mysql":
                    $limite = ( (string) $this->offset != false) ? ' LIMIT ?,?' : $limite;
                break;
            }

            $string_build = $this->method . " "
                . $campos_usar . " "
                . $this->util . " "
                . $this->table
                . $leftjoin
                . $rightjoin
                . $innerjoin
                . $fullouterjoin
                . $this->getFullWhere()
                . $groupby
                . $orderby
                . $limite;

        } elseif ($this->method == "INSERT") {
            if ($this->list_inter == false AND $this->insertSelect == false) {
                throw new AppException("É ncessário passar os valores dos campos",007);

            } else {
                switch ($this->insertSelect) {
                    case false:
                        $suf_insert = "VALUES ("
                            . $this->list_inter . ")";
                        break;
                    default:
                        $suf_insert = $this->insertSelect
                            . $leftjoin
                            . $rightjoin
                            . $innerjoin
                            . $fullouterjoin
                            . $this->getFullWhere()
                            . $groupby
                            . $orderby;
                        break;
                }

                $string_build = $this->method . " "
                    . $this->util . " "
                    . $this->table . "("
                    .$campos_usar.") "
                    .$suf_insert;
            }
        }
        elseif ($this->method == "UPDATE")
        {
            if ($campos_usar != '*') {

                foreach ($this->campos_table as $i => $campos_use) {
                    $campos_atualizar[] = $campos_use/*[$i]*/ . ' = ? ';
                }
                
                $campos_usar = implode(',',$campos_atualizar);

                $string_build = $this->method . " "
                    . $this->table . " "
                    . $this->util . " "
                    . $campos_usar . ""
                    . $this->getFullWhere();
                    
            } else {
                throw new AppException('Layout incorreto para o método UPDATE ', 107);
            }
        } elseif ($this->method == "DELETE") {
            $string_build = $this->method . " "
                . $this->util . " "
                . $this->table . ""
                . $this->getFullWhere()
                . $groupby;
        } else {
            throw new AppException("Metódo desconhecido", 108);
        }

        $this->query_union .= $union
            .$unionAll
            .$string_build;
        $this->valores_insert_bd[] = $this->valores_insert;
        $pdo_obj = $this->pdo_obj_usando != false ? $this->pdo_obj_usando : false;

        /*if ($this->gravar_log_complexo == false) {
            $this->setLogComplexo($this->gravarsetLogComplexo, $this);
            $this->gravar_log_complexo = true;
        }*/

        $query = $this->query_union;
        $parametros = false;

        $count_insert_bd = count($this->valores_insert_bd);

        if ($count_insert_bd > 0) {
            $dados_insert_query = [];

            foreach ($this->valores_insert_bd as $i => $matriz_insert) {
                foreach ($matriz_insert as $j => $elemento_insert) {
                    $dados_insert_query[] = $elemento_insert;
                }
            }

            $dados_insert_query = is_array($dados_insert_query) 
                ? $dados_insert_query 
                : [$dados_insert_query];

            if (count($this->valores_insert_final) > 0) {
                $dados_insert_query = array_merge($dados_insert_query, $this->valores_insert_final);
            }

            $parametros = $dados_insert_query;
        }

        //$this->query_executar[] = [$query, $parametros];
        $executar = $this;

        if (!$usando_union) {
            $this->query = ['query' => $query, 'parametros' => $parametros];
            $executar = $this->executarSQL($query, $parametros);
            
            if ($this->gerar_log) {
                //$valores_query = json_encode($dados_insert_query);
                //$this->setLog(json_encode([$retorno, "query_sql" => $this->query_union, "valores_query" => $dados_insert_query]), 'info');
                //$retorno = [$retorno, "query_sql" => $this->query_union." -> valores_query => ".$valores_query];
            }

            $this->limparValores();
            $this->query_union = '';
        }

        if ($retorno_personalizado != false) {
            return array_merge(["dados"=>$executar], $retorno_personalizado);
        }

        return $executar;
    }
}