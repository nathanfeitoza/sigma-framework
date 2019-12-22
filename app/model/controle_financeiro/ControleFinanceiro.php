<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 17/03/19
 * Time: 12:28
 */

namespace AppModel\controle_financeiro;


use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;

class ControleFinanceiro extends Model
{
    /**
     * Objetivo: Trazer os dados do controle financeiro. Também busca as contas pagar, a receber,
     * a pagar para a tela de baixa de contas
     * Recebe: buscar (que, no caso da tela de baixa de contas recebe os campos da url), um campo de filtro
     * e um operador de filtro (ambos opcionais). Também pode receber uma closure de callback
     * Retorna: Dados do controle financeiro solicitado
     * Autor: Nathan Feitoza
     * Data: 18/03/19 09:12
     * Nome Método: getControleFinanceiro
     *
     * @param $controle_financeiro_id
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getControleFinanceiro($controle_financeiro_id)
    {
        $dados_controle_financeiro = $this->db()->tabela(Genericos::getSchema().'controle_financeiro')
            ->where('id','=', $controle_financeiro_id)
            ->buildQuery('select');

        return $dados_controle_financeiro;
    }

    /**
     * Objetivo: Recuperar as contas baixadas
     * Recebe: a entidade buscada, o periodo, o tipo de controle e o tipo a ser buscado
     * Retorna: Dados das contas
     * Autor: Nathan Feitoza
     * Data: 18/03/19 09:23
     * Nome Método: getBaixaDeContas
     *
     * @param $entidade
     * @param $data_periodo
     * @param int $tipo_controle
     * @param int $tipo_busca
     * @param bool $desfazer
     * @return array
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function getBaixaDeContas($entidade, $data_periodo, $tipo_controle = 1, $tipo_busca = 3, $desfazer = false)
    {
        $this->loadModel('entidade/fornecedor');
        $this->loadModel('entidade/cliente');
        $this->loadModel('entidade/admin_cartoes');

        $data_periodo = is_array($data_periodo) ? $data_periodo : [$data_periodo];

        if (count($data_periodo) == 1) $data_periodo[1] = $data_periodo[0];

        /*
         * 0 -> Controlefinanceiro a pagar
         * 1 -> Controlefinanceiro Receber
         * 2 -> Cartoes
         * 3 -> Cheques
         * 4 -> Carta Frete
         * 5 -> CTF
         * 9 -> Outros
         * */
        switch ($tipo_controle) {
            case 0:
                $this->model_entidade_fornecedor->setMsgNaoEncontrado('Fornecedor '.$entidade.' não encontrado')->getFornecedor($entidade);
                $view = Genericos::getSchema().($desfazer ? 'view_contas_pagas' : 'view_contas_pagar');
                break;
            case 1:
                $this->model_entidade_cliente->setMsgNaoEncontrado('Cliente '.$entidade.' não encontrado')->getCliente($entidade);
                $view = Genericos::getSchema().($desfazer ? 'view_contas_recebidas' : 'view_contas_receber');
                break;
            case 2:
                $this->model_entidade_admin_cartoes->setMsgNaoEncontrado('Administradora '.$entidade.' não encontrada')->getAdminCartoes($entidade);
                $view = Genericos::getSchema().($desfazer ? 'view_cartoes_recebidos' :'view_cartoes_receber');
                break;
            //case 3: break;
            //case 4: break;
            //case 5: break;
            //case 9: break;
            default:
                throw new AppException('Tipo controle não identificado', 297);
        }

        $tipo = 'vencimento';

        if ((int) $tipo_busca == 2) $tipo = 'emissao';
        elseif ((int) $tipo_busca == 3) $tipo = 'data_baixa';

        $campos = ['id', 'documento', 'emissao', 'vencimento', 'valor','valor_liquido','lote','valor_restante'];

        $dados = $this->db()->tabela($view)
            ->campos($campos)
            ->where('entidade_id', '=', $entidade)
            ->whereComplex([$tipo,$tipo], ['>=','<='], [$data_periodo[0], $data_periodo[1]],['AND','AND'])
            ->buildQuery('select');

        $retorno = [
            'DADOS' => $dados,
            'QNTD_DADOS' => count($dados)
        ];

