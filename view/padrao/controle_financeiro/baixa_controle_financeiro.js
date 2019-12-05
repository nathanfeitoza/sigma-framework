/*
* @Author: dev01
* @Date:   2018-06-14 11:22:37
* @Last Modified by:   Nathan
* @Last Modified time: 2018-10-19 10:02:01
*/
$(document).ready(function(e){
        var controle_tipo = ModelTipoControle = function() {
            var habilitar = function(nao_habilitar) {
                return nao_habilitar.indexOf(this.getTipoControle()) == -1;
            }

            this.tipo_controle = tipo_controle;

            self.setTipoControle = function($tipo) {
                this.tipo_controle = $tipo;
            }

            self.getTipoControle = function() {
                return this.tipo_controle;
            }

            self.HabilitarFormasPgto = function() {
                var nao_habilitar = [],
                especial = [{tipo: 2, form: 'banco'}];
                if(!habilitar(nao_habilitar)) return false;
                
                for (var i in especial) {
                    var d = especial[i];
                    if(d.tipo == this.getTipoControle()) {
                        return {fixar: d.form};
                    }
                }
                
                return true;
            }

            self.HabilitarInsercaoPgto = function(){
                var nao_habilitar = [2];
                return habilitar(nao_habilitar);    
            }

            /*self.HabilitarFatura = function() {
                var nao_habilitar = [0,2];
                return habilitar(nao_habilitar);    
            }*/

            self.getUrlTipoAjax = function() {
                var tipo_pesquisar = 'fornecedor',
                    tipo_url = 'fornecedor/buscar',
                    tipo = self.getTipoControle();

                if(tipo == 1){ 
                    tipo_url = 'cliente/buscar';
                    tipo_pesquisar = 'cliente';
                } else if(tipo == 2) {
                    tipo_url = 'admin_cartoes/buscar',
                    tipo_pesquisar = 'adm';
                }
                
                return [tipo_url, tipo_pesquisar];
            }


            self.HabilitarFatura = function() {
                var nao_habilitar = [0,2];
                /*if(desfazer != -1) {
                    return false;
                }*/
                return habilitar(nao_habilitar);    
            }

            self.HabilitarValorMenorNoPagto = function() {
                var nao_habilitar = [0,2];
                if(desfazer != -1) {
                    return true;
                }
                return habilitar(nao_habilitar);
            }

            return self;
        }
        var TipoControle = controle_tipo();   
        // Campos que regulam o pagamento
        var contador_pago = ".pago_cont",
        falta_pagar = ".falta_pagar";
        
        if($(contador_pago).length == 0) $('body').append('<input type="hidden" class="'+contador_pago.replace('.','')+'">');
        if($(falta_pagar).length == 0) $('body').append('<input type="hidden" class="'+falta_pagar.replace('.','')+'">');

        var InputsReguladoresPagto = function(tipo) {
            switch(tipo) {
                case 1:
                    return $(falta_pagar)
                    break;
                case 2:
                    return $(contador_pago)
                    break;
                default:
                    return $(falta_pagar)
            }
        }

        var jaInserirPgto = {
            pgtoInsert: false,
            get ID() {
                return this.pgtoInsert;
            },
            set ID(id) {
                this.pgtoInsert = id;
            }
        }

        if(!TipoControle.HabilitarInsercaoPgto()) {
            $('.'+$tabelas.formas_pagto+',div.col.col-md-4.pagamento_div > form > div:nth-child(5)').hide();
        }

        setTimeout(function(){
            var campo = $("#"+$inputs.inp_cliente);
            if(campo.val().length == 0)
                campo.focus();
            else
                $("#"+$inputs.data_pk1).focus();
        }, 350)

        var data_widget = $("#"+$inputs.dp3).datepicker(options_datePicker);
        $("#"+$inputs.data_pk1+", #"+$inputs.data_pk2).datepicker(options_datePicker);
        data_widget.datepicker('option', "showOn","button");
        data_widget.datepicker('option', "buttonText", '<i class="fas fa-calendar"></i>');
        data_widget.datepicker('option', 'altField', 'input[name="data_pagto"]')
        data_widget.datepicker('option', 'altFormat', "yy-mm-dd")
        data_widget.val(getDataFormatada());
        $('input[name="data_pagto"]').val( getDataFormatada(false,3) );
        
        //data_widget.datepicker('update', new Date());
        //"#"+$inputs.data_pk1+", #"+$inputs.data_pk2+", #"+$inputs.dp3
        //var mascara_data = '00/00/0000';
        $("."+$inputs.campo_data).addClass('ativado');/*.mask(mascara_data);*/
        $('body').on('keyup', "."+$inputs.campo_data,function(){
            if(!$(this).hasClass('ativado')){
                $(this).addClass('ativado')/*.mask(mascara_data)*/;
            }
        });
        // Remover mensagem de erro do input ao pressionar uma tecla
        $('body').on('keydown', '.errado', function(e){
            var div_man = $(this).closest('.form-group');
            div_man.find('.invalid-feedback').remove();
            $(this).removeClass('errado');
            
        });
        // Aqui adiciona-se uma data mascarada para o banco de dados, assim não é necessário converter a data no backend
        $('body').on('change val',"."+$inputs.campo_data, function(e){
            //var input =  $(this)[0].id != $inputs.dp3 ? $(this) : $(this).find("."+$inputs.data_pk),
            var input =  $(this),
            name_input = $(this).attr($roles.role_name);
            data_recuperada = input.val();
            data_format = getDataBR(data_recuperada,true)
            name_input = name_input == undefined ? "" : 'name="'+name_input+'"';
            if(input.next('input[type=hidden]').length == 0) {
                $('<input type="hidden" '+name_input+'>').insertAfter(this);
            }
            input.next('input[type=hidden]').val(data_format);
        })
        $('body').on('blur',"."+$inputs.campo_data, function(e){
            var th = $(this);
            setTimeout(function(e){
                th.trigger('change');
            })
        })
        // Opções do plugin da tabela
        var opcoes_tabela = function(inicial) { 

            var retorno = {
                "language": idioma,
                searching: false,
                scrollY:        '50vh',
                scrollX:        true,
                //scrollCollapse: true,
                paging:         false,
                info:           false,
                // As duas opções abaixo são referentes, respectivamente, a coluna de seleção e a de mostrar mais das lotes
                columnDefs: [ {
                    orderable: false,
                    className: 'select-checkbox',
                    targets:   0,
                    width: '20px',
                },{
                    className:      'details-control',
                    orderable:      false,
                    //data:           null,
                    //defaultContent: '',
                    targets:   6,
                } ],
                select: {
                    style:    'os',
                    selector: 'td:first-child'
                },
                initComplete: function(settings, json) {
                    //this.fnAdjustColumnSizing();
                    $('div.dataTables_scrollBody').css('min-height', 0);
                    $('.dataTable').wrap('<div class="dataTables_scroll" />');
                    if(inicial) {
                        $(".dataTables_empty").hide();
                    }
                },
                createdRow: function(row, data, index) {
                    //this.fnAdjustColumnSizing();
                    //console.log('criada',row,data,index,this)
                }
            }

            return retorno;
        };
        // Limpar formulário referente ao cheque
        var LimparDadosCheques = function() {
            if($("."+$inputs.valores_cheques_add).length != 0) {
                $("."+$inputs.valores_cheques_add).val(0);
            }
            $("#"+$tabelas.lista_cheque_tab+' table tbody').html('');
            $('a[href="#'+$tabelas.lista_cheque_tab+'"]').addClass('disabled');
            $('totais-cheques').text('0,00');
            $("."+$form.dados_cheque_add).find('input').val('');            
        }
        // Limpa os dados do pagamento e das seleções
        var LimparDados = function(rolar) {
                $('body').trigger('conte-registros');
                $('td.select-checkbox').trigger('valor-select');

                $("."+$tabelas.formas_pagto+" tbody").html('');
                InputsReguladoresPagto().val(0);
                InputsReguladoresPagto(2).val(0);
                var campo_desc = $("."+$inputs.hidden_desc_acres);
                if(campo_desc.length == 1) {
                    campo_desc.val(0);
                }
                $("#"+$inputs.desc_acres).val('').prop('readonly', false);
                $("#"+$inputs.valor_pagar).val('');
                $("#"+$inputs.valor_pago).val('');
                $("#"+$inputs.doc).val('');
                $("."+$form.dados_pagamento).find('button[type="submit"]').prop('disabled', true);  
                $("."+$botao.btn_desfazer_lote).hide(); 

                if(rolar) {
                    var rolar = $(".dataTables_scrollBody");
                    rolar.scrollTop(rolar[0].scrollHeight);
                }
                LimparDadosCheques();
        }
        // Inicia o plugin da tabela
        var tabela = $('#'+$tabelas.tabela_dados).DataTable(opcoes_tabela(true));
        // Funcao para debug
        window.Tabela = function(callback) {
            return tabela;
        }
        // Adicionar os dados na tabela para visualização
        var AddDadosTabela = function(data, html) {
            var lote =  '',
            btn_mais_lote = '';

            if(data.LOTE != null && TipoControle.HabilitarFatura()) {
                lote = 'lote';
                btn_mais_lote = '<div class="'+$botao.btn_mais_lote+'"><i class="fas fa-plus-square"></i></div>';
            }
            
            var td1 = '<td></td>',
            tdLast = '<td>'+formatarValorParaPadraoBr(data.VALOR_RESTANTE)+'</td><td>'+btn_mais_lote+'</td>';

            if(html == false) {
                td1 = ''; tdLast = '';
            }

            var valor_usar = data.VALOR_LIQUIDO == undefined ? data.VALOR : data.VALOR_LIQUIDO,
            dados_add = td1+'<td>'+data.DOCUMENTO+'</td><td>'+getDataBR(data.EMISSAO)+'</td><td>'+getDataBR(data.VENCIMENTO)+'</td><td>'+formatarValorParaPadraoBr(valor_usar)+'</td>'+tdLast,
            rows_add = $('<tr class="'+lote+'" '+$roles.role_id+'="'+data.ID+'"/>').prepend(dados_add);

            retornar = html == false ? dados_add : rows_add[0]; 
           
            return retornar;
        }
        // Evento para deseleção dos itens
        Tabela().on( 'deselect', function ( e, dt, type, indexes ) {
            $("#"+$inputs.desc_acres).val('').prop('readonly', false);
            $("."+$botao.btn_desfazer_lote).hide();
            if($('tr.selected').length == 0) $("."+$form.dados_pagamento).find('button[type="submit"]').prop('disabled', true);
        });
        // Evento para seleção dos itens
        Tabela().on( 'select', function ( e, dt, type, indexes ) {
            var elemento = Tabela()[ type ]( indexes ).nodes().to$(),
            nao_liberar = false;
            
            // Para seleção de não lote
            if($('tr.lote.selected').length > 0 && !elemento.hasClass('lote')) {
                Tabela().row('.lote.selected').deselect();
                $("."+$botao.btn_desfazer_lote).hide();
                //Tabela().row(elemento[0]).deselect();
            } else if(elemento.hasClass('lote') && $('tr.lote.selected').length > 1) { // Seleção de lote com uma selecionada

               $('.lote.selected').each(function(i, d){
                    if(this != elemento[0]) {
                        Tabela().row(this).deselect();
                        $(contador_pago).val(0);
                        $("."+$tabelas.formas_pagto+" tbody").html('');
                        return false;
                    }
                });
               $("#"+$inputs.desc_acres).val('');
               nao_liberar = true;
               $("."+$botao.btn_desfazer_lote).show(); 
                //Tabela().row(elemento[0]).select();
            } else if(elemento.hasClass('lote')){ // Selecção de lote com nenhuma selecionada
                $(contador_pago).val(0);
                $("."+$tabelas.formas_pagto+" tbody").html('');
                nao_liberar = true;
                $("#"+$inputs.desc_acres).val('');
                Tabela().rows('.selected:not(.lote)').deselect();
                $("."+$botao.btn_desfazer_lote).show(); 
            }
            $("#"+$inputs.desc_acres).prop('readonly', nao_liberar);
            if(desfazer != -1) {
                $("."+$form.dados_pagamento).find('button[type="submit"]').prop('disabled', false);
                $("."+$botao.btn_desfazer_lote).hide(); 
            };
        });
        // Botão que mostra as contas referentes a lote ([+])
        $('body').on('click', '.'+$botao.btn_mais_lote, function(e){
            var tr = $(this).closest('td').closest('tr'),
            id_lote = tr.attr($roles.role_id),
            doc_lote = tr.find('td:nth-child(2)').text(),
            row = Tabela().row( tr );

            if ( row.child.isShown() ) {
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                var tabela = '<table class="table table-striped '+$tabelas.tabela_dados_lote+' table-bordered col col-md-12">',
                thead = '<thead><tr class="'+$ClassesAvulsas.diferenciar+'">',
                tbody = '<tbody>';

                $("#tabela-dados").find('thead.'+$ClassesAvulsas.principal+' > tr > th:not(.select-checkbox, .details-control, :nth-child(6))').each(function(i, data){
                    thead += '<th>'+$(this).text()+'</th>';
                });
                thead += '</tr></thead>';

                chamadaAjax({
                    url: '/controle_financeiro/lote/buscar',
                    data: {id_lote: id_lote, doc_lote: doc_lote},
                    type: 'GET',
                    LoadMsg: 'Buscando dados...',
                    success: function(ok){ 
                        $.each(ok.data_msg, function(i, data){
                           tbody += '<tr class="'+$ClassesAvulsas.diferenciar+'">'+AddDadosTabela(data, false)+'</tr>';
                           
                        });
                        tbody += '</tbody>';
                        tabela += thead+tbody+'</table>';
                        row.child($(tabela)[0]).show();
                        tr.addClass('shown');
                        $(".dataTables_scrollBody").scrollTop( (tr.next().offset().top - $('.dataTables_scrollBody').offset().top) )
                    }, 
                    error: function(){
                        row.child.hide();
                        tr.removeClass('shown');  
                    },
                    complete: function(){
                        //Load(true);
                    }

                })
                
            }
        });
        // Função que ajusta a tabela para uma melhor visualização, pois podem ocorrer erros de layout
        window.Ajustar = function() {
            var cont = 1,
            thead = "thead."+$ClassesAvulsas.principal;

            $("#"+$tabelas.tabela_dados).css({width: $(".dataTables_scroll").width()+"px"});

            $(thead).closest('table').css({width: $("#"+$tabelas.tabela_dados+" tbody").innerWidth()+"px"});

            $(thead+' tr th').each(function(i, e){
                if($(e).height() == 0) {
                 $(thead+" tr th:nth-child("+cont+")").css({width: $(e).width()+"px"})
                cont++;     
                }
            });
        }
    
        
        /*$(window).resize(function(e){
            Ajustar();
        })*/
        
        // Função que gerencia o modal da lote e faz sua geração
        var ModalFatura = function(num_lote) {
            criarModal({
                classModal: $modais.modal_lote,
                title: 'Gerar Lote - Parâmetros',
                conteudo: '<form class="'+$form.enviar_lote+'"> <div class="col-auto"> <label for="'+$inputs.num_lote+'">Número Lote</label> <div class="input-group mb-2"> <input value="'+num_lote+'" class="form-control" id="'+$inputs.num_lote+'" name="num_lote" type="number" readonly="readonly"> </div></div><div class="col-auto"> <label for="'+$inputs.venc_lote+'">Vencimento</label> <div class="input-group mb-2"> <input class="form-control data-venc" id="'+$inputs.venc_lote+'" name="venc_lote" type="text" value="'+getDataFormatada()+'"> </div></div><div class="col-auto"> <label for="'+$inputs.valor_lote+'">Valor</label> <div class="input-group mb-2"> <input class="form-control somente-numero money_qnt not-blur" data-option="{ponto: false, virgula: true, decs: 2, negativo: false, per_cent: false}" id="'+$inputs.valor_lote+'" name="valor_lote" type="tel"> </div></div></form>',
                btns: ['OK'],
                enterFocus: 2,
                clickBtn: function(c) {
                    
                    var dados_enviar = dadosFormularioParaJson( $("."+$form.enviar_lote).serializeArray() );
                    dados_enviar.valor_lote = valorMonetarioParaFloat(dados_enviar.valor_lote);
                    dados_enviar.valor_selecionados = valorMonetarioParaFloat( $('tselect').html() );
                    var div_tabela = $('.dataTables_scroll'),
                    selecteds = [], docs_selecteds = [];
                    div_tabela.find('tbody > tr.selected').each(function(i, dados){
                        var selecionado = $(this).attr($roles.role_id);
                        selecteds.push(selecionado);
                        docs_selecteds.push($(this).find('td:nth-child(2)').text());
                    });
                    dados_enviar.id_selecionados = selecteds;
                    dados_enviar.documentos_selecionados = docs_selecteds;
                    dados_enviar.tipo_controle = tipo_controle;
                    this.enviar_dados = dados_enviar;
                    var este = this; // Guarda o this, pois a próxima função terá seu próprio this, então aqui os objetos desta ficam armazenados nesta variável. OPÇÃO RECORRENTE
                    $("."+$modais.modal_lote).modal('hide');

                    confirmar('Deseja gerar lote dos itens selecionados?', function(e,b){

                           if(e) {
        
                                b.modal('hide');
                                //Load('Gerando lote...');
                                chamadaAjax({
                                url: '/controle_financeiro/gerar_lote/',
                                data: este.enviar_dados,
                                type: 'POST',
                                LoadMsg: 'Gerando lote...',
                                success: function(ok){ 
                                    
                                    Tabela().rows('.selected').remove().draw(); 
                                    var data = ok.data_msg;
                                    var row_add = AddDadosTabela(data);
                                    Tabela().row.add(row_add).draw(false);
                                    $('body').trigger('conte-registros');
                                    $('td.select-checkbox').trigger('valor-select');
                                    if($('th.select-checkbox').hasClass('checked')) {
                                        $('th.select-checkbox').click();
                                    }
                                    var rolar = $(".dataTables_scrollBody");
                                    rolar.scrollTop(rolar[0].scrollHeight);
                                    Ajustar();
                                }, 
                                complete: function(){
                                    //Load(true);
                                    
                                    $("."+$form.dados_pagamento).find('button[type="submit"]').prop('disabled', true);                                
                                }

                                })
                           }
                    });
                },
                //ModalCentralizado: true,
                Starttop: 3,
                criacaoCompleta: function() {
                    $(".data-venc").datepicker(options_datePicker);
                },
                Open: function(x){
                    $("#"+$inputs.num_lote).val(num_lote);
                    $("#"+$inputs.valor_lote).val( formatarValorParaPadraoBr( valorMonetarioParaFloat($('tselect').html()) ) );
                    setTimeout(function(){$("#"+$inputs.valor_lote).select() }, 650);
                },Close: function(x){}
            });
            $("."+$modais.modal_lote).modal('show');
        }
        // Evento que manipula a alteração no campo de desconto/acéscimo
        $("#"+$inputs.desc_acres).on('keyup', function(e, acao_interna){
            if($("."+$inputs.hidden_desc_acres).length == 0) $('body').append('<input type="hidden" name="'+$inputs.hidden_desc_acres+'" class="'+$inputs.hidden_desc_acres+'">');
            $("."+$inputs.hidden_desc_acres).val('0');
            var valor_ajustar = valorMonetarioParaFloat( $('tselect').html() ),
            valor = $(this).val().replace('.',','),
            is_percent = false;

            if(acao_interna != true && jaInserirPgto.pgtoInsert) {
                valor = valor > 0 ? valor * -1 : valor;
                $("."+$botao.btn_remover_forma_pagto).trigger('click', [true]);
                valor += '%';
            }

            if(valor.indexOf('%') !== -1) {
                valor = valor.replace(/%/g,'');
                is_percent = true;
            }

            if(valor.length == 0) {
                $("#"+$inputs.valor_pagar).val( formatarValorParaPadraoBr(valor_ajustar)).trigger('change');
            } else {
                valor = valorMonetarioParaFloat(valor);
                if(!isNaN(valor)) {
                    var is_negativo = valor < 0,
                    valor_retornar = valor_ajustar;

                    if(is_percent) valor = parseFloat( (valor * valor_ajustar) / 100 ).toFixed(2);
                    
                    // Aqui pode-se somar porque eu recebo o valor negativo, quando desconto, então pela regra matemática - com + = - e + com + = +, o cálculo é feito automaticamanete
                    valor_retornar += parseFloat(valor);

                    /* Verifica se é negtivo e em seguinda se o valor é maior que 0, pois caso não retornará o valor atual */
                    if(is_negativo){
                        if(valor_retornar < 0) {
                            valor_retornar = valor_ajustar;
                        }
                    }
                        
                    if(!isNaN(valor_retornar) && valor_ajustar != 0) {
                        var valor_ja_pago = parseFloat( InputsReguladoresPagto(2).val() );
                        valor_ja_pago = isNaN(valor_ja_pago) ? 0 : valor_ja_pago;
                        if(valor_ja_pago <= valor_retornar) {
                            $("."+$inputs.hidden_desc_acres).val(valor);

                            $("#"+$inputs.valor_pagar).val( formatarValorParaPadraoBr(valor_retornar) ).trigger('change');
                        } else {
                            $(this).val('').trigger('keyup');
                            mostrarMensagemErroSucessoAlerta('Não é possível dar um desconto maior que os valores já pagos. Para isto, remova uma forma de pagamento e tente novamente.');
                        }
                    }

                }
            }

            if(jaInserirPgto.pgtoInsert) $("#"+$inputs.valor_pago).trigger('keydown', [true,true]);
            
        });
        // Evento criado para controlar a seleção dos itens, somar seus valores e mostrar quantos foram selecionadso
        $('body').on('valor-select','td.select-checkbox', function(e, time){
            var div_tabela = $('.dataTables_scroll'),
            tselect = $('tselect'),
            time = time == undefined ? 0 : time,
            selecteds = 0,
            total_selecionados = 0;

            setTimeout(function(){
                div_tabela.find('tbody > tr.selected').each(function(i, dados){
                    valor_selecionado = valorMonetarioParaFloat( $(this).find('td:nth-child(6)').html() );
                    total_selecionados += valor_selecionado;
                    selecteds += 1;
                });
                if(selecteds > 1 && TipoControle.HabilitarFatura()) {
                    $("."+$botao.btn_gerar_lote).prop('disabled', false).show(); 
                    $("."+$botao.btn_desfazer_lote).hide();
                } else {
                    $("."+$botao.btn_gerar_lote).prop('disabled', true).hide();
                }

                $('selecteds').html(selecteds)
                let valor_ja_pago = parseFloat( InputsReguladoresPagto(2).val() );
                valor_ja_pago = isNaN(valor_ja_pago) ? 0 : valor_ja_pago;
                
                if(total_selecionados < valor_ja_pago) {
                    InputsReguladoresPagto(2).val(0);
                    $("."+$inputs.valor_pago).val('0,00')
                    $("."+$tabelas.formas_pagto+" tbody").html('');                    
                }

                var valor_exibir = formatarValorParaPadraoBr(total_selecionados);
                tselect.html(valor_exibir);
                $("#"+$inputs.valor_pagar).val(valor_exibir);
                $("#"+$inputs.desc_acres).trigger('keyup', [true]);
            }, time);


        });
        // Evento criado para contar quantos registros existem na tabela que se vê
        $('body').on('conte-registros', function(e){
            var elemento = $("#"+$tabelas.tabela_dados).find('tbody > tr:not(.'+$ClassesAvulsas.diferenciar+')'),
            regs = 0, 
            valor = 0;
            elemento.each(function(i){
                if( $(this)[0].childElementCount > 1 ) {
                    regs += 1;
                    valor += valorMonetarioParaFloat( $(this).children('td:nth-child(6)').text() );
                }
            });
            $('regs').html(regs);
            $('total').html(formatarValorParaPadraoBr(valor));
        });
        // Evento que aciona a seleção de todas as não lotes na tabela
        $('body').on("click",'th.select-checkbox', function(){
            var classe = 'checked', prop = false, tb = $(".dataTables_scroll").find('tbody > tr'),time=undefined;
            var l = Load();
            
            $(contador_pago).val(0);
            $("."+$tabelas.formas_pagto+" tbody").html('');

            if($(this).hasClass(classe)){
                Tabela().rows().deselect();
            } else { 
                time = 150;
                Tabela().rows('.lote').deselect();
                setTimeout(function(){ Tabela().rows('tr:not(.lote)').select(); }, time);
                prop = true;
            }
            $('td.select-checkbox').trigger('valor-select', [time]);
            //console.log(prop);
            $(this).toggleClass(classe).find("."+$inputs.selecionar_todos).prop('checked', prop);
            l.RemoverLoad();
            return false;
        });
        // Evento que é acionado ao clicar em um checkbox da tabela, e assim dispara o evento de controle dos valores selecionados
        $('body').on('click','td.select-checkbox', function(){
            $(this).trigger('valor-select');
        });

        $("#"+$inputs.inp_cliente).autocomplete({
            minLength: 2,
            source: function(request, response) {
                var pesquisar = $('#'+$inputs.inp_cliente).val(),
                tipo_pesquisar = TipoControle.getUrlTipoAjax()[1],
                tipo_url = TipoControle.getUrlTipoAjax()[0];

                var data = JSON.parse( '{"'+tipo_pesquisar+'": "'+pesquisar+'"}' );
                chamadaAjax({
                  url: '/entidade/'+tipo_url,
                  type: 'GET',
                  erro404: false,
                  data: data,
                  success: function(data) {
                    response(data.data_msg['DADOS']);
                  }
                })
            },
            focus: function(event, ui) {
                $('#'+$inputs.inp_cliente).val(ui.item.NOME);
                return false;
            },
            close: function() {
                let campo = $('#'+$inputs.inp_cliente);
                if(campo.attr($roles.role_name) != undefined) {
                    campo.val( campo.attr($roles.role_name) )
                }
            },
            select: function(event, ui) {
                entidade.entidadeD = ui.item.ID;
                $('#'+$inputs.inp_cliente).val(ui.item.NOME).attr($roles.role_name, ui.item.NOME);
                $('#'+$inputs.data_pk1).select().focus();
                if(ui.item.CONTA_CORRENTE != undefined) {
                    $('.'+$inputs.select_conta).val(ui.item.CONTA_CORRENTE);
                }
                var stateObj = { foo: "bar" };
                history.pushState(stateObj, $('title').text(), "baixa_controle_financeiro?tipo_controle="+tipo_controle+"&entidade="+entidade.entidadeD);
                return false;
            }
        }) 
       .autocomplete("instance")._renderItem = function(ul, item) {
            return $("<li>")
                .append("<a>" + item.NOME + " (" + item.ID + ")")
                .appendTo(ul);
        };

        // Evento que controla a submissão do pagamento 
        $("."+$form.dados_pagamento).on('submit', function(){
            var valor_selecionado_real = valorMonetarioParaFloat( $('tselect').text() ),
            desconto_acrescimo = $("."+$inputs.hidden_desc_acres).val() == undefined ? 0 : parseFloat( $("."+$inputs.hidden_desc_acres).val() );
            campo_conta = $('#'+$inputs.select_conta),
            dados_enviar = dadosFormularioParaJson( $(this).serializeArray() );
            dados_enviar.valor_pagar = valorMonetarioParaFloat(dados_enviar.valor_pagar);
            dados_enviar.valor_pago = parseFloat( InputsReguladoresPagto(2).val() );
            dados_enviar.valor_selecionados = valorMonetarioParaFloat( $('tselect').text() );
            dados_enviar.desc_acres = isNaN(desconto_acrescimo) ? 0 : desconto_acrescimo;

            if(jaInserirPgto.pgtoInsert) {
                dados_enviar.documento = getDataFormatada(false, 5);
            }
            
            var div_tabela = $('.dataTables_scroll'),
            itens_selecionados = [], documento_conta = [];

            div_tabela.find('tbody > tr.selected').each(function(i, dados){ 
                itens_selecionados.push( parseInt( $(this).attr($roles.role_id) ) );
                documento_conta.push( $(this).find('td:nth-child(2)').text() );
            });
            
            if(itens_selecionados.length == 1) {
                dados_enviar.e_lote = $('tr['+$roles.role_id+'="'+itens_selecionados[0]+'"]').hasClass('lote');
            }

            dados_enviar.itens_selecionados = itens_selecionados;
            dados_enviar.documento_conta = documento_conta;
            dados_enviar.conta_pagto = campo_conta.children('option:selected').attr('id');           
            dados_enviar.entidade = entidade.ID;
            dados_enviar.tipo_controle = tipo_controle;

            var nome_acres_desc = dados_enviar.desc_acres < 0 ? "desconto" : "acréscimo",
            dados_cheques = dadosFormularioParaJson( $("."+$form.dados_cheques_adicionados).serializeArray() );
            var dados_enviar_unidos = Object.assign(dados_enviar, dados_cheques);

            //if( parseFloat((dados_enviar.valor_selecionados + dados_enviar.desc_acres).toFixed(2)) == dados_enviar.valor_pago) {
                
                this.dados_enviar_server = dados_enviar_unidos;
                this.url_acessar = '/controle_financeiro/baixar_conta/';
                this.type = 'POST';
                if(desfazer != -1) {
                    this.dados_enviar_server = {id_conta:dados_enviar.itens_selecionados, tipo_controle: dados_enviar.tipo_controle};
                    this.url_acessar = '/controle_financeiro/desfazer_conta/';
                    this.type = 'PUT';
                }
                var este = this;
                //0019241804
                confirmar('Você deseja realizar esta ação?', function(e,b){
                    if(e) {
                        b.modal('hide');
                        chamadaAjax({
                            url: este.url_acessar,
                            data: este.dados_enviar_server,
                            type: este.type,
                            LoadMsg: 'Enviando dados...',
                            success: function(ok){ 
                                //Tabela().rows('.selected').remove().draw(); 
                                LimparDados();
                                $("."+$form.filtrar_contas).trigger('submit',[false]);
                                var msg = desfazer == -1 ? 'Conta baixada com sucesso' : 'Conta desfeita com sucesso';
                                mostrarMensagemErroSucessoAlerta(msg,false, false);
                            },
                            complete: function(){
                                $("."+$form.dados_pagamento).find('button[type="submit"]').prop('disabled', true);
                                //Load(true);
                            }

                        })
                    }
                })

            /*} else {
                mostrarMensagemErroSucessoAlerta('O valor selecionado juntamente com o seu '+nome_acres_desc+" não coincidem com o valor pago. Por favor, refaça a operação.");
            }*/
            return false;
        });
        // Função que recupera as contas da entidade no período informado
        var PegarContas = function(form,pag,erro404) {
            erro404 = erro404 == undefined ? true : erro404;
            var tipo = $("."+$inputs.tipo_escolha+":checked"),
            validar = getInputsVazios($("."+$divs.inputs_periodo)),
            tipo_send = tipo.attr($roles.role_id);
            if($("#"+$inputs.inp_cliente).val().length == 0) {
                $("#"+$inputs.inp_cliente).focus();
                return false;
            }
            if(typeof validar == "object") { // Verifica se há campos vazios
                if(validar.length == 1) {
                    if(validar[0].toLowerCase() == 'campo2') {
                        $("#"+$inputs.data_pk2).next('input[type=hidden]').val( $("#"+$inputs.data_pk1).next('input[type=hidden]').val() );
                        validar = true;
                    } else {
                        validar = false;
                    }
                } else {
                    validar = false;
                }
            }

            if(validar) {
                dados_enviar = dadosFormularioParaJson(form.serializeArray());
                dados_enviar.tipo_busca = tipo_send;
                dados_enviar.entidade = entidade.ID;
                dados_enviar.tipo_controle = TipoControle.getTipoControle();
                
                Tabela().rows().clear().draw();
                $('selecteds').text('0');
                $('tselect').text('R$ 0,00');
                //dados_enviar.pag = pag == 0 ? 1 : pag; 
                
                if(desfazer != -1) {
                    dados_enviar.desfazer = desfazer;
                    dados_enviar.data_pagto = $('input[name='+$inputs.dp3+']').val();
                }

                chamadaAjax({
                    url: '/controle_financeiro/baixas/listar',
                    data: dados_enviar,
                    type: 'GET',
                    LoadMsg: 'Buscando...',
                    HabilitarBotao: form,
                    erro404: erro404,
                    success: function(ok){ 
                        var dados = [];
                        $.each(ok.data_msg.DADOS, function(i, data){
                            dados.push(AddDadosTabela(data));
                        });
                        //$('regs').html(dados.length);
                        if(dados.length > 0) {
                            //$('body').attr($roles.lotes, '['+lotes.join(',')+']');
                            Tabela().rows.add(dados).draw(false);
                            Ajustar();
                            $('body').trigger('conte-registros');
                            
                            //total_el.html(formatarValorParaPadraoBr(valor_total));

                            $("."+$divs.div_valores_tb).show();
                            /*$(".dataTables_scroll").attr('liberar','1');

                            if(ok.data_msg.MAX_PAGS <= pag) {
                                $(".dataTables_scroll").removeAttr('liberar');
                            }*/
                        }
                        
                    }, 
                    error: function(xhr){ 
                        var tabela = $(".dataTables_scrollBody").find('table > tbody > tr').find('.dataTables_empty');
                        if(xhr.status == 404 && tabela.length == 1) {
                            tabela.show();
                        }
                        $("."+$divs.div_valores_tb).hide();
                        Ajustar();
                        //console.log(xhr)
                    },
                    complete: function(){
                        $("."+$form.dados_pagamento).find('button[type="submit"]').prop('disabled', true);
                    }

                })
            } else {
                mostrarMensagemErroSucessoAlerta('O primeiro campo de data deve ser preenchido');
            }
        }
        // Evento que controla a submissão do filtro de contas e aciona o PegarContas
        $("."+$form.filtrar_contas).on('submit', function(e, erro404){
            erro404 = erro404 == undefined ? true : erro404;
            Tabela().clear().draw();
            $("."+$botao.btn_gerar_lote).prop('disabled', true).hide();
            $('total').html('0,00');
            $('th.select-checkbox').removeClass('checked').find("."+$inputs.selecionar_todos).prop('checked', false);
            $('td.select-checkbox').trigger('valor-select');
            $("."+$botao.btn_desfazer_lote).hide();
            PegarContas($(this), 1, erro404);
            $('body').attr($roles.pag, 1);
            return false;
        });

        /*$(".dataTables_scrollBody").on('scroll', function(){
            if( Math.ceil($(this).scrollTop() + $(this).innerHeight()) >= $(this)[0].scrollHeight) {
                var permitir = $(".dataTables_scroll").attr('liberar'),
                pag = $('body').attr($roles.pag);
                pag = pag == undefined ? 2 : pag;
                    if(permitir == '1') {
                    PegarContas($("."+$form.filtrar_contas), pag);
                    pag++;
                    $('body').attr($roles.pag, pag);
                }
            }
        });*/

        // Evento que modifica o tipo de pagamento no select de formas, assim aciona seus metódos
        $("."+$inputs.select_forma).on('change', function(e){
           var selected = $(this).find('option:selected'),
           campo_conta = $('#'+$inputs.select_conta),
           campo_doc = $("#"+$inputs.doc),
           label_conta = $('label[for="'+$inputs.select_conta+'"]'),
           label_doc = $('label[for="'+$inputs.doc+'"]');

           if(selected.attr($roles.data_bank) == undefined) {
                if(campo_conta.is(':visible')) {
                    campo_conta.fadeTo(400, 0, function(){ campo_conta.hide(); });
                    label_conta.fadeTo(400, 0, function(){ label_conta.hide(); });
                }

                if(campo_doc.is(':visible') && (selected.text().toLowerCase().indexOf('dinheiro') != -1 || selected.length == 0)) {
                    campo_doc.fadeTo(400, 0, function(){ campo_doc.hide(); });
                    label_doc.fadeTo(400, 0, function(){ label_doc.hide(); });
                } else {
                    let texto_label = 'Documento';
                    campo_doc.maskMoney('destroy').removeClass('somente-numero').removeClass('per');
                    if(selected.text().toLowerCase().indexOf('cheque') != -1)
                    {
                        texto_label = 'N° Cheque';
                        campo_doc
                        .addClass('somente-numero')
                        .addClass('per')
                        .attr('data-option','{ponto: false, virgula: false, decs: 2, negativo: false, per_cent: false}')
                        .val( campo_doc.val().replace(/[^0-9]+/g, "") );
                        
                    }
                    label_doc.text(texto_label);
                    campo_doc.show();
                    label_doc.show();
                    campo_doc.animate({opacity: 1}, 400); 
                    label_doc.animate({opacity: 1}, 400); 
                }

           } else {

                campo_conta.show();
                label_conta.show();
                campo_conta.animate({opacity: 1}, 400); 
                label_conta.animate({opacity: 1}, 400);                 

                label_doc.text('Documento');
                campo_doc.maskMoney('destroy').removeClass('somente-numero').removeClass('per');
                campo_doc.show();
                label_doc.show();
                campo_doc.animate({opacity: 1}, 400); 
                label_doc.animate({opacity: 1}, 400); 
           }
        });
        $("."+$inputs.select_forma).trigger('change');



    // Função que gera o número da lote
    function AddFaturaNumero() {
        //Load('Gerando número da lote...');
        chamadaAjax({
        url: '/controle_financeiro/num_lote/',
        data: {},
        type: 'GET',
        LoadMsg: 'Gerando número da lote...',
        success: function(ok){ 
            var num_seq = ok.data_msg.NUM_SEQ == undefined ? ok.data_msg[0].NUM_SEQ : ok.data_msg.NUM_SEQ;
            num_seq = parseInt(num_seq);
            num_seq += 1;
            ModalFatura(num_seq);
        }, 
        complete: function() {
            Load(true);
        }

        })        
    }
    if(TipoControle.HabilitarFatura()) {
        // Clique do botão de gerar lote
        $('body').on('click', "."+$botao.btn_gerar_lote ,function(){
            AddFaturaNumero();
        });
    }

    // Evento que captura mudanças no campo que informa o valor a ser pago
    $("#"+$inputs.valor_pagar).on('change', function(e){
        var meu_valor = $(this).val(),
        pago = InputsReguladoresPagto(2).val(),
        falta_pagar = InputsReguladoresPagto();

        if(meu_valor.length > 0) {

            meu_valor = valorMonetarioParaFloat(meu_valor);

            let pago_real = parseFloat(pago);
            pago_real = isNaN(pago_real) ? 0 : pago_real;

            let subtracao = pago_real - meu_valor,
            bloquear = true,
            subtracao_show = '';

            if(subtracao < 0) {
                subtracao = (subtracao * -1).toFixed(2);
                subtracao_show = formatarValorParaPadraoBr(subtracao);
            } else if(subtracao >= 0) {
                subtracao = 0;
                bloquear = false;
                if($('tr.selected').length == 0) {
                    bloquear = true;
                }
            }

            falta_pagar.val( subtracao );
            $("#"+$inputs.valor_pago).val( subtracao_show );
            bloquear = parseFloat( InputsReguladoresPagto(2).val() ) > 0 ? false : true;
            if(!TipoControle.HabilitarValorMenorNoPagto() && subtracao > 0) {
                bloquear = true;
            }
            $("."+$form.dados_pagamento).find('button[type="submit"]').prop('disabled', bloquear); //bloquear
            
        }
    });

    $("#"+$inputs.valor_pago).on('focus', function(e){
        var valor = valorMonetarioParaFloat( $(this).val() );
        if(valor == 0) {
            let valor_a_pagar = InputsReguladoresPagto().val();
            if(valor_a_pagar.length == 0) {
                if( $("#"+$inputs.valor_pagar).val().length > 0) {
                    valor_a_pagar =  valorMonetarioParaFloat( $("#"+$inputs.valor_pagar).val() );
                }
            }

            $(this).val( formatarValorParaPadraoBr( valor_a_pagar ) );
            var el = $(this);
            setTimeout(function(){ el.select() }, 100);
        }
    });

    // Função que aciona e valida o pagamento após pressionado tab ou enter no campo de valor pago
    $("#"+$inputs.valor_pago).on('keydown', function(e, ativar, valorE){
        var valor = valorE == undefined || valorE == true ? $(this).val() : valorE,
        valor_pagar = $("#"+$inputs.valor_pagar).val(),
        forma_pagto = $("."+$inputs.select_forma+" option:selected").text(),
        id_forma_pagto = $("."+$inputs.select_forma).val(),
        campo_conta = $('#'+$inputs.select_conta),
        campo_doc = $("#"+$inputs.doc)
        add_doc = '', add_conta = '',
        necessita_doc = false, necessita_conta = false,
        sou_cheque = forma_pagto.toLowerCase().indexOf('cheque') != -1 ? true : false;

        if(valor.length > 0 && valor_pagar.length > 0 && ( e.which == 13 || e.which == 9 || ativar) && !e.shiftKey) {
            if(sou_cheque && !$("."+$modais.modal_cheque).is(':visible')) {
                return false;
            }
            valor = valorMonetarioParaFloat(valor);
            if(valor != 0) {
                var campo_conta = $('#'+$inputs.select_conta),
                campo_doc = $("#"+$inputs.doc);

                if(campo_conta.is(':visible')) {
                    if(campo_conta.val().length == 0) {
                        mostrarMensagemErroSucessoAlerta('É necessário que o campo da conta seja preenchido', campo_conta[0]);
                        return false;
                    } else {
                        add_conta = campo_conta.children('option:selected').attr('id');
                        necessita_conta = true;
                    }
                }

                if(campo_doc.is(':visible')) {
                    if(campo_doc.val().length == 0) {
                        mostrarMensagemErroSucessoAlerta('O campo documento precisa ser preenchido', campo_doc[0]);
                        return false;
                    } else {
                        add_doc = campo_doc.val();
                        necessita_doc = true;
                    }
                }

                if(necessita_conta && $("."+$tabelas.formas_pagto+" tbody tr").length != 0 && !jaInserirPgto.pgtoInsert) {
                    mostrarMensagemErroSucessoAlerta("A forma de pagamento solicitada deve ser única, portando elimine as que já foram registradas e tente novamente");
                    return false;
                }

                valor_pagar = valorMonetarioParaFloat(valor_pagar);
                
                contador_pago = $(contador_pago);
                falta_pagar = $(falta_pagar);

                valor_pagar = falta_pagar.val().length == 0 ? valor_pagar : parseFloat( falta_pagar.val() );

                let troco = valor - valor_pagar,
                el = $(this),
                bloquear = false,
                btn_confirmar = $("."+$form.dados_pagamento).find('button[type="submit"]'),
                count_pago = contador_pago.val().length == 0 ? 0 : parseFloat(contador_pago.val());
  
                if(troco <= 0) {
                    if(troco < 0) {
                        if(necessita_conta) {
                            mostrarMensagemErroSucessoAlerta('Não é possível pagar um valor mais baixo quando a opção selecionada for banco');
                            return false;
                        } 
                        troco = (troco * -1);
                        //$(this).maskMoney('mask',troco);
                        $(this).val( formatarValorParaPadraoBr(troco) );
                        setTimeout(function(){ $("#"+$inputs.select_forma).focus()/*el.select()*/ }, 200);
                        bloquear = true;
                    } else if(troco == 0){
                        $(this).val('');
                        troco = 0;
                        if(valorE != true) {
                            setTimeout(function(){ btn_confirmar.focus(); }, 300);
                        }
                    }

                    count_pago += valor;
                    falta_pagar.val(troco.toFixed(2));
                    contador_pago.val(count_pago.toFixed(2));
                    var tbody = $("."+$tabelas.formas_pagto+" tbody");
                    
                    var verificar = function(){
                            let retorno = false;
                            tbody.find('tr').each(function(i, data){
                                var td1 = $(this).children('td:nth-child(1)').text();
                                if(td1.toLowerCase() == forma_pagto.toLowerCase()) {
                                    retorno = [ (i + 1),valorMonetarioParaFloat( $(this).children('td:nth-child(2)').text() )];
                                    return true;
                                }
                        })
                        return retorno;
                    }
                    
                    let checar = verificar();

                    if(!checar || (forma_pagto.toLowerCase().indexOf('dinheiro') == -1 && !sou_cheque && !jaInserirPgto.pgtoInsert)) {
                        let adicionar = '<tr><td class="col col-lg-5">'+forma_pagto+'</td><td class="col col-lg-6">'+formatarValorParaPadraoBr(valor)+'</td><td class="col col-lg-1"><i class="fas fa-trash '+$botao.btn_remover_forma_pagto+'"></i></td><input type="hidden" name="forma_pagto_id[]" value="'+id_forma_pagto+'"> <input type="hidden" name="valor_forma_pagto[]" value="'+valor+'"> <input type="hidden" name="conta[]" value="'+add_conta+'"> <input type="hidden" name="documento[]" value="'+add_doc+'"> <input type="hidden" name="conta_sim[]" value="'+necessita_conta+'"> <input type="hidden" name="doc_sim[]" value="'+necessita_doc+'"> <input type="hidden" name="sou_cheque[]" value="'+sou_cheque+'"></tr>';
                        tbody.append(adicionar);
                    } else if(checar && ( forma_pagto.toLowerCase().indexOf('dinheiro') != -1 || sou_cheque || jaInserirPgto.pgtoInsert)){
                        let somar_valores = checar[1] + valor;
                        tbody.find('tr:nth-child('+checar[0]+')').children('td:nth-child(2)').text( formatarValorParaPadraoBr(somar_valores) );
                        $( tbody.find('tr:nth-child('+checar[0]+')').children('input[type="hidden"]').get(1) ).val(somar_valores.toFixed(2));
                        $( tbody.find('tr:nth-child('+checar[0]+')').children('input[type="hidden"]').get(2) ).val(add_conta);
                        $( tbody.find('tr:nth-child('+checar[0]+')').children('input[type="hidden"]').get(3) ).val(add_doc);
                    }

                    if(!jaInserirPgto.pgtoInsert) {
                        $("."+$inputs.doc).val('');
                    }
                    

                    if(!TipoControle.HabilitarValorMenorNoPagto() && troco == 0) {
                        btn_confirmar.prop('disabled', false); // true
                    } else if(TipoControle.HabilitarValorMenorNoPagto()) {
                        btn_confirmar.prop('disabled', false); // true
                    }

                } else {
                    mostrarMensagemErroSucessoAlerta('Não é possível pagar um valor acima do selecionado', this);
                }
                return false;
            }
        }

    });
    
    window.AtualizarPagamento = function() {
        var valor_pagar =valorMonetarioParaFloat( $("#"+$inputs.valor_pagar).val() )
        valor_pago = 0;

        $("."+$tabelas.formas_pagto+" tbody tr").each(function(i){
            valor_pago += parseFloat( $( $(this)[0].children[4] ).val() );
        });
        valor_pagar -= valor_pago;
        valor_pagar = valor_pagar < 0 ? valor_pagar * -1 : valor_pagar;
        $("#"+$inputs.valor_pago).val( formatarValorParaPadraoBr(valor_pagar) );
        InputsReguladoresPagto().val( valor_pagar );
        InputsReguladoresPagto(2).val(valor_pago);
    }
 
    window.IniciarCheque = function(num_cheque) {
           
            criarModal({
                classModal: $modais.modal_cheque,
                title: 'Cheques',
                conteudo: '<div class="container"><nav> <div class="nav nav-tabs" id="nav-tab" role="tablist"> <a class="nav-item nav-link active" data-toggle="tab" href="#'+$divs.cadastro_cheque_tab+'" role="tab" aria-controls="'+$divs.cadastro_cheque_tab+'" aria-selected="true">Cadastro de Cheque</a> <a class="nav-item nav-link disabled" data-toggle="tab" href="#'+$divs.lista_cheque_tab+'" role="tab" aria-selected="false">Lista de Cheques</a> </div></nav><div class="tab-content" id="nav-tabContent"> <div class="tab-pane fade show active" id="'+$divs.cadastro_cheque_tab+'" role="tabpanel"> <form class="'+$form.dados_cheque_add+'"> <div class="form-row"> <div class="form-group col-md-3"> <label for="'+$inputs.banco_cheque+'">Banco</label> <input type="number" min="0" class="form-control somente-numero per" data-option="{ponto: false, virgula: false, decs: 2, negativo: false, per_cent: false}" name="'+$inputs.banco_cheque+'" id="'+$inputs.banco_cheque+'"> </div><div class="form-group col-md-3"> <label for="'+$inputs.agencia_cheque+'">Agência</label> <input type="number" min="0" class="form-control somente-numero per" data-option="{ponto: false, virgula: false, decs: 2, negativo: false, per_cent: false}" name="'+$inputs.agencia_cheque+'" id="'+$inputs.agencia_cheque+'"> </div><div class="form-group col-md-3"> <label for="'+$inputs.conta_cheque+'">Conta</label> <input type="number" min="0" class="form-control somente-numero per" data-option="{ponto: false, virgula: false, decs: 2, negativo: false, per_cent: false}" id="'+$inputs.conta_cheque+'" name="'+$inputs.conta_cheque+'"> </div><div class="form-group col-md-3"> <label for="'+$inputs.numero_cheque+'">N° Cheque</label> <input type="number" min="0" class="form-control" id="'+$inputs.numero_cheque+'" name="'+$inputs.numero_cheque+'"> </div></div><div class="form-row"> <div class="form-group col-md-6"> <label for="'+$inputs.vencimento_cheque+'">Vencimento</label> <input type="text" class="form-control '+$inputs.campo_data+'" id="'+$inputs.vencimento_cheque+'"> </div><div class="form-group col-md-6"> <label for="'+$inputs.valor_cheque+'">Valor</label> <input type="tel" class="form-control money_qnt somente-numero not-blur" id="'+$inputs.valor_cheque+'" name="'+$inputs.valor_cheque+'" data-option="{ponto: true, virgula: true, decs: 2}"> </div></div></form> <h5>Total dos Cheques: <strong>R$ <totais-cheques>0,00</totais-cheques></strong></h5> </div><div class="tab-pane fade" id="'+$tabelas.lista_cheque_tab+'" role="tabpanel"> <form class="'+$form.dados_cheques_adicionados+'"><table class="table table-striped"> <thead> <tr> <th>Algo</th> <th>Algo</th> <th>Algo</th> </tr></thead> <tbody></tbody> </table></form> </div></div></div>',
                btns: ['confirmar'],
                enterFocus: 2,
                clickBtn: function(a, b) {
                    b = parseInt(b);
                    if(b == 1) {
                        a.addClass('manter')
                        var valor_add = parseFloat( $("."+$inputs.valores_cheques_add).val() );
                        if(!isNaN(valor_add) && valor_add != 0) { 
                            valor_add = formatarValorParaPadraoBr(valor_add);
                            var valor_doc = $("#"+$inputs.doc).val();
                            $("#"+$inputs.valor_pago).trigger('keydown', [true, valor_add]);
                            $("#"+$inputs.doc).val(valor_doc);
                            $("."+$inputs.valores_cheques_add).val('');
                            $("."+$modais.modal_cheque).modal('hide');
                            
                        }
                        
                       
                    }
                },
                Open: function(){
                    $("#"+$inputs.numero_cheque).val(num_cheque);
                    $("."+$form.dados_cheque_add).find('input:visible').val('');
                    setTimeout(function(){ $("#"+$inputs.banco_cheque).focus() }, 600);
                }, 
                Close: function() {
                   if( !$("."+$modais.modal_cheque).find('.btn-action-modal:nth-child(1)').hasClass('manter') ) {
                        LimparDadosCheques();
                    }

                },
                criacaoCompleta: function(e) {
                    navegacaoEntreInputsEmUmaMesmaDiv($('.'+$form.dados_cheque_add));
                    options_datePicker.minDate = new Date();
                    $("#"+$inputs.vencimento_cheque).datepicker(options_datePicker).off('blur,change').on('blur', function(e){
                        var data_inserida = new Date( getDataBR($(this).val(),true) ),
                        data_hoje = new Date();
                        if(data_inserida.getTime() < data_hoje.getTime() || isNaN(data_inserida)) {
                            $(this).val( getDataFormatada() );
                        }

                    }).on('change', function(){
                        setTimeout(function(){ $('#'+$inputs.valor_cheque).select().focus() }, 450);
                    });
                }
            });
            var percorrer = $("#"+$divs.cadastro_cheque_tab).find('label'),
            armazenar_penultimo = [];
            $("#"+$tabelas.lista_cheque_tab+' thead tr').html('');
           percorrer.each(function(i,e){
            let penultimo = percorrer.length - 2,
            texto = $(this).text();
            switch(texto.toLowerCase()) {
                case 'agência':
                    texto = 'Ag.'
                    break;
                case 'vencimento':
                    texto = 'Venc.'
                    break;
                case "n° cheque":
                    texto = 'Cheque';
                    break;
            }
            $("#"+$tabelas.lista_cheque_tab+' thead tr').append("<th>"+texto+"</th>");
            

           });

           $("#"+$tabelas.lista_cheque_tab+' thead tr').append('<th></th>');  
           var valor_pagto = parseFloat(InputsReguladoresPagto().val());
           valor_pagto = isNaN(valor_pagto) ? 0 : valor_pagto;

           if(valor_pagto != 0 || $('.'+$tabelas.formas_pagto+" tbody tr").length > 0) {
                $("#"+$inputs.valor_cheque).trigger('keypress').val( formatarValorParaPadraoBr( InputsReguladoresPagto().val() ) );
                $("."+$modais.modal_cheque).modal('show');
           }
        }

        $('body').on('focus',"#"+$inputs.valor_cheque,function(){
            $(this).removeClass('liberar');
        }).on('blur',"#"+$inputs.valor_cheque, function(){
            var dados_cheque = dadosFormularioParaJson( $("."+$form.dados_cheque_add).serializeArray() );
            if(!$(this).hasClass('liberar')) {
                var form = $("."+$form.dados_cheque_add), 
                vazios = getInputsVazios( form );
                
                form.find('.errado').removeClass('errado');
                form.find('.invalid-feedback').remove();

                if(vazios != true) {
                    setTimeout(function(){ $('#'+$inputs.banco_cheque).focus() }, 300);
                    form.addClass('errado');
                    $.each(vazios, function(i, data){
                        let input_usando = $('input[name="'+data+'"]'), 
                        div_manipular = input_usando.closest('div');

                        if(div_manipular.find('.invalid-feedback').length == 0) {
                            input_usando.addClass('errado');    
                            div_manipular.append('<div style="display: block;" class="invalid-feedback">Este campo precisa ser preenchido</div>');
                        }
                    });

                    return false;
                }

                var falta_pagar = parseFloat(InputsReguladoresPagto().val()),
                valor_digitado = dados_cheque.valor_cheque,
                valor_cheque = valorMonetarioParaFloat(valor_digitado);

                if(valor_cheque > 0) {
                    if($("."+$inputs.valores_cheques_add).length == 0) $('body').append('<input type="hidden" class="'+$inputs.valores_cheques_add+'">');
                    
                    /*var length_permitido = [11,14];

                    if( length_permitido.indexOf( dados_cheque.cpf_cnpj_cheque.length ) == -1 ) {
                        mostrarMensagemErroSucessoAlerta("O campo de cpf/cnpj precisa ter 11 ou 14 números",'#'+$inputs.banco_cheque);
                        return false;
                    }*/

                    var valor_adicionado = parseFloat( $("."+$inputs.valores_cheques_add).val() );
                    valor_adicionado = isNaN(valor_adicionado) ? 0 : valor_adicionado;
                    var valor_futuro = valor_adicionado + valor_cheque,
                    tabela_add = $("#"+$tabelas.lista_cheque_tab+' table tbody'),
                    dados_adicionar_na_tabela = '<tr>';

                    if(valor_futuro > falta_pagar) {
                        $(this).addClass('liberar');
                        mostrarMensagemErroSucessoAlerta('O valor não pode ser maior que o total a ser pago', $("#"+$inputs.valor_cheque));
                        return false;
                    }
                    dados_cheque.botao_remover = '<i class="fas fa-trash text-danger '+$botao.remover_cheque+'"></i>';
                    //console.log(dados_cheque)
                    $.each(dados_cheque, function(i, adicionar){
                        var add_diferenciado = adicionar;
                        //console.log('i',i,'ADD', adicionar);
                        add_diferenciado = i.toLowerCase().indexOf('vencimento') != -1 ? getDataBR(add_diferenciado) : add_diferenciado;
                        dados_adicionar_na_tabela += '<td>'+add_diferenciado+'</td>';
                        if(adicionar.toLowerCase().indexOf('<button') == -1) {
                            adicionar = i.toLowerCase().indexOf('valor_cheque') != -1 ? valorMonetarioParaFloat(adicionar) : adicionar;
                            dados_adicionar_na_tabela += '<input type="hidden" name="'+i+'_adicionar[]" value="'+adicionar+'">';
                        }
                    });
                    dados_adicionar_na_tabela += '</tr>';
                    
                    
                    chamadaAjax({
                        url: '/controle_financeiro/setVerificarCheque/',
                        data: {entidade_id: entidade.entidadeD, documento: dados_cheque.numero_cheque,parcela: '1',emissao: dados_cheque.vencimento_cheque},
                        LoadMsg: 'Verificando...',
                        success: function(ok) {
                            var data = ok.data_msg;
                            if(data == "true") {
                                tabela_add.append(dados_adicionar_na_tabela);
                                $('a[href="#'+$tabelas.lista_cheque_tab+'"]').removeClass('disabled');

                                $("."+$inputs.valores_cheques_add).val(valor_futuro.toFixed(2));
                                var valor_formatado = formatarValorParaPadraoBr(valor_futuro);

                                $('totais-cheques').text( valor_formatado );
                                
                                if(valor_futuro < falta_pagar) {
                                    $(this).addClass('liberar');
                                    $("."+$form.dados_cheque_add).find('input:visible').val('');
                                    $("#"+$inputs.valor_cheque).val( formatarValorParaPadraoBr((falta_pagar - valor_futuro)) );
                                    setTimeout(function(){ $("#"+$inputs.banco_cheque).select().focus() }, 80);
                                } else {
                                    $("."+$form.dados_cheque_add).find('input:visible').val('');
                                    //setTimeout(function(){  $("#"+$inputs.banco_cheque).focus() }, 80);
                                }
                            } else {
                                mostrarMensagemErroSucessoAlerta('Esse cheque já está cadastrado com estas informações, verifique o número do cheque', $('#'+$inputs.numero_cheque));
                            }
                        }
                    })

                } else {
                    $(this).addClass('errado');    
                    $(this).closest('div').append('<div style="display: block;" class="invalid-feedback">O valor não pode ser 0</div>');
                        
                }
            } else {
                $(this).removeClass('liberar');
            }
            
        }).on('keydown',"#"+$inputs.valor_cheque, function(e){
            if(e.which == 13) {
                //console.log('TESTE')
                $(this).blur();
                return false;
            }
        })

        

        $("#"+$inputs.doc).on('keydown', function(e){
            if($("."+$inputs.select_forma).find('option:selected').text().toLowerCase().indexOf('cheque') != -1 && (e.which == 13 || e.which == 9) && $(this).val().length > 0) {
                IniciarCheque($(this).val());
                return false;
            }
        })

        $('body').on('click', "."+$botao.btn_remover_forma_pagto, function(e, remover_forma){
            this.tr = $(this).closest('td').closest('tr');
            this.forma = this.tr.children('td:nth-child(1)').text();
            this.valor = "R$ "+this.tr.children('td:nth-child(2)').text();
            this.RemoverForma = function(tempo) {
                    tempo = tempo == undefined ? 400 : tempo;
                    var valor_reduzir = valorMonetarioParaFloat(this.valor),
                    valor_ja_pago = parseFloat( $(contador_pago).val() ),
                    valor_reduzido = valor_ja_pago - valor_reduzir;

                    $(contador_pago).val(valor_reduzido.toFixed(2));
                    $("#"+$inputs.valor_pagar).trigger('change');

                    this.tr.fadeTo(tempo, 0,function(){ $(this).remove() })
                    if(this.forma.toLowerCase().indexOf('cheque') != -1) {
                        LimparDadosCheques();
                    }            
            }
            var este = this;
            if(remover_forma != true) {
                confirmar('Tem certeza que quer remover a forma de pagamento: '+este.forma+' - '+este.valor+'?', function(e,b){
                   if(e) {
                        este.RemoverForma();
                        b.modal('hide');
                   }
                }, 1);
            } else {
                este.RemoverForma(0);
            }
        });

        $('body').on('click',"."+$botao.remover_cheque, function(e){
            var tr = $(this).closest('tr');
            this.numero_cheque = $(tr[0].children[6]).text();
            this.valor_cheque = $(tr[0].children[10]).text();
            this.valor_cheque_float = valorMonetarioParaFloat( this.valor_cheque );
            $("."+$botao.remover_cheque).removeClass('clicked');
            $(this).addClass('clicked');
            var este = this;

            confirmar("Remover o cheque de número: "+este.numero_cheque+" de valor R$ "+este.valor_cheque, function(a,b,c){
                if(a) {
                    var tr = $("."+$botao.remover_cheque+'.clicked').closest('tr'),
                    valor_cheque_float = valorMonetarioParaFloat( $(tr[0].children[10]).text() );

                    tr.fadeTo(400, 0, function(){ 
                        $(this).remove();
                        if($("."+$form.dados_cheques_adicionados+" table tbody tr").length == 0) {
                            $('a[href="#'+$divs.cadastro_cheque_tab+'"]').click();
                            $('a[href="#'+$tabelas.lista_cheque_tab+'"]').addClass('disabled');                            
                        }
                    });
                    var valor_atual = 0;
                    $('.'+$form.dados_cheques_adicionados+' table tbody tr').each(function(e){
                        valor_atual += parseFloat( $( $(this)[0].children[11] ).val() );
                    });   

                    var valor_reduzido = valor_atual - valor_cheque_float,
                    valor_formatado = formatarValorParaPadraoBr(valor_reduzido);


                    $('totais-cheques').text( valor_formatado );
                    $("."+$inputs.valores_cheques_add).val(valor_reduzido.toFixed(2));

                    $("."+$tabelas.formas_pagto+" tbody tr").each(function(i,a){
                        var tipo = $(this).find('td:nth-child(1)').text();
                        if(tipo.toLowerCase().indexOf('cheque') != -1) {
                            if(valor_reduzido == 0) {
                                $(this).find('td:nth-child(3)').find('.'+$botao.btn_remover_forma_pagto).trigger('click', [true]);
                                return false;
                            }
                            $(this).find('td:nth-child(2)').text(valor_formatado);
                            $( $(this).find('input')[1] ).val(valor_reduzido);
                            AtualizarPagamento();
                        }
                    });
                    
                    b.modal('hide');
                }
            }, $(this))

        });


    $("."+$botao.btn_desfazer_lote).on('click', function(){
        var tr_lote = $('tr.selected.lote');
        if(tr_lote.length == 1) {
            this.id_lote = tr_lote.attr($roles.role_id); 
            this.documento = tr_lote.find('td:nth-child(2)').text(); 
            this.valor_lote = tr_lote.find('td:nth-child(5)').text(); 
            this.saldo_lote = tr_lote.find('td:nth-child(6)').text(); 

            //, documento_lote: este.documento_lote, valor_lote: este.valor_lote, saldo_lote: este.saldo_lote
            var documento = tr_lote.children('td:nth-child(2)').text(),
            este = this; // Usar, pois a função de função embaraça o JavaScript. Então, setando o this em uma var, ele sempre pegará o objeto atual

            confirmar('Deseja desfazer o lote de documento: '+documento, function(e, b){
                if(e) {
                    b.modal('hide');

                    chamadaAjax({
                        url: '/controle_financeiro/desfazer_lote/',
                        data: {id_lote: este.id_lote, doc_lote: este.documento, valor_lote: este.valor_lote, saldo_lote: este.saldo_lote},
                        type: 'PUT',
                        LoadMsg: 'Enviando Dados...',
                        success: function(ok){ 
                            var dados = [];
                            Tabela().row('.lote.selected').remove().draw();
                            $.each(ok.data_msg, function(i, data){
                                data.VALOR_RESTANTE = data.VALOR;
                                dados.push(AddDadosTabela(data));
                            });
                            Tabela().rows.add(dados).draw(false);
                            Ajustar();
                            LimparDados(true);
                            mostrarMensagemErroSucessoAlerta('Lote desfeito com sucesso', false, false);
                            $('body').trigger('conte-registros');
                        }

                    })
                }
            })

        }
    });
    var AjustarAlturaTabela = () => { $('#tabela-dados_wrapper .dataTables_scrollBody').css({'height': ($(window).height() * 0.67)+'px'}) }
    $(window).resize(function(){
        AjustarAlturaTabela();
        Ajustar();
    })
    var forma_p_f = TipoControle.HabilitarFormasPgto();
    if(typeof forma_p_f.fixar != undefined) {
        if(forma_p_f.fixar == 'banco') {
            jaInserirPgto.pgtoInsert = true;
            setTimeout(function(){
                $('.'+$inputs.select_forma).prop('disabled',true).find('option['+$roles.data_bank+'=BANCO]').prop('selected', true).trigger('change');
            }, 440);
            $('.'+$inputs.doc).prop('disabled',true).parent().parent().hide();
            $('.'+$inputs.select_conta).prop('disabled',true).val(conta_id);
        }
    }

    AjustarAlturaTabela();
});