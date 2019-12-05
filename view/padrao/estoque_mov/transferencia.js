$(document).ready(function(e){
   //if(typeof doc_id != "undefined") {
       var doc = {
           id: doc_id,
           set val(id) {
               this.id = id;
           },
           get val() {
               return this.id;
           }
       }
   //}

   var data_transferencia = $('.'+$inputs.data_transferencia).datepicker(options_datePicker);
   data_transferencia.datepicker('option', "showOn","button");
   data_transferencia.datepicker('option', "buttonText", '<i class="fas fa-calendar"></i>');
   data_transferencia.datepicker("setDate",new Date()).trigger('change');

   $('.'+$inputs.entidade_id).chosen2()

   navegacaoEntreInputsEmUmaMesmaDiv($('.Inputar'), function(ultimo,campo){
       if(ultimo) {
           $('.'+$inputs.inp_codigo).first().focus();
           return false;
       }

       if(getTagName(campo) == "input") {
           campo.select();
       }
   });


   function getFocarEmpresaDestino() {
        var local = $('#entidade_id_chosen').find('input[type="text"]');
        return local;
   }

   setTimeout(function(){ getFocarEmpresaDestino().focus() }, 250)

   function atualizarSetorDestino(filial) {
      filial = parseInt(filial);
      var input_setor_destino = $('.'+$inputs.setor_destino);
      var setores_destino = '';

      for(var i in setores) {
         var setor = setores[i];
         if(parseInt(setor.FILIAL) == filial) {
            setores_destino += '<option value="'+setor.ID+'">'+setor.ID+' - '+setor.NOME+'</option>';
         }
      }

      if(setores_destino.length > 0) {
          input_setor_destino.attr($roles.role_filial, filial).html(setores_destino);
      }
   }

   $('.'+$inputs.entidade_id).on('change',function(){
      var filial = $(this).find('option:selected').attr($roles.role_filial);
       atualizarSetorDestino(filial);
   }).trigger('change');

    function atualizarItens (numero_itens_atualizar) {
        var tabela_prod =  $('.'+$tabelas.tabela_transferencia),
            ultimo_item_bd = tabela_prod.attr($roles.role_ultimo_item),
            linhas_bd = tabela_prod.find('tbody').find('tr['+$roles.role_id+']'),
            linhas_bd_qntd = linhas_bd.length,
            linhas_normais = linhas_bd.last().nextAll();

        if(numero_itens_atualizar) {
            tabela_prod.find('tbody').find('tr').each(function(i,a){
                var item = i + 1;
                $(a).find('td:nth-child(2) span').html(item);
            })
            return false;
        }

        linhas_normais.each(function(i,a){
            var item_fator = i + 1,
            item = parseInt( tabela_prod.attr($roles.role_ultimo_item) ) + item_fator;
            $(this).attr($roles.role_item, item);
        })
        tabela_prod.addClass('att_itens');
    }

    function gerarLinhaTabelaItem(id,focar,tempo,contar_item) {
        focar = focar == undefined ? true : focar;
        tempo = tempo == undefined ? 0 : tempo;
        contar_item = contar_item == undefined ? true : contar_item;
        id = id == undefined ? parseInt($('#'+id_tr).closest('tbody').find('tr').last().attr('id').replace('tr_','') ) : id;
        if(isNaN(id)) {
            id = $("."+$tabelas.tbody_t1).length
        }
        valores_tr_ant = 0;
        var pr_id = Math.ceil((new Date()).getTime() * (Math.random() * 100)),
            ultima_linha = $("."+$tabelas.tbody_t1).find('tr').last(),
            id_tr = 'tr_'+pr_id,
            item = $("."+$tabelas.tbody_t1+' tr').length + 1;
        //var id_cfop_chose = Math.ceil((Math.random() * 15) * (new Date()).getTime());

        var new_tr = ' <tr id="'+id_tr+'" '+$roles.role_grade+'="1"> <td> <button role-id="\'+pr_id+\'" class="rmv_item" type="button"><span class="fas fa-trash"></span></button> </td> <td><span>'+item+'</span></td><td> <input role-id="'+pr_id+'" class="input-70 td_input produto_id somente-numero '+$inputs.id_produto+' '+$inputs.inp_codigo+'" data-option="{ponto: false, virgula: false, decs: 100, negativo: false, per_cent: false}" name="id_produto[]"> </td><td> <input role-id="'+pr_id+'" id="'+$inputs.desc_produto+'_'+pr_id+'" class="td_input nome_produto '+$inputs.desc_produto+'"> </td> <td><select id="'+pr_id+'" class="td_input cfop_transferencia no" name="cfop[]"><option value="9001">9001</option><option value="9002">9002</option></select></td> <td> <input id="'+pr_id+'" class="td-right td_input money_qnt quantidade qntd" name="quantidade[]"> <input type="hidden" class="preco_compra" name="preco_compra[]" class="price"> <input type="hidden" class="unidade_medida" name="unidade[]" class="unidade_medida"></td><td> <button class="btn btn-success '+$botao.add_grade+'" type="button"><i class="fas fa-plus"></i></button> </td><td class="'+$ClassesAvulsas.grade_td+'"><span data-placement="right" class="td_input" title=""> </span></td></tr>';

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
                atualizarItens();
            }

            if(id != 0 && focar) {
                setTimeout(function(){ $("#tr_"+pr_id+" > td > .id_produto").focus(); }, tempo);
            }
            setTimeout(function(){ gerarAutocompleteNomeProduto("#"+$inputs.desc_produto+"_"+pr_id) }, 600);
        } else {
            setTimeout(function(){ ultima_linha.find('.'+$inputs.id_produto).focus() }, 250);
        }
        var retorno = $('#'+id_tr);
        atualizarItens(true);
        //setTimeout(function(){ retorno.find('select:not(.no)').trigger('change') }, 400);
        //$("#"+$inputs.cfop+'_'+id_cfop_chose).chosen({no_results_text: "Nada encontrado", title:'teste'});
        return retorno;
    }

    function limparDados() {
        var load = Load('Limpando');
        $('.'+$tabelas.tbody_t1).html('');
        setTimeout(function(){ gerarLinhaTabelaItem(0).find('.'+$inputs.id_produto).attr('required', 'required')}, 200);
        data_transferencia.datepicker("setDate",new Date()).trigger('change');
        $('button[name="remover_pedido"]').hide();
        load.RemoverLoad();
        doc_id = undefined;
        if(typeof doc != "undefined") {
            if(typeof doc.id != "undefined") {
                doc.id = undefined;
            }
        }
        setTimeout(function(){ getFocarEmpresaDestino().focus() }, 300);
        return false;
    }

    $('.btn-limpar').on('click',limparDados)

    gerarLinhaTabelaItem(0).find('.'+$inputs.id_produto).attr('required', 'required');
    ativarGrades(gerarLinhaTabelaItem);
    //  Quando o codigo é adicionado e clicado em enter ou tab ele coloca nos campos as informações relativas ao produto
    $("body").on('blur','.'+$inputs.id_produto,function(event){
        var val = $(this).val();
        var role_val = $(this).attr($roles.role_val);
        if(val.length > 0) {
            if($(this).attr($roles.role_use) != undefined) {
                setTimeout(function(){ $(this).closest('td').closest('tr').find('td:nth-child(3) > input').focus()}, 200);
            } else {
                if(val != role_val) {
                    getProdutoId(this, event);
                }
            }
            $(this).removeAttr($roles.role_use);
            return false;
        }
    }).on('keydown', '.'+$tabelas.tabela_transferencia+' .td_input',function(e){
       if(e.which == 13) {
          var tr = $(this).closest('tr');
          var td = $(this).closest('td');
          var td_prox = td.next().find('.td_input');
          if(td_prox.length != 0) {
              if(($(this).hasClass($inputs.inp_codigo) || $(this).hasClass($inputs.desc_produto)) && tr.find('.'+$inputs.inp_codigo).val().length > 0) {
                  setTimeout(function(){ td.closest('tr').find('.qntd').focus().select() }, 300);
              } else {
                  setTimeout(function () {
                      td_prox.select().focus()
                  }, 300);
              }
          } else {
              $(this).blur();
          }
          return false;
       }
    }).on('blur', '.'+$inputs.quantidade, function (e) {
        var valor = $(this).val();
        var tr = $(this).closest('tr');
        var produto = tr.find('.'+$inputs.id_produto).val();
        var nome_produto = tr.find('.'+$inputs.desc_produto).val();

        if(parseInt(tr.attr($roles.role_obrig_grade)) == 1) {
            tr.find('.'+$botao.add_grade).click();
        }

        if(parseFloat(valor) > 0 && produto.length > 0 && nome_produto.length > 0) {
            gerarLinhaTabelaItem(idTabelaProdutos());
        }
    }).on('focus', '.'+$inputs.quantidade, function (e) {
        var input = $(this);
        setTimeout(function(){ input.select() }, 100);
    });

    $('#form_transferencia').submit(function(){
        var dados_enviar = dadosFormularioParaJson($('.form_transferencia').serializeArray());

       var produtos = [], quantidades = [], cfops = [], grades = [],
           precos_compra = [], unidades = [];

       for(var i in dados_enviar.id_produto) {
           var produto = dados_enviar.id_produto[i];
           var quantidade = valorMonetarioParaFloat(dados_enviar.quantidade[i]);
           var cfop = dados_enviar.cfop[i];
           var preco_compra = dados_enviar.preco_compra[i];
           var unidade = dados_enviar.unidade[i];
           var tr = $('.'+$tabelas.tbody_t1).find('tr:nth-child('+(parseInt(i) + 1)+')');
           var grade = tr.find('.grade_td').attr('role-grade');

           var selecionado_origem = $('.'+$inputs.setor_origem).val();
           var setor_destino = $('.'+$inputs.setor_destino);
           var filial_destino = parseInt(setor_destino.attr($roles.role_filial));
           var selecionado_destino = setor_destino.val();

           if((filial_destino == empresa_origem) && (selecionado_destino == selecionado_origem)) {
               mostrarMensagemErroSucessoAlerta('Não é possível transferir produtos para o mesmo setor',setor_destino)
               return false;
           }

           if(produto.length > 0) {
               grade = grade == undefined ? null : grade;
               var nome_prod = tr.find('.'+$inputs.desc_produto).val();
               var item = tr.find('td:nth-child(2) span').text();
               var btn_grade = tr.find('.'+$botao.add_grade);

               if(parseInt(tr.attr($roles.role_obrig_grade)) == 1 && grade == null) {

                   mostrarMensagemErroSucessoAlerta('É necessário informar a grade no item '+item+' de nome '+nome_prod,btn_grade);
                   return false;
               }

               if(quantidade == 0 || isNaN(quantidade)) {
                   mostrarMensagemErroSucessoAlerta('Quantidade zerada no item '+item+' de nome '+nome_prod,tr.find('.qntd'))
                   return false;
               }

               produtos.push(produto);
               quantidades.push(quantidade);
               cfops.push(cfop);
               grades.push(grade);
               precos_compra.push(valorMonetarioParaFloat(preco_compra));
               unidades.push(unidade);
           }
       }

       dados_enviar.id_produto = produtos;
       dados_enviar.quantidade = quantidades;
       dados_enviar.preco_compra = precos_compra;
       dados_enviar.unidade = unidades;
       dados_enviar.cfop = cfops;
       dados_enviar.grade_id = grades;

       if(typeof doc != "undefined") {
           if(typeof doc.id != "undefined") {
               dados_enviar.estoque_mov_id = doc.id;
           }
       }

       dados_enviar = JSON.stringify(dados_enviar);

       var enviar = new FormData();
       enviar.append('dados_gravar',dados_enviar);

       chamadaAjax({
           url: '/estoque_mov/transferencia/adicionar',
           type: 'POST',
           data: enviar,
           processData: false,
           contentType: false,
           LoadMsg: 'Processando...',
           success: function(ok) {
               mostrarMensagemErroSucessoAlerta(ok.data_msg.msg, false, false);
                doc.id = ok.data_msg.estoque_mov_id
               //limparDados();
               //$('.btn-limpar').click();
           }
       })

       return false;
    });

    $('body').on('click','.'+$botao.rmv_item, function(){
        var tr = $(this).closest('tr');
        this.tr = tr;
        var este = this;

        const remocaoItemLinha = () => {
            var tbody = este.tr.closest('tbody');
            var trs = tbody.find('tr').length;
            var tr_last = tbody.find('tr').last();
            este.tr.fadeOut(400, function(){
                este.tr.remove();
                if(trs == 1) {
                    gerarLinhaTabelaItem(0).find('.'+$inputs.id_produto).attr('required', 'required');
                } else if(tr_last.find('.'+$inputs.inp_codigo).length > 0) {
                    gerarLinhaTabelaItem(idTabelaProdutos())
                }
                atualizarItens(true);
            })
        }

        confirmar('Deseja remover este item?',function(a,b){
            if(a) {
                remocaoItemLinha()
                b.modal('hide')
            }
        })
    })

    $('button[name="remover_pedido"]').on('click', function(){
        if(doc_id != undefined) {
            confirmar('Você deseja excluir esta transferência', function(a, b) {
                if(a) {
                    chamadaAjax({
                        url: '/estoque_mov/estoque_mov/deletar_estoque_mov',
                        type: 'DELETE',
                        dataType: 'JSON',
                        data: {nota_id: doc_id},
                        LoadMsg: 'Excluindo...',
                        success: function(response) {
                            mostrarMensagemErroSucessoAlerta(`Transferencia id ${doc_id} excluído com sucesso`,false, false);
                            limparDados()
                        }
                    })
                    b.modal('hide')
                }
            })
        }
    })

    if(typeof dados_transferencia != "undefined") {
        dados_transferencia = dados_transferencia;
        // Cabecalho
        var cabecalho = dados_transferencia.CABECALHO[0];
        var produtos = dados_transferencia.ITENS;

        if(cabecalho == undefined) return false;

        $('.'+$inputs.entidade_id).val(cabecalho.ENTIDADE_ID);
        var data_emissao = cabecalho.DATA_EMISSAO.split('-');
        data_transferencia.datepicker("setDate",new Date(Date.UTC(data_emissao[0],parseInt(parseInt(data_emissao[1]) - 1),data_emissao[2],3 ))).trigger('change');
        $('.'+$inputs.setor_origem).val(produtos[0].SETOR_ORIGEM);
        $('.'+$inputs.setor_destino).val(produtos[0].SETOR_DESTINO);

        for(var i in produtos) {
            var item_produto = produtos[i];
            var tr = $('.'+$tabelas.tbody_t1).children('tr').first();
            if(i != 0) {
                tr = gerarLinhaTabelaItem(idTabelaProdutos());
            }

            for(var j in item_produto) {
                var valor_item = item_produto[j];
                var indice = j.toLowerCase();

                if(tr.find('.'+indice).length != 0) {
                    var ignorar_numerico = ["produto_id","cfop_transferencia","unidade_medida"];
                    if(ignorar_numerico.indexOf(indice) == -1) {
                        valor_item = $.isNumeric(valor_item) ? formatarValorParaPadraoBr(valor_item) : valor_item;
                    }
                    tr.find('.'+indice).val(valor_item);
                    if(indice == 'produto_id') {
                        tr.find('.'+indice).attr($roles.role_val, valor_item);
                    }
                }

                if(indice == "produto_grade_id" && valor_item != null) {
                    var grade_formatada = formatarNomeGrade(valor_item, item_produto.TAMANHO, item_produto.COR);
                    tr.attr($roles.role_obrig_grade, '1');
                    tr.find('.grade_td').attr($roles.role_grade, valor_item).
                    attr($roles.role_grade, valor_item).
                    find('span').attr('title',grade_formatada).html(grade_formatada);
                }
            }

            setTimeout(function(){ gerarLinhaTabelaItem(idTabelaProdutos()) }, 100);
        }
    }
});