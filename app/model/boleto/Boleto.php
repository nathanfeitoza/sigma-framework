<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 19/03/19
 * Time: 13:50
 */
namespace AppModel\boleto;

use AppCore\Engine;
use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;
use BoletosPHP\BoletosPHP;
use Cnab\Especie;
use Cnab\Factory;
use Cnab\Remessa\Cnab240\Arquivo;
use Cnab\Banco;

Genericos::includeExterno('BoletosPHP/BoletosPHP');

class Boleto extends Model
{
    const TRAVA_GERACAO_NSU = 'ultimo.nsu';

    private $em_fila = false, $finalizar_zip = false, $baixar_somente_remessa = false;
    private $nome_remessa_temp;
    protected $boletoPHP, $empresa;

    public function __construct()
    {
        $this->boletoPHP = new BoletosPHP();
        $this->loadModel('entidade/empresa');
        $this->empresa = $this->model_entidade_empresa;
    }

    /**
     * Objetivo: Recupera um boleto da base
     * Recebe: boleto id
     * Retorna: boleto
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:41
     * Nome Método: getBoleto
     *
     * @param $boleto_id
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getBoleto($boleto_id)
    {
       return $this->db()
            ->tabela(Genericos::getSchema().'view_boletos_bancarios')
            ->where('boleto_id', '=', $boleto_id)
            ->buildQuery('select');
    }

    /**
     * Objetivo: Recupera um boleto por seu documento
     * Recebe: documento do boleto
     * Retorna: boleto
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:41
     * Nome Método: getBoletoDocumento
     *
     * @param $boleto_documento
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getBoletoDocumento($boleto_documento)
    {
        return $this->db()
            ->tabela(Genericos::getSchema().'view_boletos_bancarios')
            ->where('documento', '=', $boleto_documento)
            ->buildQuery('select');
    }

    /**
     * Objetivo: Recuperar a remessa de um boleto
     * Recebe: remessa id de um boleto
     * Retorna: dados do boleto
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: getBoletoRemessa
     *
     * @param $boleto_remessa_id
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getBoletoRemessa($boleto_remessa_id)
    {
        return $this->db()
            ->tabela(Genericos::getSchema().'view_boletos_bancarios')
            ->where('remessa_boleto_id', '=', $boleto_remessa_id)
            ->buildQuery('select');
    }

    /**
     * Objetivo: Formatar o numero do boleto para algum padrão do banco. Retirada do arquivo de funções do BoletoPHP,
     * pois havia redundância de código lá
     * Recebe: numero, loop, inserts e tipo
     * Retorna: numero do boleto fomatado
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: formatarNumeroBoleto
     *
     * @param $numero
     * @param $loop
     * @param $insert
     * @param string $tipo
     * @return mixed|string
     * @autor Nathan Feitoza
     */
    public function formatarNumeroBoleto($numero,$loop,$insert,$tipo = "geral")
    {
        if ($tipo == "geral") {
            $numero = str_replace(",","",$numero);
            while(strlen($numero)<$loop){
                $numero = $insert . $numero;
            }
        }
        if ($tipo == "valor") {
            /*
            retira as virgulas
            formata o numero
            preenche com zeros
            */
            $numero = str_replace(",","",$numero);
            while(strlen($numero)<$loop){
                $numero = $insert . $numero;
            }
        }
        if ($tipo == "convenio") {
            while(strlen($numero)<$loop){
                $numero = $numero . $insert;
            }
        }
        return $numero;
    }

