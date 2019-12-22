<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 17/03/19
 * Time: 03:32
 */

namespace AppController\api\produto;


use AppCore\Controller;
use AppCore\errors\AppException;
use AppCore\Genericos;

class ControllerProduto extends Controller
{
    protected $model_produto;

    public function __construct($container = false)
    {
        parent::__construct($container);

        $this->loadModel('produto/produto');
        $this->model_produto = $this->model_produto_produto;
    }

    public function listar()
    {
        $this->setMethodsAceitos('GET');
        $this->model_produto->setMsgNaoEncontrado('Nenhum produto encontrado. É necessário realizar o cadastro dos mesmos');

        $this->setOutputJson($this->model_produto->setPaginacao($this->getAllParams())->geProdutos());
    }

    public function buscar()
    {
        $this->setMethodsAceitos('GET');
        $produto = $this->getParamSend('produto', true)['produto'];

        if (is_numeric($produto)) {

            if (strlen($produto) >= 8) {
                $this->setOutputJson($this->model_produto->getProdutoCodigoBarras($produto));
            } else {
                $this->setOutputJson($this->model_produto->getProduto($produto));
            }

        } else {
            $this->setOutputJson($this->model_produto->getProdutoNome($produto));
        }
    }

    public function getProdutoGrade()
    {
        $this->setMethodsAceitos('GET');
        $produto_id = $this->getParamSend('produto_id', true)['produto_id'];

        $retornar = $this->model_produto->getProdutoGrade($produto_id);

        $this->setOutputJson($retornar);
    }

    public function getProdutoTamanhoCorJuntos()
    {
        $this->setMethodsAceitos('GET');

        $retornar = [
            'TAMANHOS'=> $this->model_produto->getListarProdutoTamanho(),
            'CORES' => $this->model_produto->getListarProdutoCor()
        ];

        $this->setOutputJson($retornar);
    }

    public function criarGrade()
    {
        $this->setMethodsAceitos('POST');

        $necessarios = ['produto_id', 'tamanho_id', 'cor_id'];
        $dados_grade = $this->getParamSend($necessarios, true);

        $produto_id = $dados_grade[$necessarios[0]];
        $tamanho_id = $dados_grade[$necessarios[1]];
        $cor_id = $dados_grade[end($necessarios)];

        $this->setOutputJson($this->model_produto->criarGrade($produto_id, $tamanho_id, $cor_id));
    }

    public function criarTamanho()
    {
        $this->setMethodsAceitos('POST');

        $tamanho = $this->getParamSend('tamanho', true)['tamanho'];

        $this->setOutputJson($this->model_produto->criarTamanhoCor('tamanho', 'tamanho', $tamanho));
    }

    public function criarCor()
    {
        $this->setMethodsAceitos('POST');

        $cor = $this->getParamSend('cor', true)['cor'];

        $this->setOutputJson($this->model_produto->criarTamanhoCor('cor', 'cor', $cor));
    }

    public function buscarRelacaoProdutoNfe()
    {
        $this->setMethodsAceitos('GET');

        $dados = $this->getParamSend(['id_emitente','cnpj','id_info'],true);

        $verificarProduto = $this->model_produto->setFalseException(true)->getProduto($dados['id_info']);

        if (!$verificarProduto) {
            throw new AppException('Produto com o id '.$dados['id_info'].' não cadastrado', 10584, 404);
        }

        $relacao = $this->model_produto->getProdutoNFE($this->getAllParams());

        if (is_int($relacao)) throw new AppException('Produto a ser relacionado não encontrado', 404, 404);

        $this->setOutputJson($relacao);
    }

    public function cadastrarAtualizarProdutoNfe()
    {
        $this->setMethodsAceitos('POST');

        $dados_cadastar = $this->getAllParams();

        $this->setOutputJson($this->model_produto->setCadastrarAtualizarRelacaoProdutoNfe($dados_cadastar));
    }

    public function cadastrarAtualizarLoteProdutoNfe()
    {
        $this->setMethodsAceitos('POST');

        $dados_cadastar = $this->getAllParams();

        $this->setOutputJson($this->model_produto->setCadastrarAtualizarLoteRelacaoProdutoNfe($dados_cadastar));
    }

    public function getProdutoCfop()
    {
        $cfop = $this->getParamSend('cfop', true)['cfop'];
        $retornar = $this->model_produto
            ->setMsgNaoEncontrado('Nenhum cfop cadastrado para o tipo '.$cfop)
            ->getProdutoCfop($cfop);

        $this->setOutputJson($retornar);
    }

    public function adicionar()
    {
        $this->setMethodsAceitos('POST');

        $necessarios = ['produtos'];
        $dados_produto = $this->getParamSend('produtos',true);
        $dados_produto = Genericos::jsonDecode($dados_produto['produtos'], 'O JSON passado com os produtos não é válido');

        $this->setOutputJson($this->model_produto->setSalvarProduto($dados_produto));
    }
}