        return $retorno;
    }

    /**
     * Objetivo: Recuperar os dados de um lote através do id do mesmo
     * Recebe: Campos da url, se vai ser um retorno completo
     * Retorna: os dados do lote
     * Autor: Nathan Feitoza
     * Nome Método: getLote
     *
     * @param $id_lote
     * @param bool $completo
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getLote($id_lote, $completo=false)
    {
        $campos_retornar = ['id', 'ENTIDADE_ID', 'documento', 'emissao', 'vencimento', 'valor','tipo_controle'];

        if ($completo != false) {
            $campos_retornar = ['*'];
        }

        return $this->db()->tabela(Genericos::getSchema().'controle_financeiro_itens_lote')
            ->campos($campos_retornar)
            ->where('CONTROLE_FINANCEIRO_LOTE_ID', '=', $id_lote)
            ->buildQuery('select');
    }

    /**
     * Objetivo: Baixar os boletos que vieram no arquivo de retorno
     * Recebe: Os boletos que serão baixados
     * Retorna: array com os boletos que foram baixados e os que não foram
     * Autor: Nathan Feitoza
     * Nome Método: setBaixarBoletosRetorno
     *
     * @param $boletos_baixar
     * @return array
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function setBaixarBoletosRetorno($dados_boletos)
    {
        $this->loadModel('boleto/boleto');
        $this->loadModel('entidade/empresa');

        $boleto = $this->model_boleto_boleto;
        $empresa = $this->model_entidade_empresa;

        $validar_boletos = ['nossoNumero', 'vencimento', 'pagamento', 'valorTitulo', 'valorRecebido', 'valorMulta', 'status','valorTarifa'];

        Genericos::camposVazios((array) $dados_boletos, $validar_boletos, true);

        $dados_boletos = (array) $dados_boletos;
        $nosso_numero = $dados_boletos[$validar_boletos[0]];
        $vencimento = $dados_boletos[$validar_boletos[1]];
        $pagamento = $dados_boletos[$validar_boletos[2]];
        $valorTitulo = $dados_boletos[$validar_boletos[3]];
        $valorRecebido = $dados_boletos[$validar_boletos[4]];
        $valorMulta = $dados_boletos[$validar_boletos[5]];
        $valorTarifa = $dados_boletos[end($validar_boletos)];
        $status = $dados_boletos[$validar_boletos[6]];

        $sucesso = [];
        $erro = [];

        $forma_banco = $empresa->getEmpresa()->FORMA_PAGTO_BANCO_ID;

        $bd = $this->db();
        $bd->iniciarTransacao();

        foreach($nosso_numero as $chave => $nosso_numero_item) {
            //$vencimento_item = $vencimento[$chave];
            //$valor_titulo_item = $valorTitulo[$chave];
            $pagamento_item = $pagamento[$chave];
            $valor_recebido_item = $valorRecebido[$chave];
            $valor_tarifa_item = $valorTarifa[$chave];
            $valor_multa_item = $valorMulta[$chave];
            $status_item = $status[$chave];

            $pagamento_atualizar = date('Y-m-d', strtotime($pagamento_item));
            $descontos = 0;
            $acrescimos = 0;

            preg_match('/^6/', $status_item, $liquidacao);

            $dados_boleto = $boleto->setCamposRetornar(['conta_corrente_id'])
                ->setFalseException(true)
                ->getBoleto($nosso_numero_item);


            //$dados_boleto = is_object($dados_boleto) ? $dados_boleto->getDadosSelectTransacao() : $dados_boleto;

            $conta_corrente = !is_array($dados_boleto) ? 0 : $dados_boleto[0]->CONTA_CORRENTE_ID;

            $campos_att = ['data_baixa','taxa_boleto', 'multa', 'descontos',
                'acrescimos', 'valor_pago'];
            $valores_att = [$pagamento_atualizar, $valor_tarifa_item, $valor_multa_item, $descontos,
                $acrescimos,$valor_recebido_item];

            if (!$liquidacao) {
                $campos_att[0] = 'obs';
                $valores_att[0] = $status_item;
            }

            $atualizar = $bd
                ->tabela(Genericos::getSchema().'controle_financeiro')
                ->campos($campos_att, $valores_att)
                ->where('id','=',$nosso_numero_item)
                ->buildQuery('update');

            if ($bd->getLinhasAfetadas() == 0) {
                $erro[] = $nosso_numero_item;
            } else {
                $atualizar = $bd->tabela(Genericos::getSchema().'controle_financeiro_pagto')
                    ->campos(['controle_financeiro_id','valor','forma_pagamento_id',
                        'conta_corrente_id','documento','data'],
                        [$nosso_numero_item,$valor_recebido_item,$forma_banco,
                            $conta_corrente, $nosso_numero_item, $pagamento_atualizar])
                    ->buildQuery('insert');
                $sucesso[] = $nosso_numero_item;
            }
        }

        $bd->commit();

        return ['SUCESSO'=>$sucesso,'ERRO'=>$erro];
    }
}