    /**
     * Objetivo: Voltar, adiantar ou recuperar o atual do sequence da remessa
     * Recebe: se vai voltar ou adiantar
     * Retorna: o valor adicionado, diminuido ou atual do sequence da remessa
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42a
     * Nome Método: setVoltarAdiantarRemessaNSUBoleto
     *
     * @param bool $voltar_adiantar
     * @return mixed
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    protected function setVoltarAdiantarRemessaNSUBoleto($voltar_adiantar=false)
    {
        if(strcasecmp($voltar_adiantar,'adiantar') == 0){
            return $this->db()->executarSQL("SELECT nextval('".Genericos::getSchema()."remessa_boleto_id') as nsu")[0]->NSU;
        } else {
            return $this->db()->executarSQL("SELECT setval('".Genericos::getSchema()."remessa_boleto_id',?) as nsu",[((int)$this->getRemessaNSUBoleto(false) - 1)])[0]->NSU;
        }
    }

    /**
     * Objetivo: Retornar o valor a ser usado como NSU na remessa
     * Recebe: adicionar um ou não
     * Retorna: o valor do valor corrente do sequence da remessa acrescido ou não de 1
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: getRemessaNSUBoleto
     *
     * @param bool $addum
     * @return mixed
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    protected function getRemessaNSUBoleto($addum=true)
    {
        $valor_corrente = $this->db()
            ->tabela(Genericos::getSchema().'remessa_boleto_id')
            ->campos(['last_value'])
            ->buildQuery('select')[0];

        $valor_corrente = $valor_corrente->LAST_VALUE;

        if(!$addum) return $valor_corrente;

        return $valor_corrente + 1;
    }

    /**
     * Objetivo: Receber os dados para montar o boleto e sua remessa
     * Recebe: Documento, dadaos da conta corrente empresa e se vai exibir o pdf gerado
     * Retorna: Retornar o PDF do boleto ou um booleano afirmando que o pdf foi gerado mas não o exibe
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: montarBoleto
     *
     * @param $documento
     * @param $dados_contaCorrente
     * @param $empresa
     * @param bool $pdf
     * @return array|bool
     * @throws \Exception
     * @autor Nathan Feitoza3
     */
    protected function montarBoleto($documento,$dados_contaCorrente, $pdf=false)
    {
        $this->boletoPHP->setLayout('cef_sigcb');
        $documento = Genericos::jsonDecode($documento, 'Link inválido para geração do boleto');

        $conta = $dados_contaCorrente->CONTA_FORMATADA;
        $conta_dv =  $dados_contaCorrente->CONTA_DV;
        $conta_cedente = $dados_contaCorrente->CONTA_CEDENTE_FORMATADA;
        //$conta_cedente_dv = $dados_contaCorrente->CONTA_CEDENTE_DV;

        $pasta_imagens = $pdf == false ? Genericos::getTemaDir(true) : Genericos::getTemaDir();
        $pasta_imagens .= '/img/boletos';
        $pasta_imagens = str_replace("\\", "/", $pasta_imagens);
        $pasta_imagens = str_replace(' ','-esp!@', $pasta_imagens);

        $empresa = $this->empresa->getEmpresa();

        $this->boletoPHP->setPastaImagens($pasta_imagens);
        $erroBoletos = [];
        for($i = 0, $contar_docs = count($documento); $i < $contar_docs; $i++) {
            $documento_usando = $documento[$i];
            try {
                $msg_naoencontrado = $pdf ? 'Boleto de documento ' . $documento_usando . ' não encontrado' : 'Boleto de documento ' . $documento_usando . ' não teve o pdf gerado.';
                $campos_retornar_boleto = ['nome', 'email', 'cnpj', 'logradouro',
                    'numero', 'bairro', 'cep', 'cidade', 'uf', 'documento',
                    'vencimento', 'valor', 'emissao', 'boleto_id', 'entidade_id',
                    'remessa_boleto_id', 'pasta_boleto', 'boleto_id'];

                $dados_boleto = $this->setCamposRetornar($campos_retornar_boleto)
                    ->setFalseException(true)
                    ->getBoletoDocumento($documento_usando);

                if (!is_int($dados_boleto)) {
                    $dados_boleto = $dados_boleto[0];

                    //$dias_de_prazo_para_pagamento = 0;
                    $taxa_boleto = ((strlen($dados_contaCorrente->TAXA_BOLETO)) == 0) ? '0' : $dados_contaCorrente->TAXA_BOLETO; // Taxa a ser cobrada do boleto
                    $valor_boleto_cadastro = $dados_boleto->VALOR;
                    //$valor_cobrado = str_replace(",", ".", $valor_boleto_cadastro);
                    $valor_boleto_real = $valor_boleto_cadastro + $taxa_boleto;
                    $valor_boleto = number_format($valor_boleto_real, 2, ',', '');

                    // Informações sobre processamento, documento e valores
                    $data_documento = date('d/m/Y', strtotime($dados_boleto->EMISSAO));
                    $nosso_numero = ['000', '1', '000', '4', str_pad($dados_boleto->BOLETO_ID, 9, "0", STR_PAD_LEFT)];
                    $data_vencimento = date('d/m/Y', strtotime($dados_boleto->VENCIMENTO));

                    $this->boletoPHP->setNumeroDocumento($documento_usando)
                        ->setDataVencimento($data_vencimento)
                        ->setDataDocumento($data_documento)
                        ->setDataProcessamento($data_documento)
                        ->setValorBoleto($valor_boleto)
                        // Dados do cliente que pagará o boleto
                        ->setSacado($dados_boleto->NOME)
                        ->setEndereco1($dados_boleto->LOGRADOURO)
                        ->setEndereco2($dados_boleto->CIDADE . " - " . $dados_boleto->UF . " - CEP: " . $dados_boleto->CEP)
                        // Informações para o sacado (cliente pagador)
                        ->setDemonstrativo('Nathan - (79) 3214-4343', 'Mensalidade referente a servicos de Informatica.')
                        // Informações/Instruções para o caixa
                        ->setInstrucoes($dados_contaCorrente->MENSAGEM_BOLETO)//'Sr. Caixa, cobrar multa de 2% após o vencimento + R$ 0,07 por dia de atraso.';
                        // DADOS OPCIONAIS DE ACORDO COM O BANCO OU CLIENTE
                        //->setQuantidade('');
                        //->setValorUnitario('')
                        //->setAceite('NAO')
                        //->setEspecie('R$')
                        //->setEspecieDoc('DM')
                        ->setIdentificacao($empresa->FANTASIA)
                        ->setCpfCnpj($empresa->CNPJ)
                        ->setEndereco($empresa->LOGRADOURO)
                        ->setCidadeUf($empresa->CIDADE . ' ' . $empresa->UF)
                        ->setCedente($empresa->NOME)
                        ->setAgencia($dados_contaCorrente->AGENCIA)
                        ->setConta($conta)
                        ->setContaDv($conta_dv)
                        ->setContaCedente($conta_cedente)
                        ->setCarteira($dados_contaCorrente->TIPO_CARTEIRA)
                        // Diferenciador banco
                        //(CAIXA)
                        ->setNossoNumero1($nosso_numero[0])
                        ->setNossoNumeroConst1($nosso_numero[1])// Aqui altera-se para gerar um boleto registrado
                        ->setNossoNumero2($nosso_numero[2])
                        ->setNossoNumeroConst2($nosso_numero[3])
                        ->setNossoNumero3($nosso_numero[4])
                        ->setCodigoBanco($dados_contaCorrente->BANCO)
                        ->setNumMoeda(9)
                        ->montarBoleto($pdf);

                    $this->formatarNumeroBoleto('', '', '');
                    //Numero gerado para debug
                    $nosso_numero_remessa = formata_numero($nosso_numero[0], 3, 0) . formata_numero($nosso_numero[2], 3, 0) . formata_numero($nosso_numero[4], 9, 0);
                    $mod_carteira = $nosso_numero[1] . $nosso_numero[3];
                    $tipo_sacado = strlen('' . $dados_boleto->CNPJ) == 14 ? 'cnpj' : 'cpf';
                    $sacado_tipo = $tipo_sacado == "cnpj" ? "sacado_cnpj" : "sacado_cpf";
                    $valor_multa_dia = 0.03;
                    $dias_atraso = 30;
                    $data_multa = date('Y-m-d', strtotime($dados_boleto->VENCIMENTO . ' + 1 day'));
                    $valor_multa = $valor_boleto_real * 0.02;

                    $com_sessao = isset($_SESSION['remessa_temp']);

                    if ($pdf OR $com_sessao) {
                        //var_dump('oi');
                        if ($com_sessao) $this->setNomeRemessaTemp($_SESSION['remessa_temp']);

                        $remessa_boleto = $dados_boleto->REMESSA_BOLETO_ID;

                        if (is_null($remessa_boleto) OR (strlen($remessa_boleto) == 0) OR $remessa_boleto == false) {
                            $dados_remessa = [
                                'boleto_id' => $dados_boleto->BOLETO_ID,
                                'codigo_ocorrencia' => 1, // 1 = Entrada de título, futuramente poderemos ter uma constante
                                'nosso_numero' => $nosso_numero_remessa,
                                'numero_documento' => $documento_usando,
                                'carteira' => $dados_contaCorrente->TIPO_CARTEIRA,
                                'modalidade_carteira' => $mod_carteira, //Para SINCO -> ver documentaçao CNAB 240
                                'especie' => Especie::CEF_DUPLICATA_DE_PRESTACAO_DE_SERVICOS, // Você pode consultar as especies Cnab\Especie
                                'aceite' => 'N', // "S" ou "N"
                                'registrado' => true,
                                'valor' => $valor_boleto_real, // Valor do boleto
                                'instrucao1' => 2, // 1 = Protestar com (Prazo) dias, 2 = Devolver após (Prazo) dias, futuramente poderemos ter uma constante
                                'identificacao_distribuicao' => 0,
                                'instrucao2' => 0, // preenchido com zeros
                                'sacado_nome' => $dados_boleto->NOME, // O setSacado é o cliente, preste atenção nos campos abaixo - substr($nome, 0, -17)
                                'sacado_tipo' => $tipo_sacado, //campo fixo, escreva 'cpf' (sim as letras cpf) se for pessoa fisica, cnpj se for pessoa juridica
                                $sacado_tipo => $dados_boleto->CNPJ,
                                'sacado_razao_social' => $dados_boleto->NOME,
                                'sacado_logradouro' => $dados_boleto->LOGRADOURO,
                                'sacado_bairro' => $dados_boleto->BAIRRO,
                                'sacado_cep' => $dados_boleto->CEP, // sem hífem
                                'sacado_cidade' => $dados_boleto->CIDADE,
                                'sacado_uf' => is_null($dados_boleto->UF) ? '' : $dados_boleto->UF,
                                'data_vencimento' => $dados_boleto->VENCIMENTO,
                                'data_cadastro' => $dados_boleto->EMISSAO,
                                'baixar_apos_dias' => 036, // Ele está a fazer uma redução de 6 dias, então, como queremos de 30 dias, colocar para 036
                                'juros_de_um_dia' => $valor_multa_dia, // Valor do juros de 1 dia'
                                'data_desconto' => null,
                                'valor_desconto' => null, // Valor do desconto
                                'prazo' => $dias_atraso, // prazo de dias para o cliente pagar após o vencimento
                                'taxa_de_permanencia' => '0', //00 = Acata Comissão por Dia (recomendável), 51 Acata Condições de Cadastramento na CAIXA
                                'mensagem' => $dados_contaCorrente->MENSAGEM_BOLETO,
                                'data_multa' => $data_multa, // data da multa
                                'valor_multa' => number_format($valor_multa, 2, '.', ''), // valor da multa
                            ];
                            file_put_contents($this->nome_remessa_temp, json_encode($dados_remessa) . PHP_EOL, FILE_APPEND);
                        }
                    }
                }
            } catch (\Exception $e) {
                $erroBoletos[] = 'Erro no boleto: '.$documento_usando.'. '.$e->getMessage().' - Cod: '.$e->getCode();
            }
        }

        if(count($erroBoletos) > 0) {
            throw new AppException(implode(', ',$erroBoletos),500);
        }

        if($pdf == false) {
            return ['Header' => ['Content-Type' => 'text-html; charset=utf-8']];
        }

        return true;
    }

