/*
* Gerar NF-e 
* Author: Nathan Feitoza 
* Description: Tela de geração de NF-e desenvolvida com HTML, CSS e Jquery
*/

// Aqui o resultado da função é colocado no campo 'saida'
 $("#saida").val(dataAtual); 

function MudarFoco_Cod(tipo, id_c,input, shift=false) {
	if(tipo == 1 && !shift) {
		$("#tr_"+id_c+" > td > .qntd").select().focus();
	} else if(tipo == 1 && shift) {}
	else if(tipo == 2 && !shift) {
		$(input).closest("td").next().next().next().next().find(".td_input.nfe").focus();
	} else if(tipo == 2 && shift) {
		$(input).closest("td").closest("tr").prev().find("td > .td_input.nfe").last().focus();
		//console.log($(input).closest("td").closest("tr").prev().find("td > .td_input.nfe").last());
		//console.log($(input).closest("td").closest("tr").prev().find("td > .td_input.nfe").last().length);
	}

}

var LigarMoneyQntd = function() {
		$('.'+$inputs.money_qnt+', .'+$inputs.money).addClass($inputs.somente_numero)
		.attr($roles.data_option, "{ponto: false, virgula: true, decs: 100, negativo: false, per_cent: false}");
}
$('body').on('append prepend insertbefore insertafter', function(e, i){
		LigarMoneyQntd();
});
LigarMoneyQntd();


window.AtualizarItens = function() {
	var tabela_prod =  $('.'+$tabelas.tabela_produtos_man),
	ultimo_item_bd = tabela_prod.attr($roles.role_ultimo_item),
	linhas_bd = tabela_prod.find('tbody').find('tr['+$roles.role_id+']'),
	linhas_bd_qntd = linhas_bd.length,
	linhas_normais = linhas_bd.last().nextAll();	

	linhas_normais.each(function(i,a){
			let item_fator = i + 1,
			item = parseInt( tabela_prod.attr($roles.role_ultimo_item) ) + item_fator;
			$(this).attr($roles.role_item, item);
	})
	tabela_prod.addClass('att_itens');
}
// Função para gerar novo elemento na tabela dos produtos da NF-e
window.GerarLinhaTabelaProdutos = function(id,focar,tempo,contar_item)
{	
		focar = focar == undefined ? true : focar;
		tempo = tempo == undefined ? 0 : tempo;
		contar_item = contar_item == undefined ? true : contar_item;
		id = id == undefined ? parseInt($('#'+id_tr).closest('tbody').find('tr').last().attr('id').replace('tr_','') ) : id;
		if(isNaN(id)) {
			id = $("."+$tabelas.tbody_t1).length
		}
		valores_tr_ant = 0;
		var pr_id = parseInt(id) + 1,
		ultimo_vendedor = $("."+$tabelas.tbody_t1).find('.'+$inputs.vendedor).last().val(),
		ultima_linha = $("."+$tabelas.tbody_t1).find('tr').last(),
		id_tr = 'tr_'+pr_id;

		if($('#'+id_tr).length != 0) {
			var numC = 0;
			$('.'+$tabelas.tabela_produtos_man+' tbody tr').each(function(i,a){
				var num = parseInt($(a).attr('id').replace('tr_','') );
				if(num > numC) 
					numC = num;
			})
			var numero_maior = numC;
			if(!isNaN(numero_maior)) {
				pr_id = numero_maior + 1;
			}
		
			id_tr = 'tr_'+pr_id;
		}

		var id_vendedor_chose = Math.ceil((Math.random() * 15) * (new Date()).getTime()),
		vendedores_var_1 = $('.'+$inputs.vendedor).last().html() == undefined ? vendedores_var : $('.'+$inputs.vendedor).last().html(),
		new_tr = '<tr id="tr_'+pr_id+'" '+$roles.role_grade+'="1"> <td> <button role-id="'+pr_id+'" class="rmv_item"><span class="fa fa-trash"></span></button> <input role-id="'+pr_id+'" class="input-70 td_input produto_id '+$inputs.inp_codigo+'" name="codigo[]"> </td><td> <input role-id="'+pr_id+'" id="'+$inputs.desc_produto+'_'+pr_id+'" class="td_input nome_produto '+$inputs.desc_produto+'"> </td><td> <input id="'+pr_id+'" class="td-right td_input money_qnt preco_compra price" name="preco[]"> </td><td> <input id="'+pr_id+'" class="td-right td_input money_qnt quantidade qntd" name="quantidade[]"> </td><td> <input readonly class="td_input unidade"> </td><td> <input class="td-right td_input total total_input" readonly> </td><td> <button class="btn btn-success '+$botao.add_grade+'" type="button"><i class="fas fa-plus"></i></button> </td><td class="'+$ClassesAvulsas.grade_td+'"><span data-placement="right" class="td_input" title=""> </span></td><td> <select '+$roles.role_execute+'="buscarVendedorSelect" class="td_input '+$ClassesAvulsas.chosen_ativar+'" id="'+$inputs.vendedor+'_'+id_vendedor_chose+'" name="'+$inputs.vendedor+'[]">'+vendedores_var_1+'</select> </td></tr>';


		ultima_linha.find('input:visible').each(function(e){
			valores_tr_ant += $(this).val().length;
		})
		if(id == 0 || valores_tr_ant > 0 || typeof tempo == "object" || tempo == 'add') {
			if(typeof tempo == "object") {
				$(new_tr).insertAfter( tempo );
			} else {
				$("."+$tabelas.tbody_t1).append(new_tr);
			}
			if(contar_item) {
				AtualizarItens();
			}
			//$('.'+$tabelas.tabela_produtos_man).removeAttr($roles.role_ultimo_item);
			if(id != 0 && focar) {
				setTimeout(function(){ $("#tr_"+pr_id+" > td > .inp_codigo").focus(); }, tempo);
			}
			gerarAutocompleteNomeProduto("#"+$inputs.desc_produto+"_"+pr_id);
		} else {
			
			setTimeout(function(){ ultima_linha.find('.'+$inputs.inp_codigo).focus() }, 250);
		}
		var retorno = $("."+$tabelas.tbody_t1).find('#tr_'+pr_id);
		if(ultimo_vendedor != undefined) {
			$("."+$tabelas.tbody_t1).find('.'+$inputs.vendedor).last().val(ultimo_vendedor);
		}	
		$("#"+$inputs.vendedor+'_'+id_vendedor_chose).chosen2()
		return retorno;
}

