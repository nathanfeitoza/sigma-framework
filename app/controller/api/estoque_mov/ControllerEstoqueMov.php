<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 19/03/19
 * Time: 09:29
 */

namespace AppController\api\estoque_mov;


use AppCore\Controller;
use AppCore\Genericos;

class ControllerEstoqueMov extends Controller
{
    protected function model()
    {
        $this->loadModel('estoque_mov/estoque_mov');
        return $this->model_estoque_mov_estoque_mov;
    }

    public function salvarXml()
    {
        $this->setMethodsAceitos('POST');
        $this->loadModel('estoque_mov/importar_xml');

        $arquivo = $this->getRequest()->getUploadedFiles();
        Genericos::verificarCampoPreenchido($arquivo,'files',true);

        $arquivo_xml = $arquivo['files'];

        $this->setOutputJson($this->model_estoque_mov_importar_xml->salvarXml($arquivo_xml));

    }

    public function salvarAtualizarItensManual()
    {
        $this->setMethodsAceitos('POST');

        /*$necessarios_url = ['inscr_estadual','saida','vendedor','icms','total_ipi',
            'out_despesas','valor_frete','base_de_calc_subst',
            'icms_subst','base_de_calc','desconto','total_produtos',
            'total_nfe','tipo_mov','modelo_doc','caixa','documento'];

        $necessarios_itens = ['codigo','desc_produto','ncm','unidade','preco_compra',
            'quantidade','total','st','base','ipi','cfop',
            'icms_prod','preco_venda','setor_id'];

        $necessarios_url_vai_validar = $necessarios_url;
        $necessarios_url_vai_validar[] = $necessarios_itens[0];

        $dados_salvar_atualizar = $this->getParamSend($necessarios_url_vai_validar, true);*/
        $dados_salvar_atualizar = $this->getAllParams();

        $this->setOutputJson($this->model()->setGravarAtualizarEstoqueMovItemManual($dados_salvar_atualizar));
    }

    public function salvarAtualizarItensXml()
    {
        $this->setMethodsAceitos('POST');
        $dados_json_xml_nota = $this->getParamSend('dados',true)['dados'];
        $dados_json_xml_nota = json_decode($dados_json_xml_nota, true);

        $this->setOutputJson($this->model()->setGravarAtualizarEstoqueMovItemXML($dados_json_xml_nota));
    }

    public function deletarEstoqueMov()
    {
        $this->setMethodsAceitos('DELETE');

        $nota_id = $this->getParamSend('nota_id',true)['nota_id'];
        $usar_chave = $this->getParamSend('usar_chave') != false;

        $this->setOutputJson($this->model()->setExcluirEstoqueMov($nota_id, $usar_chave));
    }

    public function vendaPdv()
    {
        $this->setMethodsAceitos('POST');

        $dados = $this->getParamSend('dados_pre_venda', true)['dados_pre_venda'];
        $dados = Genericos::jsonDecode($dados,'Os dados da pré-venda enviados não são um json válido', true);

        $this->setOutputJson($this->model()->vendaPdv($dados));
    }
}