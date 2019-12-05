/*
 * Gerar NF-e
 * Author: Nathan Feitoza
 * Description: Tela de geração de NF-e desenvolvida com HTML, CSS e Jquery
 */

if(tipo_uso == 1) {
    $('#'+$inputs.pdv+', #'+$inputs.turno).removeAttr('required')
}

// Aqui o resultado da função é colocado no campo 'saida'
$("#saida").val(dataAtual);
navegacaoEntreInputsEmUmaMesmaDiv('.cabec_nfe', (ultimo, proxInput) => {
    if(proxInput.hasClass('total_valor_pago')) {
       setTimeout(() => {
           $('.nfe.cod_produto.inp_codigo').first().select().focus();
       }, 250)
    }
})

navegacaoEntreInputsEmUmaMesmaDiv('.dados-fornecedor', (ultimo, proxInput) => {
})

var ligarMoneyQntd = function() {
    $('.'+$inputs.money_qnt+', .'+$inputs.money).addClass($inputs.somente_numero)
        .attr($roles.data_option, "{ponto: false, virgula: true, decs: 100, negativo: false, per_cent: false}");
}

$('body').on('append prepend insertbefore insertafter', function(e, i){
    ligarMoneyQntd();
});

ligarMoneyQntd();

var setores = '', sts = '';

if(cfop_aceitos == 'erro') {
    Mask();
    mostrarMensagemErroSucessoAlerta('Erro ao carregar CFOPs');
}

if(setor != 'erro' && st != 'erro') {
    $.each(setor, function(i,n){
        var set = n.ID+' - '+n.NOME;
        setores += '<option ' + (i == 0 ? 'selected' : '') + ' role-option-select="'+set+'" value="'+n.ID+'">'+set+'</option>';
    })

    $.each(st, function(i,f){
        var set = f.ID+' - '+f.NOME;
        sts += '<option role-option-select="'+set+'" value="'+f.ID+'">'+set+'</option>';
    })

} else {
    Mask();
    mostrarMensagemErroSucessoAlerta('Erro ao carregar setores e st');
}

const atualizarItens = function() {
    const tabela = $('.'+$tabelas.tabela_produtos_man);
    const linhas = tabela.find('tbody tr');

    var ultimoItem = 1;

    linhas.each((i, item) => {
        const roleItem = parseInt(i) + 1;

        if($(item).find(`.${$inputs.inp_codigo}`).val().length > 0) {
            ultimoItem = roleItem;
        }

        $(item).attr($roles.role_item, roleItem)
    })

    tabela.attr($roles.role_ultimo_item, ultimoItem)
}

$('body').on('alterado', `.${$tabelas.tabela_produtos_man} .base_calc_icms`, function() {
    var valorTotalBc = 0;

    $(`.${$tabelas.tabela_produtos_man} .base_calc_icms`).each(function(i, el) {
        el = $(el);
        const tr = el.closest('tr');
        let valorProdutoBc = el.val();
        let valorTotalProduto = tr.find('.total').val();
        let porcentagemIcms = tr.find('.aliquota_icms').val()

        valorProdutoBc = valorProdutoBc.length == 0 ? '0,00' : valorProdutoBc;
        valorProdutoBc = valorMonetarioParaFloat(valorProdutoBc);

        valorTotalProduto = valorTotalProduto.length == 0 ? '0,00' : valorTotalProduto;
        valorTotalProduto = valorMonetarioParaFloat(valorTotalProduto);

        porcentagemIcms = porcentagemIcms.length == 0 ? '0,00' : porcentagemIcms;
        porcentagemIcms = valorMonetarioParaFloat(porcentagemIcms);

        if(porcentagemIcms > 0 && valorTotalProduto > 0) {
            valorTotalBc += parseFloat(valorProdutoBc);
        }
    })

    $('input[name="base_de_calc"]').val(formatarValorParaPadraoBr(valorTotalBc))
})

const atualizarIcmsTotal = () => {
    var valorTotalIcms = 0;

    $(`.${$tabelas.tabela_produtos_man} .total`).each(function(i, el) {
        el = $(el);
        const tr = el.closest('tr');
        let valor = el.val();

        tr.find('.base_calc_icms').val(valor)

        let porcentagemIcms = tr.find('.aliquota_icms').val()

        valor = valor.length == 0 ? '0,00' : valor;
        valor = valorMonetarioParaFloat(valor);

        porcentagemIcms = porcentagemIcms.length == 0 ? '0,00' : porcentagemIcms;
        porcentagemIcms = valorMonetarioParaFloat(porcentagemIcms);

        if(porcentagemIcms > 0 && valor > 0) {
            let valorIcmsProduto = (valor * porcentagemIcms) / 100;

            valorTotalIcms += parseFloat(valorIcmsProduto);
        }
    })

    $('.total_icms').val(formatarValorParaPadraoBr(valorTotalIcms))
}

$('body').on('keyup','.aliquota_icms', function() {
    atualizarIcmsTotal()
})

$('body').on('alterado','.total', function(){
    atualizarIcmsTotal()
});

const recalcularTotal = function() {
    var total_produtos = 0;
    var total_somar = 0;
    var total_descontos = 0;

    $('.tabela_informacoes').each(function(i,e){
        var valor = valorMonetarioParaFloat( $(this).find('.td_input').val() );

        valor = isNaN(valor) ? 0 : valor;

        if(i <= 6) total_somar += valor;
        else if(i == 7) total_descontos = valor;

    })

    setTimeout(function(){
        $('.'+$tabelas.tabela_produtos_man+' tbody > tr').each(function(e,i){
            let total_eu = valorMonetarioParaFloat($(this).find('td:nth-child(8) .td_input').val());
            total_eu = isNaN(total_eu) ? 0 : total_eu;

            total_produtos += total_eu;
        });

        let total_final = ( total_produtos + total_somar ) - total_descontos;
        $('.total_nfe').val( formatarValorParaPadraoBr(total_final) );
        $('.total_produtos').val( formatarValorParaPadraoBr(total_produtos) );

    }, 100);

}

// Função para atualizar o valor total da NF-e
function atualizarTotal(tr, preco, quantidade) {
    var total = parseFloat(preco) * parseFloat(quantidade);
    tr.find("td > .total").val(formatarValorParaPadraoBr( total) );
    recalcularTotal();
}

function modeloLinhaTabelaProdutos(dados) {

    const pr_id = Math.ceil((new Date()).getTime() + (Math.random() * 256))
    const id_cfop_chose = pr_id

    const dadosAdicionar = $(`<tr id="${pr_id}" />`);

    dadosAdicionar.append(`
    <td>
        <input role-id="${pr_id}" class="td_input produto_id ${$inputs.inp_codigo}" name="codigo[]"> 
    </td>`)

    dadosAdicionar.append(`
    <td>
        <input role-id="${pr_id}" id="${$inputs.desc_produto}_${pr_id}" class="td_input nome_produto ${$inputs.desc_produto}" name="${$inputs.desc_produto}[]">  
    </td>`)

    dadosAdicionar.append(`
    <td>
        <select ${$roles.role_execute}="buscarCfopSelect" name="cfop[]" ${$roles.role_regex_texto_exibir}="\\D" ${$roles.opcoes_regex}="g" role-id="${pr_id}" class="td-right td_input no cfop ${$ClassesAvulsas.chosen_ativar}" id="${$inputs.cfop}_${id_cfop_chose}" ${$roles.role_texto_exibir}="4">${options_cfop}</select>  
    </td>`)

    dadosAdicionar.append(`
    <td>
        <select class="td_input unidade ${$ClassesAvulsas.chosen_ativar}" ${$roles.role_regex_texto_exibir}="[^\\w+\\s]\\s+(.*)" id="input_unidade_${id_cfop_chose}" name="unidade[]">${unidadesMedidasOptions}</select>  
    </td>`)

    dadosAdicionar.append(`
    <td>
        <input id="${pr_id}" class="td-right td_input money_qnt quantidade qntd" name="quantidade[]">  
    </td>`)

    dadosAdicionar.append(`
    <td>
        <input id="${pr_id}" class="td-right td_input money_qnt ${tipo_uso == 1 ? 'preco_venda' : 'preco_compra'} price">   
    </td>`)

    dadosAdicionar.append(`
    <td>
        <input class="td-right td_input total total_input" name="total[]" readonly>   
    </td>`)

    dadosAdicionar.append(`
    <td>
        <button class="btn btn-success ${$botao.add_grade}" type="button"><i class="fas fa-plus"></i></button>
    </td>`)

    dadosAdicionar.append(`
    <td class="${$ClassesAvulsas.grade_td}">
        <span data-placement="right" class="td_input" title=""> </span>
    </td>`)

    dadosAdicionar.append(`
    <td>
        <button class="btn btn-success btn-detalhes" type="button"><i class="fas fa-info-circle"></i></button>
        <input type="hidden" class="aliquota_icms" name="icms_prod[]"> 
        <input type="hidden" class="cst_icms" name="st[]">
        <input type="hidden" class="cest" name="cest[]">
        <input type="hidden" required class="setor_id" name="setor_id[]">
        <input type="hidden" class="base_calc_icms" name="base[]"> 
        <input type="hidden" class="valor_ipi" name="ipi[]">
        <input type="hidden" class="ncm" name="ncm[]">
        <input type="hidden" class="preco_compra" name="preco_compra[]">
        <input type="hidden" class="preco_venda" name="preco_venda[]">
    </td>`)

    return [dadosAdicionar];
}

$('body').on('keyup blur alterado', '.price', function () {
    const linha = $(this).closest('tr');
    const inputAutalizar = $(this).hasClass('preco_compra') ? '.preco_compra' : '.preco_venda';
    var valor = valorMonetarioParaFloat($(this).val())

    valor = isNaN(valor) ? 0 : valor;

    linha.find(`${inputAutalizar}:not(.price)`).val(valor)
})

const tabelaPodutos = $('.div-tabela-estoque-mov').gerarTabela({
    cabecalho: ['Produto id','Nome do produto','CFOP', 'Unid.', 'Quantidade','Preço R$','Total R$','<i class="fas fa-th"></i>','Grade','Detalhes'],
    classesTabela: ['table','tabela_produtos_man att_itens'],
    corpo: modeloLinhaTabelaProdutos(),
    removerLinhaClicadaAuto: false,
    opcoesTabelasMultiplas: {
        verticalSo: true
    },
    linhaRemovida: (linha) => {
        setTimeout(function(){ atualizarItens() }, 400);
        recalcularTotal();
    },
    linhaAdicionada: (linha) => {
       linha.find('.cfop').chosen2();
       linha.find('.unidade').chosen2();
       gerarAutocompleteNomeProduto(linha.find("."+$inputs.desc_produto)[0]);

       setTimeout(() => { atualizarItens(); }, 300)
       recalcularTotal();

       navegacaoEntreInputsEmUmaMesmaDiv(linha[0], function(ultimo, proxInput, atual) {

           if(ultimo) {
               const linhaTabela = atual.closest('tr')
               const proxLinhaTabela = linhaTabela.next()

               if(proxLinhaTabela.length != 0) setTimeout( () => { proxLinhaTabela.find(`.${$inputs.inp_codigo}`).select().focus() }, 250 )
               else atual.trigger('blur')
           }
       })

    },
    clickRemocaoLinha: (linha, posicaoLinha, ultimaLinha, tabela) => {

        confirmar('Confirmar remoção do item? Esta operação requer que a nota seja salva no final', function(auth, modal){
            if(auth) {
                tabelaPodutos.removerLinha(linha);

                if(ultimaLinha) setTimeout(() => { gerarLinhaTabelaProdutos() }, 250)
                modal.modal('hide');
            }
        })

    }
})

function iniciarTabelaProdutos() {
    tabelaPodutos.ativarTabelasMultiplas()
}

const permitirCriarNovaLinha = () => {
    const tabela = $(`.${$tabelas.tabela_produtos_man}`)
    const ultimaLinha = tabela.find('tbody tr').last();

    const campoId = ultimaLinha.find(`.${$inputs.inp_codigo}`);
    const campoDescricao = ultimaLinha.find(`.${$inputs.desc_produto}`)

    return campoId.val().length > 0 && campoDescricao.val().length > 0;
}

// Função para gerar novo elemento na tabela dos produtos da NF-e
const gerarLinhaTabelaProdutos = function() {
    if(permitirCriarNovaLinha()) tabelaPodutos.adicionarLinha(modeloLinhaTabelaProdutos());

    return tabelaPodutos.find('tbody tr').last()
}

