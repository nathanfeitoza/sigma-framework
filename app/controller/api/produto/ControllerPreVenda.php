<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 22/03/19
 * Time: 09:07
 */

namespace AppController\api\produto;


use AppCore\Controller;
use AppCore\Genericos;

class ControllerPreVenda extends Controller
{
    protected function model()
    {
        $this->loadModel('produto/pre_venda');
        return $this->model_produto_pre_venda;
    }

    public function adicionar()
    {
        $this->setMethodsAceitos(['POST']);

        $necessarios = ["documento","saida","nome_cliente","cpf_cnpj","vendedor",
            "forma_pagto","total_acrescimo","total_desconto","total_pedido","tipo_pedido"];
        $this->getParamSend($necessarios, true);

        $this->setOutputJson($this->model()->criarPedidoCompraVenda($this->getAllParams()));
    }

    public function receberPdv()
    {
        $this->setMethodsAceitos('POST');

        $this->setOutputJson( $this->model()->setReceberPagamentoPdv($this->getAllParams()) );
    }

    public function verificarComandaMesa()
    {
        $this->setMethodsAceitos('GET');

        $esperado = $this->getParamSend(['numero_comanda_mesa', 'tipo'],true);
        $tipo_buscar = $this->getParamSend('tipo_buscar');
        $tipo_buscar = $tipo_buscar == false ? 'comanda' : $tipo_buscar['tipo_buscar'];

        $this->setOutputJson($this->model()->getComandaMesaConsumindo($esperado['numero_comanda_mesa'], $esperado['tipo'], $tipo_buscar, true));
    }

    public function nova()
    {
        $this->setMethodsAceitos('POST');

        $dados = $this->getParamSend('dados_pre_venda', true)['dados_pre_venda'];
        $dados = Genericos::jsonDecode($dados,'Os dados da pré-venda enviados não são um json válido', true);

        $this->setOutputJson($this->model()->setSalvarPedido($dados));
    }

    public function receberPagamento() {
        $this->setMethodsAceitos('POST');

        $dados = $this->getParamSend('dados_pagamento', true)['dados_pagamento'];
        $dados = Genericos::jsonDecode($dados, 'Os dados para pagamento da pré-venda não são um json válido', true);

        $this->setOutputJson($this->model()->setPagamentoPedido($dados));
    }
}