<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 14/08/18
 * Time: 14:12
 */

namespace BoletosPHP;

include('html2pdf/html2pdf.class.php');
class BoletosPHP
{
    protected
        $atendidos = ['cef_sigcb','bb','itau','banese','banespa'],
        $banco,
        $arquivo_funcoes,
        $arquivo_layout,
        $pasta_imagens = null,
        // Comum a todos os bancos
        $numero_documento,
        $data_vencimento,
        $data_documento,
        $data_processamento,
        $valor_boleto,
        $sacado,
        $endereco1,
        $endereco2,
        $demonstrativo1,
        $demonstrativo2,
        $demonstrativo3,
        $instrucoes1,
        $instrucoes2,
        $instrucoes3,
        $instrucoes4,
        $quantidade = ' ',
        $valor_unitario = ' ',
        $aceite = 'NAO',
        $especie = 'R$',
        $especie_doc = 'DM',
        $identificacao,
        $cpf_cnpj,
        $endereco,
        $cidade_uf,
        $cedente,
        $agencia,
        $conta,
        $conta_dv,
        $conta_cedente,
        $carteira,
        $codigo_barras,
        $linha_digitavel,
        $agencia_codigo,
        $nosso_numero,
        $codigo_banco_com_dv,
        $codigobanco,
        $nummoeda,
        // Fim Comum a todos

        // Para Caixa (CEF)
        $nosso_numero1,
        $nosso_numero_const1,
        $nosso_numero2,
        $nosso_numero_const2,
        $nosso_numero3,

        // Banco do Brasil (BB)
        $contrato,
        $convenio,
        $formatacao_convenio,
        $formatacao_nosso_numero,

        // Bradesco
        // Com o $nosso_numero
        $conta_cedente_dv,
        $agencia_dv,

        // Itau e Banese usam somente o $nosso numero

        // Banespa
        $codigo_cliente,
        $ponto_venda;

    protected $nao_gerar_index = ['codigobanco','nummoeda'];

    private function getNecessariosGeralBoleto(){
        $necessarios = ['numero_documento','data_vencimento','data_documento','data_processamento','valor_boleto','sacado','endereco1','endereco2','demonstrativo1','demonstrativo2','demonstrativo3','instrucoes1','instrucoes2','instrucoes3','instrucoes4','quantidade','valor_unitario','aceite','especie','especie_doc','identificacao','cpf_cnpj','endereco','cidade_uf','cedente','agencia','conta','conta_dv','conta_cedente','carteira','codigobanco','nummoeda'];
        $permitir_null = ['carteira'];
        $permitir_zero = ['agencia','conta','conta_dv','conta_cedente'];
        foreach ($necessarios as $val) {
            $valor = $this->$val;
            if((is_null($valor) || $valor == false) AND !in_array($val,$permitir_null) AND !in_array($val, $permitir_zero)) {
                throw new \Exception('Parâmetro '.$val.' que é geral para os boletos não informado', 8886);
            }
        }
    }

    protected function getNecessariosBanco() {
        $cef_sigcb = ['nosso_numero1','nosso_numero_const1','nosso_numero2','nosso_numero_const2', 'nosso_numero3'];
        $bb = ['contrato','convenio','formatacao_convenio','formatacao_nosso_numero,'];
        $itau = ['nosso_numero'];
        $banese = ['nosso_numero'];
        $banespa = ['codigo_cliente','ponto_venda'];
        $b = $this->banco;
        foreach($$b as $valores) {
            $verificar = $this->$valores;
            if(is_null($verificar) || $verificar == false) {
                throw new \Exception('Parâmetro '.$valores.' não informado', 8887);
            }
        }
    }

    public function setLayout($banco){
        $this->banco = strtolower($banco);
        if(!in_array($this->banco, $this->atendidos)){
           throw new \Exception('Banco não atendido ou não otimizado ainda',8885);
        }
        $this->arquivo_funcoes = __DIR__.'/Funcoes/funcoes_'.$this->banco.'.php';
        $banco_layout = $this->banco == 'cef_sigcb' ? 'cef' : $this->banco;
        $this->arquivo_layout = __DIR__.'/Layout/layout_'.$banco_layout.'.php';
    }

    public function getBanco(){
        return $this->banco;
    }

    public function getArqFuncoes() {
        return $this->arquivo_funcoes;
    }

    public function getArqLayout() {
        return $this->arquivo_layout;
    }

    public function setPastaImagens($pasta){
        $this->pasta_imagens = $pasta;
    }

    public function getPastaImagens() {
        return $this->pasta_imagens;
    }