const modalDetalhesProduto = criarModal({
    classModal: 'modal_detalhes_produto',
    title: 'Detalhes do produto',
    conteudo: `
        <div class="form-group dados-adicionais-produtos">
            <div class="row inputs-mais-proximos">
                
                <div class="col-md-2 ajustar-ncm">
                    <label>NCM</label>
                    <input maxlength="8" class="form-control ncm somente-numero" role-equivale="ncm" type="tel" ${$roles.data_option}="{ponto: false, virgula: false, decs: 0, negativo: false, per_cent: false}"> 
                </div>
                
                <div class="col-md-3">
                    <label>CFOP</label>
                    <select ${$roles.role_execute}="buscarCfopSelect" role-equivale="cfop" class="form-control ajustar-completo no cfop ${$ClassesAvulsas.chosen_ativar}">${options_cfop}</select>
                </div>
                
                <div class="col-md-2">
                    <label>Setor</label>
                    <select role-equivale="setor_id" class="form-control ajustar-completo no setor_produto ${$ClassesAvulsas.chosen_ativar}" id="setor_produto">${setores}</select>
                </div>
                
                <div class="col-md-4" style="max-width: 31%;">
                    <label>CST ICMS</label>
                    <select role-equivale="cst_icms" class="form-control ajustar-completo no cst_icms ${$ClassesAvulsas.chosen_ativar}" id="cst_icms">${sts}</select>
                </div>
                
                <div class="col-md-3 pouco-menor">
                    <label>CEST</label>
                    <input role-equivale="cest" maxlength="8" class="form-control cest somente-numero" ${$roles.data_option}="{ponto: false, virgula: false, decs: 0, negativo: false, per_cent: false}"> 
                </div>
                
                <div class="col-md-2 ajustar-aliquota-icms">
                    <label>Aliq. ICMS %</label>
                    <input role-equivale="aliquota_icms" class="form-control aliquota-icms somente-numero" ${$roles.data_option}="{ponto: false, virgula: true, decs: 5, negativo: false, per_cent: false}"> 
                </div>                
                
            </div>
            
            <div class="row inputs-mais-proximos">
                
                <div class="col-md-2 ajustar-bcicms">
                    <label>Base de Calc. ICMS</label>
                    <input role-equivale="base_calc_icms" class="form-control base-calc-icms somente-numero money_qnt" ${$roles.data_option}="{ponto: false, virgula: true, decs: 10, negativo: false, per_cent: false}"> 
                </div>
                
                <div class="col-md-2">
                    <label>Valor do IPI R$</label>
                    <input role-equivale="valor_ipi" class="form-control valor-ipi somente-numero money_qnt" ${$roles.data_option}="{ponto: false, virgula: true, decs: 10, negativo: false, per_cent: false}"> 
                </div>
                
                <div class="col-md-2 ajustar-unidade-medida">
                    <label>Unid. Med.</label>
                    <select role-equivale="unidade" class="form-control unidade-medida ajustar-completo ${$ClassesAvulsas.chosen_ativar}">${unidadesMedidasOptions}</select> 
                </div>
                
                <div class="col-md-2">
                    <label>Preço de Compra</label>
                    <input role-equivale="preco_compra" class="form-control preco-compra somente-numero money_qnt" ${$roles.data_option}="{ponto: false, virgula: true, decs: 10, negativo: false, per_cent: false}"> 
                </div>
                
                <div class="col-md-2">
                    <label>Preço de Venda</label>
                    <input role-equivale="preco_venda" class="form-control preco-venda somente-numero money_qnt" ${$roles.data_option}="{ponto: false, virgula: true, decs: 10, negativo: false, per_cent: false}"> 
                </div>
                
                <div class="col-md-2 ajustar-lucro-bruto">
                    <label>Lucro Bruto</label>
                    <p>R$ <lucro-bruto>0,00</lucro-bruto> <porcentagem-lucro>0</porcentagem-lucro>%</p> 
                </div>
                
            </div>
            
        </div>
    `,
    btns: ['Salvar'],
    focusAuto: false,
    enterFocus: 2,
    isLarge: true,
    botoesRodapeNaoFecham: true,
    clickBtn: (a, b) => {
        const linhaSelecionadaAlterar = $(`.${$tabelas.tabela_produtos_man} .detalhando`)
        const inputsModalUsar = $('.dados-adicionais-produtos').find('input:not(:disabled):not([readonly]):visible, select')

        inputsModalUsar.each((i, item) => {
            const campo = $(item)
            const equivaleA = campo.attr('role-equivale')
            const valorCampoEquivalente = linhaSelecionadaAlterar.find(`.${equivaleA}`);

            valorCampoEquivalente.val(campo.val()).trigger('change').trigger('chosen:updated').trigger('esconder_o_dropdown')

            if(!valorCampoEquivalente.hasClass('price') && valorCampoEquivalente.hasClass('preco_compra') && valorCampoEquivalente.hasClass('preco_venda')) {
                valorCampoEquivalente.trigger('blur')
            }
        })

        modalDetalhesProduto.fecharModal();
    },
    criacaoCompleta: (a, b) => {
        $('.dados-adicionais-produtos select').chosen2();

        navegacaoEntreInputsEmUmaMesmaDiv('.dados-adicionais-produtos', function(ultimo, proxInput) {
            if(ultimo) {
                setTimeout(() => {
                    modalDetalhesProduto.elementoModal.find('.btn-action-modal').focus()
                }, 250)
            }

        })
    },
    Close: () => {
        $('.animacao-background').removeClass('animacao-background')
    },
    Open: () => {

        const linhaSelecionada = $(`.${$tabelas.tabela_produtos_man} .detalhando`)
        const inputsModal = $('.dados-adicionais-produtos').find('input:not(:disabled):not([readonly]):visible, select')

        inputsModal.each((i, item) => {
            const campo = $(item)
            const equivaleA = campo.attr('role-equivale')
            const valorCampoEquivalente = linhaSelecionada.find(`.${equivaleA}`);

            campo.val(valorCampoEquivalente.val()).trigger('blur').trigger('change').trigger('chosen:updated').trigger('esconder_o_dropdown')
        })

        setTimeout(() => {
            modalDetalhesProduto.elementoModal.find('input:not(:disabled):not([readonly]):visible').first().select().focus()
        }, 600)
    }
});

$('body').on('keyup blur alterado', '.preco-compra, .preco-venda', function() {
    const elementoValorLucro = $('lucro-bruto')
    const elementoPorcentagemLucro = $('porcentagem-lucro')

    const valorPrecoCompra = valorMonetarioParaFloat($('.preco-compra').val())
    const valorPrecoVenda = valorMonetarioParaFloat($('.preco-venda').val())

    const lucroBruto = valorPrecoVenda - valorPrecoCompra;
    const porcentagemLucroBruto = parseFloat((lucroBruto * 100) / valorPrecoCompra).toFixed(2)

    elementoValorLucro.text(formatarValorParaPadraoBr(lucroBruto))
    elementoPorcentagemLucro.text(formatarValorParaPadraoBr(porcentagemLucroBruto))

})

const tabelaInformacoes = $('.div-tabela-informacoes').gerarTabela({
    cabecalho: ['Total IPI R$','Despesas R$','Total Frete R$','Base de Calc. ST','ICMS ST R$','Base de Calc.','ICMS R$','Desconto R$','Total Produtos R$','Total NFe R$'],
    classesTabela: ['table','table-striped tabela-informacoes'],
    corpo: [
        [
            '<input class="td-right td_input money total_ipi" name="total_ipi" value="0,00">',
            '<input class="td-right td_input money total_outras_despesas" name="out_despesas" value="0,00">',
            '<input class="td-right td_input money total_frete" name="valor_frete" value="0,00">',
            '<input class="td-right td_input money base_calc_icms_st" disabled name="base_de_calc_subst" value="0,00">',
            '<input class="td-right td_input money total_icms_st" disabled name="icms_subst" value="0,00">',
            '<input class="td-right td_input money base_calc_icms" disabled name="base_de_calc" value="0,00">',
            '<input class="td-right td_input money total_icms" disabled name="icms" value="0,00">',
            '<input class="td-right td_input money desconto_total total_desconto" name="desconto" value="0,00">',
            '<input disabled class="td-right td_input total_produtos" name="total_produtos" value="0,00">',
            '<input disabled class="td-right td_input total_nfe" name="total_nfe" value="0,00">'
        ]
    ],
    usarRemocaoLinha: false,
    linhaAdicionada: (linha) => {
        navegacaoEntreInputsEmUmaMesmaDiv(linha[0])
    }
})

$('body').on('click', '.btn-detalhes', function() {
    const linha = $(this).closest('tr');
    const tbody = linha.closest('tbody');

    tbody.find('tr').removeClass('detalhando')
    linha.addClass('detalhando')

    modalDetalhesProduto.abrirModal()
})

$('body').on('blur', '.qntd, .price', function() {
    var valor = $(this).val(),
        valor_float = valorMonetarioParaFloat(valor),
        tr = $(this).closest('td').closest('tr'),
        codigo_prod = tr.find("."+$inputs.inp_codigo).val(),
        nome_prod = tr.find("."+$inputs.desc_produto).val();

    if(valor_float == 0 || isNaN(valor_float)) {
        if(codigo_prod.length > 0) {
            mostrarMensagemErroSucessoAlerta('Produto '+nome_prod+' com total zerado, verifique a quantidade e preço antes de continuar.', this);
        }

    } else {
        if($(this).hasClass('qntd')) {
            const linhaInput = $(this).closest('tr');
            const abrirAutomaticamente = linhaInput.attr($roles.role_obrig_grade) != -1;
            const precoProduto = valorMonetarioParaFloat(linhaInput.find('.price').val());

            if(precoProduto > 0 && abrirAutomaticamente) {
                const botaoAbrirGrade = linhaInput.find('.add_grade');
                botaoAbrirGrade.click();
            }
        }
    }

})

"use strict";
var resetFormNota = function() {
    var $form = $( '.box' ),
        $input     = $form.find( 'input[type="file"]' ),
        $div_arqs  = $form.find( '.arquivos_a_submeter > ol' );

    $form.removeClass("is-error").removeClass('is-uploading');
    $div_arqs.html('');
    $input.val('');
}

