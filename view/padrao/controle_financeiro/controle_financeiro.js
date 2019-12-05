//(function(){

    navegacaoEntreInputsEmUmaMesmaDiv('.form-dados-cabecalho', function(ultimo,a,b) {
        if(ultimo) b.trigger('blur');
    });

    setTimeout(() => {
        $('#data_historico').select().focus();
    }, 250)

    var saldo = {
        ant: 0,
        at: 0,
        set anterior(ant) {
            $('saldo-anterior').text(formatarValorParaPadraoBr(ant))
            this.ant = ant;
        },
        get anterior() {
            return this.ant;
        },
        set atual(at) {
            $('saldo-atual').text(formatarValorParaPadraoBr(at))
            this.at = at;
        },
        get atual() {
            return this.at;
        }
    }

    saldo.anterior = saldo_anterior;
    //saldo.atual = saldo_atual;

    var options_datePicker = {
        changeMonth: true,
        changeYear: true,
        usarBotao: true,
        usarDataAtual: true
    };

    var data_historico = $('#data_historico').datepicker(options_datePicker);


    $('#plano_de_conta').on('change',function(){
        var id_conta = $(this).val();
        var tipo_conta = plano_contas_usar[id_conta];
        var valor_input = $("#valor");
        var opcs_valor = valor_input.attr($roles.data_option);
        var valor_val_input = valor_input.val();

        if(tipo_conta == "D") {
            valor_val_input = (valor_val_input.indexOf('-') == -1 && valor_val_input.length > 0) ? '-'+valor_val_input : valor_val_input;
            opcs_valor = opcs_valor.replace('negativo: false','negativo: true');
        } else {
            valor_val_input = valor_val_input.replace('-','');
            opcs_valor = opcs_valor.replace('negativo: true','negativo: false');
        }

        valor_input.val(valor_val_input).attr($roles.data_option, opcs_valor)

    })

    $('#conta_corrente, #plano_de_conta, #centro_de_custo').chosen2();
    $('#plano_de_conta').trigger('change')

    var atualizarSaldoLancamentos = function() {
        setTimeout(function() {
            if(tabelaLancamentos.objJqueryDataTable() != undefined) tabelaLancamentos.objJqueryDataTable().destroy();

            tabelaLancamentos.find('tbody tr').each(function(i, el){
                el = $(el);
                var primeiro = i == 0;
                var id = el.find('td:nth-child(2)').text();
                var valor = valorMonetarioParaFloat( el.find('td:nth-child(7)').text() );
                var arrayUsar = valor > 0 ? creditoArr : debitoArr;

                var saldo_somar = primeiro ? saldo.anterior : saldo.atual;
                var saldo_final = parseFloat(valor) + parseFloat(saldo_somar);

                saldo.atual = saldo_final;
                //arrayUsar[id].saldo = saldo_final;

                el.find('td:nth-child(8)').text(formatarValorParaPadraoBr(saldo_final));
            })

            tabelaLancamentos.ativarJqueryDataTable();
        }, 400)
    }

    var creditoArr = {};
    var debitoArr = {};

    var thead_universal = ['Id','Data','Plano','Documento','Histórico do lançamento','Valor R$','Saldo R$'];

    var tabelaLancamentos = $('.lancamentos-forms').gerarTabela({
        classesTabela: ['table', 'table-striped'],
        cabecalho: thead_universal,
        corpo: [[
            '','','','','','',''
        ]],
        linhaAdicionada: function(linha, tabela) {
            atualizarSaldoLancamentos();
            if($('.dataTables_scrollBody').length > 0) {
                if( $('.dataTables_scrollBody').hasScrollBar()) $('.lancamentos-forms').addClass('redimensionar')
            }
        },
        linhaRemovida: function(linha, posicaoLinha, ultimaLinha, tabela) {
            atualizarSaldoLancamentos();
            if($('.dataTables_scrollBody').length > 0) {
                if( !$('.dataTables_scrollBody').hasScrollBar()) $('.lancamentos-forms').removeClass('redimensionar')
            }
        },
        clickRemocaoLinha: function(linha, posicaoLinha, ultimaLinha, tabela) {
            var id = linha.find('td:nth-child(2)').text();
            var data = linha.find('td:nth-child(3)').text();
            var documento = linha.find('td:nth-child(5)').text();
            var historico = linha.find('td:nth-child(6)').text();
            var valor = linha.find('td:nth-child(7)').text();
            var valor_convertido = valorMonetarioParaFloat(valor);
            var conta_corrente = $('#conta_corrente').val();
            var arrayUsar = valor_convertido > 0 ? creditoArr : debitoArr;

            var msg = 'Você deseja excluir o lançamento de id ' + id + ' lançado na data ' +
            data + ' com o documento ' + documento + ' de histórico ' + historico + ' e valor R$ ' +
            valor;

            var excluir = function() {
                chamadaAjax({
                    url: '/controle_financeiro/controle_financeiro/remover_controle_mov',
                    data: {id_excluir: id, data: getDataBR(data,true), conta_corrente: conta_corrente},
                    type: 'DELETE',
                    LoadMsg: 'Removendo...',
                    dataType: 'JSON',
                    success: function(ok) {
                        var dados = ok.data_msg;
                        var msg = dados.msg;
                        var saldo_at = dados.saldo_atual.SALDO;

                        saldo.atual = saldo_at;

                        mostrarMensagemErroSucessoAlerta(msg, false, false);

                        tabelaLancamentos.removerLinha(linha);

                        if(typeof arrayUsar[id] != "undefined") delete arrayUsar[id];
                    }
                })
            };

            confirmar(msg, function(a,b) {
                if(a) {
                    excluir();
                    b.modal('hide');
                }
            })

            return false;
        },
        tabelaCarregada: function(tabela) {

            navegacaoEntreInputsEmUmaMesmaDiv(tabela.find('tbody'), function(ultimo, input, atual){
                if(ultimo) atual.blur();
            })

            setTimeout(() => {
                iniciarOutras();
            }, 100)
        },
        usarJqueryDataTable: true,
        opcoesJqueryDataTable: {
            "language": idioma,
            searching: true,
            scrollY: '450px',
            //scrollX:        true,
            //scrollCollapse: true,
            paging:         false,
            info:           false,
            initComplete: function() {
                setTimeout(() => {
                    tabelaLancamentos.find('input[type="search"]').addClass('form-control')
                    .attr('placeholder','Pesquisar')
                }, 100)
            }
        },
        tempoRemocaoLinha: 400,
        removerLinhaClicadaAuto: false,
        alinharBotaoRemocao: 'esq',
        classesAdicionaisBotaoRemover: ['rmv_item']

    });

    setInterval(function() {
        if($('.dataTables_scrollBody').length > 0) {
            if( $('.dataTables_scrollBody').hasScrollBar()) $('.lancamentos-forms').addClass('redimensionar')
            else $('.lancamentos-forms').removeClass('redimensionar')
        }
    }, 600)

    var dadosAddLancamento = function(dados, lancaCreditoDebitoAba) {
        var saldo = retornoUndefined(dados.saldo, 0);

        if(lancaCreditoDebitoAba != true) {
            var valor = parseFloat(dados.valor);

            if(valor > 0) {
                creditoArr[dados.id] = dados;
            } else {
                debitoArr[dados.id] = dados;
            }
        }

        var arrayRetorno = [
            dados.id,
            getDataBR(dados.data_historico),
            dados.plano_de_conta,
            dados.documento,
            dados.historico_lancamento,
            formatarValorParaPadraoBr(dados.valor)
        ];

        if(lancaCreditoDebitoAba != true) {
            arrayRetorno.push(formatarValorParaPadraoBr(saldo));
        }

        return arrayRetorno;
    }

    var tabelaResumoDiario = $('#resumo-diario').gerarTabela({
        classesTabela: ['table', 'table-striped','table-bordered'],
        cabecalho: ['Id','Plano de Conta','Total R$'],
        corpo: [[
            '','',''
        ]],
        tabelaCarregada: function() {
        },
        usarJqueryDataTable: true,
        usarRemocaoLinha: false,
        opcoesJqueryDataTable: {
            "language": idioma,
            searching: true,
            scrollY: '350px',
            //scrollX:        true,
            //scrollCollapse: true,
            paging:         false,
            info:           false,
            initComplete: function() {
                setTimeout(() => {
                    tabelaResumoDiario.find('input[type="search"]').addClass('form-control')
                    .attr('placeholder','Pesquisar')
                }, 100)
            }
        },
    })


    var dadosAddLancamentoDiario = function(dados) {

        return [
            dados.ID,
            dados.PLANO_CONTA,
            formatarValorParaPadraoBr(dados.TOTAL)
        ];
    }

    var calcularSaldoTotalResumo = function(valor_final) {
        if(valor_final == undefined) {/*$('#resumo-total').is(':checked') ? 0 : */
            var somar = parseFloat(saldo.anterior);
            valor_final = somar;

            $('#resumo-diario').find('tbody tr td:nth-child(3)').each(function (i, el) {
                el = $(el);
                var total_linha = valorMonetarioParaFloat(el.text());
                valor_final += total_linha;
            })
        }

        $('saldo-atual-resumo').text(formatarValorParaPadraoBr(valor_final));

    }

    var getResumoDia = function(so_dia_atual) {
        var data = getDataBR($('#data_historico').val(), true);
        var conta_corrente = $('#conta_corrente').val();
        var linhas_add = [];

        chamadaAjax({
            url: '/controle_financeiro/controle_financeiro/resumo_mov_conta_diario/' + (so_dia_atual === true ? 'dia' : ''),
            data: {data: data, conta_corrente: conta_corrente},
            LoadMsg: 'Buscando...',
            dataType: 'JSON',
            success: function(ok) {
                var dados = ok.data_msg;
                tabelaResumoDiario.limparTabela();
                for(var i in dados) {
                    var dados_td = dados[i];
                    linhas_add.push(dadosAddLancamentoDiario(dados_td))
                }

                tabelaResumoDiario.adicionarLinha(linhas_add);
                calcularSaldoTotalResumo();
            },
            error: function(ok) {
                calcularSaldoTotalResumo(0);
            }
        })
    }

    var tabelaCredito = false;
    var tabelaDebito = false;
    var theadao = thead_universal.slice();

    var iniciarOutras = function() {
        //theadao.shift();
        theadao.pop();

        tabelaCredito = $('#creditos-lanca').gerarTabela({
            classesTabela: ['table', 'table-striped', 'table-bordered'],
            cabecalho: theadao,
            corpo: [[
                '', '', '', '', '', ''
            ]],
            usarJqueryDataTable: true,
            usarRemocaoLinha: false,
            opcoesJqueryDataTable: {
                "language": idioma,
                searching: true,
                scrollY: '450px',
                //scrollX:        true,
                //scrollCollapse: true,
                paging:         false,
                info:           false,
                initComplete: function() {
                    setTimeout(() => {
                        tabelaCredito.find('input[type="search"]').addClass('form-control')
                        .attr('placeholder','Pesquisar')
                }, 300)
                }
            }
        });

        tabelaDebito = $('#debitos-lanca').gerarTabela({
            classesTabela: ['table', 'table-striped', 'table-bordered'],
            cabecalho: theadao,
            corpo: [[
                '', '', '', '', '', ''
            ]],
            usarJqueryDataTable: true,
            usarRemocaoLinha: false,
            opcoesJqueryDataTable: {
                "language": idioma,
                searching: true,
                scrollY: '450px',
                //scrollX:        true,
                //scrollCollapse: true,
                paging:         false,
                info:           false,
                initComplete: function() {
                    setTimeout(() => {
                        tabelaDebito.find('input[type="search"]').addClass('form-control')
                        .attr('placeholder','Pesquisar')
                }, 300)
                }
            }
        });

        setTimeout(function(){
            $('.nav-link.disabled').removeClass('disabled')
        }, 300)
    }

    if(typeof naolimpar == "undefined") {
        tabelaLancamentos.limparTabela();
    }

    var getDadosCreditoDebitoAba = function(tipo) {
        // 1 -> credito, 2 -> debito
        tipo = retornoUndefined(tipo, 1);

        var arrUsar = tipo == 1 ? creditoArr : debitoArr;
        var dadosMontar = [];
        for(var i in arrUsar) {
            var dados = arrUsar[i];
            dadosMontar.push(dadosAddLancamento(dados,true));
        }

        return dadosMontar;
    }


    function calcularTotalCreditoDebito() {
        const creditos = getDadosCreditoDebitoAba();
        const debitos = getDadosCreditoDebitoAba(2);

        let totalCredito = 0;
        let totalDebito = 0;

        creditos.map((credito) => {
            var valorCredito = valorMonetarioParaFloat(credito[(credito.length - 1)]);
            totalCredito += valorCredito;
        });

        debitos.map((debito) => {
            var valorDebito = valorMonetarioParaFloat(debito[(debito.length - 1)]);
            totalDebito += (valorDebito * -1);
        });

        $('total-creditos').text(formatarValorParaPadraoBr(totalCredito));
        $('total-debitos').text(formatarValorParaPadraoBr(totalDebito));
    }

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var tab = $(this).attr('aria-controls').toLowerCase();

        if(tab == 'creditos') {
            calcularTotalCreditoDebito();
            var addLinhas = getDadosCreditoDebitoAba();
            tabelaCredito.limparTabela();

            if(addLinhas.length > 0) tabelaCredito.adicionarLinha(addLinhas);

            tabelaCredito.ativarJqueryDataTable();
        } else if(tab == 'debitos') {
            calcularTotalCreditoDebito();
            var addLinhas = getDadosCreditoDebitoAba(2);
            tabelaDebito.limparTabela();

            if(addLinhas.length > 0) tabelaDebito.adicionarLinha(addLinhas);

            tabelaDebito.ativarJqueryDataTable();
        } else if(tab == 'resumo-dia') {
            //$('#resumo-total').prop('checked',false);
            tabelaResumoDiario.limparTabela();
            getResumoDia(true);
        } else {
            setTimeout(() => {
                tabelaLancamentos.objJqueryDataTable().columns.adjust()
            }, 300)
        }
    });

    $('#resumo-do-dia').on('click', function(){
        if($(this).is(':checked')) {
            tabelaLancamentos.limparTabela();
            $('#data_historico').trigger('blur');
        } else {
            tabelaLancamentos.limparTabela();
            $('#data_historico').trigger('blur');
        }
    });

    var limparDadosLancamento = function() {
        $('input:not(#data_historico)').val('');
        $('select:not(#conta_corrente)  option:first-child').prop('selected', true).trigger('chosen:updated');
        data_historico.trigger('change');

        setTimeout(() => {
            $('#plano_de_conta_chosen input[type="text"]').focus();
        }, 250)
    }

    $('.form-dados-cabecalho').submit(function(e, autorizado) {
        var dados_enviar = dadosFormularioParaJson($(this).serializeArray());

        var vazios = getInputsVazios($(this), true);

        if(vazios != true) {
            mostrarMensagemErroSucessoAlerta('Preencha os campos vazios', '#'+vazios[0])
            return false;
        }

        dados_enviar.valor = valorMonetarioParaFloat(dados_enviar.valor);

        if(autorizado != true) {

            var msg = 'Você deseja confirmar o lançamento ' + dados_enviar.historico_lancamento +
            ' de documento ' + dados_enviar.documento + ' para a data ' + getDataBR(dados_enviar.data_historico) +
            ' no valor de R$ ' + formatarValorParaPadraoBr(dados_enviar.valor) + ' na conta corrente ' +
            $('#conta_corrente option:selected').text() + ' no centro de custo ' +
            $('#centro_de_custo option:selected').text() + ' e no plano de contas ' +
            $('#plano_de_conta option:selected').text();

            confirmar(msg, function (a, b) {
                if(a) {
                    $('.form-dados-cabecalho').trigger('submit',[true]);
                    b.modal('hide');
                }
            }, undefined, 2)

            return false;
        }

        chamadaAjax({
            url: '/controle_financeiro/controle_financeiro/adicionar_controle_mov',
            type: 'POST',
            data: dados_enviar,
            LoadMsg: 'Lançando...',
            dataType: 'JSON',
            success: function(ok) {
                dados_enviar.id = ok.data_msg.ID;
                tabelaLancamentos.adicionarLinha([ dadosAddLancamento(dados_enviar) ]);
                limparDadosLancamento();
                setTimeout(function() {
                    if($('.dataTables_scrollBody').length > 0) $('.dataTables_scrollBody').scrollTop($('.dataTables_scrollBody')[0].scrollHeight)
                }, 350)
            }
        })


        return false;
    })

    $('#valor').blur(function(){
        var valor = $(this).val();
        valor = valorMonetarioParaFloat(valor)

        if(valor == 0 || isNaN(valor)) {
            mostrarMensagemErroSucessoAlerta('O valor não pode estar vazio ou ser zero', '#documento');
            return false;
        }

        $('#plano_de_conta').trigger('change')
        $('.form-dados-cabecalho').trigger('submit');
    })

    var adicionarLancamentosVindoBd = function(mov_conta) {
        var linhas_add = [];
        for(var i in mov_conta) {
            var lancamento = mov_conta[i];
            var add = {
                id: lancamento.ID,
                data_historico: lancamento.DATA,
                plano_de_conta: lancamento.PLANO_CONTAS_ID,
                documento: lancamento.DOCUMENTO,
                historico_lancamento: lancamento.HISTORICO,
                valor: lancamento.VALOR
            }
            linhas_add.push(dadosAddLancamento(add))
        }

        tabelaLancamentos.adicionarLinha(linhas_add)
        setTimeout(function() {
            if($('.dataTables_scrollBody').length > 0) $('.dataTables_scrollBody').scrollTop($('.dataTables_scrollBody')[0].scrollHeight)
        }, 350)
    }


    $('#data_historico').on('blur', function(e){
        $('#conta_corrente_chosen input[type="text"]').focus();
    })

    $('body').on('blur','#conta_corrente_chosen input[type="text"]',function(e) {

        setTimeout(() => {

            var data = getDataBR($('#data_historico').val(), true);
            var conta_corrente = $('#conta_corrente').val();
            var dados_enviar = {data: data, conta_corrente: conta_corrente};

            if($('#resumo-do-dia').is(':checked')) {
                dados_enviar.somente_dia = true;
            }

            setTimeout(() => {
                $('.modal_confirmar').modal('hide');
            }, 250)


            chamadaAjax({
                url: '/controle_financeiro/controle_financeiro/get_mov_conta',
                dataType: 'JSON',
                LoadMsg: 'Buscando...',
                erro404: false,
                data: dados_enviar,
                success: function(ok) {
                    var dados = ok.data_msg;
                    var dados_montar = dados.DADOS;
                    var saldo_anterior = dados.SALDO_ANTERIOR.SALDO;
                    tabelaLancamentos.limparTabela();
                    saldo.anterior = saldo_anterior;

                    creditoArr = {};
                    debitoArr = {};

                    adicionarLancamentosVindoBd(dados_montar);
                    $('#lancamentos-tab').click();
                },
                error: function(xhr) {
                    if(xhr.status == 404) {
                        var dados = xhr.responseJSON.data_msg;
                        var saldo_anterior = dados.SALDO_ANTERIOR.SALDO;
                        tabelaLancamentos.limparTabela();
                        saldo.atual = 0;
                        saldo.anterior = saldo_anterior;
                        $('saldo-atual').text($('saldo-anterior').text());
                    }
                }
            })
        }, 400)

    })

    if(mov_conta != false) {
        adicionarLancamentosVindoBd(mov_conta)
    } else {
        setTimeout(function(e){
            $('saldo-atual').text($('saldo-anterior').text());
        }, 300)
    }

    $('#conta_corrente').on('change', function(e){
        $('#data_historico').trigger('blur')
    })

//})();