    // Dados preenchimento do boleto
    public function setNumeroDocumento($numero_documento){
        $this->numero_documento = $numero_documento;
        return $this;
    }
    public function setDataVencimento($data_vencimento){
        $this->data_vencimento = $data_vencimento;
        return $this;
    }
    public function setDataDocumento($data_documento){
        $this->data_documento = $data_documento;
        return $this;
    }
    public function setDataProcessamento($data_processamento){
        $this->data_processamento = $data_processamento;
        return $this;
    }
    public function setValorBoleto($valor_boleto){
        $this->valor_boleto = $valor_boleto;
        return $this;
    }
    public function setSacado($sacado){
        $this->sacado = $sacado;
        return $this;
    }
    public function setEndereco1($endereco1){
        $this->endereco1 = $endereco1;
        return $this;
    }
    public function setEndereco2($endereco2){
        $this->endereco2 = $endereco2;
        return $this;
    }
    public function setDemonstrativo($demonstrativo1, $demonstrativo2='', $demonstrativo3=' '){
        $this->demonstrativo1 = $demonstrativo1;
        $this->demonstrativo2 = $demonstrativo2;
        $this->demonstrativo3 = $demonstrativo3;
        return $this;
    }
    public function setInstrucoes($instrucoes1,$instrucoes2=' ',$instrucoes3=' ',$instrucoes4=' '){
        $this->instrucoes1 = $instrucoes1;
        $this->instrucoes2 = $instrucoes2;
        $this->instrucoes3 = $instrucoes3;
        $this->instrucoes4 = $instrucoes4;
        return $this;
    }
    public function setQuantidade($quantidade){
        $this->quantidade = $quantidade;
        return $this;
    }
    public function setValorUnitario($valor_unitario){
        $this->valor_unitario = $valor_unitario;
        return $this;
    }
    public function setAceite($aceite){
        $this->aceite = $aceite;
        return $this;
    }
    public function setEspecie($especie){
        $this->especie = $especie;
        return $this;
    }
    public function setEspecieDoc($especie_doc){
        $this->especie_doc = $especie_doc;
        return $this;
    }
    public function setIdentificacao($identificacao){
        $this->identificacao = $identificacao;
        return $this;
    }
    public function setCpfCnpj($cpf_cnpj){
        $this->cpf_cnpj = $cpf_cnpj;
        return $this;
    }
    public function setEndereco($endereco){
        $this->endereco = $endereco;
        return $this;
    }
    public function setCidadeUf($cidade_uf){
        $this->cidade_uf = $cidade_uf;
        return $this;
    }
    public function setCedente($cedente){
        $this->cedente = $cedente;
        return $this;
    }
    public function setAgencia($agencia){
        $this->agencia = $agencia;
        return $this;
    }
    public function setConta($conta){
        $this->conta = $conta;
        return $this;
    }
    public function setContaDv($conta_dv){
        $this->conta_dv = $conta_dv;
        return $this;
    }
    public function setContaCedente($conta_cedente){
        $this->conta_cedente = $conta_cedente;
        return $this;
    }
    public function setCarteira($carteira){
        $this->carteira = $carteira;
        return $this;
    }
    public function setNossoNumero($nosso_numero){
        $this->nosso_numero = $nosso_numero;
        return $this;
    }
    public function setCodigoBanco($codigobanco){
        $this->codigobanco = $codigobanco;
        return $this;
    }
    public function setNumMoeda($nummoeda){
        $this->nummoeda = $nummoeda;
        return $this;
    }

    // Caixa
    public function setNossoNumero1($nosso_numero1){
        $this->nosso_numero1 = $nosso_numero1;
        return $this;
    }
    public function setNossoNumeroConst1($nosso_numero_const1){
        $this->nosso_numero_const1 = $nosso_numero_const1;
        return $this;
    }
    public function setNossoNumero2($nosso_numero2){
        $this->nosso_numero2 = $nosso_numero2;
        return $this;
    }
    public function setNossoNumeroConst2($nosso_numero_const2){
        $this->nosso_numero_const2 = $nosso_numero_const2;
        return $this;
    }
    public function setNossoNumero3($nosso_numero3){
        $this->nosso_numero3 = $nosso_numero3;
        return $this;
    }

    // BB
    public function setContrato($contrato){
        $this->contrato = $contrato;
        return $this;
    }
    public function setConvenio($convenio){
        $this->convenio = $convenio;
        return $this;
    }
    public function setFormatacaoConvenio($formatacao_convenio){
        $this->formatacao_convenio = $formatacao_convenio;
        return $this;
    }
    public function setFormatacaoNossoNumero($formatacao_nosso_numero){
        $this->formatacao_nosso_numero = $formatacao_nosso_numero;
        return $this;
    }

    // Bradesco
    public function setContaCedenteDv($conta_cedente_dv){
        $this->conta_cedente_dv = $conta_cedente_dv;
        return $this;
    }
    public function setAgenciaDv($agencia_dv){
        $this->agencia_dv = $agencia_dv;
        return $this;
    }

    // Banespa
    public function setCodigoCliente($codigo_cliente){
        $this->codigo_cliente = $codigo_cliente;
        return $this;
    }
    public function setPontoVenda($ponto_venda){
        $this->ponto_venda = $ponto_venda;
        return $this;
    }

