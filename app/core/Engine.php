<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 09/03/19
 * Time: 16:04
 */

namespace AppCore;

use AppCore\errors\AppException;
use AppModel\entidade\Empresa;

class Engine
{
    const VERSAO = '0.1';
    const PASTA_ARQUIVOS_TMP = 'tmp';

    private $container = [];

    public function __construct()
    {
        $timezone = defined('DEFAULT_TIME_ZONE') ? DEFAULT_TIME_ZONE : 'America/Bahia';

        date_default_timezone_set($timezone);
    }

    public function getContainer()
    {
        $retornar = [];

        foreach ($this->container as $i => $valor) {
            $containerName = array_keys($valor)[0];
            $contaierValue = array_values($valor)[0];

            $retornar[$containerName] = $contaierValue;
        }

        return $retornar;
    }

    public function setContainer($chave, $container, $position = -1)
    {
        if (!is_int($position)) throw new AppException('A posição "'.$position.'" do container "'.$chave.'" não é válida', 1009,403);
        $position = $position < 0 ? count($this->container) : $position;
        $containerAdd[$chave] = $container;
        array_splice($this->container, $position, 0, [$containerAdd]);
    }

    public function initContainers()
    {
        $pastaAbir = Configuracoes::get('ROOTDIR').'app/containers';

        if (!file_exists($pastaAbir)) {
            throw new AppException('A pasta de containers não foi encontrada no caminho: '.$pastaAbir, 1010, 500);
        }

        $abrirPasta = opendir($pastaAbir);

        if (!$abrirPasta) {
            throw new AppException('Não foi possível abrir a pasta de containers. '.var_dump($abrirPasta, true), 1011, 500);
        }

        $este = $this;

        while (false !== ($file = readdir($abrirPasta))) {
            $naoExibir = ['.','..'];
            if (!in_array($file, $naoExibir)) {
                $file = $pastaAbir.'/'.$file;
                if (is_file($file)) {
                    require_once $file;
                }
            }
        }

        closedir($abrirPasta);

        $this->setContainer('settings', Configuracoes::get('SLIM_SETTINGS'), 0);
    }

    public function criarPasta($arquivo, $com_data = true)
    {
        $empresa = new Empresa();
        $cnpj = $empresa->getEmpresa()->CNPJ;
        $pasta_arquivos = Genericos::getArquivosDir();
        $estrutura_pasta = $pasta_arquivos.'/'.$cnpj.'/';
        $pasta_salvar = $estrutura_pasta.$arquivo;
        $pasta_salvar .= $com_data ? '/'.date('Y').'/'.date('m').'/' : '/';

        if (!file_exists($pasta_salvar)) Genericos::mkdir($pasta_salvar,0755, true);

        return $pasta_salvar;
    }

    public function saveArquivo($arquivo, $dadosArquivo, $criarPasta = true)
    {

        $arquivo = str_replace(DIRECTORY_SEPARATOR, '/', $arquivo);
        $estrutura_arquivo = explode('/', $arquivo);
        $arquivo_salvar = end($estrutura_arquivo);
        if ($criarPasta) array_pop($estrutura_arquivo);
        $pasta_arquivo = implode('/', $estrutura_arquivo);
        $pasta_salvar = $criarPasta ? $this->criarPasta($pasta_arquivo) . $arquivo_salvar: $pasta_arquivo;

        return Genericos::saveArquivo($pasta_salvar, $dadosArquivo);
    }
}