    /**
     * Objetivo: Retornar o caminho onde os arquivos de remessa a ser gerados serão gravados, usando o cnpj para organizar
     * Retorna: Caminho da pasta onde ficam os arquivos de remessa
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: getPastaRemessa
     *
     * @return string
     * @autor Nathan Feitoza
     */
    protected function getPastaRemessa()
    {
        $pasta_remessas = $this->engine()->criarPasta(Engine::PASTA_ARQUIVOS_BOLETOS.'/remessas', false);
        return $pasta_remessas;
    }

    /**
     * Objetivo: Gerar o arquivo de remessa e devolver a nsu e o caminho completo do arquivo gerado
     * Recebe: $conta_usar -> Id da conta corrente a usar
     * zipar -> Objeto ZipArchive para adicionar o arquivo de remessa gerado no zip
     * Retorna: Um array com o nsu e o caminho salvo da remessa. Caso esteja no modo fila (gerando zips) retorna
     * um false se o arquivo temporário não for encontrado
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: gerarRemessa
     *
     * @param bool $conta_usar
     * @param bool $zipar
     * @return array|bool
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function gerarRemessa($conta_usar=false, $zipar=false)
    {
        if($zipar != false) {
            $zip = $zipar;
        }

        $dados_contaCorrente = $this->empresa->getContaCorrenteEmpresa($conta_usar);
        $empresa = $this->empresa->getEmpresa();

        $dados_contaCorrente = $this->formatarObjetosConta($dados_contaCorrente);

        $pasta_remessas = $this->getPastaRemessa();
        $remessa_temp = isset($_SESSION['remessa_temp']) ? $_SESSION['remessa_temp'] : $this->nome_remessa_temp;
        $arquivo_lock_nsu = $pasta_remessas . '/'. self::TRAVA_GERACAO_NSU;

        if(file_exists($arquivo_lock_nsu)) {
            unlink($arquivo_lock_nsu);
        }

        if(file_exists($remessa_temp)) {
            $codigo_banco = Banco::CEF;
            $remessa = new Arquivo($codigo_banco);
            $nsu = $this->getRemessaNSUBoleto();
            file_put_contents($arquivo_lock_nsu, $nsu);

            $configurar_remessa = [
                'data_geracao' => new \DateTime(),
                'data_gravacao' => new \DateTime(),
                'nome_fantasia' => $empresa->FANTASIA, // seu nome de empresa
                'razao_social' => $empresa->NOME, // sua razão social
                'cnpj' => $empresa->CNPJ, // seu cnpj completo
                'banco' => $dados_contaCorrente->BANCO, //código do banco
                'logradouro' => $empresa->LOGRADOURO,
                'numero' => $empresa->NUMERO,
                'bairro' => $empresa->BAIRRO,
                'cidade' => $empresa->CIDADE,
                'uf' => $empresa->UF,
                'cep' => $empresa->CEP,
                'agencia' => $dados_contaCorrente->AGENCIA,
                'conta' => $dados_contaCorrente->CONTA_FORMATADA, // número da conta
                'conta_dac' => $dados_contaCorrente->CONTA_DV, // digito da conta
                'codigo_cedente' => $dados_contaCorrente->CONTA_CEDENTE_FORMATADA,
                'codigo_cedente_dv' => $dados_contaCorrente->CONTA_CEDENTE_DV,
                'agencia_dv' => 1, //digito verificador da agencia -> 5
                'operacao' => '003', // Tipo de operação da conta
                'numero_sequencial_arquivo' => $nsu
            ];

            $remessa->configure($configurar_remessa);
            $remessa_dados = file_get_contents($remessa_temp);
            $remessa_dados = explode(PHP_EOL, $remessa_dados);

            unset($remessa_dados[end($remessa_dados)]);

            foreach ($remessa_dados as $dados_remessa) {
                $dados_inserir = json_decode($dados_remessa, true);
                if (is_array($dados_inserir)) {
                    $atualizar_nsu[] = $dados_inserir['numero_documento'];
                    $dados_inserir['data_vencimento'] = new \DateTime($dados_inserir['data_vencimento']);
                    $dados_inserir['data_cadastro'] = new \DateTime($dados_inserir['data_cadastro']);
                    $dados_inserir['data_multa'] = new \DateTime($dados_inserir['data_multa']);

                    $remessa->insertDetalhe((array)$dados_inserir);
                }
            }

            $numero_remessa = $configurar_remessa['numero_sequencial_arquivo'];
            $nome_remessa_final = date('Ymd') . str_pad($numero_remessa, 5, "0", STR_PAD_LEFT) . '.REM';
            $caminho_salvar_remessa = $pasta_remessas . '/' . $nome_remessa_final;
            $remessa->save($caminho_salvar_remessa);
            unlink($remessa_temp);
            unlink($arquivo_lock_nsu);

            if (isset($zip)) {
                $zip->addFile($caminho_salvar_remessa, $nome_remessa_final);
            }

            if (isset($atualizar_nsu)) {

                $this->atualizar_bd1_controle_financeiro(
                    ['remessa_boleto_id','pasta_remessa'],
                    [$nsu,$caminho_salvar_remessa],
                    function($where) use($atualizar_nsu) {
                        $where->where('documento', 'in', '(' . implode(',', $atualizar_nsu) . ')');
                    }
                );

                $this->setVoltarAdiantarRemessaNSUBoleto('adiantar');
            }

            return [$numero_remessa, $caminho_salvar_remessa];
        } else {
            return false;
        }
    }

    /**
     * Objetivo: Formatar os objetos que referem-se a dados de conta
     * Recebe: dados da conta corrente
     * Retorna: objetos de conta formatados
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: formatarObjetosConta
     *
     * @param $dados_contaCorrente
     * @return mixed
     * @autor Nathan Feitoza
     */
    protected function formatarObjetosConta($dados_contaCorrente)
    {
        $dados_contaCorrente = isset($dados_contaCorrente[0]) ? $dados_contaCorrente[0]  : $dados_contaCorrente;

        $dados_contaCorrente->CONTA_FORMATADA = substr($dados_contaCorrente->NUMERO_CONTA, 0, -1);
        $dados_contaCorrente->CONTA_DV = substr($dados_contaCorrente->NUMERO_CONTA, -1, 1);
        $dados_contaCorrente->CONTA_CEDENTE_FORMATADA = substr($dados_contaCorrente->CODIGO_CEDENTE, 0, -1);
        $dados_contaCorrente->CONTA_CEDENTE_DV = substr($dados_contaCorrente->CODIGO_CEDENTE, -1, 1);
        return $dados_contaCorrente;
    }

