<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 12/03/19
 * Time: 13:51
 */

namespace AppCore;

use AppCore\errors\AppException;
use Slim\Http\Stream;

class Genericos
{
    public static function convertClassMethod($elemento, $type)
    {
        if($type == 1) {
            $classe = str_replace('_',' ', $elemento);
            $classe = ucwords($classe);
            $classe = str_replace(' ','', $classe);
            return $classe;
        }

        $method = str_replace('_',' ',$elemento);
        $method = ucwords($method);
        $method = lcfirst($method);
        $method = str_replace(' ','', $method);

        return $method;
    }

    /**
     * Objetivo:
     * Recebe:
     * Retorna:
     * Autor: Nathan Feitoza
     * Nome Método: loadModelGeneric
     *
     * @param $model
     * @param int $return -> 1 = retorna classe, 2 retornar classe e sua relacao
     * @return mixed|string
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public static function loadModelGeneric($model, $return = 1)
    {
            $nameSpaceModel = 'AppModel\\';
            $loadModel = explode('/',$model);
            $modelUse = $loadModel[0];
            $nameSpaceAdd = '';

            if(count($loadModel) > 1) {
                $modelUse = end($loadModel);
                array_pop($loadModel);
                $nameSpaceAdd = implode('\\', $loadModel) . '\\';
            }

            $nameSpaceModel .= $nameSpaceAdd;
            $class = $modelUse;
            $modelSave = str_replace('\\','_',$nameSpaceAdd.$class);
            $class = $nameSpaceModel . self::convertClassMethod($class, 1);

            if (!class_exists($class)) {
                throw new AppException('O model "' . $model . '" solicitado não foi encontrado', 1002, 403);
            }

            if($return == 2) return [$modelSave, $class];

            return $class;
    }

    public static function camposVazios($array_dados,$necessarios,$exception=false)
    {
        $quantidade = count($necessarios);

        for($i = 0; $i < $quantidade; $i++) {
            if(is_array($array_dados)) {
                if (!array_key_exists($necessarios[$i], $array_dados)) {
                    $nao_encontrados[] = $necessarios[$i];
                } else {
                    $campo = $array_dados[$necessarios[$i]];
                    if (!is_array($campo)) {
                        if ((strlen($campo)) == 0) $vazios[] = $necessarios[$i];

                    } else {
                        if (count($campo) == 0) $vazios[] = $necessarios[$i];
                    }
                }
            } else {
                $nao_encontrados[] = $necessarios[$i];
            }
        }

        if(isset($nao_encontrados) AND (count($nao_encontrados) != 0) AND !isset($vazios)) {
            $faltam = implode(",",$nao_encontrados);
            $msg = 'Faltam os seguintes campos: '.$faltam;
        } elseif(isset($vazios) AND (count($vazios) != 0) AND !isset($nao_encontrados)) {
            $vazios = implode(",",$vazios);
            $msg = 'Os seguintes campos estão vazios: '.$vazios;
        } elseif(isset($vazios) AND (count($vazios) != 0) AND isset($nao_encontrados) AND (count($nao_encontrados)) != 0) {
            $faltam = implode(",",$nao_encontrados);
            $vazios = implode(",",$vazios);
            $msg = 'Faltam os seguintes campos: '.$faltam.' e os seguintes campos esão vazios: '.$vazios;
        } else {
            $msg = 1;
        }

        if($exception and (isset($faltam) or isset($vazios)) ) throw new AppException($msg, 269);

        return $msg;
    }

    public static function removerCaracteresEspeciais($str)
    {
        $str = preg_replace('/[áàãâä]/ui', 'a', $str);
        $str = preg_replace('/[éèêë]/ui', 'e', $str);
        $str = preg_replace('/[íìîï]/ui', 'i', $str);
        $str = preg_replace('/[óòõôö]/ui', 'o', $str);
        $str = preg_replace('/[úùûü]/ui', 'u', $str);
        $str = preg_replace('/[ç]/ui', 'c', $str);
        return $str;
    }

    public static function verificarCampoPreenchido($array_campo, $campo_verificar, $gerar_exception_nao_encontrado=false)
    {
        $array_campo = is_array($array_campo) ? (array) $array_campo : $array_campo;
        if(isset($array_campo[$campo_verificar])) {
            if(!empty($array_campo[$campo_verificar]) OR
                ( (is_string($array_campo[$campo_verificar]) OR is_numeric($array_campo[$campo_verificar])) AND
                    ($array_campo[$campo_verificar] == "0" OR $array_campo[$campo_verificar] == 0) ) ) {
                return true;
            }
        }

        if($gerar_exception_nao_encontrado) throw new AppException($campo_verificar.' não encontrado',270,404);
        return false;
    }

    public static function encriptarDecriptar($acao, $string, $chave)
    {
        $saida = false;
        $metodo_encript = "AES-256-CBC";
        $chave_criptografia = hash('sha256', $chave);
        $iv = substr( hash('sha256', $chave_criptografia), 0, 16 ); // O metodo de encriptação selecionado só permite até 16 caracteres como senha

        switch (strtolower($acao)) {
            case 'encrypt':
                $saida = openssl_encrypt($string, $metodo_encript, $chave_criptografia, 0, $iv);
                break;
            case 'decrypt':
                $saida = openssl_decrypt($string, $metodo_encript, $chave_criptografia, 0, $iv);
                break;
        }

        return $saida;
    }

    public static function setStream($valor,$write = true,$stream = 'php://memory', $modo = 'rw')
    {
        $fh = fopen($stream, $modo); // Este handler abaixo foi colocado para que o Slim não deixe de exibir um texto muito grande na saída HTTP, por exemplo, um JSON extenso
        $stream = new Stream($fh); // É registrado o Handle no Slim;
        if($write) $stream->write($valor); // É escrito o retorno
        return $stream;
    }

    public static function jsonDecode($json, $msg_erro=false,$options_json=null,$excep=true)
    {
        $msg_erro = is_bool($msg_erro) ? 'O Json enviado não está em um formato válido' : $msg_erro;
        $msg_erro = (string) $msg_erro.'';
        $json = json_decode($json, $options_json);

        if(is_null($json) || !$json) {
            if($excep) throw new AppException($msg_erro,323);
            return $msg_erro;
        }

        return $json;
    }

    public static function getTemaDir($semRoot = false)
    {
        $tema = 'view/'.Configuracoes::get('TEMA');
        $self = preg_replace('/index.php+(.*)/', '',$_SERVER['PHP_SELF']);

        return !$semRoot ? Configuracoes::get('ROOTDIR').$tema : $self.$tema;
    }

    public static function getArquivosDir()
    {
        return Configuracoes::get('ROOTDIR').'arquivos/';
    }

    public static function getSchema($nome_schema=false)
    {
        $schema = 'empresa01';
        if(!isset($_SESSION)) @session_start();
        if(isset($_SESSION['schema'])) $schema = $_SESSION['schema'];
        if($nome_schema) return $schema;

        return $schema.'.';
    }

    public static function getUsuarioSCLogado($id_usuario=false, $usar_exception=true,$retorno_nao_encontrado=false)
    {
        if(!isset($_SESSION)) session_start();
        if(isset($_SESSION['usuario_id']) && $id_usuario) return $_SESSION['usuario_id']; // Retorna o login do usuário logado
        if(isset($_SESSION['usr_login']) && $id_usuario != true) return $_SESSION['usr_login']; // Retorna o id do usuário logado

        if($usar_exception) throw new AppException('Nenhum usuário logado', 298, 401);
        else return $retorno_nao_encontrado;
    }

    public static function mkdir($pasta, $recursivo=true)
    {
        if(!@mkdir($pasta, 0755, $recursivo)) {
            $error = error_get_last();
            throw new AppException($error['message'],$error['type'],500);
        }

        return true;
    }

    public static function saveArquivo($arquivo, $dados, $flags=null)
    {
        if(!@file_put_contents($arquivo, $dados, $flags)) {
            $error = error_get_last();
            throw new AppException($error['message'],$error['type'],500);
        }

        return true;
    }

    public static function getErrorUpload($cod_error, $exception = false)
    {
        switch ($cod_error) {
            case 0:
                $erro = true;
                break;
            case 1:
                $erro = 'O arquivo enviado excede o limite definido na diretiva upload_max_filesize do php.ini.';
                break;
            case 2:
                $erro = 'O arquivo excede o limite definido em MAX_FILE_SIZE no formulário HTML.';
                break;
            case 3:
                $erro = 'O upload do arquivo foi feito parcialmente.';
                break;
            case 4:
                $erro = 'Nenhum arquivo foi enviado.';
                break;
            case 6:
                $erro = 'Pasta temporária ausênte.';
                break;
            case 7:
                $erro = 'Falha em escrever o arquivo em disco.';
                break;
            case 8:
                $erro = 'Uma extensão do PHP interrompeu o upload do arquivo.';
                break;
            default:
                $erro = 'Erro não identificado';
        }

        if(!is_bool($erro) and $exception) throw new AppException($erro, $cod_error, 500);

        return $erro;
    }

    /**
     * Objetivo: Retornar a chave de criptografia para criptografar o caminho de um arquivo zip e devolvêlo através da api.
     * Usado, por exemplo, na geração em fila dos boletos
     * Retorna: String com a chave para criptografar arquivos zip
     * Autor: Nathan Feitoza
     * Nome Método: getChaveCriptografiaZip
     *
     * @return string
     * @autor Nathan Feitoza
     */
    public static function getChaveCriptografiaZip()
    {
        return '#@ABcN1F465NF10'.md5('ZiP5Cr14D0SliNd4M3enT3@N!F->10');
    }

