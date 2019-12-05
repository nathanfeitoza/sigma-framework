(function($) {
    var origAppend = $.fn.append;

    $.fn.append = function () {
        return origAppend.apply(this, arguments).trigger("append");
    };
})(jQuery);

(function($) {
    var origPrepend = $.fn.prepend;

    $.fn.prepend = function () {
        return origPrepend.apply(this, arguments).trigger("prepend");
    };
})(jQuery);

(function($) {
    var origInsertAfter = $.fn.insertAfter;

    $.fn.insertAfter = function () {
        return origInsertAfter.apply(this, arguments).trigger("insertafter");
    };
})(jQuery);

(function($) {
    var origInsertBefore = $.fn.insertBefore;

    $.fn.insertBefore = function () {
        return origInsertBefore.apply(this, arguments).trigger("insertbefore");
    };
})(jQuery);
 
(function( $ ){
	$.fn.TabelaMultipla = function(opcoes) {
		 var padrao = {
		 	'height_body': 350,
		 	'width_table' : false,
		 	'width_div_table': false,
			'verticalSo': false,
			'widths_usar': [],
			'LinhaAdicionada': function(linha, tbody) {
				return [linha, tbody];
			},
			'LinhaRemovida': function(linha, tbody){
				return [linha, tbody];
			},
		 };

        const configs = $.extend( {}, padrao, opcoes );
		const eu = this;

		function getScrollBarWidth() {
	      var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
	          widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
	      $outer.remove();

	      return 100 - widthWithScroll;
		}

		function Percent(val1, val2) {
		  var verificar = val1 < val2 ? (val2 - val1) : val2,
		  per = (verificar * 100) / val1;
		  return per
		  
		}

		var prefix = "TabelasMultiplas",
		div_principal = prefix+"_scroll", 
		thead_divP = prefix+"_scrollHead",
		thead_divInner = prefix+"_scrollHeadInner",
		table_header = "table-header",
		table_body = prefix+"_scrollBody",
		headertable = "headertable",
		bodytable = "bodytable",
		tabela_scroll_vertical = 'tabela_scroll_vertical',
		height_body = configs.height_body;

		this.ajustar = function(verticalso, tabela_elemento) {

			if(typeof verticalso != "object") {
				const div_tabela_usando = eu.closest('.'+div_principal);
				const div_body_usando = div_tabela_usando.find("."+table_body);

				div_body_usando.css({"max-height": height_body+"px"});
				var width_antiga = div_tabela_usando.find('.'+table_body).css('width');


				const new_width = div_tabela_usando.outerWidth();
				const width_div_table = configs.width_div_table == false ? new_width : configs.width_div_table;
				const width_tbodytable = div_tabela_usando.find("."+bodytable+" > tbody").outerWidth();
				let width_perfeita = 0;

				div_tabela_usando.find("."+bodytable+' > thead > tr > th').each(function(i,e){
					width_perfeita += $(this).outerWidth();
				});

				let	width_table = configs.width_table == false ? Math.ceil(width_perfeita) : configs.width_table;

				if($.isNumeric(width_table)) width_table += 'px';

				if(!div_tabela_usando.hasClass('ajustado_width')) {
					div_tabela_usando.addClass('ajustado_width')
					.find("."+table_body)
					.css({width: width_div_table})
					.find('table')
					.css({width: width_table});

					div_tabela_usando.find("."+thead_divInner).css({width: width_div_table})
				}

				div_tabela_usando.find("."+thead_divInner).find('table')
				.css({width: div_tabela_usando.find("."+table_body).find('table').outerWidth() });

			    div_tabela_usando.find("."+bodytable+" tbody > tr").each(function(j, e){
				    	$(this).find('td').each(function(i,a){
					    var id = i + 1,
					    elemento = div_tabela_usando.find("."+bodytable+" thead > tr > th:nth-child("+id+")"),
					    width_add = elemento.outerWidth(true),
					    elemento_html = elemento.html();

					    //width_add = (width_add - (width_add * porcentagem_reducao) ).toFixed(3);
					    $(this).css({width: width_add+'px'});  
					    if(j == 0) {
						    elemento.html('<div class="sizing" style="height:0;overflow:hidden;padding-top: 0px; padding-bottom: 0px; border-top-width: 0px; border-bottom-width: 0px;">'+elemento_html+' </div>');
						    div_tabela_usando.find("."+headertable+" thead > tr > th:nth-child("+id+")").css({"width":width_add+"px"});
						}
			    	})
			    });



			    div_tabela_usando.find("."+bodytable+" thead > tr").css({"max-height": "0px"});

			    div_tabela_usando.find("."+bodytable+" thead > tr > th").css({ "padding-top": "0px", "padding-bottom": "0px","border-top-width":"0px","border-bottom-width": "0px","height": "0"});
			    div_tabela_usando.find("."+table_body).off('scroll').on('scroll',function () {
	        		div_tabela_usando.find("."+thead_divInner).css({ 'left': ($(this).scrollLeft()*-1 )+"px" });
	    		});

    		} else {

    			tabela_elemento = tabela_elemento == undefined ? $(this) : tabela_elemento;
				verticalso.each(function(i, eu){
					var nth = i + 1,
					width = configs.widths_usar[i],
					td = tabela_elemento.find('tbody > tr > td:nth-child('+nth+')');
					if(td.length != 0) {
						td.css({'width': width});
						setTimeout(function(){ $(eu).css({'width': td.outerWidth()+"px"}); },250)	
					} else {
						$(eu).css({'width': width});
					}
				});    			
    		}	
		}

		function Exception(msg, code) {

			msg = msg == undefined ? '' : msg;
			code = code == undefined ? 0 : code;

			this.msg = msg;
			this.code = code;
		}

		
		return this.each(function(index) {

			var id_div = 'receber_'+parseInt(new Date().getTime() * ( Math.random() * 15 ) ),
			parent = $(eu).parent(),
			tipo_ajuste = false;

			var tabela = this,
 			tabela_el = $(tabela),
			classes_tabela = tabela_el[0].className;
			
			if(!configs.verticalSo) {
				var div_criar = '<div class="'+div_principal+'"> <div class="'+thead_divP+'"> <div class="'+thead_divInner+'"> </div></div><div class="'+table_body+'"> </div></div>';
				div_criar = $(div_criar);
				div_criar.find('.'+thead_divInner).html('<table class="'+headertable+' '+classes_tabela+'"> <thead>'+tabela_el.find('thead').html()+'</thead> </table>');
				div_criar.find('.'+table_body).html( tabela_el.addClass(bodytable)[0] );

				parent.html($(div_criar));
				
			} else {

				tabela_el.addClass(tabela_scroll_vertical);
				var th = tabela_el.find('thead > tr > th'),
				tbody = tabela_el.find('tbody'),
				contar_elementos = th.length;

				if(contar_elementos == contar_elementos) { //configs.widths_usar.length
					tbody.css({'max-height': configs.height_body+"px"});
					tipo_ajuste = th;

					if(typeof intervalo == "undefined") {
						var intervalo = setInterval(function() {

								if(tbody.height() == configs.height_body) {

									if(!tbody.hasClass('ajustado')) {
										tbody.addClass('ajustado');
										eu.ajustar(tipo_ajuste, tabela_el);
									}

								} else if(tbody.height() < configs.height_body && tbody.hasClass('ajustado')){
									tbody.removeClass('ajustado');
									eu.ajustar(tipo_ajuste, tabela_el);
								}

							}, 600);
					}
				} else {
					throw new Exception('Array de larguras não é equivalente a quantidade de elementos do thead',1);
				}
				

			}

			var eu_retornar = $(this);
			parent.find("."+bodytable+' > tbody').off('append prepend insertbefore insertafter')
			.on('append prepend insertbefore insertafter',function(){
				var tbody = $(this),
				linha_add = tbody.find('tr').last();
				linha_add.off('remove').one('remove', function(){
					var removida = $(this);
					eu.ajustar(tipo_ajuste,tabela_el);
					configs.LinhaRemovida(removida, tbody);
					eu_retornar.trigger('LinhaRemovida',[removida,tbody]);
				})
				eu.ajustar(tipo_ajuste,tabela_el);
				configs.LinhaAdicionada(linha_add,tbody);
				eu_retornar.trigger('LinhaAdicionada',[linha_add,tbody]);
			})

			eu.ajustar(tipo_ajuste,tabela_el);
			
		});	
	}
})(jQuery);