    /**
     * Objetivo: Gerar os boletos juntando com suas remessas e, caso necessários, zipá-los
     * Recebe: Campos da url
     * Retorna: array com os dados da fila de boletos ou o caminho criptografado
     * para baixar o(s) arquivo(s) do(s) boleto(s)
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: gerarBoleto
     *
     * @param $campos_url
     * @return array
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function gerarBoleto($documento, $conta_usar)
    {
        $empresa = $this->empresa;

        $baixar_somenteRemessa = $this->baixar_somente_remessa;
        $documentos_gerar = @json_decode($documento);

        $dados_contaCorrente = $empresa->getContaCorrenteEmpresa($conta_usar);

        $caminho_pasta_pdf = Engine::PASTA_ARQUIVOS_BOLETOS.'/pdf';
        $pasta_zips = $this->engine()->criarPasta( Engine::PASTA_ARQUIVOS_BOLETOS .'/zips', false);

        $nome_zip_temp = time().uniqid();
        $nome_zip_final = 'Boletos'.date('d-m-Y');

        $qntd_docs_gerar = count($documentos_gerar);

        $zip_final = $pasta_zips.'/'.$nome_zip_final.'.zip';
        $zip_temporario = $pasta_zips.'/'.$nome_zip_temp.'.zip';

        $nome_remessa_temp = time().uniqid().rand(0, 100);

        $remessa_temp = $this->getPastaRemessa().'/'.$nome_remessa_temp;

        $dados_contaCorrente = $this->formatarObjetosConta($dados_contaCorrente);

        if($this->em_fila != false) {
            $nome_arquivo_fila = $this->em_fila;
            $verificar_nome_arquivo_fila = strtolower($nome_arquivo_fila) != "true";

            if ($qntd_docs_gerar > 1 || $verificar_nome_arquivo_fila) {
                $zip = new \ZipArchive();
                if ($verificar_nome_arquivo_fila) {
                    $zip_temp = Genericos::encriptarDecriptar('decrypt', $nome_arquivo_fila, Genericos::getChaveCriptografiaZip());
                    $zip_temp = json_decode($zip_temp);

                    if(is_null($zip_temp)) {
                        throw new AppException('Arquivos temporários informados inválidos',292);
                    }

                    if(file_exists($zip_temp[1]))
                        $remessa_temp = $zip_temp[1];

                    if(file_exists($zip_temp[0])) {
                        $zip->open($zip_temp[0]);
                        $zip_temp = $zip_temp[0];
                    } else {
                        $zip->open($zip_temporario, \ZipArchive::CREATE);
                        $zip_temp = $zip_temporario;
                    }
                } else {
                    $zip->open($zip_temporario, \ZipArchive::CREATE);
                }

            }
        }

        try {
            $nao_encontrados = [];
            foreach ($documentos_gerar as $chave => $documento_boleto) {

                $dados_boleto = $this
                    ->setCamposRetornar(['nome', 'vencimento', 'boleto_id'])
                    ->setFalseException(true)
                    ->getBoletoDocumento($documento_boleto);

                if (!is_bool($dados_boleto)) {
                    $dados_boleto = $dados_boleto[0];
                    $documento = json_encode([$documento_boleto]);

                    ob_start();
                    $this->setNomeRemessaTemp($remessa_temp);
                    $this->montarBoleto($documento, $dados_contaCorrente,true);
                    $content = ob_get_clean();
                    $pdf = $this->boletoPHP->getPDFBoleto();
                    $pastas_vencimento = explode('-', $dados_boleto->VENCIMENTO);

                    $pasta_salvar_pdf = $caminho_pasta_pdf . '/' . $pastas_vencimento[0] . '/' . $pastas_vencimento[1];
                    $nome_boleto = $dados_boleto->NOME . ' - ' . $documento_boleto . '.pdf';

                    $pasta_salvar_pdf = $this->engine()->criarPasta($pasta_salvar_pdf,false);
                    $caminho_boleto = $pasta_salvar_pdf . '/' . $nome_boleto;

                    $pdf->writeHTML($content);
                    $pdf->Output($caminho_boleto, 'F');

                    $this->atualizar_bd1_controle_financeiro('pasta_boleto',$caminho_boleto, function ($where) use ($dados_boleto){
                        $where->where('id', '=', $dados_boleto->BOLETO_ID);
                    });

                    if (isset($zip)) $zip->addFile($caminho_boleto, $nome_boleto);
                    ob_clean();
                } else {
                    $nao_encontrados[] = $documento_boleto;
                }
            }

            if ($this->finalizar_zip != false) {
                $zipar = isset($zip) ? $zip : false;
                $salvar_remessa = $this->gerarRemessa($conta_usar,$zipar);

                if(is_array($salvar_remessa)) {
                    $nsu_remessa = $salvar_remessa[0];
                    $salvar_remessa = $salvar_remessa[1];
                }
            }

            if (isset($zip)) $zip->close();

            if ($qntd_docs_gerar > 1 || isset($verificar_nome_arquivo_fila)) {
                if ($this->finalizar_zip != false) {

                    if (!isset($zip_temp)) {
                        if (!file_exists($zip_temporario)) {
                            throw new AppException("Nome do arquivo zip temporário não informado", 291);
                        } else {
                            $zip_temp = $zip_temporario;
                        }
                    }

                    if(file_exists($zip_temp) && isset($nsu_remessa)) {
                        rename($zip_temp, $zip_final);
                        $arquivo_download = $baixar_somenteRemessa ? $salvar_remessa : $zip_final;
                        $array_retorno = ['download_zip' => Genericos::encriptarDecriptar('encrypt', $arquivo_download, Genericos::getChaveCriptografiaZip())];
                        $array_retorno = array_merge($array_retorno, ["nsu" => $nsu_remessa, "boletos_nao_encotrados" => $nao_encontrados]);
                    } else {
                        $code = 299;
                        $msg = 'Zip temporário não encontrado';
                        if(file_exists($zip_temporario) && !isset($nsu_remessa)) {
                            $code = 308;
                            $msg = 'NSU não gerada';
                        } elseif(!file_exists($zip_temporario) && !isset($nsu_remessa)) {
                            $code = 309;
                            $msg = 'Zip temporario não encontrado e nsu não gerada';
                        }

                        throw new AppException('Erro na geração do zip dos boletos: '.$msg, $code);
                    }
                    return $array_retorno;
                }

                $zip_retorno = $zip_temporario;

                if (isset($zip_temp)) {
                    $zip_retorno = $zip_temp;
                }

                $zip_retorno = json_encode([$zip_retorno, $remessa_temp]);
                return ['fila' => Genericos::encriptarDecriptar('encrypt', $zip_retorno, Genericos::getChaveCriptografiaZip()), "boletos_nao_encotrados"=>$nao_encontrados];
            }
            $download_boleto = ['download_boleto'=> Genericos::encriptarDecriptar('encrypt', $caminho_boleto, Genericos::getChaveCriptografiaZip())];
            $download_remessa = ['download_remessa'=> Genericos::encriptarDecriptar('encrypt', $salvar_remessa, Genericos::getChaveCriptografiaZip())];
            $array_retorno = array_merge($download_boleto, $download_remessa);

            if($baixar_somenteRemessa) {
                $array_retorno = $download_remessa;
            }

            $array_retorno = array_merge($array_retorno, ["nsu"=>$nsu_remessa]);

            return $array_retorno;

        } catch (AppException $e) {
            throw new AppException($e->getMessage(), $e->getCode());
        }

    }

    /**
     * Objetivo: Receber os documentos dos boletos que serão impressos e salvar em uma sessão seus dados,
     * pois assim pode-se abrir uma nova guia no browser sem precisar informar as querystrings com os documentos e,
     * desta forma, não esbarramos nas limitações das variáveis de url (var[]=algo&var[]=algo2) que o php pode receber
     * Recebe: Campos da url
     * Retorna: string
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: prepararImpressao
     *
     * @param $campos_url
     * @return string
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function prepararImpressao($documento)
    {
        if($_SESSION) @session_start();
        $_SESSION['dados_boleto'] = json_decode($documento, true);

        return 'Iniciado';
    }

    /**
     * Objetivo: Montar os boletos e exibi-los na tela para impressão
     * Recebe: Campos da url
     * Retorna: Os boletos solicitados montados
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: getExibirBoleto
     *
     * @param $campos_url
     * @return array
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function getExibirBoleto($conta_usar)
    {
        $dados_contaCorrente = $this->empresa->getContaCorrenteEmpresa($conta_usar);
        $dados_contaCorrente = $this->formatarObjetosConta($dados_contaCorrente);
        $empresa = $this->empresa->getEmpresa();
        ob_start();
        try {
            if(isset($_SESSION['dados_boleto'])){
                $documento = json_encode($_SESSION['dados_boleto'][0]);
                unset($_SESSION['dados_boleto']);
            } else {
                throw new AppException('Nenhum boleto foi preparado para impressão anteriormente', 293);
            }
            $this->montarBoleto($documento, $dados_contaCorrente);

            $content = ob_get_clean();

            return $content;
        } catch (\Exception $e) {
            $msg = $e->getMessage();

            if($e->getCode() == 710) {
                $msg = explode(';',$msg);
                $msg = $msg[0];
            }

            $html = '<head><meta charset="utf-8"/> <style>
                body{font-family: Arial,"sans-serif";}
                h3{font-weight: 200;}
                </style></head><h1>ERRO</h1>
                    <h3><strong>Mensagem: </strong> '.$msg .' </h3>
                    <h3><strong>Código: </strong> '.$e->getCode().'</h3>';

            return $html;
        } finally{
            ob_clean();
        }
    }

    /**
     * Objetivo: Recuperar o arquivo de uma remessa
     * Recebe: campos url
     * Retorna: array com um caminho para o arquivo zip contendo a remessa ou o arquivo unitario da remessa
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: getRemessaGerada
     *
     * @param $campos_url
     * @return array
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function getRemessaGerada($remessas)
    {
        if(count($remessas) > 1) {
            $pasta_remessa = $this->getPastaRemessa();
            $zip_lote_remessa = $pasta_remessa . '/lote-remessas_'.date('Y-m-d').time().uniqid().'.zip';
            $zip = new \ZipArchive();
            $zip->open($zip_lote_remessa, \ZipArchive::CREATE);
        }

        foreach ($remessas as $numero_remessa) {
            if(!is_numeric($numero_remessa)) throw new AppException('A remessa de nsu '.$numero_remessa.' não é um valor numérico', 296);

            $caminho_arquivo_bd = $this->setCamposRetornar(['pasta_remessa'])
                ->setFalseException(true)
                ->getBoletoRemessa($numero_remessa);

            $remessa = $caminho_arquivo_bd[0]->PASTA_REMESSA;
            $nome_remessa = basename($remessa);

            if(isset($zip)) $zip->addFile($remessa, $nome_remessa);
        }

        $chave = "arq";
        $retorno = $remessa;

        if(isset($zip)) {
            $zip->close();
            $chave = "zip";
            $retorno = $zip_lote_remessa;
        }

        return [$chave => Genericos::encriptarDecriptar('encrypt', $retorno, Genericos::getChaveCriptografiaZip())];
    }

    /**
     * Objetivo: Ler o arquivo de retorno CNAB e devolver as informações processadas
     * Recebe: arquivo a ler
     * Retorna: array com os dados lidos do arquivo de retorno
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: lerArquivoRetorno
     *
     * @param $arquivo
     * @return array
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function lerArquivoRetorno($arquivo)
    {
        $cnabFactory = new Factory();
        $arquivo = $cnabFactory->createRetorno($arquivo);
        $detalhes = $arquivo->listDetalhes();
        $retorno = [];

        foreach ($detalhes as $detalhe) {
            $dataPagamento = $detalhe->getDataOcorrencia();
            $dataPagamento = $dataPagamento != false ? $dataPagamento->format('d/m/Y') : '';

            $vencimento = $detalhe->getDataVencimento();
            $vencimento = $vencimento != false ? $vencimento->format('d/m/Y') : '';

            $nosso_numero = $detalhe->getNossoNumero();

            $buscarCliente = $this->setCamposRetornar(['nome','data_baixa'])
                            ->setUsarException(false)
                            ->getBoleto($nosso_numero);
            $baixado = false;
            $nome_cliente = 'Boleto não encontrado';

            if(!is_int($buscarCliente)) {
                $baixado = !is_null($buscarCliente[0]->DATA_BAIXA) && strlen($buscarCliente[0]->DATA_BAIXA) != 0 ? true : $baixado;
                $nome_cliente = $buscarCliente[0]->NOME;
            }
            $valorRecebido = $detalhe->getValorRecebido();

            //if($valorRecebido > 0) {
            if($nosso_numero != 0) {
                $retorno[] = [
                    'ValorRecebido' => $valorRecebido,
                    'NomeCliente' => $nome_cliente,
                    'NossoNumero' => $nosso_numero,
                    'DataPagamento' => $dataPagamento,
                    'Vencimento' => $vencimento,
                    'Carteira' => $detalhe->getCarteira(),
                    'ValorTitulo' => $detalhe->getValorTitulo(),
                    'ValorTarifa' => $detalhe->getValorTarifa(),
                    'Codigo' => $detalhe->getCodigo(),
                    'CodigoNome' => $detalhe->getCodigo() == 9 ? 'Baixa s/ pagto' : $detalhe->getCodigoNome(),
                    'ValorMoraMulta' => $detalhe->getValorMoraMulta(),
                    'Baixado' => $baixado,
                ];
            }
            //}
        }

        return $retorno;
    }

    /**
     * @return bool
     */
    public function isEmFila()
    {
        return $this->em_fila;
    }

    /**
     * @param bool $em_fila
     */
    public function setEmFila($em_fila)
    {
        $this->em_fila = $em_fila;
        return $this;
    }

    /**
     * @return bool
     */
    public function isFinalizarZip()
    {
        return $this->finalizar_zip;
    }

    /**
     * @param bool $finalizar_zip
     */
    public function setFinalizarZip($finalizar_zip)
    {
        $this->finalizar_zip = $finalizar_zip;
        return $this;
    }

    /**
     * Objetivo: Setar o nome temporário do arquivo da remessa
     * Recebe: nome
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:42
     * Nome Método: setNomeRemessaTemp
     *
     * @param $nome
     * @autor Nathan Feitoza
     */
    protected function setNomeRemessaTemp($nome)
    {
        $this->nome_remessa_temp = $nome;
    }

    /**
     * @param bool $baixar_somente_remessa
     */
    public function setBaixarSomenteRemessa($baixar_somente_remessa)
    {
        $this->baixar_somente_remessa = $baixar_somente_remessa;
        return $this;
    }
}