GerarLinhaTabelaProdutos(0).find('.'+$inputs.inp_codigo).attr('required', 'required');


$('body').on('blur', '.qntd', function(){
	var valor = $(this).val(),
	valor_float = valorMonetarioParaFloat(valor),
	tr = $(this).closest('td').closest('tr');
	if(valor_float == 0 || isNaN(valor_float)) {
		//$(this).val( formatarValorParaPadraoBr(1) );
		tr.find("."+$inputs.inp_codigo).select().focus();
	}

})


"use strict";
// Inicia o Jquery
$(function() {

	navegacaoEntreInputsEmUmaMesmaDiv('.Inputar')
	setTimeout(function(){
		$("#"+$inputs.documento).focus();
	}, 200)
	var options_datePicker = {
	                            changeMonth: true,
	                            changeYear: true,
	                        };
	var sxidx = $('.'+$inputs._saida).datepicker(options_datePicker);
	sxidx.datepicker('option', "showOn","button");
	sxidx.datepicker('option', "buttonText", '<i class="fas fa-calendar"></i>');
	 
	// Manipulação do campo #cpf_cnpj afim de validar os dados e mascará-los 
	  $("#"+$inputs.cpf_cnpj).on("keyup", function(){

	  var valor = $(this).unmask().val();

	  if(valor.length == 11)
	  {
	  
	  if(verificarIguais(valor, "cpf"))
	  {
		  if(valor == validarCpf(valor))
		  {
			$(this).popover('hide');
			$(this).popover('destroy');
		  	$(this).removeAttr("style");

		  }
		  else
		  {
			$(this).attr('data-content','CPF Inválido');
		  	//$(this).popover('show');  
		  }
	  }
	  
	  else
	  {
		  $(this).attr('data-content','CPF Inválido');
		  //$(this).popover('show');
	  }
	  
	  }
	  else if(valor.length == 14)
	  {
	  
	    if(verificarIguais(valor, "cnpj"))
	  {
		  if(valor == validarCnpj(valor)){
			  $(this).popover('hide');
			  $(this).popover('destroy');
			  $(this).removeAttr("style");
		  }
		  else
		  {
			$(this).attr('data-content','CNPJ Inválido');
		  	//$(this).popover('show');  
		  }
	  }
	  
	  else
	  {
		  $(this).attr('data-content','CNPJ Inválido');
		  //$(this).popover('show');
	  }
	  
	  }
	  else if(valor.length == 0)
	  {
		  $(this).popover('hide');
		  $(this).popover('destroy');
		  $(this).removeAttr("style");
	  }
	  else
	  {
	 	 $(this).css({"color": "#fff", "background-color": "#d9534f", "border-color": "#d43f3a"});
	  }
	  
	  });
	  $("#"+$inputs.cpf_cnpj).focus(function(){
		  $(this).keyup();
		});
	 
	// Aqui se mascara o CPF ou CNPJ assim que o campo é clicado fora 
	  $("#"+$inputs.cpf_cnpj).on("blur", function(){
		    try {
	    	$(this).unmask();
	    } catch (e) {} 
		
		var tamanho = $(this).val().length;
		
	    if(tamanho == 11){
			$(this).unmask();
	        $(this).mask("999.999.999-99");
	    } else if(tamanho == 14){
			$(this).unmask();
	        $(this).mask("99.999.999/9999-99");
	    } 
		else
		{
			$(this).css({"color": "#fff", "background-color": "#d9534f", "border-color": "#d43f3a"});	
		}		
	  });

	window.getTotalPedido = function (somente_total_produtos) {
        var total_produtos = 0,
            total_somar = 0,
            total_descontos = 0;
        $('.'+$tabelas.tabela_informacoes+' > tbody > tr > td').each(function(i,e){
            var valor = valorMonetarioParaFloat( $(this).find('.td_input').val() );
            valor = isNaN(valor) ? 0 : valor;

            if(i <= 3) {
                total_somar += valor;
            } else if(i == 4) {
                total_descontos = valor;
            }
        })

        $('.'+$tabelas.tabela_produtos_man+' tbody > tr').each(function(e,i){
            let total_eu = valorMonetarioParaFloat($(this).find('td:nth-child(6) .td_input').val());
            total_eu = isNaN(total_eu) ? 0 : total_eu;

            total_produtos += total_eu;
        });

        if(somente_total_produtos) return total_produtos;

        let total_final = ( total_produtos + total_somar ) - total_descontos;
        total_final = total_final < 0 ? total_final * -1 : total_final;
        return total_final;
    }

    window.RecalcularTotal = function() {

    	setTimeout(function(){
			let total_final = getTotalPedido();
			$('.'+$inputs.total_pedido).val( formatarValorParaPadraoBr(total_final) );
			$('.total_produtos').val( formatarValorParaPadraoBr(getTotalPedido(true)) );
		}, 100);
		
    }

	// Função para atualizar o valor total da NF-e
	function AtualizarTotal(id, preco, quantidade)
	{
		var total = parseFloat(preco) * parseFloat(quantidade);	
		$("#tr_"+id+" > td > .total").val(formatarValorParaPadraoBr( total) );
		RecalcularTotal();
		/*var soma = 0;
		$('.total').each(function(){
			var valor = parseFloat(valorMonetarioParaFloat( $(this).val() ));
			soma = soma + valor;
		});
		var desconto = parseFloat(valorMonetarioParaFloat($('.total_desconto').val()));
		if(soma >= desconto)
		{
			$('.total_nfe').val(formatarNumeroCompleto( soma-desconto ));
		}
		$('.total_produtos').val(formatarNumeroCompleto(soma));*/
	}

	// Manipulação do campo de quantidade
	$("body").on('keyup','.qntd',function(){
		var id = $(this).attr('id');
		
		var preco_send =  valorMonetarioParaFloat($("#tr_"+id+" > td > .price").val());
		var quantidade_send = valorMonetarioParaFloat($(this).val());
		
		$("#tr_"+id+" > td > .total").change();
		
		// Aqui carrega a função e altera os valores
		AtualizarTotal(id, preco_send, quantidade_send);
		});
		
	// Manipulação do campo preço	
	// .on('focus',function(){
		$("body").on('keyup','.price',function(){
			RecalcularTotal()
		});

	// Quando o desconto é mudado o preço total é alterado	
	$("body").on('keyup',$inputs.total_desconto.class+',.'+$inputs.total_acrescimo,function(){
		var desconto = valorMonetarioParaFloat($(this).val());
		var total = valorMonetarioParaFloat($('.'+$inputs.total_produtos).val());
		var descontou = total - desconto;
		//descontou = descontou > 0 ? descontou : 0;
		if(!$(this).hasClass($inputs.total_acrescimo)) {
                if (descontou >= 0) {
                    RecalcularTotal();
                } else {
                	$(this).val(0).select();
                    $('.' + $inputs.total_pedido).val(formatarValorParaPadraoBr(total));
                }
		} else {
			if($('#tr_1 > td:nth-child(1) > input').val().length > 0) RecalcularTotal();
		}
		
	});
		
	//  Quando o codigo é adicionado e clicado em enter ou tab ele coloca nos campos as informações relativas ao produto
	$("body").on('blur','.'+$inputs.inp_codigo,function(event){
		if($(this).val().length > 0) {
			if($(this).attr($roles.role_use) != undefined) {
				setTimeout(function(){ $(this).closest('td').closest('tr').find('td:nth-child(1) > input').focus()}, 200);
			} else {
				getProdutoId(this, event);
			}
			$(this).removeAttr($roles.role_use)
			return false;
		}
	});

	$(document).on('keydown',function(e){
		var keypress =  'which' in e ? e.which : e.keyPress; 
		if(keypress == 107 || (e.shiftKey && keypress == 187)){
			GerarLinhaTabelaProdutos( idTabelaProdutos() );
		}
		
	});

	$("body").on("keydown",".td_input",function(e){

		if(e.which == 13 || e.keyCode == 13)
		{
			let tr = $(this).parent().parent().next(),
			td = $(this).parent().next();

			if(td.find('input.td_input, select.td_input').length != 0) { 
				td.find('input.td_input, select.td_input').select().focus();
			} else if(tr.find('input.td_input').first().length != 0) {
				tr.find('input.td_input').first().select().focus();
			} else if($(this).hasClass($inputs.cfop)) {
				$(this).trigger('blur');
			}
			//console.log($(this).parent().next().children(".td_input"));
			return false;
		}

	}).on('focus', '.td_input',function(e){
		if($(this).is('[readonly]')) {
			var td = $(this).parent();
			td.next().find('input.td_input, select.td_input').select().focus();
		}
	});

	// Remoção de elemento da tabela produtos
	$('body').on('click','.'+$botao.rmv_item,function(){
		if($(document.activeElement).hasClass('form-control')) {
			return false;
		}
		var id = parseInt( $(this).attr('role-id') ),
		tr = $(this).closest('tr'),
		role_id = tr.attr($roles.role_id),
		tbody = tr.parent();
		this.role_id = role_id;
		this.tbody = tbody;
		this.id = id;
		var este = this;
	    var remover_item = function(b) {
		        $('#tr_'+id).hide(300,function(){
		          RecalcularTotal();
		          $(this).remove();
		          b.modal('hide');
		          if(tbody.children('tr').length == 0 && role_id != undefined) {
		          	GerarLinhaTabelaProdutos( idTabelaProdutos() )
		          }
		        });
	    }
	    
	    let id_comparar = role_id != undefined ? 0 : id;
		/*if(id_comparar != 1)
		{*/
			if(tr.nextAll().length == 0) {
				return false;
			}
			confirmar("confirmar remoção do item? As ações serão efetivadas ao salvar.", function(a,b,c){
			      if(a) {
			      	if(este.role_id != undefined) {
			      		$("#form_nfe").append('<input type="hidden" name="cancelar[]" value="'+este.role_id+'">');
			      		remover_item(b);
			      		/*chamadaAjax({
			      			url: '/pre_vendas/cancelar/',
			      			type: 'DELETE',
			      			LoadMsg: 'Excluindo...',
			      			data: {consumo: este.role_id, pre_venda: doc_id.doc_id},
			      			success: function(ab){
			      				//$('.'+$tabelas.tabela_produtos_man).attr($roles.role_ultimo_item, ab.data_msg.ULTIMOS_ITENS[0] );
			      				remover_item(b);
			      			}
			      		});*/

			      	} else {
			      		remover_item(b);
			      	}

			      }
		    },undefined, undefined, 1);
		//}
		return false;
	});

	tb_man.on('LinhaRemovida', function(e,a){
		if($('.'+$tabelas.tabela_produtos_man).attr($roles.role_atualizar) != undefined) {
			setTimeout(function(){ AtualizarItens() }, 400);
		}
	})
	botaoLimparNfePedidos(sxidx);
	// Aqui é manipulado o envio do formulário
	$('#form_nfe').submit(function(){
		var dados = converterObjetoParaFloat(dadosFormularioParaJson( $(this).serializeArray() ), ["base_de_calc","base_de_calc_subst","desconto","icms","icms_subst","out_despesas",
	      "preco","quantidade","total","total_pedido","total_produtos","total_desconto","total_acrescimo"]),
		cpf_cnpj = $("#"+$inputs.cpf_cnpj).unmask().val(),
		grades_id = [], itens = [];
		let atualizar = $('.'+$tabelas.tabela_produtos_man).attr($roles.role_atualizar);
	  	if(atualizar != undefined) {
	  		dados.atualizar = 1;
	  		dados.id_estoque = atualizar;
	  		$('.'+$tabelas.tabela_produtos_man+' > tbody > tr').each(function(e){
	  			if($(this).attr($roles.role_id) == undefined) {
	  				itens.push( $(this).attr($roles.role_item) );
	  			}
	  		});
	  		dados.itens = itens;
	  	}

		$('.'+$tabelas.tabela_produtos_man+' > tbody > tr > td.grade_td').each(function(i){
			let grade_add = $(this).attr($roles.role_grade);
			if(grade_add != undefined && atualizar != undefined) {
				grades_id.push( grade_add );
			} else if(atualizar == undefined) {
				grades_id.push( grade_add );
			}
		});
	  	var vazios = getInputsVazios($("#form_nfe"));
	  	for(let i = 0; i < vazios.length; i++) {
	  		if(vazios[i] != undefined) {
	    		vazios[i] = vazios[i].replace('[]','')
	    	}
	    	//$('input[name*='+vazios[i]+']').val(0)
	  	} 

	  	if(dados.forma_pagto[0] == "-1") {
			var formas_pagto = [];
			for(var i in dados.forma_pagto) {
				if(i != 0){  
					formas_pagto.push(dados.forma_pagto[i])
			    } 	
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
			mostrarMensagemErroSucessoAlerta('É necessário inserir ao menos um produto', $('.'+$inputs.inp_codigo).first()[0]);
			return false;
		}

	  	dados.grades_id = grades_id;
	  	dados.tipo_pedido = tipo_pedido;
	  	dados.codigo = limparArray(dados.codigo);
	  	dados.id_entidade = $("#"+$inputs.nome_cliente_destin).attr($roles.role_id);
	  	dados.id_entidade = dados.id_entidade == undefined ? 0 : dados.id_entidade;
	  	dados.turno = dados.turno == undefined ? dados.turno : 1;
	  	dados.pdv = dados.pdv == undefined ? dados.pdv : 1;
	  	if(typeof doc_id != 'undefined') {
	  		if(doc_id.doc_id != undefined) {
				dados.pedido_id = doc_id.doc_id;
			}
		}
		var formas_pagto_id_att = [];
		$('.'+$inputs.forma_pagto).each(function(e,a){
			var forma_pagto_id = $(this).attr($roles.role_id);
			if(forma_pagto_id != undefined) {
				formas_pagto_id_att.push(forma_pagto_id);
			}
		});
		if(formas_pagto_id_att.length > 0) {
			dados.forma_pagto_id = formas_pagto_id_att;
		}

		var pago = valorMonetarioParaFloat($('.'+$inputs.total_valor_pago).val()),
		total_a_pagar = valorMonetarioParaFloat($('.'+$inputs.total_pedido).val());
		if(pago != total_a_pagar ) {
			mostrarMensagemErroSucessoAlerta('Os valores pagos e os totais não são iguais, por favor, revise-os');
			return false;
		}

		dados.total_pedido = getTotalPedido(true);
	  	//console.log(parseInt(dados.modelo_doc))

		if(validarCamposCpfCnpj(cpf_cnpj)) {
		    chamadaAjax({
		      url: '/produto/pre_venda/adicionar',
		      data: dados,
		      type: 'POST',
		      LoadMsg: 'Enviando...',
		      success: function(data) {
		        //$("."+$tabelas.tabela_produtos_man).find('tbody').html('');
		        /*$('input:visible:not(.custom-combobox)').val('');
		        sxidx.datepicker("setDate",new Date());*/
		        //$('.'+$botao.btn_limpar).trigger('click');
		        //$("."+$divs.custom_combobox).find('input').val( $("#"+$inputs.combobox).find('option:nth-child(1)').text() )
		        //GerarLinhaTabelaProdutos(0);
		        mostrarMensagemErroSucessoAlerta('Pedido registrado. Código: '+data.data_msg.PEDIDO_REGISTRADO, "#"+$inputs.nome_cliente_destin, false);
                  $('.'+$tabelas.tabela_produtos_man).attr($roles.role_atualizar, data.data_msg.PEDIDO_REGISTRADO);
                  doc_id.doc_id = data.data_msg.PEDIDO_REGISTRADO;
		      }
		    })
		}
		else
		{
			$("#"+$inputs.cpf_cnpj).focus();
		}
		return false;
	});
			
	// Autocomplete Clientes
	var url_usar = 'cliente/buscar',
	param = 'cliente';

	if(tipo_pedido == 4) {
		url_usar = 'fornecedor/buscar',
		param = 'fornecedor';
	}

	autoCompleteClienteUniversal(url_usar, param)

	    $('#'+$inputs.cpf_cnpj).on('blur', function(){
	    	var cnpj = $(this).val().replace(/\D/g,'');
	    	if(cnpj.length == 0) {
	    		mostrarMensagemErroSucessoAlerta('É necessário preencher o CPF/CNPJ',$("#"+$inputs.nome_cliente_destin)[0]);
	    		return false;
	    	}

	    	chamadaAjax({
	    		url:'/entidade/entidade/busca_cnpj',
	    		type: 'GET',
	    		data: {cnpj: cnpj},
	    		erro404: false,
	    		LoadMsg: 'Verificando...',
	    		error: function(xhr){
	    			if(xhr.status == 404) {
	    				confirmar('Esta entidade não está cadastrada, ela será cadastrada no final. Deseja continuar?',function(a,mo){
	    					if(!a) {
	    						$("#"+$inputs.nome_cliente_destin).select().focus()
	    					} else {
	    						setTimeout(function(){ $('#'+$inputs.cep).focus().select(); }, 250);
	    					}
	    					mo.modal('hide')
	    				})
	    			}
	    		}
	    	})
	    })
		
	  	// Autocomplete Tabela produtos
	    //gerarAutocompleteNomeProduto("#desc_produto_inicial");

	    ativarGrades(GerarLinhaTabelaProdutos);

	    $('body').on('blur', "."+$tabelas.tabela_produtos_man+" ."+$inputs.quantidade, function(e){
	        let tr = $(this).closest('tr'),
	        qntd_inserida =  $(this).val(),
			produto_id = tr.find("."+$inputs.inp_codigo).val();

			if(produto_id.length != 0 && qntd_inserida.length != 0) {
				if(!$(this).hasClass($ClassesAvulsas.n_gerar) && (parseInt(produto_id) != 0 && parseInt(qntd_inserida) != 0) ) {
					$("."+$tabelas.tbody_t1).find('tr').last().find('input:visible').each(function(e){
						valores_tr_ant += $(this).val().length;
					})
					var id = $('.'+$ClassesAvulsas.tbody_t1+' > tr').length;
					GerarLinhaTabelaProdutos(id);
				}
				$(this).removeClass($ClassesAvulsas.n_gerar)
			} else {
				if(qntd_inserida.length == 0) {
					mostrarMensagemErroSucessoAlerta('O campo Quantidade não pode estar vazio', tr.find(".qntd")[0]);
				}
				else if(produto_id.length == 0) {
					mostrarMensagemErroSucessoAlerta('O campo Código não pode estar vazio', tr.find("."+$inputs.inp_codigo)[0]);
				}
			}	
		}); 

	    $('body').on('keyup change','input',function(){
	    	var valor = $(this).val();
	    	$(this).attr('title',valor);
	    });

	    tb_man.on('LinhaRemovida LinhaAdicionada', function(e,i){
	    	RecalcularTotal();
	    });

	    //$('select:not(.no)').trigger('append').trigger('change');
	    function Null2Vazio($el, $passar) {
	    	var regex_data = /^\d{4}\-\d{1,2}\-\d{1,2}$/;
	    	if(($el == undefined || $el == null || ''+$el == 'false') && ''+$el != '0') {
	    		return '';
	    	} else if(''+$el == '0') {
	    		return 0;
	    	}

	    	if(regex_data.test($el)) {
	    		return getDataBR($el);
	    	}
	    	if($.isNumeric($el) && (""+$el).indexOf('.') != -1) {
	    		return formatarNumeroCompleto($el);
	    	}
	    	
	    	return $el;
	    }
	    // Completar
	    if(typeof doc_id != 'undefined') {

        	ativarRemocaoCompletaNota('/pre_vendas/cancelar_inteira/', {pre_venda: doc_id.doc_id});
        
	    	/*chamadaAjax({
	    		url: '/pre_vendas/Getpedido_compra_venda/',
	    		data: {pedido_id: doc_id.doc_id, tipo_pedido: pedido_tipo_pre},
	    		usarLoad: false,
	    		LoadMsg: 'Recuperando...',
	    		success: function(dados) {*/
	    			let tr_f = $("#tr_1"),
	    			dados_ret = doc_valores,
	    			cabecalho = dados_ret.CABECALHO,
	    			att_multiplas = [];
	    			$('.'+$tabelas.tabela_produtos_man).attr($roles.role_atualizar, cabecalho.ID);

	    			$.each(cabecalho, function(i, a){
	    				var chave = i.toLowerCase();
	    				if(chave != "pagto") {
		    				var el = $('#'+chave).length > 0 ? $('#'+chave) : ( $('.'+chave).length > 0 ? $('.'+chave) : undefined  );
		    				//console.log(chave+':',el)
		    				if(el != undefined) {
		    					let valor = Null2Vazio(a);
		    					if(!(getTagName(el) == 'select' && valor == 0)) {
		    						el.val(valor).trigger('change').trigger('blur')
		    					}
		    				}
	    				} else {
	    					$.each(a, function(e, pagto){
	    						if(a.length > 1) {
	    							att_multiplas.push('a');
	    							setTimeout(function(){ gerarLinhaFormaPagamento(pagto.FORMA_PAGTO_ID, pagto.VALOR, pagto.ID) }, 800);
	    							$('#'+$inputs.forma_pagto).attr($roles.role_id, pagto.ID).val("-1").trigger('change');
	    						} else {
	    							$('#'+$inputs.forma_pagto).attr($roles.role_id, pagto.ID).val(pagto.FORMA_PAGTO_ID);
	    						}
	    					})
	    				}
	    			})
	    			if(att_multiplas.length > 0) {
	    				setTimeout(function(){ adicionarFormasPagtosMultiplas(); }, 800);
	    				att_multiplas = null;
	    			}
	    			$.each(dados_ret.PRODUTOS, function(i,data){
	    				var tr = i == 0 ? $('#tr_1') : GerarLinhaTabelaProdutos(idTabelaProdutos() ,false,'add',false);
	    				$('.'+$tabelas.tabela_produtos_man).attr($roles.role_ultimo_item, data.ITEM );

	    				tr.attr($roles.role_item, data.ITEM).attr($roles.role_id, data.ID);
	    				$.each(data, function(j, dados_produtos){
		    				var chave = j.toLowerCase();
		    				if(chave != 'grade') {
		    					//console.log('2',tr);
		    					let el = tr.find('#'+chave).length > 0 ? tr.find('#'+chave) : ( tr.find('.'+chave).length > 0 ? tr.find('.'+chave) : undefined  );
		    					if(el != undefined) {
			    						let valor = Null2Vazio(dados_produtos);
			    						if(!(getTagName(el) == 'select' && valor == 0)) {
			    							valor = chave == 'valor_icms_st' ? valorMonetarioParaFloat(valor) : valor;
			    							el.val(valor).trigger('keyup');
			    						}
		    					} 
	    					}
	    					else {
	    						var grade = formatarNomeGrade(dados_produtos[0].ID,dados_produtos[0].TAMANHO,dados_produtos[0].COR);
	    						tr.find('td.grade_td > span').attr('title',grade).html(grade).tooltip();
	    					}
	    				})
	    				//tr.find('input:visible, select:visible').removeAttr('name').prop('disabled',true);
	    				tr.attr($roles.role_grade,'1').append('<input type="hidden" name="cod_item[]" value="'+data.ID+'">');
	    			})
	    			GerarLinhaTabelaProdutos(idTabelaProdutos(),true,'add');
	    			$('.td_input.'+$inputs.vendedor).trigger('chosen:updated')
	    		/*},
	    		error: function(e,a,b) {
	    			$('body').html('');
	    			Mask();
	    			mostrarMensagemErroSucessoAlerta(e.responseJSON.data_msg, false, true, undefined, {NuncaFechar: true});
	    		}
	    	});*/
	    }

		$('body').on('alterado keyup', '.'+$inputs.inp_codigo, function(e){

			if($(this).val().length > 0) {
				var tr = $(this).closest('td').closest('tr'),
				valor_st = tr.find('.'+$inputs.valor_icms_st),
				valor_st_v = parseInt(valor_st.val());

				tr.find('.'+$inputs.inp_codigo+", ."+$inputs.desc_produto+", ."+$inputs.preco_compra+
						', .'+$inputs.quantidade).attr('required','required');
			} else {

				if(tr != undefined) {
					tr.find('.'+$inputs.inp_codigo+", ."+$inputs.desc_produto+", ."+$inputs.preco_compra+
							', .'+$inputs.quantidade+', .'+$inputs.cfop+', .'+$inputs.ncm+', .'+$inputs.aliquota_icms)
					.removeAttr('required');
				}
			}
		});	 

		function limpa_formulário_cep() {
	        // Limpa valores do formulário de cep.
	        $("#endereco").val("");
	        $("#bairro").val("");
	        $("#cidade").val("");
	        $("#uf").val("");
        }
            
        //Quando o campo cep perde o foco.
        $("#cpf_cnpj").blur(function() {

            //Nova variável "cep" somente com dígitos.
            var cep = $(this).val().replace(/\D/g, '');

            //Verifica se campo cep possui valor informado.
            if (cep != "") {

                //Expressão regular para validar o CEP.
                var validacep = /^[0-9]{8}$/;

                //Valida o formato do CEP.
                if(validacep.test(cep)) {

                    //Preenche os campos com "..." enquanto consulta webservice.
                    //$("#endereco").val("...");
                    //$("#bairro").val("...");
                    $("#cidade").val("...");
                    $("#uf").val("...");

                    //Consulta o webservice viacep.com.br/
                    $.getJSON("//viacep.com.br/ws/"+ cep +"/json/?callback=?", function(dados) {

                        if (!("erro" in dados)) {
                            //Atualiza os campos com os valores da consulta.
                            //$("#endereco").val(dados.logradouro);
                            //$("#bairro").val(dados.bairro);
                            $("#cidade").val(dados.localidade);
                            $("#uf").val(dados.uf);
                        } //end if.
                        else {
                            //CEP pesquisado não foi encontrado.
                            //limpa_formulário_cep();
							$(".head_modal_cep").html("CEP não encontrado");
							$("#txt_modal_cep").html("O CEP digitado não foi encontrado, por favor, digite outro cep.");
                            $('#modal_cep_erro').modal('show');
                        }
                    });
                } //end if.
                else {
                    //cep é inválido.
                    //limpa_formulário_cep();
					$(".head_modal_cep").html("CEP Inválido");
					$("#txt_modal_cep").html("O CEP digitado não é válido, por favor, digite outro cep.");
                    $('#modal_cep_erro').modal('show');
                }
            } //end if.
            else {
                //cep sem valor, limpa formulário.
                //limpa_formulário_cep();
            }
        });
    $('body').on('focus','.td_input.total', function(){
    	var tr = $(this).closest('tr');
    	setTimeout(function(){ tr.find('.'+$inputs.vendedor).focus() }, 300)
	})
        //AtivarVendedorChosen();
});