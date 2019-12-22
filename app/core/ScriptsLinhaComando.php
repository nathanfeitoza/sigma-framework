<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 29/05/19
 * Time: 11:47
 */

namespace AppCore;


class ScriptsLinhaComando extends Model
{
    public function getArgumento($indiceArgumento)
    {
        global $argv;

        return (isset($argv[$indiceArgumento])) ? $argv[$indiceArgumento] : false;
    }

    public function getOpcao($opcao)
    {
        $recuperarOpcao = getopt("", [$opcao.":"]);

        return (count($recuperarOpcao) > 0) ? $recuperarOpcao[$opcao] : false;
    }

    public function getEmpresasAtivas()
    {
        return [];
    }

    public function salvarLogScripts($mensagem, $codigo = 0)
    {
        $pastaLogs = '../logs/scripts_linha_comando/';

        if (!file_exists($pastaLogs)) Genericos::mkdir($pastaLogs, true);

        $nomeArquivo = date('d-m-Y').'.'.$this->getArgumento(0).'.log';

        $dadosSalvar = '['.date('d-m-Y H:i:s').']: '.$mensagem .
            ' - Código: '.$codigo.
            ' - Rastro do Erro: '.json_encode(error_get_last()).
            PHP_EOL;

        return Genericos::saveArquivo($pastaLogs.$nomeArquivo, $dadosSalvar, FILE_APPEND);
    }

    protected function getCorFundo($cor)
    {
        $cor = strtolower($cor);

        $cores = [
            'preto' => '40',
            'vermelho' => '41',
            'verde' => '42',
            'amarelo' => '43',
            'azul' => '44',
            'magenta' => '45',
            'ciano' => '46',
            'cinza-claro' => '47'
        ];

        return isset($cores[$cor]) ? $cores[$cor] : false;
    }

    protected function getCorTexto($cor)
    {
        $cor = strtolower($cor);

        $cores = [
            'preto' => '0;30',
            'cinza' => '1;30',
            'vermelho' => '0;31',
            'vermelho-claro' => '1;31',
            'verde' => '0;32',
            'verde-claro' => '1;32',
            'marrom' => '0;33',
            'amarelo' => '1;33',
            'azul' => '0;34',
            'azul-claro' => '1;34',
            'magenta' => '0;35',
            'magenta-claro' => '1;35',
            'ciano' => '0;36',
            'ciano-claro' => '1;36',
            'cinz-claro' => '0;37',
            'branco' => '1;37'
        ];

        return isset($cores[$cor]) ? $cores[$cor] : false;
    }

    public function setMensagem($mensagem, $cor = false, $fundo = false)
    {
        $cor = $this->getCorTexto($cor);
        $fundo = $this->getCorFundo($fundo);

        $estiloTexto = [];

        if ($cor != false) $estiloTexto[] = $cor;
        if ($fundo != false) $estiloTexto[] = $fundo;

        $estiloTexto = implode(';', $estiloTexto);

        echo "\e[".$estiloTexto."m".$mensagem."\e[0m";
        echo PHP_EOL;
    }

    public function setErro($msgErro, $codigoErro = 0)
    {

        $erroMostar = '['.date('d-m-Y H:i:s').']: Mensagem Erro: '.$msgErro.
            ' - Código: '.$codigoErro.
            ' - Arquivo: '.$this->getArgumento(0);

        $this->salvarLogScripts($msgErro, $codigoErro);

        $this->setMensagem($msgErro, 'branco', 'vermelho');
        exit;
    }

    public function getDadosNaoPodemVirVazios($mensagem) {
        echo PHP_EOL;
        echo $mensagem;
    
        $retornar = fgets(fopen ("php://stdin","r"));
        $retornar = preg_replace('/\s/', '', $retornar);
    
        if (strlen($retornar) == 0) {
    
            while(strlen($retornar) == 0) {
                echo $mensagem;
                $retornar = fgets(fopen ("php://stdin","r"));
                $retornar = preg_replace('/\s/', '', $retornar);
            }
        }
    
        return $retornar;
    }
    
    public function getYesOrNot($mensagem) {
        echo $mensagem." (s,n): ";
        $retornar = fgets(fopen ("php://stdin","r"));
        $retornar = preg_replace('/\s/', '', $retornar);
    
        return ($retornar == "s" || $retornar == "y" || (strlen($retornar) == 0)) ? 's' : 'n';
    }
    
    public function stringVirgulaToArray($mensagem, $padrao = '*') {
        echo PHP_EOL;
        echo $mensagem;
        $campos = fgets(fopen ("php://stdin","r"));
        $campos = preg_replace('/\s/', '', $campos);
        $campos = ((strlen($campos)) == 0) ? $padrao : $campos;
        $campos = explode(',', $campos);
    
        return $campos;
    }
    
    public function printArrayArquivo($array) {
        return "'".implode("','", $array)."'";
    }
}