    public static function includeExterno($files)
    {
        $files = is_array($files) ? $files : [$files];
        $pasta_externos = Configuracoes::get('ROOTDIR').'app/externo/notcomposer/';

        foreach($files as $file) {
            if(!strpos('.php', $file)) $file .= '.php';

            $arquivo = $pasta_externos.$file;

            if(!file_exists($arquivo)) {
                throw new AppException('O arquivo '.$arquivo.' solicitada a inclusão não existe', 1039, 500, 'Erro interno');
            }

            require_once $arquivo;
        }
    }

    /**
     * Objetivo: Limpar um string SQL removendo os campos que possam gerar SQL Injection
     * Recebe: String sql
     * Retorna: string sql limpa
     * Autor: Nathan Feitoza
     * Nome Método: setLimparStringSQL
     *
     * @param $string
     * @return false|mixed|string
     * @autor Nathan Feitoza
     */
    public static function limparStringSQL($string)
    {
        if(isset($string->innerDate)) {
            $string = $string->innerDate;
            $string = date('Y-m-d', strtotime($string));
        }
        $string = str_replace('select', '', $string);
        $string = str_replace('SELECT', '', $string);
        $string = str_replace('INSERT', '', $string);
        $string = str_replace('insert', '', $string);
        $string = str_replace('DELETE', '', $string);
        $string = str_replace('delete', '', $string);
        $string = str_replace('UPDATE', '', $string);
        $string = str_replace('update', '', $string);
        $string = str_replace('"', '', $string);
        $string = str_replace("'", '', $string);
        $string = str_replace(';', '', $string);
        return $string;
    }

    public static function converterNumero($numero)
    {
        if(strpos($numero,',') != false) {
            $numero_c = str_replace('.','', $numero);
            $numero_c = str_replace(',','.', $numero_c);
            if(is_numeric($numero_c)) {
                return (float) $numero_c;
            }
            return $numero;
        } else {
            return $numero;
        }
    }

    public static function retornarFloat($val)
    {
        $n_t = str_replace("R$", "", $val);
        if(strrpos($n_t,",") === true AND strrpos($n_t,".") === true) {
            $n_t = str_replace(".", "", $n_t);
            $n_t = str_replace(",", ".", $n_t);
        } else {
            $n_t = str_replace(",", ".", $n_t);
        }
        return (float) $n_t;
    }

    public static function getDadosUsuarioOauth()
    {
        if(isset($GLOBALS['dados_usuario_oauth'])) {
            return (array) $GLOBALS['dados_usuario_oauth'];
        }

        return false;
    }
}