    // Fim Dados Preenchimento do boleto
    protected function adicionarArquivo($arquivo, $tipo,$comrequire=true,$retirar_head=false){
        if($this->getPastaImagens() == null) {
            throw new \Exception("É preciso informar qual a pasta das imagens");
        }
        $tipo = $tipo == 1 ? 'funções' : 'layout';
        if(!file_exists($arquivo)) {
            throw new \Exception('Erro ao recuperar arquivo de '.$tipo.' para o banco: '.$this->getBanco(), 8544);
        }
        if($comrequire != true) {
            $conteudo = file_get_contents($arquivo);
            $head_add = '<head><meta charset="utf-8"></head>';
            preg_match("/<meta charset=\"utf-8\"/", $conteudo, $verificar);
            $verificar = count($verificar) == 0;
            if($verificar AND $retirar_head == false) {
                $conteudo = $head_add . $conteudo;
                file_put_contents($arquivo, $conteudo);
            } else{
                if(!$verificar AND $retirar_head) {
                    $conteudo = str_replace($head_add,'',$conteudo);
                    file_put_contents($arquivo, $conteudo);
                }
            }
            return $arquivo;
        }
        $GLOBALS['pasta_imagens'] = $this->getPastaImagens();
        return require $arquivo;
    }

    protected function adicionarFuncoes(){
        return $this->adicionarArquivo( $this->getArqFuncoes(),1 );
    }

    public function montarBoleto($retirar_head=false){
        $dados['pasta_imagens'] = $this->getPastaImagens();

        $this->getNecessariosGeralBoleto();
        $this->getNecessariosBanco();
        if(!function_exists('monta_linha_digitavel')) {
            $this->adicionarFuncoes();
        }

        if($this->banco == 'cef_sigcb') {
            $this->codigo_banco_com_dv = geraCodigoBanco($this->codigobanco);
            $fator_vencimento = fator_vencimento($this->data_vencimento);
            //valor tem 10 digitos, sem virgula
            $valor = formata_numero($this->valor_boleto, 10, 0, "valor");
            //agencia é 4 digitos
            $agencia = formata_numero($this->agencia, 4, 0);
            //conta é 5 digitos
            $conta = formata_numero($this->conta, 5, 0);
            //dv da conta
            $conta_dv = formata_numero($this->conta_dv, 1, 0);

            //conta cedente (sem dv) com 6 digitos
            $conta_cedente = formata_numero($this->conta_cedente, 6, 0);
            //dv da conta cedente
            $conta_cedente_dv = digitoVerificador_cedente($conta_cedente);

            //campo livre (sem dv) é 24 digitos
            $campo_livre = $conta_cedente . $conta_cedente_dv . formata_numero($this->nosso_numero1, 3, 0) . formata_numero($this->nosso_numero_const1, 1, 0) . formata_numero($this->nosso_numero2, 3, 0) . formata_numero($this->nosso_numero_const2, 1, 0) . formata_numero($this->nosso_numero3, 9, 0);
            //dv do campo livre
            $dv_campo_livre = digitoVerificador_nossonumero($campo_livre);
            $campo_livre_com_dv = "$campo_livre$dv_campo_livre";

            //nosso número (sem dv) é 17 digitos
            $nnum = formata_numero($this->nosso_numero_const1, 1, 0) . formata_numero($this->nosso_numero_const2, 1, 0) . formata_numero($this->nosso_numero1, 3, 0) . formata_numero($this->nosso_numero2, 3, 0) . formata_numero($this->nosso_numero3, 9, 0);

            //modalidade da carteira
            $mod_carteira = $this->nosso_numero_const1.$this->nosso_numero_const2;

            //Numero gerado para debug
            $nnum2 = formata_numero($this->nosso_numero1, 3, 0) . formata_numero($this->nosso_numero2, 3, 0) . formata_numero($this->nosso_numero3, 9, 0);

            //nosso número completo (com dv) com 18 digitos
            $nossonumero = $nnum . digitoVerificador_nossonumero($nnum);

            // 43 numeros para o calculo do digito verificador do codigo de barras
            $dv = digitoVerificador_barra("$this->codigobanco$this->nummoeda$fator_vencimento$valor$campo_livre_com_dv", 9, 0);
            // Numero para o codigo de barras com 44 digitos
            $linha = "$this->codigobanco$this->nummoeda$dv$fator_vencimento$valor$campo_livre_com_dv";

            $agencia_codigo = $agencia . " / " . $conta_cedente . "-" . $conta_cedente_dv;
        }
        $this->codigo_barras = $linha;
        $this->linha_digitavel = monta_linha_digitavel($linha);
        $this->agencia_codigo = $agencia_codigo;
        $this->nosso_numero = $nossonumero;

        //$this->codigo_banco_com_dv = $codigo_banco_com_dv;

        foreach($this as $chave => $valor) {
            if(!in_array($chave, $this->nao_gerar_index)) {
                $dados[$chave] = $valor;
            }
        }

        $dadosboleto = $dados;
        $inclusao = include $this->adicionarArquivo( $this->getArqLayout(),2, false,$retirar_head);
        return $inclusao;
    }
    public function getPDFBoleto(){
        $html2pdf = new \HTML2PDF('P', 'A4', 'pt', array(0, 0, 0, 0), 'UTF-8');
        /* Abre a tela de impressão */
        //$html2pdf->pdf->IncludeJS("print(true);");

        $html2pdf->pdf->SetDisplayMode('real');
        return $html2pdf;
    }

}