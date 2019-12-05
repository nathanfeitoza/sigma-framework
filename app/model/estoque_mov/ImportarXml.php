<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 25/03/19
 * Time: 16:10
 */

namespace AppModel\estoque_mov;


use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;

class ImportarXml extends Model
{
    /**
     * Objetivo: Salvar um xml enviado e retornar seus dados para utilização na tela de entrada de notas
     * Recebe: Arquivo xml a receber
     * Retorna: array com os dados da nota salva
     * Autor: Nathan Feitoza
     * Nome Método: salvarXMLEnviado
     *
     * @param $arquivo_xml
     * @return array
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function salvarXml($arquivo_xml) {
        $this->loadModel('estoque_mov/estoque_mov');
        $this->loadModel('nfe/nfe_core');
        $this->loadModel('entidade/empresa');

        $model_estoque_mov = $this->model_estoque_mov_estoque_mov;
        $model_nfe = $this->model_nfe_nfe_core;
        $model_empresa = $this->model_entidade_empresa->getEmpresa();

        if(!is_array($arquivo_xml)) $arquivo_xml = [$arquivo_xml];

        foreach ($arquivo_xml as $recuperar_envio) {
            $nome_arquivo = $recuperar_envio->getClientFilename();
            $erro_arquivo = $recuperar_envio->getError();

                if($erro_arquivo != 0) {
                    throw new AppException("Não foi possível receber o arquivo ". $nome_arquivo .". Erro: ".Genericos::getErrorUpload($erro_arquivo),15496);
                }

                $arquivo = explode(".",$nome_arquivo);
                $extensao = strtolower(end($arquivo));

                if($extensao != "xml")  throw new AppException("O arquivo ".$nome_arquivo." enviado não é um XML", 15497);

                if($recuperar_envio->getSize() > 3145728) throw new AppException("O arquivo ". $nome_arquivo ." enviado excede o limite máximo de 3 MB", 15498);

                $cnpj = $model_empresa->CNPJ; //Aqui virá o cnpj do usuário

                try {
                    $verificar = $model_nfe->setLerXML($recuperar_envio->file);

                    $chNFe = $model_nfe->getChaveNFe($verificar);

                    $emissao_formatar = $model_nfe->getDataEmissaoNFeChave($chNFe);
                    $ano = $emissao_formatar['ano'];
                    $mes = $emissao_formatar['mes'];


                    $verificar_nota = $model_estoque_mov->setUsarException(false)
                        ->getEstoqueMovSalvosChaveNfe($chNFe,false,true);

                    $novo_nome = '';

                    $upload = (is_int($verificar_nota) OR !file_exists($novo_nome)) ? $model_nfe->setSalvarNotaRecebidaGerada($chNFe,file_get_contents($recuperar_envio->file)) : true;

                    if($upload) {
                        $notas[] = $verificar;
                        $ja_cadastradas[] = $model_estoque_mov->getAnalisarNFeEnviada($verificar);
                        $msg[] = $nome_arquivo." recebida com sucesso";
                    } else {
                        throw new AppException("Erro ao receber o arquivo ".$nome_arquivo." tente novamente por favor", 15499);
                    }
                    /* Adicionar a partir daqui a verificação dos produtos para ver se já estão cadastrados
                        A verificação feita hoje (firebird), busca o código do produto da EstoqueMov que pode ser
                        o código de barras ou o código do produto que o fornecedor cadastrou na nota, o cfop do produto,
                        o cnpj do fornecedor e o fator (este serve como fator de convesão, por exemplo se eu compro um caixa
                        e vendo as unidades do produto, significa a taxa para converter as caixas em unidades)
                    */

                } catch(AppException $e) {
                   throw new AppException('Erro com o arquivo '.$nome_arquivo.': '.$e->getMessage(), $e->getCode(), $e->getCodeHttp(), $e->getMsgUsuario());
                }
        }



        if(isset($msg) and !isset($erro)) {
            $mensagens = implode(", ", $msg);
            $use_notas = $model_nfe->getFormatacaoNotaLida($mensagens, $notas, $ja_cadastradas);
            $usar_buscar = isset($use_notas["nota"][0]->infNFe) ? $use_notas["nota"][0]->infNFe : $use_notas["nota"][0]->NFe->infNFe;
            $save = 'ID_NFE = '.$chNFe.' || '.
                'Empresa = '.(isset($usar_buscar->emit->CNPJ) ? $usar_buscar->emit->CNPJ : $usar_buscar->emit->CPF).' || '.
                'Nome_Emitente = '.$usar_buscar->emit->xNome;

            //$this->gravarLogSC('access',false, $save);

            return $use_notas;
        } elseif(isset($erro) and !isset($msg)) {
            $mensagens = implode(", ", $erro);
            throw new AppException($mensagens, 276);
        } else {
            $okays = implode(", ", $msg);
            $no_okays = implode(", ", $erro);
            $use_notas = ["erro_notas"=>$erro,"notas"=>$notas,"produtos_cadastrados" => $ja_cadastradas];

            throw new AppException('Há NF-e com erro:'.$okays.json_encode($use_notas),276);
        }
    }
}