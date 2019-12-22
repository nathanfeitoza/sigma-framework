<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 14/03/19
 * Time: 14:22
 */

namespace AppController\api\entidade;

use AppCore\Controller;
use AppCore\errors\AppException;
use AppCore\Genericos;

class ControllerEntidade extends Controller
{
    protected $model_entidades, $model_cliente, $model_adm_cartoes, $model_vendedores, $model_funcionarios, $model_empresa;

    public function __construct($container = false)
    {
        parent::__construct($container);

        $this->loadModel('entidade/entidade');
        $this->loadModel('entidade/cliente');
        $this->loadModel('entidade/admin_cartoes');
        $this->loadModel('entidade/vendedor');
        $this->loadModel('entidade/funcionario');
        $this->loadModel('entidade/empresa');
        $this->loadModel('entidade/fornecedor');

        $this->model_entidades = $this->model_entidade_entidade->setPagina($this->getPaginaPaginacao())->setMaxPorPag($this->getMaxPorPaginaPaginacao());
        $this->model_cliente = $this->model_entidade_cliente->setPagina($this->getPaginaPaginacao())->setMaxPorPag($this->getMaxPorPaginaPaginacao());
        $this->model_adm_cartoes = $this->model_entidade_admin_cartoes->setPagina($this->getPaginaPaginacao())->setMaxPorPag($this->getMaxPorPaginaPaginacao());
        $this->model_vendedores = $this->model_entidade_vendedor->setPagina($this->getPaginaPaginacao())->setMaxPorPag($this->getMaxPorPaginaPaginacao());
        $this->model_funcionarios = $this->model_entidade_funcionario->setPagina($this->getPaginaPaginacao())->setMaxPorPag($this->getMaxPorPaginaPaginacao());
        $this->model_empresa = $this->model_entidade_empresa->setPagina($this->getPaginaPaginacao())->setMaxPorPag($this->getMaxPorPaginaPaginacao());
        $this->model_fornecedor = $this->model_entidade_fornecedor->setPagina($this->getPaginaPaginacao())->setMaxPorPag($this->getMaxPorPaginaPaginacao());
    }

    public function listar()
    {
        $this->setMethodsAceitos('GET');
        $this->model_entidades->setMsgNaoEncontrado('Nenhuma entidade encontrada');
        $this->setOutputJson( $this->model_entidades->setPaginacao($this->getAllParams())->getEntidades() );
    }

    public function buscaCnpj()
    {
        $this->setMethodsAceitos('GET');
        $cnpj = $this->getParamSend('cnpj',true)['cnpj'];

        $this->setOutputJson($this->model_entidades->getEntidadeCnpj($cnpj));
    }

    public function adicionar()
    {
        $this->setMethodsAceitos('POST');

        $dados_entidade = $this->getParamSend('dados_entidade', true);
        $dados_entidade = $dados_entidade['dados_entidade'];

        //Genericos::camposVazios($dados_entidade, ['CNPJ','xNome','enderEmit','IE','CRT'], true);
        Genericos::camposVazios($dados_entidade, ['tipo_entidade','CNPJ','xNome','enderEmit'], true);

        $endereco_entidade = $dados_entidade['enderEmit'];
        //Genericos::camposVazios($endereco_entidade,['xLgr','nro','xCpl','xBairro','cMun','xMun','UF','CEP','cPais','xPais','fone']);
        Genericos::camposVazios($endereco_entidade,['xLgr','nro','xBairro','xMun','UF','CEP','fone']);

        $tipoEntidde = $dados_entidade['tipo_entidade'];

        $modelUsar = $this->model_entidades;
        $getEntidadePorCnpjMetodo = 'getEntidadeCnpj';

        if ($tipoEntidde == 1) {
            $modelUsar = $this->model_cliente;
            $getEntidadePorCnpjMetodo = 'getClienteCpfCnpj';
        }

        if ($tipoEntidde == 2) {
            $modelUsar = $this->model_fornecedor;
            $getEntidadePorCnpjMetodo = 'getFornecedorCnpj';
        }

        if (!is_bool($modelUsar->setFalseException(true)->$getEntidadePorCnpjMetodo($dados_entidade['CNPJ'])))
            throw new AppException('A entidade '.$dados_entidade['xNome'].' já esá cadastrada');

        $fornecedor_add = [
            'nome' => $dados_entidade['xNome'],
            'fantasia' => $dados_entidade['xNome'],
            'cnpj' => $dados_entidade['CNPJ'],
            'logradouro' => $endereco_entidade['xLgr'],
            'bairro' => $endereco_entidade['xBairro'],
            'numero' => is_numeric($endereco_entidade['nro']) ? $endereco_entidade['nro'] : 0,
            'cep' => $endereco_entidade['CEP'],
            'telefone1' => $endereco_entidade['fone'],
            'data_cadastro' => date('Y-m-d H:i:s'),
            'tipo' => $tipoEntidde,
            'entidade_tipo' => $tipoEntidde,
            'cidade' => $endereco_entidade['xMun'],
            'uf' => $endereco_entidade['UF'],
            'situacao' => 0,
            'email' => Genericos::verificarCampoPreenchido($dados_entidade, 'email') ? $dados_entidade['email'] : null
        ];

        $insert = $modelUsar->inserir_bd_entidade(array_keys($fornecedor_add), array_values($fornecedor_add));

        $this->setOutputJson([
            "entidade"=>[
                "id"=> $modelUsar->setMsgNaoEncontrado('Entidade com cnpj '.$dados_entidade['CNPJ'].' não encontrado, houve algum erro ao tentar cadastrá-lo')
                    ->$getEntidadePorCnpjMetodo($dados_entidade['CNPJ'])[0]->ID,
                "nome"=> $dados_entidade['xNome'],
                "fantasia" => $dados_entidade['xNome'],
                "cnpj_cpf"=> $dados_entidade['CNPJ']
            ]
        ]);
    }
}