// Inicia o Jquery
$(function() {

    navegacaoEntreInputsEmUmaMesmaDiv('#resumo-nota', function(ultimo, input) {
        const modelo_doc = $('#modelo_doc').val();

        if(input.hasClass('chave_nfe') && modelo_doc == '99') {
            /*setTimeout(() => {
                $('#nome_cliente_destin').select().focus()
            }, 250)*/
        }

        if(input.hasClass('total_valor_pago')) {
            setTimeout(function(){
                $('.'+$inputs.inp_codigo + ':not(:disabled)').first().select().focus()
            }, 250)
        }
    })

    setTimeout(function(){
        $("#"+$inputs.nome_cliente_destin).focus();
    }, 200)

    const options_datePicker = {
        changeMonth: true,
        changeYear: true
    };

    const dataSaida = $('.'+$inputs._saida).datepicker(options_datePicker);

    dataSaida.datepicker('option', "showOn","button");
    dataSaida.datepicker('option', "buttonText", '<i class="fas fa-calendar"></i>');

    var ativarLimparDadosXML = function(ativar) {
        $('body').removeClass('usando-chave-nfe');
        //inputar = $('.Inputar')
        var tabela_info = $('.'+$tabelas.tabela_informacoes),
            div1 = $('#form_nfe > div.row.float-right > div'),
            submit_btn = $('#form_nfe').find('button[type=submit]');

        if(ativar == undefined || ativar) {
            //inputar.hide().next().hide();
            tabela_info.hide();
            div1.addClass('ativo');
            submit_btn.attr('type','button').addClass($botao.enviar_produtos_xml)
        } else {
            //inputar.show().next().show();
            tabela_info.show();
            div1.removeClass('ativo');
            $('.'+$botao.enviar_produtos_xml).attr('type','submit').removeClass($botao.enviar_produtos_xml);
            $('.'+$divs.cabec_nfe+',.'+$divs.div_tabela_nfe+',.'+$divs.rodape_nfe).html('');
        }
    }

    var modal_import_xml = criarModal({
        classModal: $modais.modal_import_xml,
        title: 'Importar EstoqueMov/XML',
        conteudo: '<form class="box"> <div class="box__input"> <svg class="box__icon" xmlns="http://www.w3.org/2000/svg" width="50" height="43" viewBox="0 0 50 43"><path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z"/></svg> <input type="file" name="files" id="file" class="box_file" accept="text/xml" data-multiple-caption="{count}files selected"/> <div class="col col-offset-4" style="text-align: center;"> <label for="file" class="file_label"><strong>Escolha o XMLs</strong><span class="box__dragndrop"> ou arraste e solte-o aqui</span>.</label> </div><div class="col-md-12"> <div class="arquivos_a_submeter"> <ol> </ol> </div></div></div><div class="box__uploading"> <svg width="90px" height="90px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-rolling" style="background: none;"> <circle cx="50" cy="50" fill="none" ng-attr-stroke="{{config.color}}" ng-attr-stroke-width="{{config.width}}" ng-attr-r="{{config.radius}}" ng-attr-stroke-dasharray="{{config.dasharray}}" stroke="#92b0b3" stroke-width="3" r="30" stroke-dasharray="141.37166941154067 49.12388980384689" transform="rotate(49.0909 50 50)"> <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1.1s" begin="0s" repeatCount="indefinite"></animateTransform> </circle> </svg> <br>Recebendo&hellip; </div><div class="box__success"> <i class="fa fa-check-circle icone_okay"></i> <br>Concluído!</div><div class="box__fornec"> <i class="fa fa-times-circle icone_okay error"></i> <br><p>O fornecedor precisa estar cadastrado. <br>Para continuar cadastre este fornecedor!<p> </div><div class="box__error">Erro! <div class="show_erro"></div><span></span> <a style="font-size: 3rem;" href="#" class="box__restart" role="button">Tente novamente!</a></div></form>',
        btns: ['Cancelar','OK'],
        btn_close: 0,
        clickBtn: function(a,b){
            b = parseInt(b);
            if(b == 2) $( '.box' ).trigger('submit');
        },
        Close: function(){
            resetFormNota()
        },
        BtnAbrirModal: "."+$botao.importar_xml
    })

    /* Upload XML */

    const montarDetalhesNfe = function (dados_nota) {
        $('#importacao-xml-tab').click()
        const load = Load('Carregando...')

        const nota_fiscal = dados_nota.nota_fiscal == undefined ? 0 : dados_nota.nota_fiscal;
        const chave_nfe = dados_nota.chave_nfe == undefined ? 0 : dados_nota.chave_nfe;
        const data_entrada = dados_nota.data_entrada == undefined ? 0 : dados_nota.data_entrada;
        const data_emissao = dados_nota.data_emissao == undefined ? 0 : dados_nota.data_emissao;
        const setor = dados_nota.setor == undefined ? 0 : dados_nota.setor;
        const cfops = dados_nota.cfops == undefined ? 0 : dados_nota.cfops;
        const pagto = dados_nota.pagto == undefined ? 0 : dados_nota.pagto;
        const frete = dados_nota.frete == undefined ? 0 : dados_nota.frete;
        const mva = dados_nota.mva == undefined ? 0 : dados_nota.mva;
        const lucro = dados_nota.lucro == undefined ? 0 : dados_nota.lucro;
        const frete_total = dados_nota.frete_total == undefined ? 0 : dados_nota.frete_total;
        const desconto_total = dados_nota.desconto_total == undefined ? 0 : dados_nota.desconto_total;
        const ipi_total = dados_nota.ipi_total == undefined ? 0 : dados_nota.ipi_total;
        const bc_icms_total = dados_nota.bc_icms_total == undefined ? 0 : dados_nota.bc_icms_total;
        const icms_total = dados_nota.icms_total == undefined ? 0 : dados_nota.icms_total;
        const bc_icms_sub_total = dados_nota.bc_icms_sub_total == undefined ? 0 : dados_nota.bc_icms_sub_total;
        const icms_sub_total = dados_nota.icms_sub_total == undefined ? 0 : dados_nota.icms_sub_total;
        const isentos_total = dados_nota.isentos_total == undefined ? 0 : dados_nota.isentos_total;
        const outros_total = dados_nota.outros_total == undefined ? 0 : dados_nota.outros_total;
        const produtos_total = dados_nota.produtos_total == undefined ? 0 : dados_nota.produtos_total;
        const total_total = dados_nota.total_total == undefined ? 0 : dados_nota.total_total;
        const produtos_todos = dados_nota.produtos_todos == undefined ? 0 : dados_nota.produtos_todos;
        const dados_fornecedor = dados_nota.dados_fornecedor == undefined ? 0 : dados_nota.dados_fornecedor;
        const modelo = dados_nota.modelo == undefined ? 0 : dados_nota.modelo;
        const autorizacao = dados_nota.autorizacao == undefined ? 0 : dados_nota.autorizacao;
        const serie = dados_nota.serie == undefined ? 0 : dados_nota.serie;
        const totais_nota = dados_nota.totais_nota == undefined ? 0 : dados_nota.totais_nota;
        const tipo_frete = dados_nota.tipo_frete == undefined ? 0 : dados_nota.tipo_frete;
        const acrescimo_total = dados_nota.acrescimo_total == undefined ? 0 : dados_nota.acrescimo_total;
        const usuario = dados_nota.usuario == undefined ? 0 : dados_nota.usuario;
        const produtos_cadastrados = dados_nota.produtos_cadastrados == undefined ? null : dados_nota.produtos_cadastrados;

        const fornecedor_informacoes = dados_fornecedor.id+" - "+dados_fornecedor.nome;
        const cnpj_fornecedor = dados_fornecedor.cnpj_cpf;

        var inputs_totais_notas = '';

        for(var total_nota in totais_nota) {
            inputs_totais_notas += '<input type="hidden" name="'+total_nota+'" value="'+totais_nota[total_nota]+'">';
        }

        if(typeof frete == "object") {
            let frete_string = "";
        }

        //Aqui será feito um laço para preencher os produtos
        var quant_produtos = (produtos_todos.length != undefined) ? produtos_todos.length : 1;
        var dados_produtos = [];

        // Para recuperar os dados do iframe: $("#your_iframe_id").contents().find("body");
        var BuscarCodigoDescriSistema = function(codigo, cean){
            if(cean != undefined) cean = cean.length == 0 ? 0 : cean;

            if(produtos_cadastrados != null) {
                for(var i in produtos_cadastrados) {
                    var item = produtos_cadastrados[i];
                    if(codigo == item.cProd || cean == item.cEAN) {
                        return item;
                    }
                }
            }

            return [];
        }

        for(var i in produtos_todos) {
            const dados_use = (produtos_todos.length != undefined) ? produtos_todos[i] : produtos_todos;

            var attributes = dados_use.attributes;
            var imposto = dados_use.imposto;
            var prod = dados_use.prod;

            // Estas informações virão da base, mas por enquanto utilizarei as da nota
            var cEAN = (prod.cEAN != undefined && (prod.cEAN.length != 0 && prod.cEAN.length != undefined)) ? prod.cEAN : "";
            var prod_cadas = BuscarCodigoDescriSistema(prod.cProd, cEAN);
            var codigo = typeof prod_cadas.id != "undefined" ? prod_cadas.id : ''; // Aqui vai o código cadastrado na base
            var descri_sis = typeof prod_cadas.descricao != "undefined" ? prod_cadas.descricao : prod.xProd; // Descrição que tá na base, por enquanto fica a da nota
            var Unid_2 = typeof prod_cadas.unidade != "undefined" ? prod_cadas.unidade : prod.uCom;
            var Preco_Venda = prod.vUnCom;
            var Quant_Est = prod.qCom;
            var CFOP = prod.CFOP;//prod.CFOP;
            var preco_anterior = typeof prod_cadas.preco_compra != "undefined" ? prod_cadas.preco_compra : ''; // Por enquanto será vazio
            var usar_grade = typeof prod_cadas.grade != "undefined" ? (parseInt(prod_cadas.grade) == 0 ? -1 : 1) : -1;
            var desabilitar_botao_grade = usar_grade == -1 ? 'disabled' : '';
            var grade_role = '';
            var nome_grade = '';

            if(typeof prod_cadas.estoque != "undefined") {
                var estoque = prod_cadas.estoque;
                if(estoque != null) {
                    if(typeof estoque.PRODUTO_GRADE_ID != "undefined") {
                        if(estoque.PRODUTO_GRADE_ID != null) {
                            grade_role =  $roles.role_grade+'="'+estoque.PRODUTO_GRADE_ID+'"';
                            nome_grade = typeof estoque.TAMANHO != "undefined" && typeof estoque.COR != "undefined" ? formatarNomeGrade(estoque.PRODUTO_GRADE_ID,estoque.TAMANHO,estoque.COR) : ''
                        }
                    }
                }
            }

            var usar_padding = (cEAN != "") ? "" : "padding: 12.5px 0px;";
            var desconto_prod = (prod.vDesc != undefined) ? prod.vDesc : 0.00;
            var vFrete = (prod.vFrete != undefined) ? prod.vFrete : 0;
            var vSeg = (prod.vSeg != undefined) ? prod.vSeg : 0;
            var vOutro = (prod.vOutro != undefined) ? prod.vOutro : 0;

            // Dados dos impostos
            var cofins_cst, cofins_pCofins, cofins_vBC, cofins_vCofins;

            var icms_cst, icms_modBC, icms_orig,
                icms_pICMS, icms_vBC, icms_vICMS, icms_vST;

            var ipi_cst = 0, ipi_cEnq, ipi_vIPI = 0;

            var pis_cst, pis_pPis, pis_vBC, pis_vPIS;

            for(var dados_icms in imposto.ICMS) {
                var icms_tratar = imposto.ICMS[dados_icms],
                    icms_pICMS = (icms_tratar.pICMS != undefined) ? icms_tratar.pICMS : 0.00,
                    icms_cst = (icms_tratar.CST != undefined) ? icms_tratar.CST : 0,
                    icms_vBC = (icms_tratar.vBC != undefined) ? icms_tratar.vBC : 0,
                    icms_vST = (icms_tratar.vST != undefined) ? icms_tratar.vST : 0,
                    icms_orig = (icms_tratar.orig != undefined) ? icms_tratar.orig : 0,
                    icms_modBC = (icms_tratar.modBC != undefined) ? icms_tratar.modBC : 0,
                    icms_pRedBC = (icms_tratar.pRedBC != undefined) ? icms_tratar.pRedBC : 0,
                    icms_vICMS = (icms_tratar.vICMS != undefined) ? icms_tratar.vICMS : 0,
                    icms_vBCSTRet = (icms_tratar.vBCSTRet != undefined) ? icms_tratar.vBCSTRet : 0,
                    icms_vICMSSTRet = (icms_tratar.vICMSSTRet != undefined) ? icms_tratar.vICMSSTRet : 0;
            }

            for(var dados_ipi in imposto.IPI) {
                var ipi_tratar = imposto.IPI[dados_ipi];
                ipi_vIPI = (ipi_tratar.vIPI != undefined) ? ipi_tratar.vIPI : 0.00;
                ipi_cst = (ipi_tratar.CST != undefined) ? ipi_tratar.CST : 0;
            }

            for(var dados_pis in imposto.PIS) {
                var pis_tratar = imposto.PIS[dados_pis];
                pis_vPIS = (pis_tratar.vPIS != undefined) ? pis_tratar.vPIS : 0.00;
            }

            for(var dados_cofins in imposto.COFINS) {
                var cofins_tratar = imposto.COFINS[dados_cofins];
                var cofins_vCofins = (cofins_tratar.vCofins != undefined) ? cofins_tratar.vCofins : 0.00;
                var cofins_CST = (cofins_tratar.CST != undefined) ? cofins_tratar.CST : 0;
            }

            var id_parent = (i - 1 >= 0) ? i - 1 : 0;
            var ultimo_input = ((quant_produtos - 1) == i) ? 1 : 0;
            var cod_prodNFE_exibir = $.isNumeric(prod.cProd) ? parseInt(prod.cProd) : prod.cProd;
            var id_cfop_chosen = Math.ceil((Math.random() * 15) * (new Date()).getTime());
            var id_cfop = 'cfop_sis_'+id_cfop_chosen;
            var div_select_temp = $('<div>');
            div_select_temp.html('<select role-value="'+CFOP+'" '+$roles.role_execute+'="buscarCfopSelect" name="cfop_compra[]" class="td_input '+$inputs.cfop+' nfe td-right '+$ClassesAvulsas.chosen_ativar+'" id="'+id_cfop+'" '+$roles.role_texto_exibir+'="4">'+options_cfop+'</select>');

            div_select_temp.val(CFOP);

            var select_cfop = div_select_temp.html();

            const idParaInputs = Math.ceil( (Math.random() * 256) + (new Date()).getTime())
            const idSelectUnidade2 = 'unidade_2_' + idParaInputs;
            const idDescricaoProduto = 'descricao2_' + idParaInputs;

            const linhaTabela = $('<tr '+$roles.role_grade+'="' + (usar_grade == 1 ? 1 : 2) + '" '+$roles.role_obrig_grade+'="'+usar_grade+'" id="tr_produtos_'+i+'"/>');

            linhaTabela.append('<td><input autocomplete="off" autocapitalize="none" tabindex="1" role-id="'+i+'" type="text" name="codigo_produto[]" class="td_input nfe td-right cod_produto '+$inputs.inp_codigo+'" '+$roles.role_val+'="'+codigo+'" value="'+codigo+'"></td>');
            linhaTabela.append('<td '+$roles.role_id+'="'+prod.cProd+'">'+cod_prodNFE_exibir+'</td>');
            linhaTabela.append('<td><input id="'+ idDescricaoProduto + '" role-ultimo="'+ultimo_input+'" tabindex="5" type="text" name="descricao_sis[]" class="td_input nfe td-left '+$inputs.desc_produto+'" value="'+descri_sis+'"></td>');
            linhaTabela.append('<td>'+prod.NCM+'<input type="hidden" name="NCM[]" class="somente-numero not-blur" data-option="{ponto: false, virgula: false, decs: 100, negativo: false, per_cent: false}" value="'+prod.NCM+'"></td>');
            linhaTabela.append('<td class="nfe semtext">'+select_cfop+'</td>').find('select').val(CFOP)
            linhaTabela.append('<td>'+prod.uCom+'</td>');
            linhaTabela.append('<td class="nfe semtext"><select '+$roles.role_texto_exibir+'="4" id="' + idSelectUnidade2 + '" class="td_input unidade_2 '+$ClassesAvulsas.chosen_ativar+'" name="unidade[]" >'+unidadesMedidasOptions+'</select></td>').find('select').val(Unid_2);
            linhaTabela.append('<td>'+formatarNumeroCompleto(prod.qCom)+'<input type="hidden" name="qCom[]" value="'+prod.qCom+'"></td>');
            linhaTabela.append('<td><input tabindex="3" type="tel" data-option="{ponto: false, virgula: true, decs: 100, negativo: false, per_cent: false}" name="quant_estoque[]" id="estoque_quant_0" class="td_input nfe td-right qntd qntd_estoque money_qnt somente-numero not-blur" value="'+formatarNumeroCompleto(Quant_Est)+'"></td>');
            linhaTabela.append('<td>'+formatarNumeroCompleto(prod.vUnCom)+'<input type="hidden" name="valor_und[]" value="'+prod.vUnCom+'"></td>');
            linhaTabela.append('<td>'+formatarNumeroCompleto(prod.vProd)+'</td>');
            linhaTabela.append('<td>'+attributes.nItem+'</td>');
            linhaTabela.append('<td><input tabindex="4" type="text" name="cst_sis[]" class="td_input nfe td-right" value="'+icms_cst+'"></td>');
            linhaTabela.append('<td><select '+$roles.role_option_numero+'="1" '+$roles.role_max+'="1" class="td_input nfe td-right setor_select" name="setor[]" id="setor">'+setor+'</select>');
            linhaTabela.append('<td style="padding: 0;"><button style="margin-left: 6px;" class="btn btn-success '+$botao.add_grade+'" type="button"><i class="fas fa-plus"></i></button></td>');
            linhaTabela.append('<td class="grade_td" '+grade_role+'><span data-placement="right" title="'+nome_grade+'">'+nome_grade+'</span></td>');
            linhaTabela.append('<td style="'+usar_padding+'">'+cEAN+'<input type="hidden" name="cEAN[]" value="'+cEAN+'"></td>');
            linhaTabela.append('<td title="'+prod.xProd+'">'+prod.xProd+'</td>');
            linhaTabela.append('<td>'+formatarNumeroCompleto(icms_pICMS)+'<input type="hidden" name="icms_pICMS[]" value="'+icms_pICMS+'"></td>');
            linhaTabela.append('<td>'+formatarNumeroCompleto(ipi_vIPI)+'<input type="hidden" name="ipi_vIPI[]" value="'+ipi_vIPI+'"></td>');
            linhaTabela.append('<td>'+formatarNumeroCompleto(icms_vBC)+'<input type="hidden" name="icms_vBC[]" value="'+icms_vBC+'"></td>');
            linhaTabela.append('<td>'+formatarNumeroCompleto(icms_vST)+'<input type="hidden" name="icms_vST[]" value="'+icms_vST+'">'+'<input type="hidden" name="icms_CST[]" value="'+icms_cst+'">'+
                '<input type="hidden" name="icms_vBC[]" value="'+icms_vBC+'">'+
                '<input type="hidden" name="icms_pICMS[]" value="'+icms_pICMS+'">'+
                '<input type="hidden" name="icms_vICMS[]" value="'+icms_vICMS+'">'+
                '<input type="hidden" name="icms_vBCSTRet[]" value="'+icms_vBCSTRet+'">'+
                '<input type="hidden" name="icms_vICMSSTRet[]" value="'+icms_vICMSSTRet+'">'+
                '<input type="hidden" name="ipi_CST[]" value="'+ipi_cst+'">'+
                '<input type="hidden" name="cofins_vCofins[]" value="'+cofins_vCofins+'">'+
                '<input type="hidden" name="cofins_CST[]" value="'+cofins_CST+'">'+
                '<input type="hidden" name="vFrete[]" value="'+vFrete+'">'+
                '<input type="hidden" name="vSeg[]" value="'+vSeg+'">'+
                '<input type="hidden" name="vOutro[]" value="'+vOutro+'">'+
                '</td>');

            linhaTabela.append('<td>'+formatarNumeroCompleto(desconto_prod)+'<input type="hidden" name="desconto_prod[]" value="'+desconto_prod+'"></td>');
            linhaTabela.append('<td>'+formatarNumeroCompleto(preco_anterior)+'</td>');

            gerarAutocompleteNomeProduto(linhaTabela.find(`#${idDescricaoProduto}`)[0])

            dados_produtos.push(linhaTabela);
        }

        var cabecalho = `<div class="form-group inputs-entrada-envio">
               <div class="row">
               <div class="col-md-2 col-3">
               <label for="chave_nfe">Chave NFe</label>
               <input maxlength="44" data-option="{ponto: false, virgula: false, decs: 100, negativo: false, per_cent: false}" class="form-control size-13 somente-numero not-blur" type="text" name="chave_nfe" id="chave_nfe" value="${chave_nfe}"/>
               </div>

               <div class="col-md-2 col-13">
               <label for="data_entrada">Data de Entrada</label>
               <input class="form-control " type="text" name="data_entrada" id="data_entrada" value="${data_entrada}"/>
               </div>

               <div class="col-md-2 col-13">
               <label for="data_emissao">Data de Emissão</label>
               <input class="form-control " type="text" name="data_emissao" id="data_emissao" value="${data_emissao}"/>
               </div>

               <div class="col-md-1 col-9">
               <label for="frete">Tipo do Frete</label>
               <select class="form-control combobox-bs no" name="frete">
               ${frete}
               </select>
               </div>

               <div class="col-md-2 col-92 ${$divs.div_pagto_xml}"></div>
               <div class="col-md-2 col-91"></div>

               </div>

               <div class="info_nota">
               <div class="row">
               <div class="col col-md-2">
               <span><strong>Nota Fiscal: </strong> <nnf>${nota_fiscal}</nnf></span>
               </div>

               <div class="col-md-6">
               <span><strong>Fornecedor: </strong> ${fornecedor_informacoes}</span>
               </div>

               <div class="col-md-4">
               <span><strong>CNPJ: </strong> ${cnpj_fornecedor}</span>
               </div>
               </div>
               </div>

               <div class="dados_complementares_nota">
               <input type="hidden" name="nNf" value="${nota_fiscal}">
               <input type="hidden" name="id_fornecedor" value="${dados_fornecedor.id}">
               <input type="hidden" name="modelo" value="${modelo}">
               <input type="hidden" name="autorizacao" value="${autorizacao}">
               <input type="hidden" name="serie" value="${serie}">
               <input type="hidden" name="tipo_frete" value="${tipo_frete}">
               <input type="hidden" name="acrescimo_total" value="${acrescimo_total}">
               <input type="hidden" name="usuario" value="${usuario}">
               ${inputs_totais_notas}
               </div>`;

        var rodape_nota = `<!-- Detalhes Totais Nota -->
               <table class="table table-bordered table-nfe">
               <thead>
               <tr style="font-size: 12px;">
               <th class="td-right">Frete R$</th>
               <th class="td-right">Desconto R$</th>
               <th class="td-right">IPI R$</th>
               <th class="td-right">B.C. ICMS R$</th>
               <th class="td-right">ICMS R$</th>
               <th class="td-right">B.C ICMS ST</th>
               <th class="td-right">ICMS ST R$</th>
               <th class="td-right">Isentos R$</th>
               <th class="td-right">Outros R$</th>
               <th class="td-right">Produtos R$</th>
               <th class="td-right">Total R$</th>
               </tr>
               </thead>
               <tbody class="tbody_entradas">
               <tr id="tr_rodape_nfe">
               <td class="td-right">${formatarNumeroCompleto(frete_total)}<input type="hidden" name="frete_total" value="${frete_total}"></td>
               <td class="td-right">${formatarNumeroCompleto(desconto_total)}<input type="hidden" name="desconto_total" value="${desconto_total}"></td>
               <td class="td-right">${formatarNumeroCompleto(ipi_total)}<input type="hidden" name="ipi_total" value="${ipi_total}"></td>
               <td class="td-right">${formatarNumeroCompleto(bc_icms_total)}<input type="hidden" name="bc_icms_total" value="${bc_icms_total}"></td>
               <td class="td-right">${formatarNumeroCompleto(icms_total)}<input type="hidden" name="icms_total" value="${icms_total}"></td>
               <td class="td-right">${formatarNumeroCompleto(bc_icms_sub_total)}<input type="hidden" name="bc_icms_sub_total" value="${bc_icms_sub_total}"></td>
               <td class="td-right">${formatarNumeroCompleto(icms_sub_total)}<input type="hidden" name="icms_sub_total" value="${icms_sub_total}"></td>
               <td class="td-right">${formatarNumeroCompleto(isentos_total)}<input type="hidden" name="isentos_total" value="${isentos_total}"></td>
               <td class="td-right">${formatarNumeroCompleto(outros_total)}<input type="hidden" name="outros_total" value="${outros_total}"></td>
               <td class="td-right">${formatarNumeroCompleto(produtos_total)}<input readonly type="hidden" name="produtos_total" value="${produtos_total}"></td>
               <td class="td-right">${formatarNumeroCompleto(total_total)}<input readonly type="hidden" name="total_total" value="${total_total}"></td>
               </tr>
               </tbody>

               </table>`;

        $(".cabec_nfe").html(cabecalho);
        $(".rodape_nfe").html(rodape_nota);
        $(".div_botoes_nfe").addClass("um");
        $(".btn_salvar_produtos").removeAttr("disabled");

        $('.'+$divs.div_pagto_xml).html($('.'+$inputs.forma_pagto).closest('div').html())
        $('.'+$divs.div_pagto_xml).next().html($('.'+$inputs.total_valor_pago).closest('div').html())
        setTimeout(function(){
            $('.'+$divs.div_pagto_xml).find('.'+$inputs.forma_pagto).trigger('change');
        }, 400)

        $(".btn_print_danfe").attr('role-chave',chave_nfe).attr('role-data',data_entrada).prop('disabled',false);

        $('#data_entrada, #data_emissao').datepicker(options_datePicker);

        $('.div_tabela_nfe').html('');

        $('.div_tabela_nfe').gerarTabela({
            classesTabela: ['table', 'table-bordered', 'td-padding-0', 'tabela-nfe-detalhes',$tabelas.tabela_dados_nfe, $tabelas.table_nfe],
            cabecalho: ["ID", "Produtos NFe", "Descrição Sistema", "NCM", "CFOP", "Und.", "Und 2.", "Qtd. NF", "Qtd Est.", "Preço R$", "Total R$", "Item", "CST", "Setor", '<i class="fas fa-th"></i>', "Grade", "Cód. Barras", "Descrição do produto NFe", "ICMS %", "IPI", "Base", "ICMS ST", "Desc. Item", "Preco Ant."],
            corpo: function() {
                setTimeout(() => {
                    this.dadosCorpoAsync(dados_produtos);
                    $('.tabela-nfe-detalhes .cfop').each((i, el) => {
                        el = $(el);
                        el.val(el.attr('role-value'))
                        el.chosen2();
                    })

                    $('.tabela-nfe-detalhes .unidade_2').chosen2();
                    load.RemoverLoad()
                }, 250);


            },
            linhaAdicionada: function(linha, tabela) {},
            usarTabelasMultiplas: true,
            usarRemocaoLinha: false
        });

        modal_import_xml.fecharModal()
        ativarLimparDadosXML();
        $('body').addClass('usando-chave-nfe')
        getDataFormatada(new Date(), 2);
    }

    var idTabelaProdutos = function(prox) {
        var atual = $("."+$tabelas.tabela_produtos_man+" > tbody > tr").length;
        return prox == true ? (atual + 1) : atual;
    }

    const loadNotas = function(notas, fornecedor_informacoes, produtos_encontrados) {
        notas = typeof notas[0] == "undefined" ? [notas] : notas;

        $.each(notas, function(i, data){
            var nfe = data.NFe != undefined ? data.NFe.infNFe : data.infNFe;
            var prot_nfe = data.protNFe;
            var dados_nfe = nfe.det;
            var dados_total = nfe.total.ICMSTot;
            nfe.emit.id_fornecedor = fornecedor_informacoes.id;
            // Dados Cabeçalho da Nota
            var cfop_algo = 1542; // Vai ser alterado
            var pagto_algo = ""; // Vai ser alterado

            try{
                sessionStorage.setItem("emitente_nota", JSON.stringify(nfe.emit) );
                sessionStorage.setItem("destinatário_nota",  JSON.stringify(nfe.dest) );
            }
            catch(err) {
                console.log(err.message);
            }

            var chave_nfe = prot_nfe != undefined ? prot_nfe.infProt.chNFe : nfe.attributes.Id.replace('NFe','');
            var data_entrada = dataAtual();
            var data_emissao = dataAtual(nfe.ide.dhEmi);
            var setor = $('.setor_id').first().html();
            var cfops = '<option id="'+cfop_algo+'">'+cfop_algo+'</option> <option id="002">002</option> <option id="003">003</option>';
            var pagto = $('.'+$inputs.forma_pagto).html(); // pagto_algo
            var mod_frete = nfe.transp.modFrete,
                select = $('<select>'),
                mods = {"0":"Por conta do emitente", "1":"Por conta do destinatário/remetente", "2": "Por conta de terceiros", "9": "Sem frete"};

            for(var i in mods) {
                var nome_add = i+' - '+mods[i],
                    selected = i == mod_frete ? 'selected' : '';
                select.append($('<option '+selected+' role-option-select="'+nome_add+'" value="'+i+'">'+nome_add+'</option>'));
            }

            var frete_option = select.html();
            var mva = '0,00';
            var lucro = '0,00';
            var nota_fiscal = nfe.ide.nNF;
            var dados_fornecedor = fornecedor_informacoes;
            // Dados Rodapé da Nota

            var frete_total = (dados_total.vFrete != undefined) ? dados_total.vFrete : 0.00;
            var desconto_total = (dados_total.vDesc != undefined) ? dados_total.vDesc : 0.00;
            var ipi_total = (dados_total.vIPI != undefined) ? dados_total.vIPI : 0.00;
            var bc_icms_total = (dados_total.vBC != undefined) ? dados_total.vBC : 0.00;
            var icms_total = (dados_total.vICMS != undefined) ? dados_total.vICMS : 0.00;
            var bc_icms_sub_total = (dados_total.vBCST != undefined) ? dados_total.vBCST : 0.00;
            var icms_sub_total = (dados_total.vICMSDeson != undefined) ? dados_total.vICMSDeson : 0.00;
            var isentos_total = (dados_total.vII != undefined) ? dados_total.vII : 0.00;
            var outros_total = (dados_total.vOutro != undefined) ? dados_total.vOutro : 0.00;
            var produtos_total = (dados_total.vProd != undefined) ? dados_total.vProd : 0.00;
            var total_total = (dados_total.vNF != undefined) ? dados_total.vNF : 0.00;

            var modelo = nfe.ide.mod;
            var autorizacao = nfe.protNFe != undefined ? nfe.protNFe.infProt.nProt : '';

            if(autorizacao.length > 0) {
                let cortar_aut = (autorizacao.length - 10 > 0) ? autorizacao.length - 10 : (autorizacao.length - 10) * -1;
                autorizacao =  autorizacao.substr(0, -cortar_aut);
            }

            var serie = 1; // Por enquanto
            var totais_nota = nfe.total.ICMSTot;

            var frete = nfe.transp != undefined ? nfe.transp : 0;
            tipo_frete = frete.modFrete != undefined ? frete.modFrete : 9;

            var acrescimo_total = 0.00; // Definir ainda onde irá buscar
            var usuario = 1; // Por enquanto será 1

            // Enviar dados para a função de montagem da nota
            var dados = {
                nota_fiscal: nota_fiscal,
                chave_nfe: chave_nfe,
                data_entrada: data_entrada,
                data_emissao: data_emissao,
                setor: setor,
                cfops: cfops,
                pagto: pagto,
                frete: frete_option,
                frete_dados: frete,
                mva: mva,
                lucro: lucro,
                frete_total: frete_total,
                desconto_total: desconto_total,
                ipi_total: ipi_total,
                bc_icms_total: bc_icms_total,
                icms_total: icms_total,
                bc_icms_sub_total: bc_icms_sub_total,
                icms_sub_total: icms_sub_total,
                isentos_total: isentos_total,
                outros_total: outros_total,
                produtos_total: produtos_total,
                total_total: total_total,
                produtos_todos: dados_nfe,
                dados_fornecedor: dados_fornecedor,
                modelo: modelo,
                autorizacao: autorizacao,
                serie: serie,
                totais_nota: totais_nota,
                tipo_frete: tipo_frete,
                acrescimo_total: acrescimo_total,
                usuario: usuario,
                produtos_cadastrados: produtos_encontrados,
            };

            montarDetalhesNfe(dados);
        });
    }

    // Manipulação do campo de quantidade
    $("body").on('keyup blur','.qntd',function() {
        const tr = $(this).closest('tr');

        const preco_send =  valorMonetarioParaFloat(tr.find(".price").val());
        const quantidade_send = valorMonetarioParaFloat($(this).val());

        tr.find("td > .total").change();

        // Aqui carrega a função e altera os valores
        atualizarTotal(tr, preco_send, quantidade_send);
    });

    // Manipulação do campo preço
    $("body").on('keyup blur','.price',function(){
        var tr = $(this).closest('tr');

        tr.find('.qntd').trigger('keyup');
    });

    // Quando o desconto é mudado o preço total é alterado
    $("body").on('change','.total_desconto',function() {
        const desconto = valorMonetarioParaFloat($(this));
        const total = valorMonetarioParaFloat($('.total_produtos'));
        const descontou = total - desconto;
        //descontou = descontou > 0 ? descontou : 0;

        if(descontou > 0) $('.total_nfe').val(formatarValorParaPadraoBr(descontou));
        else if(descontou == 0) $('.total_nfe').val('0,00');
    });

    function relacionarProdutosNfe(tr,id_info,role_val, focar) {
        if(typeof tr == 'object' && id_info == 'lote' && typeof role_val == 'object') {
            var lotes = JSON.stringify(tr);
            var enviar = new FormData();

            enviar.append('lote', lotes)

            chamadaAjax({
                url: '/produto/produto/cadastrar_atualizar_lote_produto_nfe/',
                type: 'POST',
                cache: false,
                contentType:  false,
                processData:  false,
                data: enviar,
                LoadMsg: 'Relacionando...',
                success: function(ok){
                    //console.log(ok.data_msg, role_val)
                    $.each(ok.data_msg.relacao, function(i,a){
                        //console.log(role_val[i])
                        preencherCamposEstoqueMov(a.PRODUTO, role_val[i])
                    })
                }
            })

            return false;
        }

        var produto_nfe = tr.find('td:nth-child(2)').attr($roles.role_id);
        var cnpj = $('.info_nota').find('span').last().text().replace('CNPJ:  ','');
        var cean = tr.find('input[name="cEAN[]"]').val();

        produto_nfe = produto_nfe == undefined ? '' : produto_nfe;
        var dados = {id_emitente: produto_nfe.semEspaco(), cnpj: cnpj};

        if(id_info.length < 8) {
            dados.id_info = id_info;
            dados.busca_relacao = true;
        } else {
            dados.cod_barras = id_info;
        }

        if(typeof id_info == 'boolean' && id_info == false) return dados;

        chamadaAjax({
            url: '/produto/produto/buscar_relacao_produto_nfe/',
            type: 'GET',
            data: dados,
            erro404: false,
            LoadMsg: 'Verificando...',
            success: function(ok) {
                preencherCamposEstoqueMov([ok.data_msg[0].PRODUTO_GERAL], focar);
                $(focar).attr($roles.role_val, id_info)
            },
            error: function(xhr) {
                if(typeof xhr.responseJSON != "undefined") {
                    var json = xhr.responseJSON;
                    if(json.codStatus == 404 || json.codStatus != 710) {
                        $(focar).val(role_val);
                        var alerta = json.codStatus == 404 ? 'warning' : true; //false
                        mostrarMensagemErroSucessoAlerta(json.data_msg, focar, alerta)
                    } else if(json.codStatus == 710) {
                        chamadaAjax({
                            url: '/produto/produto/cadastrar_atualizar_produto_nfe/',
                            type: 'POST',
                            data: {id_produto: id_info,id_nfe: produto_nfe,cnpj: cnpj, codigo_barras: cean},
                            LoadMsg: 'Relacionando...',
                            success: function(ok) {
                                preencherCamposEstoqueMov(ok.data_msg.PRODUTO, focar)
                                $(focar).attr($roles.role_val, id_info)
                            }
                        })
                    }
                } else {
                    mostrarMensagemErroSucessoAlerta(xhr.responseText)
                }
            }
        })
    }

    //  Quando o codigo é adicionado e clicado em enter ou tab ele coloca nos campos as informações relativas ao produto
    $("body").on('blur','.'+$inputs.inp_codigo,function(event){
        var tr = $(this).closest('tr');

        if(!$(this).hasClass('nfe')) {
            if($(this).attr($roles.role_use) != undefined) setTimeout(function(){ tr.find('td:nth-child(1) > input').focus()}, 200);

            $(this).removeAttr($roles.role_use)

        } else {
            var id_info = $(this).val();
            var role_val = $(this).attr($roles.role_val);

            if(id_info != role_val) {
                if(id_info.length > 0) {

                    if(!$.isNumeric(id_info)) {
                        $(this).val(role_val);
                        return false;
                    }

                    relacionarProdutosNfe(tr,id_info,role_val, this)
                }
            }
        }
    });

    $(document).on('keydown',function(e){
        var keypress =  'which' in e ? e.which : e.keyPress;
        if((keypress == 107 || (e.shiftKey && keypress == 187)) && permitirCriarNovaLinha() ) gerarLinhaTabelaProdutos();

        if(keypress == $keys.f6.key) {
            $('#resumo-nota-tab').click();
            return false;
        }

        if(keypress == $keys.f7.key) {
            $('#produtos-tab').click();
            return false;
        }

        if(keypress == $keys.f8.key) {
            $('#importacao-xml').click();
            return false;
        }

        if(keypress == $keys.f9.key) {
            $('#dados-fornecedor-tab').click();
            return false;
        }

        if(keypress == $keys.f3.key) {
            $('button[type="submit"][name="salvar"]').click()
            return false;
        }
    });

    botaoLimparNfePedidos(dataSaida, ativarLimparDadosXML, false);

    var setDocId = function(id) {
        if(typeof doc_id == "undefined") {
            var doc_id = {
                doc_id: undefined,
                set DID($id){
                    this.doc_id = $id
                },
                get DID(){
                    return this.doc_id;
                }
            };
        }
        doc_id.doc_id = id;
    }

    // Aqui é manipulado o envio do formulário
    $('#form_nfe').submit(function() {

        const validarInputsEscondidosTabelaProdutos = validarInputsEscondidos(`.${$tabelas.tabela_produtos_man} tbody tr.ativo`)

        const marcarInputErroDetalhes = function (campo) {
            const linha = campo.closest('tr');
            const campoFocarModalDetalhes = $(`input[role-equivale="${campo.attr('class')}"], select[role-equivale="${campo.attr('class')}"]`)

            $('#produtos-tab').click()
            linha.find('.btn-detalhes').click()
            linha.addClass('animacao-background')

            setTimeout(() => {

                if(campoFocarModalDetalhes.next('.chosen-container').length > 0) {
                campoFocarModalDetalhes.next('.chosen-container').click().addClass('chosen-container-active').trigger('mousedown');
            } else {
                campoFocarModalDetalhes.select().focus()
            }

        }, 600)
        }

        if(validarInputsEscondidosTabelaProdutos != false) {

            mostrarMensagemErroSucessoAlerta('Há campos não preenchidos na aba de detalhes do produto', function() {
                marcarInputErroDetalhes(validarInputsEscondidosTabelaProdutos[0])
            })
            return false;
        }

        if(!validarFormulario(this)) return false;

        if(tipo_uso == 1) {
            var erroPrecoCompra = false;

            $(`.${$tabelas.tabela_produtos_man} tr.ativo .preco_compra`).each((i, item) => {
                item = $(item)

                if(item.val().length == 0 || item.val() == '0') {
                    erroPrecoCompra = true;
                    marcarInputErroDetalhes(item)
                    return false;
                }
            })

            if(erroPrecoCompra) return false;
        }

        $('.'+$inputs._saida).trigger('change')
        const des = $("."+$tabelas.tabela_produtos_man).find('input:disabled, select:disabled')
        const desabilitados = $(this).find('input:disabled');

        const nullParaZero = (valor) => {

            valor.map((item, i) => {
                valor[i] = isNaN(item) ? 0 : item
            })

            return valor;
        }

        des.removeAttr('disabled')
        desabilitados.removeAttr('disabled')

        var dados = converterObjetoParaFloat(dadosFormularioParaJson( $(this).serializeArray() ), ["base_de_calc","base_de_calc_subst","desconto","icms","icms_subst","out_despesas",
            "preco_compra","preco_venda","quantidade","total","total_ipi","total_nfe","total_produtos","valor_frete"]);

        des.prop('disabled', true);
        desabilitados.prop('disabled', true);

        var cpf_cnpj = $("#"+$inputs.cpf_cnpj).unmask().val();
        var grades_id = [];
        var itens = [];

        let atualizar = $('.'+$tabelas.tabela_produtos_man).attr($roles.role_atualizar);

        if(atualizar != undefined) {
            dados.atualizar = 1;
            dados.id_estoque = atualizar;
            $('.'+$tabelas.tabela_produtos_man+' > tbody > tr').each(function(e){
                //if($(this).attr($roles.role_id) == undefined) {
                itens.push( $(this).attr($roles.role_item) );
                //}
            });
            dados.itens = itens;
        }

        var return_erro_grade = true;

        $('.'+$tabelas.tabela_produtos_man+' > tbody > tr > td.grade_td').each(function(i){
            let grade_add = $(this).attr($roles.role_grade),
                tr = $(this).closest('tr');

            if(parseInt(tr.attr($roles.role_obrig_grade)) == 1 && grade_add == undefined) {
                var nome_prod = tr.find('.'+$inputs.desc_produto).val();
                mostrarMensagemErroSucessoAlerta('O produto '+nome_prod+' requer informação da grade', tr.find('.'+$inputs.cfop)[0])
                return_erro_grade = false;
                return false;
            }

            grade_add = grade_add == undefined ? '' : grade_add;
            grades_id.push( grade_add );
        });

        if(!return_erro_grade) return return_erro_grade;

        var vazios = getInputsVazios($("#form_nfe"));

        for(let i = 0; i < vazios.length; i++) {
            if(vazios[i] != undefined) vazios[i] = vazios[i].replace('[]','')
        }

        if(dados.forma_pagto[0] == "-1") {

            if(valorPagarPedidoNfe() != parseFloat(QuantidadePaga())) {
                mostrarMensagemErroSucessoAlerta('A soma dos valores pagos não é igual ao valor a pagar')
                return false;
            }

            var formas_pagto = [];
            for(var i in dados.forma_pagto) {
                if(i != 0) formas_pagto.push(dados.forma_pagto[i])
            }

            dados.forma_pagto = formas_pagto;

        } else {
            dados.forma_pagto = [dados.forma_pagto[0]];
            dados.valor_forma_pagto = '';
        }

        var arr_val = [];

        $('.td_input.total').each(function(i, a){
            var val = $(a).val();
            if(val.length > 0) arr_val.push(val);
        })

        if(arr_val.length == 0) {

            if(typeof doc_id != "undefined") {
                if(typeof doc_id.doc_id != "undefined") {
                    confirmar('Foram excluídos todos os itens da nota, portanto a mesma será excluída por completo. Caso cancele, nenhuma alteração será salva', function(a, modal){
                        if(a) {
                            let identificadorEstoqueMov = typeof chave_nfe_atual != "undefined" ? chave_nfe_atual : doc_id.doc_id;
                            ativarRemocaoCompletaNota('/estoque_mov/estoque_mov/deletar_estoque_mov/', {nota_id: identificadorEstoqueMov}, function(){
                                modal.modal('hide');
                            });
                        }
                    });
                    return false;
                }
            }

            mostrarMensagemErroSucessoAlerta('É necessário inserir ao menos um produto', $('.'+$inputs.inp_codigo).first()[0]);
            return false;
        }

        nullParaZero(dados.preco_venda)
        nullParaZero(dados.preco_compra)

        dados.grades_id = grades_id;
        dados.tipo_mov = tipo_uso;
        dados.codigo = limparArray(dados.codigo);
        dados.id_entidade = $("#"+$inputs.nome_cliente_destin).attr($roles.role_id);
        dados.id_entidade = dados.id_entidade == undefined ? 0 : dados.id_entidade;
        dados.turno = dados.turno == undefined ? dados.turno : 1;
        dados.pdv = dados.pdv == undefined ? dados.pdv : 1;

        var valores_enviar = new FormData();
        var dados_paraEnvio = JSON.stringify(dados);

        valores_enviar.append('dados', dados_paraEnvio)

        var validar_cnpj_enviar = true;

        if(tipo_uso != 0) validar_cnpj_enviar = validarCamposCpfCnpj(cpf_cnpj);

        if(validar_cnpj_enviar /*|| parseInt(dados.modelo_doc) != 55*/) {
            chamadaAjax({
                url: '/estoque_mov/estoque_mov/salvar_atualizar_itens_manual',
                data: dados,
                type: 'POST',
                LoadMsg: 'Enviando...',
                success: function(data) {
                    mostrarMensagemErroSucessoAlerta(data.data_msg.msg, "#"+$inputs.nome_cliente_destin, false);
                    $('.'+$tabelas.tabela_produtos_man).attr($roles.role_atualizar, data.data_msg.estoque_mov_id)
                    doc_id.doc_id = data.data_msg.estoque_mov_id;
                },
                error: function(xhr){
                    if(typeof xhr.responseJSON != "undefined") {
                        var dados = xhr.responseJSON;
                        if(dados.codStatus == 325) {
                            var data_msg = JSON.parse(dados.data_msg);
                            var documento = $('#'+$inputs.documento).val();
                            var fornecedor = $('#'+$inputs.nome_cliente_destin).val();
                            var msg_usuario = 'Nota ' + documento + ' - ' + fornecedor + ' já cadastrada. Deseja consultá-la?';

                            $($modais.modal_alerta_erro.class+', .modal-backdrop').remove();

                            this.data_msg = data_msg;

                            var este = this;

                            setDocId(data_msg.id_nota)

                            confirmar(msg_usuario, function(a, modal){
                                if(a){
                                    chamadaAjax({
                                        url: '/estoque_mov/recuperar_informacoes/',
                                        data: {doc_id: este.data_msg.id_nota},
                                        usarLoad: false,
                                        LoadMsg: 'Recuperando...',
                                        success: function(dados) {
                                            $('.'+$botao.btn_limpar).click();
                                            setTimeout(function(e){
                                                carregarDocId([dados.data_msg]);
                                            }, 200)
                                        }

                                    });

                                    modal.modal('hide');
                                }
                            })
                        }
                    }
                }
            })
        } else {
            $("#"+$inputs.cpf_cnpj).focus();
        }
        return false;
    });

    // Autocomplete Clientes
    var url_usar = 'cliente/buscar',
        param = 'cliente';

    switch(tipo_uso) {
        case 1:
            url_usar = 'fornecedor/buscar';
            param = 'fornecedor';
            break;
        case 2:
            url_usar = 'empresa/exibir';
            param = 'no';
            break;
    }

    $(`#${$inputs.nome_cliente_destin}, #${$inputs.nome_cliente_destin}2`).autoCompleteCliente({
        url_usar: url_usar,
        param: param,
        focus: focusClientePadrao,
        select: selectClientePadrao
    })

    var dadosXMLNota = {
        dados: false,
        set d($d) {
            this.dados = $d;
        },
        get d(){
            return this.dados;
        }
    }

    var carregarNotas = function(data) {
        data = data.data_msg;
        var fornecedor_info = data.produtos_cadastrados[0].cadastrar_fornecedor,
            nota_ler = data.nota,
            cadastrados = data.produtos_cadastrados[0],
            produtos_encontrados = cadastrados.produtos;

        if(typeof dados_nota_chave != "undefined") {
            if(typeof dados_nota_chave.dados != "undefined") {
                nota_ler = [nota_ler];
            }
        }

        if(fornecedor_info == false) {
            if(nota_ler != undefined) loadNotas(nota_ler, cadastrados.fornecedor_cadastrado, produtos_encontrados);

        } else if(fornecedor_info != false && nota_ler != undefined) {
            var nome_fornecedor = fornecedor_info.dados_fornecedor.xNome; //(fornecedor_info.dados_fornecedor.xFant != undefined) ? fornecedor_info.dados_fornecedor.xFant :

            fornecedor_info.tipo_entidade = 2;

            this.fornecedor_info = fornecedor_info;

            this.fornecedor_info.dados_entidade = this.fornecedor_info.dados_fornecedor

            delete this.fornecedor_info.dados_fornecedor;

            this.nota_ler = nota_ler;
            this.produtos_encontrados = produtos_encontrados;
            var este = this;
            modal_import_xml.fecharModal();

            confirmar("O fornecedor "+nome_fornecedor+" ainda não foi cadastrado, deseja cadastrá-lo?", function(a, modal){

                chamadaAjax({
                    url: '/entidade/entidade/adicionar',
                    type: 'POST',
                    data: este.fornecedor_info,
                    LoadMsg: 'Cadastrando...',
                    success: function(data) {
                        loadNotas(este.nota_ler, data.data_msg.entidade, este.produtos_encontrados);
                    }
                });

                modal.modal('hide');
            })

        } else {
            alert("Não há notas para serem lidas, houve um erro");
        }

        var estoque_dados = data.produtos_cadastrados[0].estoque_dados;

        if(estoque_dados != null && estoque_dados != false) {
            var pagto = estoque_dados.CABECALHO.PAGTO;

            if(pagto.length == 1) {
                $('.'+$inputs.forma_pagto).attr($roles.role_id, pagto[0].ID).val(pagto[0].FORMA_PAGTO_ID);
            } else {
                $.each(pagto, function(e, pagto){
                    setTimeout(function(){ gerarLinhaFormaPagamento(pagto.FORMA_PAGTO_ID, pagto.VALOR, pagto.ID); }, 600);
                })
                setTimeout(function(){ adicionarFormasPagtosMultiplas(); $('.'+$inputs.forma_pagto).attr($roles.role_id, pagto.ID).val("-1").trigger('change',[undefined,false]) }, 600);
            }
        }

        resetFormNota();
        dadosXMLNota.dados = data;
        $('input[name="data_entrada"],input[name="data_emissao"]').trigger('change');
        $('.'+$botao.criar_produtos).show();
    }

    $("body").on("click",".btn_salvar_admin",function(e){

        var funcao = $(this).attr("role-action"); // 1 - Fechar; 2 - Novo; 3 - Importar;

        if(funcao == 1) {
            alert("Fechar");
        } else if(funcao == 2) {
            alert("Novo");
        } else if(funcao == 3) {
            modal_import_xml.fecharModal()
        }

    });

    'use strict';

    ;( function( $, window, document, undefined ) {
        // feature detection for drag&drop upload
        var isAdvancedUpload = function() {
            var div = document.createElement( 'div' );
            return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
        }();

        // applying the effect for every form
        $( '.box' ).each( function() {

            var $form    = $( this ),
                $input     = $form.find( 'input[type="file"]' ),
                $label     = $form.find( 'label' ),
                $div_arqs  = $form.find( '.arquivos_a_submeter > ol' ),
                $errorMsg  = $form.find( '.box__error span' ),
                $restart   = $form.find( '.box__restart' ),
                $button = $(".button_send_xml"),
                droppedFiles = false,
                showFiles  = function( files ) {
                    $div_arqs.html('');

                    for(var i = 0; i < files.length; i++) {
                        $div_arqs.append('<li>'+files[ i ].name+'</li>');
                        //$label.append( $input.attr( 'data-multiple-caption' ) || '' ).replace( '{count}', files[i].name );
                    }

                    $button.removeAttr("disabled");

                    //$label.text( files.length > 1 ? ( $input.attr( 'data-multiple-caption' ) || '' ).replace( '{count}', files.length ) : files[ 0 ].name );
                };

            $button.click(function(e){
                $form.submit();
            });

            // letting the server side to know we are going to make an Ajax request
            $form.append( '<input type="hidden" name="ajax" value="1" />' );

            // automatically submit the form on file select
            $input.on( 'change', function( e ) {
                showFiles( e.target.files );

            });

            function extensao(fileName) {
                var ext = fileName.substring(fileName.lastIndexOf('.') + 1);
                return ext;
            }

            // drag&drop files if the feature is available
            if( isAdvancedUpload ) {
                $form
                    .addClass( 'has-advanced-upload' ) // letting the CSS part to know drag&drop is supported by the browser
                    .on( 'drag dragstart dragend dragover dragenter dragleave drop', function( e ) {
                        // preventing the unwanted behaviours
                        e.preventDefault();
                        e.stopPropagation();
                    }).on( 'dragover dragenter', function() {
                        $form.addClass( 'is-dragover' );
                    })
                    .on( 'dragleave dragend drop', function() {
                        $form.removeClass( 'is-dragover' );
                    }).on( 'drop', function( e ) {
                        if(e.originalEvent.dataTransfer.files.length == 1) {
                            if(extensao(e.originalEvent.dataTransfer.files[0].name) == 'xml') {
                                $input.val('');
                                droppedFiles = e.originalEvent.dataTransfer.files; // the files that were dropped
                                showFiles( droppedFiles );
                            } else {
                                alert("Este arquivo não é um xml, por favor selecione outro");
                            }
                        } else {
                            alert("Só é possível enviar uma EstoqueMov por vez");
                        }


                    });
            }

            // if the form was submitted
            $form.on( 'submit', function( e ) {
                if( isAdvancedUpload ) { // ajax file upload for modern browsers
                    e.preventDefault();

                    // gathering the form data
                    var ajaxData = new FormData( $form.get( 0 ) );
                    var ext_false = false;

                    var filesnames = $input.val();

                    if( droppedFiles && droppedFiles.length == 1 && filesnames == 0) {
                        $.each( droppedFiles, function( i, file ) {
                            if(i == 0) {
                                if(extensao(file.name) != "xml") {
                                    ext_false = true;
                                }
                                ajaxData.append( $input.attr( 'name' ), file );
                                var add_file = true;
                            }
                        });
                    }

                    var nome_add = '';

                    for(var arqs of ajaxData.entries()) {
                        nome_add += arqs[1].name;
                    }

                    if(nome_add == "undefined" || nome_add == undefined) {
                        mostrarMensagemErroSucessoAlerta('É preciso enviar um arquivo...')
                        return false;
                    }

                    if((filesnames.length != 0 && extensao(filesnames) == 'xml') || (filesnames.length == 0 && ext_false == false))  {
                        // preventing the duplicate submissions if the current one is in progress
                        if( $form.hasClass( 'is-uploading' ) ) return false;

                        $form.addClass( 'is-uploading' ).removeClass( 'is-error' );
                        console.log(ajaxData)
                        chamadaAjax({
                            url: '/estoque_mov/estoque_mov/salvarXml',
                            type: 'POST',
                            data: ajaxData,
                            cache: false,
                            UsarLoad: false,
                            contentType:  false,
                            processData:  false,
                            success: carregarNotas,
                            error: function() {
                                /*$(".show_erro").html(data.msg);
                                 alert(data.msg);*/
                            },
                            complete: function(){
                                $form.removeClass( 'is-uploading' );
                                resetFormNota();
                                ajaxData.delete( $input.attr( 'name' ));
                            }
                        })

                    } else {
                        alert("Há arquivos com a extensão inválida");
                    }

                } else { // fallback Ajax solution upload for older browsers

                    var iframeName  = 'uploadiframe' + new Date().getTime(),
                        $iframe   = $( '<iframe name="' + iframeName + '" style="display: none;"></iframe>' );

                    $( 'body' ).append( $iframe );
                    $form.attr( 'target', iframeName );

                    $iframe.one( 'load', function()
                    {
                        var data = $.parseJSON( $iframe.contents().find( 'body' ).text() );
                        $form.removeClass( 'is-uploading' ).addClass( data.success == true ? 'is-success' : 'is-error' ).removeAttr( 'target' );
                        if( !data.success ) $errorMsg.text( data.error );
                        //$iframe.remove();
                    });
                }

                return false;
            });

            // restart the form if has a state of error/success
            $restart.on( 'click', function( e ) {
                e.preventDefault();
                $form.removeClass( 'is-error is-success' );
                $button.attr("disabled","disabled");
                $input.trigger( 'click' );
            });

            // Firefox focus bug fix for file input
            $input.on( 'focus', function(){ $input.addClass( 'has-focus' ); }).on( 'blur', function(){ $input.removeClass( 'has-focus' ); });
        });

    })( jQuery, window, document );

    ativarGrades(gerarLinhaTabelaProdutos, {
        fechado: () => {
            setTimeout(() => {
                $(`.${$inputs.inp_codigo}`).last().select().focus()
            }, 250)
        }
    });
    /*
     0 -> Entre 5000 e 9000
     1 -> menor que 5000
     2 -> 9001 e 9002

     */
    $('body').on('blur', "."+$tabelas.tabela_produtos_man+" ."+$inputs.cfop, function(e){
        let cfop =  parseInt($(this).val()),
            tr = $(this).closest('tr'),
            qntd_inserida =  tr.find(".qntd").val(),
            produto_id = tr.find("."+$inputs.inp_codigo).val(),
            desc_produto = tr.find("."+$inputs.desc_produto).val(),
            mov_estoque = $(this).children('option:selected').attr($roles.role_mov_estoque),
            liberar = false,
            tipo_m = '';

        if(mov_estoque == 0) {
            mostrarMensagemErroSucessoAlerta('O CFOP ' +cfop+ ' não movimentará o estoque.',false,'warning');
        }

        liberar = cfop_aceitos.indexOf(cfop) != -1;
        switch(tipo_uso) {
            case 0:
                //liberar = cfop >= 5000 && cfop <= 9000;
                tipo_m = 'saída';
                break;
            case 1:
                //liberar = cfop >= 1000 && cfop < 5000;
                tipo_m = 'entrada';
                break;
            default:
                liberar = cfop == 9001 || cfop == 9002;
                tipo_m = 'transferência';
        }

        if(liberar) {
            if(produto_id.length != 0 && qntd_inserida.length != 0) {
                if(!$(this).hasClass($ClassesAvulsas.n_gerar) && (parseInt(produto_id) != 0 && parseInt(qntd_inserida) != 0) ) {
                    $("."+$tabelas.tbody_t1).find('tr').last().find('input:visible').each(function(e){
                        valores_tr_ant += $(this).val().length;
                    })
                    var id = $('.'+$ClassesAvulsas.tbody_t1+' > tr').length;
                    gerarLinhaTabelaProdutos(id);
                }
                $(this).removeClass($ClassesAvulsas.n_gerar)
            } else {
                if(produto_id.length == 0 || desc_produto.length == 0) return false;
                if(qntd_inserida.length == 0) {
                    mostrarMensagemErroSucessoAlerta('O campo Quantidade não pode estar vazio', tr.find(".qntd")[0]);
                }
                else if(produto_id.length == 0) {
                    mostrarMensagemErroSucessoAlerta('O campo Código não pode estar vazio', tr.find("."+$inputs.inp_codigo)[0]);
                }
            }

        } else {
            cfop = isNaN(cfop) ? 0 : cfop;
            var nome_prod = tr.find('.'+$inputs.desc_produto).val();
            mostrarMensagemErroSucessoAlerta('CFOP '+cfop+' é inválido para movimentações de '+tipo_m+' no produto '+nome_prod, tr.find('.qntd')[0]);
        }

    });

    $('body').on('blur','.tabela_produtos_man tr td:nth-child(6) input[type=text]', function(){
        var tr = $(this).closest('tr');
        var campo_icms = tr.find('.aliquota_icms');

    });

    $('body').on('blur','.unidade', function() {
        var tr = $(this).closest('tr');
        var cfop = tr.find('.'+$inputs.cfop);
        var valCfop = cfop.val();
        var input_chosen = tr.find('.chosen-container').find('input[type="text"]');
        if(valCfop == null) cfop.children('option').first().prop('selected', true).trigger('chosen:updated')

        cfop.trigger('blur');

    }).on('keydown','.unidade',function(e) {
        if(e.which == 13) {
            $(this).trigger('blur');
        }
    });

    $('body').on('keyup change','input',function(){
        var valor = $(this).val();
        $(this).attr('title',valor);
    });

    $('body').on('blur', `.${$tabelas.tabela_produtos_man} .price`, function() {
        if( permitirCriarNovaLinha() ) {
            const linha = gerarLinhaTabelaProdutos()
            setTimeout(() => {
                linha.find(`.${$inputs.inp_codigo}`).select().focus()
            }, 250)
        }
    })

    $('#'+$inputs.modelo_doc).on('change', function(){
        var valor = parseInt( $(this).val() ),
            requer = (valor == 55 || valor == 65);
        //console.log('TIPO:', requer);
        $('.'+$inputs.chave_nfe+', .'+$inputs.autorizacao_nfe+', .'+$inputs.serie+', .'+$inputs.valor_icms_st).prop('required', requer);

        if(requer) {
            $('.'+$inputs.chave_nfe).attr('minlength',"44");
            $('.'+$inputs.autorizacao_nfe).attr('minlength',"10");
        } else {
            $('.'+$inputs.chave_nfe+', .'+$inputs.autorizacao_nfe).removeAttr('minlength');
        }

        $('#'+$inputs.nome_cliente_destin+', #'+$inputs.cpf_cnpj+', #'+$inputs.cep+
            ', #'+$inputs.tel+', #'+$inputs.bairro+', #'+$inputs.cidade+', #'+$inputs.endereco
            +', #'+$inputs.uf+', #'+$inputs.numero).removeAttr('required');

        if(valor == 55) {

            $('#'+$inputs.nome_cliente_destin+', #'+$inputs.cpf_cnpj+', #'+$inputs.cep+
                ', #'+$inputs.tel+', #'+$inputs.bairro+', #'+$inputs.cidade+', #'+$inputs.endereco
                +', #'+$inputs.uf+', #'+$inputs.numero).attr('required','required');

        } else if(valor == 65) {
            $('#'+$inputs.serie).attr('required','required');
            if(tipo_uso != 1) {
                $('#'+$inputs.turno+', #'+$inputs.pdv).attr('required','required');
            }
        } else if(valor == 99) {
            $('#'+$inputs.pdv+', #'+$inputs.serie+', .'+$inputs.cfop+', .'+$inputs.ncm+', .'+$inputs.valor_icms_st).removeAttr('required');
            if(tipo_uso != 1)
                $('#'+$inputs.turno).attr('required','required');
        }
    });

    $('#'+$inputs.modelo_doc).trigger('change');

    function Null2Vazio($el, $passar) {
        var regex_data = /^\d{4}\-\d{1,2}\-\d{1,2}$/;

        if(($el == undefined || $el == null || ''+$el == 'false') && ''+$el != '0') {
            return '';
        } else if(''+$el == '0') {
            return 0;
        }

        if(regex_data.test($el)) return getDataBR($el);

        if($.isNumeric($el) && (""+$el).indexOf('.') != -1) return formatarNumeroCompleto($el);

        return $el;
    }

    window.carregarDocId = function(doc_s){
        //console.log('Iniciou',new Date())
        doc_s =typeof doc_valores != "undefined" ? doc_valores : doc_s;

        if(doc_s == undefined) return false;

        let tr_f = $("#tr_1"),
            dados_ret = doc_s[0],
            cabecalho = dados_ret.CABECALHO,
            x = Load('Carregando...'),
            att_multiplas = [];
        $('.'+$tabelas.tabela_produtos_man).attr($roles.role_atualizar, cabecalho.ID);

        setTimeout(function(){
            $.each(cabecalho, function(i, a){
                var chave = i.toLowerCase(),
                    el = $('#'+chave).length > 0 ? $('#'+chave) : ( $('.'+chave).length > 0 ? $('.'+chave) : undefined  );
                if(chave != 'pagto') {
                    if(el != undefined) {
                        let valor = Null2Vazio(a);
                        if(!(getTagName(el) == 'select' && valor == 0)) {
                            el.val(valor).trigger('change').trigger('blur').trigger('chosen:updated')
                            if(chave == "nome_cliente") {
                                el.attr($roles.role_id, cabecalho.ENTIDADE_ID)
                            }
                        }
                    }
                } else {
                    $.each(a, function(e, pagto) {
                        if(a.length > 1) {
                            att_multiplas.push('a');
                            setTimeout(function(){ gerarLinhaFormaPagamento(pagto.FORMA_PAGTO_ID, pagto.VALOR, pagto.ID); }, 800);
                            $('.'+$inputs.forma_pagto).attr($roles.role_id, pagto.ID).val("-1").trigger('change');
                        } else {
                            $('.'+$inputs.forma_pagto).attr($roles.role_id, pagto.ID).val(pagto.FORMA_PAGTO_ID);
                        }
                    })
                }
            })

            if(att_multiplas.length > 0) {
                setTimeout(function(){ adicionarFormasPagtosMultiplas(); }, 800);
                att_multiplas = null;
            }

        }, 0)

        setTimeout(function(){

            dados_ret.PRODUTOS.map(function(data,i){
                var tr = i == 0 ? $('.'+$tabelas.tabela_produtos_man).find('tbody > tr:first') : gerarLinhaTabelaProdutos(idTabelaProdutos() ,false,'add',false);
                $('.'+$tabelas.tabela_produtos_man).attr($roles.role_ultimo_item, data.ITEM );

                tr.attr($roles.role_item, data.ITEM).attr($roles.role_id, data.ID);
                $.each(data, function(j, dados_produtos){
                    var chave = j.toLowerCase();
                    if(chave != 'grade') {

                        let el = tr.find('#'+chave).length > 0 ? tr.find('#'+chave) : ( tr.find('.'+chave).length > 0 ? tr.find('.'+chave) : undefined  );
                        if(el != undefined) {
                            let valor = Null2Vazio(dados_produtos);
                            if(!(getTagName(el) == 'select' && valor == 0)) {
                                valor = chave == 'valor_icms_st' ? valorMonetarioParaFloat(valor) : valor;
                                el.val(valor).trigger('keyup');
                            }
                        }
                    } else {

                        var grade = formatarNomeGrade(dados_produtos[0].ID,dados_produtos[0].TAMANHO,dados_produtos[0].COR);
                        tr.find('td.grade_td').attr($roles.role_grade, dados_produtos[0].ID)
                            .find(' span').attr('title',grade).html(grade).tooltip();
                    }
                })

                tr.find('input:visible, select:visible').prop('disabled',true);
                tr.find('.'+$botao.add_grade).prop('disabled',true);
            })
            gerarLinhaTabelaProdutos(idTabelaProdutos(),true,'add');
            $('.'+$inputs.vendedor).trigger('chosen:updated')
            x.RemoverLoad();

        }, 0)

    }

    // Completar
    if(typeof doc_id != 'undefined') {
        setTimeout(function(){
            carregarDocId();
        }, 0)

    }

    $('body').on('alterado keyup', '.'+$inputs.inp_codigo, function(e){
        if(!$(this).hasClass('nfe')) {
            var valor = parseInt( $('#'+$inputs.modelo_doc).val() );

            if($(this).val().length > 0) {
                var tr = $(this).closest('td').closest('tr'),
                    valor_st = tr.find('.'+$inputs.valor_icms_st),
                    valor_st_v = parseInt(valor_st.val());

                tr.find('.'+$inputs.inp_codigo+", ."+$inputs.desc_produto+", ."+$inputs.preco_compra+
                    ', .'+$inputs.quantidade).attr('required','required');

                if(valor == 55 || valor == 65) {
                    tr.find('.'+$inputs.cfop+', .'+$inputs.ncm).attr('required','required');
                } else {
                    tr.find('.'+$inputs.cfop+', .'+$inputs.ncm).removeAttr('required');
                }

                if( valor_st_v == 0 || valor_st_v == 10 || valor_st_v == 20) {
                    tr.find('.'+$inputs.aliquota_icms).attr('required','required');
                } else {
                    tr.find('.'+$inputs.aliquota_icms).removeAttr('required');
                }

            } else {

                if(tr != undefined) {
                    tr.find('.'+$inputs.inp_codigo+", ."+$inputs.desc_produto+", ."+$inputs.preco_compra+
                        ', .'+$inputs.quantidade+', .'+$inputs.cfop+', .'+$inputs.ncm+', .'+$inputs.aliquota_icms)
                        .removeAttr('required');
                }
            }
        }
        $(this).removeClass('achado');
    });

    $('body').on('change','.'+$inputs.valor_icms_st, function(){
        $(this).closest('td').closest('tr').find('.'+$inputs.inp_codigo).trigger('alterado');
    })

    //Quando o campo cep perde o foco.
    $("#cep").blur(function() {

        //Nova variável "cep" somente com dígitos.
        var cep = $(this).val().replace(/\D/g, '');

        //Verifica se campo cep possui valor informado.
        if (cep != "") {

            //Expressão regular para validar o CEP.
            var validacep = /^[0-9]{8}$/;

            //Valida o formato do CEP.
            if(validacep.test(cep)) {

                //Preenche os campos com "..." enquanto consulta webservice.
                $("#cidade").val("...");
                $("#uf").val("...");

                //Consulta o webservice viacep.com.br/
                $.getJSON("//viacep.com.br/ws/"+ cep +"/json/?callback=?", function(dados) {

                    if (!("erro" in dados)) {
                        $("#cidade").val(dados.localidade);
                        $("#uf").val(dados.uf);
                        $(".logradouro_cliente").val(dados.logradouro);
                        $("#bairro").val(dados.bairro);
                    } else {
                        //CEP pesquisado não foi encontrado.
                        $(".head_modal_cep").html("CEP não encontrado");
                        $("#txt_modal_cep").html("O CEP digitado não foi encontrado, por favor, digite outro cep.");
                        $('#modal_cep_erro').modal('show');
                    }
                });
            } //end if.
            else {
                //cep é inválido.
                $(".head_modal_cep").html("CEP Inválido");
                $("#txt_modal_cep").html("O CEP digitado não é válido, por favor, digite outro cep.");
                $('#modal_cep_erro').modal('show');
            }
        } //end if.
    });

    if(typeof doc_id != "undefined" || typeof chave_nfe_atual != "undefined") {
        var id_usar = typeof chave_nfe_atual != "undefined" ? chave_nfe_atual : doc_id.doc_id,
            dados_usar = {nota_id: id_usar};
        if(typeof chave_nfe_atual != "undefined")
            dados_usar.usar_chave = 1;

        ativarRemocaoCompletaNota('/estoque_mov/estoque_mov/deletar_estoque_mov/', dados_usar);
    }

    window.linhasVaziasNFE = function() {
        var tabela = $('.'+$tabelas.tabela_dados_nfe),
            linhas = [];

        tabela.find('.'+$inputs.inp_codigo).each(function(i,el){
            el = $(el);
            if(el.val().semEspaco().length == 0) {
                linhas.push(el);
            }
        });
        return linhas;
    }

    $('body').on('click','.'+$botao.enviar_produtos_xml, function(){
        var tabela = $('.'+$tabelas.table_nfe),
            grades_id = [],
            erro_grade = false;
        $('.hasDatepicker').trigger('change');

        if(linhasVaziasNFE().length != 0) {
            mostrarMensagemErroSucessoAlerta('Há produtos não relacionados, para que a nota seja salva é preciso relacioná-los');
            return false;
        }

        tabela.find('td.grade_td').each(function(i, e) {
            var el = $(e),
                tr = el.closest('tr'),
                grade_id = el.attr($roles.role_grade),
                usando_grade = parseInt(tr.attr($roles.role_obrig_grade));
            if((usando_grade == 1 && grade_id == undefined) ){
                erro_grade = true;
                mostrarMensagemErroSucessoAlerta('Há produtos que necessitam de grade e que as mesmas não foram setadas', tr.find('.'+$botao.add_grade)[0])
                return false;
            }
            grades_id.push( ((grade_id == undefined) ? '' : grade_id) );
        });


        if(erro_grade) return false;
        var form = $('<form>')
        form.append($('.'+$divs.cabec_nfe).clone())
        var cabec_nfe = dadosFormularioParaJson(form.serializeArray());
        form.html('').append($('.'+$divs.div_tabela_nfe).clone())
        var produtos = dadosFormularioParaJson(form.serializeArray());
        form.html('').append($('.'+$divs.rodape_nfe).clone())
        var rodape_nota = dadosFormularioParaJson(form.serializeArray()),
            notas = typeof dadosXMLNota.dados.nota[0] != "undefined" ? dadosXMLNota.dados.nota[0] : dadosXMLNota.dados.nota;

        var infNFENota = typeof notas.NFe != "undefined" ? notas.NFe.infNFe : notas.infNFe,
            emitente = infNFENota.emit,
            destinatario = infNFENota.dest;
        if(cabec_nfe.forma_pagto.length > 1){
            cabec_nfe.forma_pagto = cabec_nfe.forma_pagto.slice(1, cabec_nfe.forma_pagto.length);
        }
        else if(cabec_nfe.forma_pagto.length == 1) {
            var forma_pagto_id = $('.'+$inputs.forma_pagto).last().val()
            cabec_nfe.forma_pagto = [forma_pagto_id];
            cabec_nfe.valor_forma_pagto = [cabec_nfe.vNF];
        }

        var dados_enviar = JSON.stringify( {cabecalho_nfe: cabec_nfe,
            produtos: produtos,
            grades_produtos: grades_id,
            rodape_nota: rodape_nota,
            emitente: emitente,
            destinatario: destinatario} );
        form_data = new FormData();
        dados_enviar = JSON.stringify(dados_enviar);

        form_data.append('dados', dados_enviar);

        chamadaAjax({
            url: '/estoque_mov/estoque_mov/salvar_atualizar_itens_xml',
            type: 'POST',
            data: form_data,
            cache: false,
            contentType:  false,
            processData:  false,
            LoadMsg: 'Enviando...',
            success: function(data) {
                mostrarMensagemErroSucessoAlerta(data.data_msg, false, false);

            },
            complete: function(xhr) {
                //$(".btn_salvar_produtos").prop("disabled", false);
            }
        })

    })

    $('body').on('click','.'+$botao.criar_produtos, function(){
        var tabela = $('.'+$tabelas.tabela_dados_nfe),
            produtos = [],
            linhas = linhasVaziasNFE();

        $.each(linhas,function(i,el){
            var tr = el.closest('tr'),
                nome_produto = tr.find('.'+$inputs.desc_produto).val(),
                ncm = tr.find('input[name="NCM[]"]').val(),
                cfop_compra = tr.find('select[name="cfop_compra[]"]').val(),
                cfop_venda = 5650,
                unidade_compra_id = tr.find('td:nth-child(6)').text(),
                unidade_venda = tr.find('td:nth-child(7)').find('select').val(),
                preco_compra = tr.find('input[name="valor_und[]"]').val(),
                preco_venda = 0,
                saldo_geral = tr.find('.qntd_estoque').val(),
                ipi = tr.find('input[name="ipi_vIPI[]"]').text(),
                icms_compra = tr.find('input[name="icms_pICMS[]"]').val(),
                icms_venda = 0,
                codigo_barras = tr.find('input[name="cEAN[]"]').val(),
                bc_icms_st = tr.find('input[name="icms_vBC[]"]').val(),
                icms_st = tr.find('input[name="icms_CST[]"]').val();

            var dados_adicionar = {
                nome_produto: nome_produto,
                ncm: ncm,
                cfop_compra: cfop_compra,
                cfop_venda: cfop_venda,
                unidade_compra_id: unidade_compra_id,
                unidade_venda: unidade_venda,
                preco_compra: preco_compra,
                preco_venda: preco_venda,
                saldo_geral: valorMonetarioParaFloat(saldo_geral),
                ipi: (ipi.length == 0 ? 0 : ipi),
                icms_compra: icms_compra,
                icms_venda: icms_venda,
                codigo_barras: codigo_barras,
                bc_icms_st: bc_icms_st,
                icms_st: icms_st
            };

            produtos.push(dados_adicionar);

        })

        if(produtos.length > 0) {
            var dados_enviar = JSON.stringify(produtos),
                enviar = new FormData();
            enviar.append('produtos', dados_enviar)
            this.enviar = enviar;
            var este = this;
            confirmar('Deseja criar os produtos não relacionados?', function(a, modal){
                if(a) {
                    chamadaAjax({
                        url: '/produto/produto/adicionar',
                        type: 'POST',
                        data: enviar,
                        cache: false,
                        contentType:  false,
                        processData:  false,
                        LoadMsg: 'Criando...',
                        success: function(data) {
                            var prods = data.data_msg;

                            linhas = linhas.reverse();

                            let relacionar = [];

                            $.each(prods.produtos[0], function(i,a){
                                console.log(i, a)
                                if(linhas[i] != undefined) {
                                    var tr = linhas[i].closest('tr'),
                                        relacao = relacionarProdutosNfe(tr, false);
                                    relacao.id_nfe = relacao.id_emitente;
                                    relacao.id_produto = a.ID;
                                    relacionar.push(relacao)
                                }
                            })
                            relacionarProdutosNfe(relacionar,'lote',linhas);
                        },
                        complete: function(xhr) {

                        }
                    })
                    modal.modal('hide');
                }
            })
        } else {
            mostrarMensagemErroSucessoAlerta('Todos os produtos já estão relacionados, então não é necessário criá-los. Mas, caso deseje realizar esta ação apague o código dos produtos que deseja criar', false, 'warning')
        }
    })

    if(typeof dados_nota_chave_nfe != "undefined") {
        carregarNotas(dados_nota_chave_nfe.dados);
    }

    $('body').on('change', '.unidade, .unidade_2', function() {
        const elemento = $(this);
        const codigo = elemento.val();
        const linhaTabela = elemento.closest('tr');
        const inputQuantidade = linhaTabela.find('.qntd');

        let opcoesInputQuantidade = inputQuantidade.attr($roles.data_option);
        let permitirFracao = ~permite_fracao.indexOf(codigo) ? 'false' : 'true';

        if(opcoesInputQuantidade != undefined) {
            opcoesInputQuantidade = opcoesInputQuantidade.replace(/virgula:\s?(true|false)/i, `virgula: ${permitirFracao}`)
            inputQuantidade.attr($roles.data_option, opcoesInputQuantidade)
        }

        const valorQuantidadeEFracionado = valorMonetarioParaFloat(inputQuantidade.val());


        if(permitirFracao == 'false' && isFloat(valorQuantidadeEFracionado)) {
            inputQuantidade.val(0).select().focus();
        }
    })


    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        const tab = $(this).attr('href').replace('#','')

        if(tab == 'dados-fornecedor') {
            const chosenContainerVendedor = $('#vendedor_chosen').closest('div')
            const widthDivPaiChosen = chosenContainerVendedor.parent().width()

            const chosenContainerCaixa = $('#caixa_chosen').closest('div')
            const widthDivPaiChosenCaixa = chosenContainerVendedor.parent().width()

            chosenContainerVendedor.width(widthDivPaiChosen)
            chosenContainerCaixa.width(widthDivPaiChosenCaixa)

            $(`#${$inputs.cpf_cnpj}2`).val($(`#${$inputs.cpf_cnpj}`).val())

        } else if(tab == 'produtos') {
            iniciarTabelaProdutos()
        } else if(tab == 'resumo-nota') {
            $(`#${$inputs.cpf_cnpj}`).val($(`#${$inputs.cpf_cnpj}2`).val())
        }

        $('#nome_cliente_destin2, #cpf_cnpj2').prop('required', false).removeAttr('name')
        $('.input-erro').tooltip('hide')

        setTimeout(() => {
            $(`input:not(:disabled):not([readonly]):visible`).first().select().focus()
        }, 250)
    })

    $('.dados-fornecedor').submit(function() {
        $('#nome_cliente_destin2, #cpf_cnpj2').prop('required', true);
        $('#nome_cliente_destin2').attr('name','xNome')
        $('#cpf_cnpj2').attr('name','CNPJ');

        const dadosFornecedor = dadosFormularioParaJson($(this).serializeArray());

        var arrEnderereco = {}
        var converterParaEndereco = {bairro: 'xBairro',cep: 'CEP', cidade: 'xMun', endereco: 'xLgr',
                                    numero: 'nro', tel: 'fone', uf: 'UF'}

        for(var i in dadosFornecedor) {
            if(Object.keys(converterParaEndereco).indexOf(i) !== -1) {
                arrEnderereco[converterParaEndereco[i]] = dadosFornecedor[i]
                delete dadosFornecedor[i]
            }
        }

        dadosFornecedor.enderEmit = arrEnderereco;
        dadosFornecedor.tipo_entidade = 1;
        dadosFornecedor.CNPJ = dadosFornecedor.CNPJ.replace(/\D/g,'');
        dadosFornecedor.xNome = dadosFornecedor.xNome.toUpperCase();

        chamadaAjax({
            url: '/entidade/entidade/adicionar',
            type: 'POST',
            dataType: 'JSON',
            data: {dados_entidade: dadosFornecedor},
            success: (resp) => {
                const idEntidade = resp.data_msg.entidade.id;
                const nomeEntidade = resp.data_msg.entidade.nome;

                $(`#${$inputs.nome_cliente_destin}, #${$inputs.nome_cliente_destin}2`).attr('role-id', idEntidade).val(nomeEntidade)

                mostrarMensagemErroSucessoAlerta(`${tipo_uso == 1 ? 'Fornecedor' : 'Cliente'} cadastrado com sucesso`, false, false)
            }
        })

        return false;
    })

    $('.salvar-fornecedor').click(function() {
        $('.dados-fornecedor').submit()
    })

});