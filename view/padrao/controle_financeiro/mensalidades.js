$(document).ready(function(e){
	navegacaoEntreInputsEmUmaMesmaDiv('.inputs_filtros', (ultimo, input) => {
		if(ultimo) {
			setTimeout(() => {
                $('.botoes_filtros button[type="submit"]').focus();
			}, 250)
		}
	})

	var tamanho_tabela = ()=>{
		return tamanhoPercentualWindow(0.6293500738552437)+'px'
	}

    var opcoes_tabela = function(inicial) { 

        var retorno = {
            "language": idioma,
            searching: true,
            scrollY:        tamanho_tabela(),
            //scrollX:        true,
            //scrollCollapse: true,
            paging:         false,
            info:           false,
            // As duas opções abaixo são referentes, respectivamente, a coluna de seleção e a de mostrar mais das faturas
            initComplete: function(settings, json) {
                this.fnAdjustColumnSizing();
                var input = $('.dataTables_filter input')
                .addClass('form-control').attr('placeholder','Pesquisar fatura');
                $(".dataTables_empty").hide();
                //$('div.dataTables_scrollBody').css('min-height', 0);
                //$('.dataTable').wrap('<div class="dataTables_scroll" />');
                /*if(inicial) {
                    $(".dataTables_empty").hide();
                }*/
            },
            createdRow: function(row, data, index) {
                //this.fnAdjustColumnSizing();
                //console.log('criada',row,data,index,this)
            }
        }

    	retorno.columnDefs = [ {
            orderable: false,
            className: 'select-checkbox',
            targets:   0,
            //width: '20px',
        }];

        retorno.select = {
            style:    'os',
            selector: 'td:first-child'
        };
        

        return retorno;
    };

	$(window).resize(function(){
    	$('.dataTables_scrollBody').css({height: tamanho_tabela()});
    })

    var tabela = $('#'+$tabelas.tabela_boletos).DataTable(opcoes_tabela(true));
    $('.'+$inputs.select_bancos).chosen2({
    	width: "100%"
    });

	$('.chosen-container').click().addClass('chosen-container-active').trigger('mousedown');

    options_datePicker.dateFormat = "mm/yy";
    options_datePicker.dateFormatMask = "00/0000";
    options_datePicker.showButtonPanel = true;
    options_datePicker.onClose =  function(dateText, inst) {
        function isDonePressed(){
            return ($('#ui-datepicker-div').html().indexOf('ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all ui-state-hover') > -1);
        }

        //if (isDonePressed()){
            var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
            var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
            $(this).datepicker('setDate', new Date(year, month, 1)).trigger('change');
            
             $('.date-picker').focusout()//Added to remove focus from datepicker input box on selecting date
        //}
    };
    options_datePicker.beforeShow = function(input, inst) {

                    inst.dpDiv.addClass('month_year_datepicker')

                    if ((datestr = $(this).val()).length > 0) {
                        year = datestr.substring(datestr.length-4, datestr.length);
                        month = datestr.substring(0, 2);
                        $(this).datepicker('option', 'defaultDate', new Date(year, month-1, 1));
                        $(this).datepicker('setDate', new Date(year, month-1, 1));
                        $(".ui-datepicker-calendar").hide();
                    }
   	}

	var sxidx = $('.'+$inputs.data_consultar).datepicker(options_datePicker);
	sxidx.datepicker('option', "showOn","button");
	sxidx.datepicker('option', "buttonText", '<i class="fas fa-calendar"></i>');
	sxidx.datepicker("setDate",new Date()).trigger('change');
//consultados
//selecionados
	
	function PreencherDadosTabela(dados) {
		var remessa = '',
		emitido = '';
		if(dados.REMESSA_BOLETO_ID != null && parseInt(dados.REMESSA_BOLETO_ID) != 0) {
			remessa = dados.REMESSA_BOLETO_ID;
			emitido = $ClassesAvulsas.emitido;
		}
		
		var dados_add = '';
		dados_add = '<td></td>';
		dados_add += '<td>'+dados.DOCUMENTO+'</td>';
		dados_add += '<td>'+dados.NOME+'</td>';
		dados_add += '<td>'+getDataBR(dados.EMISSAO)+'</td>';
		dados_add += '<td>'+getDataBR(dados.VENCIMENTO)+'</td>';
		dados_add += '<td>'+formatarNumeroCompleto(dados.VALOR)+'</td>';
		dados_add += '<td>'+remessa+'</td>';
		var rows_add = $('<tr class="'+emitido+'" />').prepend(dados_add)
		return rows_add[0]
	}
	
	var gerar_boletos = '.'+$botao.btn_gerar+'['+$roles.role_id+'=2]';

	function AtualizarLinhasSelecionadas(){
		var selecionados = $('#'+$tabelas.tabela_boletos).find('.selected').length;

		if(selecionados > 0) {
			$(gerar_boletos+', .'+$botao.btn_acao).show();
		} else {
			$(gerar_boletos+', .'+$botao.btn_acao).hide();
		}
		
		$('selecionados').html(selecionados+' '+(selecionados > 1 ? "Selecionados" : "Selecionado"))
	}

	// Para Debug
	window.TB = function(){
		return tabela;
	}

	tabela.on( 'deselect', function ( e, dt, type, indexes ) {
		AtualizarLinhasSelecionadas();
	})
	tabela.on( 'select', function ( e, dt, type, indexes ) {
		AtualizarLinhasSelecionadas();
	});

	$('.'+$form.dados_filtros).on('submit', function(){
		var dados = dadosFormularioParaJson($(this).serializeArray());
		$('.selecionar-todos').prop('checked', false);	
		$(gerar_boletos+', .'+$botao.btn_acao).hide();

		chamadaAjax({
			url: '/controle_financeiro/mensalidade/buscar',
			type: 'GET',
			data: dados,
			LoadMsg: 'Consultando...',
			success: function(ok){
				var linhas_adicionar = [], dados_retornados = ok.data_msg, qntd_retornados = dados_retornados.length;

				$('consultados').html(qntd_retornados+" "+( qntd_retornados > 1 ? "Mensalidades" : "Mensalidade" ))
				$.each(dados_retornados, function(i, dados){
					linhas_adicionar.push(PreencherDadosTabela(dados))
					//DOCUMENTO: "0019211809", VENCIMENTO: "2018-10-10", VALOR: "494.00", EMISSAO: "2018-08-14"
				});
				TB().rows().clear().draw();
				tabela.rows.add(linhas_adicionar).draw(false);
			}, 
			error: function(e) {
				TB().rows().clear().draw();
				$('consultados').html('0 Mensalidade')
				$('selecionados').html('0 Selecionado')
				$(".dataTables_empty").hide();
			}
		});
		return false;
	});
	function BlocoEnvioBoletos(max_envio,emitidos) {
		max_envio = max_envio == undefined ? 10 : max_envio;
		emitidos = emitidos == undefined ? false : emitidos;
		if(emitidos == 'tudo') { 
			emitidos = '';
		} else {
			emitidos = emitidos ? '.'+$ClassesAvulsas.emitido : ':not(.'+$ClassesAvulsas.emitido+')';
		}
		emitidos = 'tr.selected'+emitidos;

		var qntd_selecionadas = $("#"+$tabelas.tabela_boletos).find(emitidos).length,
		qntd_rodar = Math.ceil( qntd_selecionadas / max_envio );

		var enviar = []
		function Rodar(rodar,max, i, pag,selecteds) {
			i = i == undefined ? 1 : i;
			pag = pag == undefined ? 1 : pag;
			selecteds = selecteds == undefined ? 0 : selecteds;

			var enviar_add = [];
		    for(var i = i; i <= max; i++) {
				
				if(i <= qntd_selecionadas){
		        	enviar_add.push( $($("#"+$tabelas.tabela_boletos).find(emitidos).get((i - 1))).children('td:nth-child(2)').text() );
					selecteds++;
		        }
		    }
			enviar.push(enviar_add)
			pag++;
			if(selecteds < qntd_selecionadas) {
				return Rodar(rodar, (max + max_envio), (max + 1), pag, selecteds);
			} else {
				return enviar;
			}
		}
		return Rodar(qntd_rodar, max_envio);
	}

	var cancelarGeracao = {
		cancelar: false,
		set Cancele($cancelar) {
			this.cancelar = $cancelar;
		},
		get Cancelar() {
			return this.cancelar;
		}
	},
	RodadaAtualBoletos = {
		ajax: false,
		set Aj($ajax) {
			this.ajax = $ajax;
		},
		get Aj(){
			return this.ajax;
		}
	},
	modal_envio_progresso = criarModal({
		classModal: $modais.modal_envio_progresso,
		title: 'Gerando Boletos...',
		conteudo: '<div class="progress"><div class="progress-bar '+$divs.progresso_envio_boletos+'" role="progressbar" style="width: 0%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">0%</div></div>',
		btns:['Cancelar','Ok'],
		ModalCentralizado: true,
		btn_close: 1,
		notClose: true,
		clickBtn: function(a,b, modal_raiz){
			if(b == 1) {
				if(!$('.'+$divs.progresso_envio_boletos).hasClass($ClassesAvulsas.concluido)) {
					confirmar('Você tem certeza que quer cancelar a geração dos boletos?', function(a,modal){
						if(a) {
							modal_raiz.modal('hide');
							cancelarGeracao.cancelar = true;
							RodadaAtualBoletos.ajax.abort();
						} 
						modal.modal('hide');
					},modal_raiz, 1,'centro')
				}				
			}
		},
		Close: function(){
			$('.'+$modais.modal_envio_progresso+' button['+$roles.role_id_seq+'=2]').hide();
		},
		Criou: function(a){
			$('.'+$modais.modal_envio_progresso+' button['+$roles.role_id_seq+'=2]').hide();
		}
	});

	var conta_usar = () => {
		return $('.'+$inputs.select_bancos).val()
	}

	var remessas_imprimir = {
		remessa_nsu: [],
		set R($r) {
			this.remessa_nsu = $r;
		},
		get R(){
			return this.remessa_nsu;
		}
	};

	var ImprimirBoletos = (ignorar_remessas) => {
		if(remessas_imprimir.remessa_nsu.length > 0 && ignorar_remessas == undefined) {
			this.remessa_imprimir = remessas_imprimir.remessa_nsu;
			var th = this;
			confirmar('Deseja imprimir os arquivos de remessa '+(th.remessa_imprimir.join(',')),
				function(a,b){
				if(a) {
					var form_d = new FormData();
					form_d.append('remessas',JSON.stringify(th.remessa_imprimir));

					chamadaAjax({
						url: '/boleto/boleto/remessa_avulsa',
						data: form_d,
						processData: false,
						contentType: false,
						timeout: 60000,
						type: 'POST',
						success: function(retorno) {
							var arquivo = retorno.data_msg
							arquivo_down = arquivo.arq,
							excluir = false;

							if(arquivo.zip != undefined) {
								arquivo_down = arquivo.zip;
								excluir = true;
							}
							DownloadArquivo(arquivo_down, excluir);
							ImprimirBoletos(true);
						}
					})
				} else {
					ImprimirBoletos(true);
				}
				b.modal('hide');
			}, 'centro')

			return false;
		}
		var boletos = BlocoEnvioBoletos($("#"+$tabelas.tabela_boletos).find('tr.selected').length, 'tudo'),
		ajaxData = new FormData();
		ajaxData.append('documento',JSON.stringify(boletos))
		chamadaAjax({
				url: '/boleto/boleto/prepararImpressao',
				type: 'POST',
				LoadMsg: 'Solicitando...',
				data: ajaxData,
				processData: false,
				contentType: false,
				timeout: 60000,
				success: function(ok) {
					chamadaAjax({
						AbrirLink: true,
						url: '/boleto/boleto/imprimir',
						data: {conta_usar: conta_usar()}
					})	
				} 
			})	
	}

	$('body').on('click',"."+$botao.btn_gerar,function(e,tipo,download_remessa){
		tipo = tipo == undefined ? $(this).attr($roles.role_id) : tipo;
		download_remessa = download_remessa == undefined ? false : download_remessa;

		if(tipo != 2) {
			chamadaAjax({
				url: '/controle_financeiro/mensalidade/gerar',
				type: 'PUT',
				LoadMsg: 'Gerando...', 
				data: {data_gerar: $('input[name="'+$inputs.data_consultar+'"]').val()},
				success: function(ok) {
					var geradas = ok.data_msg[0].MENSALIDADES_GERADAS;
					if(geradas == 0) { 
						mostrarMensagemErroSucessoAlerta('Não há mensalidades a ser geradas', false, 'warning');
					} else {
						mostrarMensagemErroSucessoAlerta(geradas+' Mensalidades geradas para o mês selecionado',false, false);
						var elemento = $('select[name=tipo_consultar]'),
						valor_old = elemento.val();
						elemento.val(2);
						$('.'+$form.dados_filtros).trigger('submit');
						setTimeout(()=>{
							elemento.val(valor_old);
						},200)

					}
				} 
			})
		} else {
			var bloco = BlocoEnvioBoletos(5, false);
			if(bloco[0].length > 0) {
				cancelarGeracao.cancelar = false;
				$('.'+$modais.modal_envio_progresso+' button['+$roles.role_id_seq+'=1]').show();
				function EnviarBoletosParaGerar(pag, fila) {
					var qntd_blocos = bloco.length,
					pag_contar = pag + 1;
					
					if(pag == 0) {
						$("."+$divs.progresso_envio_boletos)
								.css({width: '0%'})
								.text('0%')
								.removeClass($ClassesAvulsas.concluido);
						modal_envio_progresso.abrirModal();
					}
					var dados_enviar = {documento: JSON.stringify(bloco[pag]), conta_usar: conta_usar()};
					
					if(pag_contar == qntd_blocos) {
						dados_enviar.finalizar_zip = 'true';
					}
					if( bloco[0].length != 1 ) {
						if(pag <= qntd_blocos) {
							dados_enviar.em_fila = (fila == undefined) ? 'true' : fila;
						}
					}
					if(download_remessa) {
						dados_enviar.somente_remessa = true;
					}
					var geracao_boletos = chamadaAjax({
						//AbrirLink: true,
						url: '/boleto/boleto/gerar',
						type: 'POST',
						timeout: 60000,
						data: dados_enviar,
						success: function(ok) {
							var retorno = ok.data_msg, 
							porcentagem_conclusao_real = Math.ceil(Percent(qntd_blocos, pag_contar ));

							if(porcentagem_conclusao_real <= 100) {
								var porcentagem_conclusao = porcentagem_conclusao_real+"%",
								concluido =  '';
								if(porcentagem_conclusao_real == 100) {
									concluido = $ClassesAvulsas.concluido;
									$('.'+$modais.modal_envio_progresso+' button['+$roles.role_id_seq+'=1]').hide();
									$('.'+$modais.modal_envio_progresso+' button['+$roles.role_id_seq+'=2]').show();
								}

								$("."+$divs.progresso_envio_boletos)
								.css({width: porcentagem_conclusao})
								.text(porcentagem_conclusao)
								.addClass(concluido);
							}

							if(pag_contar < qntd_blocos) {
								if(!cancelarGeracao.cancelar) {
									var fila_enviar = ok.data_msg.fila;
									EnviarBoletosParaGerar(pag_contar, fila_enviar)	
								} else {
									cancelarGeracao.cancelar = false;
								}
							}

							if(retorno.download_zip != undefined || retorno.download_boleto != undefined || retorno.download_remessa != undefined) {
								let permimtidos_for = ['download_zip','download_boleto','download_remessa'];
								for(var i in retorno) {
									if(permimtidos_for.indexOf(i) != -1) {
										DownloadArquivo(retorno[i]);
									}
								}

								$("#"+$tabelas.tabela_boletos).find('tr.selected:not(.'+$ClassesAvulsas.emitido+')')
								.each(function(i,a){
										$(a).addClass($ClassesAvulsas.emitido).find('td:nth-child(7)').text(retorno.nsu);
								})

								if(download_remessa){ 
									ImprimirBoletos();
							
								}

							}
						}, error: function(a) {
							$("."+$divs.progresso_envio_boletos)
								.css({width: '100%'})
								.text('100%')
								.addClass($ClassesAvulsas.concluido);
							$('.'+$modais.modal_envio_progresso+' button['+$roles.role_id_seq+'=2]').show();
							$('.'+$modais.modal_envio_progresso+' button['+$roles.role_id_seq+'=1]').hide();
							console.log(a);
						}
					})

					RodadaAtualBoletos.ajax = geracao_boletos;
				}
				EnviarBoletosParaGerar(0);
				/*
				chamadaAjax({
					AbrirLink: true,
					url: '/boletos/imprimir',
					data: {documento: JSON.stringify(documentos), conta_usar: conta_usar}
				})*/
				//jQuery.param({documento: documentos, conta_usar: conta_usar});
			} else {
				mostrarMensagemErroSucessoAlerta('Os boletos selecionados já foram gerados, por favor selecione os que ainda não foram');
			}

		}
	});

	$('body').on('click','.'+$botao.btn_acao, function(){
		var tipo = parseInt($(this).attr($roles.role_id));
		if(tipo == 1) {	
			var remessa_nsu = [];
			$("#"+$tabelas.tabela_boletos).find('tr.selected.'+$ClassesAvulsas.emitido).each(function(i, a){
				var remessa = $(a).find('td:nth-child(7)').text();
				if(remessa_nsu.indexOf(remessa) == -1) {
					remessa_nsu.push(remessa);
				}
			})

			remessas_imprimir.remessa_nsu = remessa_nsu;

			if($("#"+$tabelas.tabela_boletos).find('tr.selected:not(.'+$ClassesAvulsas.emitido+')').length > 0) {
				$('.'+$botao.btn_gerar+'['+$roles.role_id+'=2]').trigger('click',[2, true]);
				return false;
			}
			ImprimirBoletos();
			/*for(var i in boletos) {
				chamadaAjax({
					AbrirLink: true,
					url: '/boletos/imprimir',
					data: {documento: JSON.stringify(boletos[i]), conta_usar: conta_usar()}
				})				
			
			}*/

		} else if(tipo == 2) {}
	})


	$('body').on('click','.selecionar-todos', function(){
		if($(this).is(':checked'))
			tabela.rows().select()
		else
			tabela.rows().deselect()
	})

})