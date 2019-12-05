window.isInt = function(n) {
    return Number(n) === n && n % 1 === 0;
}

window.isFloat = function(n) {
    return Number(n) === n && n % 1 !== 0;
}

window.keysToLoweCase = function(object) {
    var o = object;
    return Object.keys(o).reduce((c, k) => (c[k.toLowerCase()] = o[k], c), {});
}

function getChromeVersion () {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

    return raw ? parseInt(raw[2], 10) : false;
}

function getAmanha() {
    var amanha = (new Date()).setDate((new Date()).getDate() + 1);
    return new Date(amanha);
}

var autocomplete = getChromeVersion() < 69 ? 'off' : 'off';
$('input, form').attr('autocomplete',autocomplete);

/* Plugin para capturar posição do ponteiro em um campo */
(function($) {
    $.fn.getCursorPosition = function() {
        var input = this.get(0);
        if (!input) return; // No (input) element found
        if ('selectionStart' in input) {
            // Standard-compliant browsers
            return input.selectionStart;
        } else if (document.selection) {
            // IE
            input.focus();
            var sel = document.selection.createRange();
            var selLen = document.selection.createRange().text.length;
            sel.moveStart('character', -input.value.length);
            return sel.text.length - selLen;
        }
    }

    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);
/* FIM PLUGIN*/
(function($) {
    var origAppend = $.fn.append;
    $.fn.append = function () {
        return origAppend.apply(this, arguments).trigger("append", [arguments]);
    };
})(jQuery);

(function($){
    var originalVal = $.fn.val;
    $.fn.val = function(){
        var att = arguments.length > 0;
        if(att) $(this).trigger('pre_alterar');
        var result =originalVal.apply(this,arguments);
        if(att) $(this).trigger('alterado'); // OR with custom event $(this).trigger('value-changed');
        return result;
    };
})(jQuery);

(function($){
    var originalChosen = $.fn.chosen;

    $.fn.chosen2 = function(options) {
        options = options == undefined ? {} : options;

        options.no_results_text = "Nada encontrado";
        options.placeholder_text_single = "Selecione uma opção";

        return $(this).chosen(options)
        //return originalChosen.apply(this, options);
    }

})(jQuery);

(function($) {
    var originalPicker = $.fn.datepicker;
    $.fn.datepicker = function(set){
        if(set != 'setDate') {
            if(!$(this).hasClass('hasDatepicker')){
                var formato = '00/00/0000';
                if(arguments[0] != undefined) {
                    var formatar = arguments[0].dateFormatMask;
                    formato = formatar != undefined ? formatar : formato;
                    /*if(formatar != undefined) {
                     formato = formatar.replace(/([a-zA-Z])/g,0);
                     }*/
                }
                $(this).mask(formato);
            }
            
            var usarBotao = typeof arguments[0] != "undefined" ? (typeof arguments[0].usarBotao != "undefined" ? arguments[0].usarBotao : false) : false;
            
            if(usarBotao) {
                arguments[0].showOn = "button";
                arguments[0].buttonText = '<i class="fas fa-calendar"></i>';
            }
        }
        //        //result.datepicker('option', "showOn","button");
        //result.datepicker('option', "buttonText", '<i class="fas fa-calendar"></i>');
        
        var result = originalPicker.apply(this,arguments);

        if(set != 'setDate') {
            if(set != undefined) {
                if(set.usarDataAtual) result.datepicker('setDate', new Date());
            }
        }

        return result;
    };
})(jQuery);

(function($) {
    var origAppend = $.fn.modal;
    $.fn.modal = function() {
        if(this.hasClass($ClassesAvulsas.sem_principal)) {
            var tipo = arguments[0],
                evento = 'show.bs.modal';
            if(tipo == 'show') {
                this.removeClass('hide').addClass('show');
            } else if(tipo == 'hide') {
                this.removeClass('show').addClass('hide');
                evento = 'hidden.bs.modal';
            }
            this.trigger(evento);
        }
        return origAppend.apply(this, arguments);
    }
})(jQuery);

(function($) {
    var origPrepend = $.fn.prepend;

    $.fn.prepend = function () {
        return origPrepend.apply(this, arguments).trigger("prepend", [arguments]);
    };
})(jQuery);

(function($) {
    var origInsertAfter = $.fn.insertAfter;

    $.fn.insertAfter = function () {
        return origInsertAfter.apply(this, arguments).trigger("insertafter", [arguments]);
    };
})(jQuery);

(function($) {
    var origInsertBefore = $.fn.insertBefore;

    $.fn.insertBefore = function () {
        return origInsertBefore.apply(this, arguments).trigger("insertbefore", [arguments]);
    };
})(jQuery);

(function($) {
    var origSelect = $.fn.select;

    $.fn.select = function () {
        return origSelect.apply(this, arguments).trigger("select-act", [arguments]);
    };
})(jQuery);


$('body').on('append insertbefore insertafter prepend', function(){
    $('input, form').attr('autocomplete',autocomplete);
})

var dados_con = {
    url: $URL_BASE,
    type: $TYPE_BASE,
    dataType: $api.TipoDados
};
var timeComInput =  {
    create: function(tp_inst, obj, unit, val, min, max, step){
        $('<input class="ui-timepicker-input" value="'+val+'" style="width:50%">')
            .appendTo(obj)
            .spinner({
                min: min,
                max: max,
                step: step,
                change: function(e,ui) { // key events
                    // don't call if api was used and not key press
                    if(e.originalEvent !== undefined)
                        tp_inst._onTimeChange();
                    tp_inst._onSelectHandler();
                },
                spin: function(e,ui) { // spin events
                    tp_inst.control.value(tp_inst, obj, unit, ui.value);
                    tp_inst._onTimeChange();
                    tp_inst._onSelectHandler();
                }
            });
        return obj;
    },
    options: function(tp_inst, obj, unit, opts, val) {
        if(typeof(opts) == 'string' && val !== undefined)
            return obj.find('.ui-timepicker-input').spinner(opts, val);
        return obj.find('.ui-timepicker-input').spinner(opts);
    },
    value: function(tp_inst, obj, unit, val) {
        if(val !== undefined)
            return obj.find('.ui-timepicker-input').spinner('value', val);
        return obj.find('.ui-timepicker-input').spinner('value');
    }
};
window.tamanhoPercentualWindow = function($per_cent) {
    return $(window).height() * $per_cent;
}
window.getTagName = function(element)
{
    return element.prop("tagName").toLowerCase();
}
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.semEspaco = function() {
    return this.replace(/\s/g, '');
}
String.prototype.soNumero = function() {
    return this.replace(/\D/g,'');
}

window.getInputsVazios = function(div, setar_invalido){
    var vazios = [];
    div.find('input:visible, select').each(function(i, el){
        var valor = $(this).val();
        valor = valor == undefined ? '' : valor;
        if(valor.length == 0 && !$(this).hasClass('can-empty') && $(this).closest('.chosen-search').length == 0) {
            if(setar_invalido) $(this).addClass('input-invalid');
            vazios.push( $(this).attr('name') );
        }
    });

    if(vazios.length == 0) {
        habilitarSubmit();
        return true;
    } else {
        habilitarSubmit();
        return vazios;
    }
}

// Função que verifica se os números do CPF e CNPJ são uma sequência igual
window.verificarIguais = function(numero, tipo) {
    var cp = 11111111111;
    var cnp = 11111111111111;
    var divisao = 0;
    var resultado;

    if(tipo == "cpf") {
        divisao = parseInt(numero) / cp;
        resultado = divisao == numero[0] ? false : true;
    } else {
        divisao = numero / cnp;
        resultado = divisao == numero[0] ? false : true;
    }

    return resultado;
}

// Função que valida o CPF
window.validarCpf = function(valor) {
    var vl1, vl2;
    var m1 = 10;
    var m2 = 11;
    var dg1 = 0;
    var dg2 = 0;
    var soma1 = 0;
    var soma2 = 0;
    var mod1 = 0;
    var mod2 = 0;
    var digito1, digito2, valor2, valorfinal;

    vl1 = valor.substr(0,9);

    for(var i = 0; i <= vl1.length-1; i++) {

        dg1 = vl1[i] * m1;
        soma1 = soma1 + dg1;
        m1 = m1 - 1;
    }
    
    mod1 = soma1 % 11;

    if(mod1 < 2) {
        digito1 = 0;
    } else {
        digito1 = 11 - mod1;
    }

    valor2 = valor.substr(0,9).toString();
    valor2 = valor2 + digito1.toString();

    for(var n = 0; n <= valor2.length-1; n++) {
        dg2 = valor2[n] * m2;
        soma2 = soma2 + dg2;
        m2 = m2 - 1;

    }

    mod2 = soma2 % 11;

    if(mod2 < 2) {
        digito2 = 0;
    } else {
        digito2 = 11 - mod2;
    }

    valorfinal = valor2 + digito2;
    return valorfinal;
}

// Função que valida o CNPJ
window.validarCnpj = function(valor) {

    var m1 = 5;
    var m2 = 6;
    var mt = 9;
    var mt2 = 9;
    var dg01 = 0;
    var dg1 = 0;
    var dg02 = 0;
    var dg2 = 0;
    var vl1, vl2;
    var soma1 = 0;
    var soma01 = 0;
    var soma1t = 0;
    var soma2 = 0;
    var soma02 = 0;
    var soma2t = 0;
    var mod1 = 0;
    var mod2 = 0;
    var digito1, digito2, cnpjfinal;

    vl1 = valor.substr(0,12);

    for(var i=0; i < vl1.length; i++) {
        if(i <= 4 && m1 >= 2) {
            dg01 = vl1[i] * m1;
            soma01 = soma01 + dg01;
        } else {
            dg1 = vl1[i] * mt;
            soma1 = soma1 + dg1;
            mt = mt - 1;
        }

        soma1t = soma1 + soma01;
        m1 = m1 - 1;
    }

    mod1 = soma1t % 11;
    
    if(mod1 < 2) {
        digito1 = 0;
    } else {
        digito1 = 11 - mod1;
    }

    vl2 = vl1 + digito1;

    for(var n=0; n < vl2.length; n++) {

        if(n <= 4 && m2 >= 2) {
            dg02 = vl2[n] * m2;
            soma02 = soma02 + dg02;
        } else {

            dg2 = vl2[n] * mt2;
            soma2 = soma2 + dg2;
            mt2 = mt2 - 1;
        }

        soma2t = soma02 + soma2;
        m2 = m2 - 1;
    }

    mod2 = soma2t % 11;
    
    if(mod2 < 2) {
        digito2 = 0;
    } else {
        digito2 = 11 - mod2;
    }

    cnpjfinal = vl2+digito2;

    return cnpjfinal;

}

// Função que captura a data atual
window.dataAtual = function(data_tratar){
    data_tratar = data_tratar == undefined ? false : data_tratar;

    var data = (data_tratar == false ) ? new Date() : new Date(data_tratar);
    var dia = data.getDate();
    if (dia.toString().length == 1)
        dia = "0"+dia;
    var mes = data.getMonth()+1;
    if (mes.toString().length == 1)
        mes = "0"+mes;
    var ano = data.getFullYear();
    return dia+"/"+mes+"/"+ano;
}

// Função para validação do campo cpf_cnpj na hora de enviar o formulário (obs: Não usada como função para validar o campo no onkeyup por ser mais simples e nesse evento necessita-se de mais usualidades)
window.validarCamposCpfCnpj = function(valor) {
    if(verificarIguais(valor, 'cpf') == false || verificarIguais(valor, 'cnpj') == false) {
        return false;
    } else {
        if(valor == validarCpf(valor) || valor == validarCnpj(valor)) {
            return true;
        } else {
            return false;
        }
    }
}

window.retornoVar = function($data, $var, $tipo, $retorno_erro) {
    var retorno = typeof $var == "string" ? $data[$var] : $data;

    if(retorno != $tipo) {
        return retorno;
    } else {
        return $retorno_erro;
    }
}

window.ajustarToast = function() {
    var selecionar = $($divs.jq_toast.class);
    if(selecionar.length != 0)
    {
        var top_teste = selecionar.offset().top;

        if(top_teste <= 0)
        {
            var new_top = Math.ceil($(window).height() * 0.4);
            $($divs.jq_toast.class).css({'top': new_top});
        }
    }

    setTimeout(function(){ ajustarToast(); }, 500);
}

ajustarToast();

window.Mask = function(remove, load) {
    var use_msg = '';

    switch (typeof remove) {
        case 'string':
            use_msg = 'use_msg';
            remove = false;
            break;
    }

    var id_mask = 'load_mask_'+Math.ceil(Math.random() * (new Date()).getTime()) * 15;

    if(load) {
        var x = Load();//console.log(x);
    }
    /*else if(remove && !$($divs.loader.class).hasClass('use_msg')){
     if(typeof x != "undefined") {
     x.RemoverLoad();
     }
     }*/

    if(remove)
        $('mask')//.fadeTo(250, 0, function(){ $(this).remove(); });
    else
    if($('mask').length == 0 || $(id_mask).length == 0)
        $('body').prepend('<mask id="'+id_mask+'" class="'+use_msg+'" style="opacity: 0"></mask>');
    $("#"+id_mask).animate({opacity: 1}, 400);


    var r = {};

    r.RemoverMascara = function() {
        $("#"+id_mask).fadeTo(250, 0, function(){ $(this).remove(); });
        if(typeof x != "undefined") {
            x.RemoverLoad();
        }
    }

    return r;

}

window.Load = function(remove) {
    remove = remove == undefined ? false : remove;
    var use_msg = '', msg='';
    
    switch (typeof remove) {
        case 'string':
            use_msg = 'use_msg';
            msg = '<p>'+remove+'</p>';
            remove = false;
            var xm = Mask('a');
            break;
    }

    var id_load = 'load_'+Math.ceil(Math.random() * (new Date()).getTime());
    var load = '',
        img_s = 'data:image/gif;base64,R0lGODlhbgBuAPcAAAAAAAoUJRs7axw+cRw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch9AcyBCcyFDdCNEdSVGdidIeClJeStLeixMey1MfC5NfC5OfC9PfTFQfjJRfzVTgDdVgjpXhD1ahkBdh0JeiURgikVhi0Zii0djjElkjUtmjkxnj05okE9pkVBqklJsk1Ntk1VulFhxllt0mF93m2R7nmd+oGmAoW2DpHCFpXOHp3WKqXmNq32RroCTsIOVsYSWsoaYs4eZtImatYydt46fuJGhupOjvJamvZqpwJ+tw6Owxaazx6i1yKq2yau4yq25y666zK+6zLC7zbG8zrK+z7XA0LfC0rrE1LzG1b7I1sDJ2MLL2cXO28jQ3cvT3szU38/W4dDX4dDY4tHY4tLZ49Pa5NTb5NXc5dfd5trf59zh6d7j6uDk6+Hm7OPn7eTo7uXp7+fr8Ons8ens8ers8ert8ert8ert8uvu8uzv8+3v8+3w9O7x9PDy9fHz9vLz9vP19/T2+PX3+Pb3+fb4+ff4+vj5+vj5+/n6+/n6+/r7/Pv7/Pv8/Pz8/fz9/f39/f39/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJAwClACwAAAAAbgBuAAAI/gBLCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6ZLQ3POeJnShIiPNTZXItISJESBo0iPkgl6co6UHBqSSlXKlKSZG1OzHi1TNWSaHFrDmunq0Q2PsGjHktUIxwfasCZowFmbEcpbpCeITPGSJg9djY5+vP3gY8qcvx75yEAbYynij2xMhF3hhdPjj1s4aBUxZdLlj07CIkH0+WMXrSXclP6oRvNUFnpWe8wjIquNRLI7MmKR9Yfn3Bs1nZ3qwzLwjUmytoB0fGOarCX2NN84Y2oH1dMzgskKJntGTLyl/gbxnrHKVA58yF+EJFnqEvUX7UoVoQi+xRFTqdiv+OY1pv0UPZEfgBTRMFUfBEpkyFQ0JCiRFVNB4WBEgkl12IQOTeKBVCtg+NAcUyXhoUNmTNXFiA15MZVaKCpExVQXtphQE1MJIqNCRUxl3I0HVYiUCTwmhINULgSJkA5StZBbC1LtoFEQUoWQm1FJjZfREVP99lklUx2hkXxJSVdaHlNFoRGEUrGxmhpTXaGRGFONsVoYUzmG0RptrmaeVNhhRKZURqyWo1TpZcQJlUihsBp+SZXAkRBTyfGZG1MNwdEWZX4moFRfcJTIVDd8ZmBSGuDGEVZSFfLYglLp4BGY/khh8RiaSUnhUX9SzYAYJy7A+FF7SWnx1xVTKfoRrEelwBxZjgCLlJkfMXJChGuFJpUJy360Z1IfDNIVHx1MZYVImKwwFQ871qQJklKxoMlI203VBFNKZCVGSaNKJWdN8UqFg0nPTfVBHTTVseFUb5yERFYrMCJTIuZOpQRKmuyQVXEwcTKcVDy8i5Ii4Un1Q7YrBaacwyrhUdtUMhSqEh8vZCWCmCulEdVUJsyVUmRZcaDGS7RK5UGnJ33hmokxbZrVvCXVq9UTM22xgVY02PmRGIv1vEVNaTBqG4sbkZHvVCOoadMeMYdlQxoaXYXWCzTb5IhbaLGAhBmVSFRJjBlHhKzVD46sReNdHvyAxRp2HIKQIXasgcUPB7/FNF1qgHXXfCzcQAMLK1+OlA4/XzZG2p6XnlVjsm2iRcSmm77CFumuNgkVzrYOFxV5ZzfJGUvAYDvLS5yRu32EZCFECaabIEQWhKB4CB1o7NSTDz4Q0cReaNBBmpHcd+/99+CHL/745Jdv/vnopxQQACH5BAkDAJgALAAAAABuAG4AhwAAAAQIDgcPGhw+cRw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch4/ciBBcyFCdCNEdSRFdiZGdydIeClJeSpKeixLey1NfDBPfTFQfjNRfzRTgDZUgThVgjlXgzpYhD1ahT9ch0FdiENfiURgikZii0djjElkjUxnj05pkFBqklJtk1VvlVlyl111mmB4nGN6nWZ9n2l/oWuBomyCo26EpXGHp3SJqHeLqnmNq3yQrYCTsISWsoeYtImatYqbto2et5CguZKiu5WlvZenvpmov5yrwZ+uw6KwxaWyxqWzx6e0yKm2ya25zLC8zrK+z7XA0bfB0rjD07rE1LzG1b/I18LL2cbO28nS3czU38/X4dLZ49Xb5dfd5trf6Nvh6d3i6t/j6+Hl7OTo7uXp7+fr8Ons8ert8evu8uzv8+7x9O/y9fDy9vHz9vL09/P09/T1+PX2+Pb3+ff4+vj5+vj5+/n6+/n6+/r7/Pr7/Pv8/Pv8/fv8/fz8/fz9/f39/f39/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+ADEJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzpsswTobsqMECRIENI1LAuKHEix2bI/doITKjgNOnUKM6VaEGaUdEXnpskMqV6wVAVjWaITKiq1mpMsJibIPjrNuoRNRWHLREw9u7TrHInQgmBV6nGUCgcDHDhYkOUd/sjZgE74kgV+YkXAOGSpLFD+vYeItiCRrMHsuUOLvhRxjQH6VgMNshyVHUHfvwMMsByWvYHTd3zUEH98cgXS808f3RSVcRYoh79FKBq4w4yjuSsSu1SKHoHN2I4KoEe8cbXHX+eOcYhquLPuM3upAKwk16jVWkYkj+HmOf7VGR1M+4RKqHPPtdNAcHUj0R4EVMSGUCWAdWJINUVjRY0RxSsSBhRVBINcWFFOkGFXQcRnSHBVG9EKJEVkil34kQ5SDVGCxCREJUH8QIkVQ92OiQGlJdpiNDXkhVxY8MSSEVGEQudIRUbCSp0GxQWeCkQg9ChcKUCb0QlYVYHlRDVCV0eZCLUHEgpkFASHXImQQRIVVvbArUX1RrxClQhlGRYScmV0C4pxlS+UCcFkiC5BNUIPhWyFYYyEDEFnBq9INUesIWZFTibdRnVEvgJoRUV3BEh1Q04IbfUxjs0VEMUV0AIGj+5UV1g0dIFIiam1FR4VGsUH2g6mJ6eBCVBZJ1lMgKUnW32JJRlfqRFlJ1UMdecawWlYEgrQfXXpNG5cFtHnUhVQbuhZUGV06MxGpUNSQSFnhgXifSF1ytaBMVXGVREg1ceWGTFyRGFYNJY3DVQZ0zlUFdVDCa1ARXLTAIkxszSsVDSvBGBURMe7TAVQnFnoQHClwJIS9LcMDAlQdprGTGwlDRAC5KY5wK1QWnsYRFVyi0nNIVGXQVqkufcsXBFyclYoRZPr4EXFc9lCsSHRnjOFOCXWmAxKseAdKEsF0NcXJMV1jLlQhSIMJRIlacYJYGWyAVBthdjTBEwxbR0YSeX2ah8JlVabjtFgpHmMFXD0GfZQPXVuVRBF4sILFFkwnZ4YUSNxzqVqeYqaHDXwVwMAMNpBeGAgiJ49VCoaiB4THosENlQhXu+pbIFCHEDroHTfjhnR9b9ICY7mbFIIUe+w3SxQ8fEP/UB0MYzqEXQbAA+gY3MJGzjmhswYQQOMCwHQgs1MDDEE9Uuuf67Lfv/vvwxy///PTXbz92AQEAIfkECQMAowAsAAAAAG4AbgCHAAAAFjBWHD5wHD5xHD5xHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHkByH0FzIUJ0IkN1I0R1JEV2JEV2JUZ3Jkd4KEl5Kkp6K0p6LEt7Lk18ME9+MlB/MlF/M1KANVOANlSBN1WCOFaCOVaDOleEPFmFPVqGP1yHQV6IQ1+JRGCKRmGLSGOMSmWOTWePT2mRUGqRUWuSUmyTVW6VWHGXXHSZYHibZHueaH6ga4GiboSkcIamcoenc4iodYmodouqeY2rfZCugZSxhJeyhpi0iZq1i5y2jZ64kaK6lKS8mKe+nKrBnq3CoK7DorDFpLLGp7XIq7jKrrvNsr7PtcDQtsHRucPTusXUvcbVwMnXw8zZxc7bx8/cyNDcytLdzNPfzdXgz9bh0dji09rk1tzl193m2N7m2d/n2uDo3OLp3+Tr4eXs4+ft5Oju5env5urv5+vw6ezx6u3y6u3y6u7y7O/z7fDz7vH07/L18PL18fP28vT38/X39Pb49ff59vj59/j6+Pn6+fr7+fr7+vr7+vv8+/v8+/v8+/z8+/z8+/z8/Pz9/Pz9/Pz9/f39/f39/f3+/f3+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4ARwkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmSzpgsEAxAmSGCAMkXtz4sSRLGkM2Rxb6osSFgadQo0p9auNJGktJN7qJomOq169QQxRJk9VimR9g06qtgeVQWYhfcKidq5bIW4aWuMygyxcs2bsJ6djoC7XDihs5UvDdAThhFr4hhGxhYweRQT5txmhxAsOrmMYGCwmZW/XMpIhunLSAGqMTaIJpVqTNQEQOxjVMUHB5PTCK2iV3eHvsNARsCCd9hH9cArZHcuUeq3zFEGUTdI9evpr4e51jGQ1eff4E6t4xDgivQDKR5wjphdcbi9ZzlD4VhiD5GwN9mFoCD/6NR0wFghv/afSGV1gUqJFcUs2AlYIXceEVdxBWpJhUdlVo0RhTfcCHhhYRMdUUIFaESAdSjVBiRV1MpcSKFAEx1RkwSvRHBlKt4FqNEF0x1RM8RjSaVLYF+ZAMUtlg5EOW4BgVE0s6RMdUV0TZUBhTjWElQ1RMVceWCyEx1YNgItRVVC+UqVANUgGhZkI7SBXEmwjJGBUPdB5UXFQz5GlQElKV4GdBTUiFwaAESTFVIYgKZMVUajQ6CodSkdgoIhhI9YOko+QgVQenNQrFVGhIWsZUUki6CHhR9cBpD/5Tfdiob1I1ISkbU3VACGiLWFYSD6iCNoUIyJFEaVQkxHcXHxw8tQESX4rEplRWACaiVFCGlJ1UKTTyFq5TdSFSJk5J5URZnQwmFQ4kbeFZVlp49QZJk1wYFQjB1WTeVEmYdGxUNjBCEx4mTBXCeCYVOlURMxXS2VTVntTIDV4tsaNLjXg61QuQpHRHCF4JIXBLmQThVQhxrATGVzowulIgPnilAYUpMeeVDHqolEbBXnmBMQ1foVBkSZtEkSmCMPXBYK5O7DpSH7B+dW5MiwzpFQlVjOxRH06A/NUQNY0K1gpbWLeRHUs0O10UZM7EBatfqdBEGxjBQYST2tFMU5caJMz1AhRwRASJGU6omxYQCJfVR4B0zSBFtAchYgcbWghxHl1VvOZG1HyJkEIMN/RwwwooEmZAC3QL94V7prf+1AtYaC0cI1R47TpdN3RhNnmGXAH07WD9QEaFaBRhO/A6REFgiZMQPm1fLCTxhctGFoIGFkz8cMMLfZOQgxBOWAGGG4Nwav756Kev/vrst+/++/DHD1hAACH5BAkDAJ0ALAAAAABuAG4AhwAAABw+cRw+cRw+cRw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch5Ach5Acx5Acx9Bcx9BcyBBcyBCdCFCdCFDdCJDdSNEdSNEdiRFdiZGdydHeChIeClJeStLeixMey5NfC9OfTBPfjFQfzJRfzRSgDZUgThWgzlWgzpXhDtYhDxZhT1ahj9chz9ch0BdiEJeiURgikZhi0djjElkjUxmj05okFBqkVJsklNtlFRulFdwlllzmF12mmF5nGR7nmZ9n2h+oGqBom2DpHGGpnWKqXqOrH6RroCTr4KUsISXsoiatIucto2euJKiu5WlvJenvpqpwJyrwaCuw6Oxxaazx6i1yau4yq26zLC8zrO/0LbB0bnD07vF1L3H1sDJ18LL2cTM2sXO28fP3MnS3czU387V4M/W4dHX4tPZ49Xc5dfd5tnf59rg6Nzh6d3i6t7j6uDl6+Hm7OPn7eXp7+fr8Ont8evu8+zv8+3w9O7x9PDy9vHz9vL09/P19/T2+Pb3+ff4+vj5+vn5+/n6+/r7/Pv8/Pv8/Pz8/Pz8/f39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+ADsJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzpktAYJ4sQWJEyI8eQo44mYLlCxybJP14WWJDQoGnUKNKZYHESyCkHNskmSG1q9euOqLswVpxERcdX9OqfZrBiBqyEPtEQbG27tobWQzBVSgHCQe7gNemCLP3oJPAUD+ceGFDxwsQiJ8WyVNYIB8fgGcgwcImYR01WZDEsBviSmE0J9aigDJGkMQ+XpBsWMujDlkqFtTKyIIIo1wTaTN0RtpEbQ4vHQ1h4doVC1YraUFsCemoyl+oRbBuSbvjDsk6OJ7+xiCENIzTrhuoODLJSIqIOUjNzO5a42hKQEjdePCaY1DlknWQ4NUMfvxX0g5esUCZgSNh4RUJdjA40h6QSeWBGxKOZIRXZ2QoUhleOeFhSIao0JUKeo340WFdlaHiR4HMF5URL37koFQiFFhjRwhKlcWOHd3R1QpAdvREVyIWudEKXdGhpEZmdIXDkxqxGFUVVGY0hFQW9JElRqNFdcOXFzECgVQ0klmRG11FoWZFXHTVxZsUHSnVG3ROtGVUEDCSp0SYRfXCnxIFIdWYhEJEhFSDJvrQEVKd4OhDSFg4qUNMdHVpQ3ZGddWmCknRlXegJlRFV2CUmhCIUjWhKkL+g+QWFQ+vInSDVBscUqtBS3SVxq4FddHVFMAStEdXQhRLEAu4eqlsJxtKBcWznXzRVQj+KevIC11h+eyNUZ3Qm7KICCiVFtRG0ZUJzhYLiIxQ/UCtEl4Rq2wfqXX1Vk1mWNESq1KpgN9M+hVQRLYqFSdluy/NYW4BMcixEiI1eCXDgi7lQVdUHXCxEh3XSdWCky31wZxUIzB8UhZfkYDhSm+44NWFLQnxFQhoqLQFvFBh0GFLgwDxVQZRLGLSINF2JcEXMDlS6VcztEGSHGF6NZ1MVJzpVQVNkPdRHUhkkJabNHkh9lcnRKGjRnAYUUFaHDhn0xkhqNWBErZd1IaZEFp/9YJ9SM2B1l1OmBGRIF8sIUNdRXwKVxX71fWBEFiokfdBaUDBQ2Cm/XfHD5EVAMILOvDAww0bB/bCywxuMULosBfwwhW6evjHFCnEDthx69VoVg66pwWE4VSqMcR5uptgRBYYf/lHGE/4UKFdG/gwhdSXtvEFFlM0cYQQPZgOFBJPjEHt+einr/767Lfv/vvwxy9/kQEBACH5BAkDAIsALAAAAABuAG4AhwAAAA0cMhk3Yxw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch5Acx9BcyBCdCJDdSNEdiVGdyVGdydIeChJeSpKeitLeyxMey5NfC9OfTBPfjNSgDZUgThVgjlXgzpXhDtYhD1ahj9ch0JeiURgikZii0hjjEtmjk9pkVFrklNtk1ZvlVhxl1t0mF52mmF4nGZ9n2mAoWyCo26EpHCFpXKHp3SJqHeLqnqOrH6RroGUsIWXs4mbtY6fuJKju5invp2rwaCuw6Oxxaa0x6q3yq66zLG9zrO/0LbB0bfC0rnD07rE1LzG1b7H1sDJ2MLL2cTN2sjQ3MvT3s7W4NHY4tLZ49Xb5Nfd5tje59vg6Nzi6d7j6t/k6+Hm7OPn7eTo7ubq7+jr8ens8evu8u3w8+7x9PDy9vHz9vL09/T2+Pb4+ff4+vj5+vn6+/r6/Pr7/Pv7/Pv7/Pz8/fz8/fz9/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+ABcJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzZss8X6xEaaKkyA8dOYLySDKFjM2SbJ7wIMC0qdOnTGsIcfLlKEcwSWRA3cq1aQolaKxWJITFRtezaG9EwSP24SAqWtHKPftByBdCbRP6ifJirl+5NtrkNXgmxt+mJWLkoKHicNMRVAYPjOL3xpIuZ+QcdMOlCRDDfn/UyYsHCFoXSbiwjThmSWO0KryILdPi7IspgS4O6gLkA1opR7GcbTGlYx0oNc4Wp6mlA9cNSvyEvDLieWSZXZxvVRGG5Jsc1mP+dvHAVcgdk4SckIe64XrLL+ufjriiEoyIrRusvPcN9cUblmKQsJUPLMFxH1Qt/NfSGSc8lcQgLOmw1QoKuqTGaxwst9IUEwoWkxsujABGS3EI+FQKa9AEhxou9bDVGJKdVMVWSsRoEh0m9MeHjSUpwR6MPI40CApQ1RjkSFroeORIPkBVxZIizbHBUyRIByVITUCFxJUhsQBVGlx+pAZUNoT50YxPRWGmRz4+5eGaGy3lFAhwdmRiUznUuREcUB2hp0ZbQKXmnxhl+ZQYhGIkBFR5JHpREE+h4OijT50wqUVDPFXCpRVl6tQInFJExFMihDpREU/RaWpERjz1war+ER0BlR2wPmSoU13U6tAXUDWha0N2QPXDrw3F1dQKxDI06lOaJZsQZU9t4WxCZEBFxLQIDcJfUx80i21BkD61xLcGlQGVCXuQW5CETwGn7kCBPiUDXu8uQkhfT0FRr0DQOvUBmPXukeNTM+xYL4dQJbHvIk1ClWu9cxD5lAreqtvFVjFUTG6r/VVILh74PsWCx9+GwRULb6ZEx1FVcLAdGyppMcKgNWHhMlQluFtSHqgSsIFsNmGhHVQ5sDgSGSETIEJYNm0xtKtMGOwRG0Pc7NQKcRyVZFcqMAEHR2wsy9UNVnmx7VYd/OAFvRW5UcTTUMnA9FFoJIcWDE6sDBGNHlwoYcOUZx0htVhOnN3VCz0oEQUYXxe0xhdSLHGDXyhwYWMbcjqmAg04vOYYDxpLRkWDjpXOlA1aXIlHFHabPlcOD5s5RhEguN6VDlX9iQcUNNjOVAk/REEyoW9ksQQPEsvVAQ5MiAHhr21coQQPQeWwgxBKPGFFGCkv7P334Icv/vjkl2/++einz2VAACH5BAkDALEALAAAAABuAG4AhwAAAA4eNhs7ax0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch5Ach9BcyBBcyBCdCFCdCJDdSNEdSRFdiZHdyhIeClJeSpKeStLeixMey5NfC9OfTFQfjNRfzRSgDVUgTdVgjlWgzpYhDxZhT1ahT5bhj5bhj9ch0FdiENfiURgikVhi0dijElkjUtmjk1nj09qkVNtk1ZvlVlyl1t0mV11ml52ml93m2B4m2B4m2J5nWR7nmZ9n2d+oGl/oWuBom6DpHKHp3WJqHiMqnyPrX6Sr4CTsIKVsYSWsoeZtImbtYuctoyet42euI+guZChupOju5WlvZinvpqqwJ2swqCuxKSyxqe0yKm2yay4y6+7zbK+z7S/0LfC0rrE1L3H1r/J18LL2cTN2sfP3MvT3s3V4NDX4tLZ49Xb5dfd5tnf59vh6N3i6t/k6+Dl7OHl7OLm7ePn7uTo7uXp7+bq7+fr8Ojs8ent8evu8+3w9O7w9O7x9O/x9fDy9vDy9vDz9vL09/T1+Pb3+ff4+vj5+vr6+/r7/Pv7/Pv7/Pv8/Pv8/Pv8/Pv7/Pr7/Pn6+/n6+/n6+/n6+/r6+/r7/Pv8/Pz8/fz8/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AGMJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzZktHccIk+ZHjxYkBKGgEWSJli5pANkm+kTJjgNOnUKM6beHETJ6kGyutWUJCqtevT198OYS1oqQwLcCqVQuiyZyyEBNtQbG27lobZCDBXWjmp92/ak+c2XvwzxDATk3A0CFkBwvET4X8ITyQTNe6QaqguYOw0J01WYo8tiuGcJ8ga0ksSeNI4qE2ROr+4IPVFBgRalN8iYTxDxYVakN0+VTzU5HcuzlWUoMa7BDiMjUdB/tEUUg4o70mMRXT1BKwLeD+kGz0BCyUVC9ROQErRa/JN8C9UnGZKspXGXRUJvruVUtLMV/54N5KVnzVxkp84CaVgC9J4dUKi6SECg9eMZheE15BkRIYFQ74kiZJePXGSXmAsKCHMH1yWFQtoAiSJjlIZQIiNkGS3VNSlLSFV2ZglYZXcoykiFdBwCWEVDmMBGBUIvQBFx8hPEUCFtaFlEoMUoFBmBYDiFAFWSPNIZUKlRBGyRWDmFReVFlQhtIiJkZFiJsnLQkVEnSeRINUceRZ0iBSwYCenyO1IdUYhJKUhVRXJSrSilKi4mhIqFz2VJGTgrSHVFdkCtKPUa3h6UdVSDXZqB3x99QJqHqERFT+PLTakRFR7SArR9M9ZeutGsUG1a68YuTrUzoEmxGkThVr7EVHQpXCshdBIVWa0FI0hlQjVjsRHVJ5oe1Ek0i1xLcT1RBVDORKJG1ULqar0LVRpeHuQ9xG9cO8DmkSH1Sc4csQF1Ll6O9CiMT51AgRDqzQulCVpnBCdQRKycMJ9SAVFhQjBGpUeGR8EAxSKesxQXJ4xcXIBTkYFQh7oDwQJGlFNQOYLr/hVQ2JuCzQmlHl0O7Di6zg1Q+S6LzGV0FMojOXXuXQsctffBUCGJq4bKdUPdCG8tVRkUCGpCNzHZUNZRS90R9WjOsnHDF/VQIVWls0h6r5+dnIemsN0QaLbxH9wYUMUWFK6Br7qsVDFWvQfNAdZ1wBBFjiJZpIiIipAEMOPwihwwsm/OVDpmqkANnoT7mRKSRk4EA6YCx80dqoczRh8OpS0WBGmbci8sULtD/VQhV0DLpsHmZA0fZfM0jxFr5/qKGFFEkEQQNdJ7yA+RJhxPGzztx37/334Icv/vjkl2/++f4GBAAh+QQJAwC4ACwAAAAAbgBuAIcAAAAcPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IfQHMgQnQhQnQiRHUjRHYkRXYlRncmR3cnR3gnSHgoSXkpSXkqSnkqSnorS3orS3osTHstTXwvTn0wT34yUH4zUn81U4A2VIE3VYI6V4Q8WYU9WoY/W4dAXIdAXYhBXYhBXohCXolDYIpFYYpGYotHY4xJZI1MZ49OaZBQapFSbJNTbZNUbpRVbpRWb5VXcZZYcZdac5hcdZlgeJxje55lfJ9nfqBpgKFrgqNvhaVziKd1iql3i6p4jKt6jqx7j61+ka6Ak6+BlLCDlbGFl7OJmrWLnbeNnriPoLmRobqSo7uUpLyWpr2Xp76Yp76ZqL+bqsCerMKfrcOgr8Sjscals8entciptsmqt8qsucuuusyvu82xvc60v9C4wtK8xtXAydfDzNrGz9vK0t7N1N/P1uHQ1+LT2ePV2+TW3OXY3ubZ3+fa4Ojc4unf5Ovh5ezi5u3j5+7k6O7m6e/n6vDo7PHq7fHr7vLs7/Pu8fTv8vXw8vbx9Pfy9Pfz9fj09vj19vn29/n29/n2+Pn3+Pr3+Pr3+Pr3+Pr3+fr4+fr4+fv5+vv5+vv5+vv6+/z7+/z7+/z7/Pz7/Pz7/P37/Pz7/Pz7/Pz8/P38/P38/P38/f39/f39/f39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBxCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6ZLR2+0NCmig4UHARhGpKDhg8obSTZH+gmD5IWAp1CjSn1qY0qcpBwfldExtatXqB6OqFmEtWIcJBe+qlU74Umhsg8FYUGxtu5aClEOwV1Ixa7fuhOm7D1Ih8XfpxdGqKiRA4aJDYcFvMAzWCAmKA7qPpiRRAwdTghL1flSZITdCFpY7ZVzoq4NMYwk7uGS48HaG3/KllkLYsoejIrElFB7gUxSMmo3eAnFsZQZFWqf1PSiFomhkGQqfI0y88pXG3ZI/v7J8VVKzCdeR5w52apLBK9UXi7xGkNvSj0wvGZpKcarDbIrWdKDfiv9od1UPSDVkiU4eOWGSjd0JQRoLz3S4FQlKGhSf1MRkYpMj9jQlXkmCXJgVDJ8OFMjIkrlAGUlDSjVA3rYdAgHU9HQCklndHUFVmZ09cVIrUAnlQyflMXDVBcEIlIbU9EIVx/vSSVdSEtKJdheWkwFQkh3TDVBbHuVkp9UbIBkxFRXDrbGVEJ8JEhmUTkgSGW4cPJTVBAg4hF6UhWBp0BMTDVkRx9MdceguNCRY0d9TKUDowK1MBWMGvUolRiU4tKlAA7YQEUcpXA0n1SYDjrIEmwoAtKZ/lBh0ClJjEwFxKwjQSkVFriKNMVUcPQa0ppRPWCJsCAVIVUJyIIkhFQmNPtREFKdIK1HQEiVwrUd+SAVC9xyxFVUL4S7UYRRxWCuRs9GJcK6GfUl1SDwXsTGVG3UaxEfU/2ob0UnPhXnvxS1CFW0BE90alSEJCxRGFNt4XBEekzVwsQR0TDVHBg/BMZUTHTsUCIQSMUBhSIvpKxUaqTMkBtTwVCqywmlYppUWtCs0K9STeCkzgcZgqNUtwJ9EIcsG30Quu6SqfRAe9AZlQ/HPj2QFF35kInVAkkynK1Jcg2zhDNb7V1XRZT9NM9T3dAH17hE4dUFnHLdxFc9NGz1m8JTcVCG1a0coVYLaahmdCteTKBWCmaoTTMfM6wlAhNwGK7z2Wt9IMQVbPChEB1iIDEDd+HWYdhhHJgAQw41qDBCWuTCOwUFkdV157qJUAFZ7V7VDa8iV+zJe1QD64uJGkBIzXsFjtdLiBc3KH5YDEiIoeHEeJjxRA8zpPC6AB60wEMRTWzxxiNwp6/++uy37/778Mcv//z0cx0QACH5BAkDAL0ALAAAAABuAG4AhwAAAAgRHxs8bR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch5Acx9BcyBBcyBCdCFCdCFDdCJDdSRFdiZGdyhIeCpKeitLei1NfC9OfTBQfjJRfzNSfzRSgDZUgTdVgjlWgztYhDxZhT5bhkBdh0JeiUVhi0ZijEhkjUpljktmj01okFBqkVFrklNsk1RulFZvlVhxllpzmFx1mWB3m2N6nWV8nmh/oWuBom6EpHKHp3iMq3yPrX6RroCTsIGUsYSWsoaYs4eZtIiatYmbtYucto2euJCguZKju5SkvJamvZmpv5yrwZ2swp+tw6CvxKKwxaWzx6i2yay4y667zbG9zrS/0LbB0brE1L3G1cDJ18TM2sjQ3MvS3szU383V4M7V4M/W4dDX4dLZ49Tb5Nfd5tnf59rg6Nvg6Nzh6d3i6t7j6uDk6+Lm7ePn7eXp7ubq7+fr8Ons8ert8uvu8uzv8+7w9O7w9O3w9O7w9O7x9O/x9fDz9fHz9vL09/P19/X2+Pb3+fb3+fb4+ff4+vf4+vj5+vj5+/n6+/n6+/n6/Pr7/Pr7/Pv7/Pv8/Pz8/Pz8/fz8/fz8/fz8/fz9/f39/f39/f39/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AHsJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmz5ss/a748GfLjh5AkUriUYcOHkk2Sd64cuUFigNOnUKPSaIIG0lGOgbTciMq1a1QQPq68AXWVIiMwPryqXfvURZhNZR9eujKCrV22McaQjatwDYy7gNnOKIOKr8E+RAI/pdGzx4wTip36CGRY4KUqd0sQeQJmTR+Ehe6wsaLjbgo1hgXVYAuiiJlLEhGNOQJ5rZS9R/O4WMsDDCOMmr7sVsuDsk03JtTWiNMx+PCuJ9LURCPCa4ktuJsLV1tmJhi1SAb+kaR0xGsH6TCfeJXBBuUXEF1FtHd5xWuPSCrjtOhKgk5LNl75gN9KiPwAXR4rGaJCV/e5RAkPXbHwR0qoAMHggC49shVXORR2UhZd6YDhS4bM0BUYJ8nBAVcnGCfTHyxwVQIiJTGyH1eo1aQHClwhUVITXTlxFRpdrTHSInVFdYMnZQ3BVQywhVRfVCV8VtYf1UVVRUiY1AbVFoZZwdUIRn30XVQnlBnXJTFwRcZHpfwV1RWV9bIGV0N8ZIaMv9W54VMdLOJREVxJUadAWnDVhUdeOjUCjYf+wdUOHdnBlRGHDgRhVHxwdCZUXGQqUBdcWcERElz5J+ogXAHB0Qr+VIo6EA1RvbBRH1wVIatAhEbFZEZjcAXmrlBwpYdGmEWlqqxhcIUeRlFw9ciuvQAY1RcaARkVXLuyGtUTGi3BFbUCJQeVrhklERUJ5PYixxx29EHItBqVB9UJ7YaUGFQt5AuSEFHF4O9H+z6VwsAeOcGVIwhz9AVXcDS8kRpcjSGxRn5wteXFGXUQlY8cY7QaVDmEjFGvT4EgqMkVFRsViixTRHFUPMRMESgLRgWIzRO5DBWdPEdkacBBS1RaVGcUDZEXXK0wotIKLQJfVFNA7ZDCX3Vq9UKPwBpVEFszVEZXaIS9kIVRoXCs2QjxkSVULLjIdkHJRjWDIXMbxGa3VzfQm/dAdjT6FA9q/t1LHElGBUQhhg/ExttQrdBG4wKl8UFXHWThoeFnrNhVECsbLoZaKWhR+NxomNuVClxEmfcfOKzVwhea/K2JtmqdgMQYkLJ9Rgl37XAFG3cwvjUffwZ2wgw9/IAuz56IYWJkTokA9Sll2ED9AKVYjcoZOUTWu9V3bCEE5GppzXYkaTQxvVfL/g3JHmyUsUUUSQTRUx2U9+///wAMoAAHSMACGvCACExgQQICACH5BAkDANUALAAAAABuAG4AhwAAABg0Xhw+cRw+cRw+cRw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch9AcyBBcyFCdCFCdCJDdSJDdSNEdSNFdiRFdiVGdyVGdyZHeCdHeChIeSlJeStKeitLeyxMey1NfC5OfC9OfTBPfjFQfjJQfzNRfzRTgDdUgjlWgztZhT1ahj5bhj9ch0BdiEFdiENfiURgikZhi0djjElkjUtmjkxnj05pkE9qkVFrklJsk1NtlFRulFZwlVhyl1t0mF52mmB4m2J6nWV8n2h/oG2Do3GGpnSJqHaKqXiMqnmNq3uOrH6RroCTsIKUsYSWsoWXs4aYtIiatYqbtoucto2euJCguZKiu5OjvJWlvZemvpiov5qpwJuqwZyrwZ6swp+uw6GvxKSyxqe0yKu4y666zLC8zrO+0LbB0bnE1LvF1b7I1sHK2MPM2cXO28fP3MnR3cvS3s3U387W4NDX4tHY4tLZ49Pa5NXb5Nbc5dfd5tjd5tje59rg6Nzi6d7j6+Dl7OHm7OLn7ePn7eTo7ubq7+fr8Ojs8ejs8ens8ert8uru8uvu8+zv8+3v8+7w9O/x9fDy9fDy9vDy9vHz9vL09/P1+PT1+PX2+PX2+fb3+fb3+fb3+fb3+fb3+fb3+fT1+PL09/P09/P1+PX2+Pb3+fb3+ff4+vf4+vj5+vj5+/n5+/n6+/r7/Pv7/Pv8/Pz8/fz9/f39/f39/f39/f39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AKsJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzpstMdt6c8TKlCZImUbKIWRPnDiebJC3BmYLDgNOnUKNi+JGlDimkHCN5yRG1q9euRLzgwWrxThMNX9OqdapCzFWyDj+labq2rtoVZN7CRRiMDQq7gNe2MBNrr0FDQQI/LVFjiI4Wip/SEGRYICksgFc0QbNHUeGCmRDpGZNkBOA0hh1xXWtkzSGJe8AcqdsEFNk/K9SmwKIII6gwKtTOCISUDoi0HLbozTiKjAvkqGmiwZAWSe+PtNLESMtFZjApaWn+0CEZy0laNTExf/2CUk1aOS/jfOUAP2WfF1456GlZyINXFH2wdIkRXpVQyEqayOAVDdexpAuBXbngiEoQRjXEUS99ooNXNSxHkhVe4eBhS4/g19UWJ8nXFQkNxjSIaVFpkEhJoZDg1Xg12UFdVEuUFIZXXWBVhld1jBTLCV0VwQtWwWwYFQ23iGRGVxw8AlceXo0Rki0wdFWFYU90FUIkILFB5SSGRRJCV0F6xMsMXlZWzY9R1fARllFxgGZltCgYFWUdedGVFXIKdEZX3XU0RFQg7CnnJF3J0BEtaEHFRKEDJRbVHxzV0RUamAo0ZFRacJRFV4Bi6khXQnDUQ1T+KYQ60A9RtbARJ11dKms1V3T1GUZ3dBWdrGl0RYhGcHS13650dFUfRmt0Zciu1RDSVRkagdEVJdTG0hUVGvUaVTDUVpMbVEloBEVUJJRbDa1QEaHRElHN4O6iUPWYkaZP+eCuDVFBoVENUe3gbgpREZoRD1GFUG4wXXmhURNdYSgrJV2dodGpf1JrSFduaGRmVHNQi0dXJWcUbFToUbuIHWZQcUQMeWi0SFdYuAtSMJU+FYTOIBEclZVAdwReVGEU3ZEeXRms9EbBbBfVtE9rxAWiVWv0cVQofJJ1Rq9GlfPXF00ZYyNkW/TJX1HpmjZFI0dV89sTNdmVDuTSLdHNyRnrPRHFUtnhd0SN9PzUCIMMDtEWXr1AtOIMkQJn015DzlAibEdlhC6WM8SH4U8ZcUnnC73x1Qt7kK4QnV1hoKXqCK37lRKewG6QLkiktUIYttk+EC1RqHVCF5r4PtAb/qU1QhbcGk/I5GlpIIQXethi+yeA1wVCEmNkAvsZoKuVOOyLTJG8WhhY7zslWZSglg3GD8RJGOd21UT8BN2ixxdFcABVm/grCCnsoIUfYAAOAVQIJ2qXwAY68IEQjKAEJ0jBClrwghjMYEMCAgAh+QQJAwCkACwAAAAAbgBuAIcAAAAcPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHIfQXMgQnQhQnQiQ3QiRHUjRHUkRXYlRncmR3cnR3gnSHgoSXkqSnorSnosS3ssTHstTHwuTXwwTn0xT34xUH4yUX80UoA1U4A2VIE5VoM7WIQ8WYU9WoY/XIdBXohDX4pGYotJZY1MZ49OaZBRa5JUbZRWcJVYcZdac5hcdJlddppheJxlfJ5pf6FsgqNuhKRwhqZ1ial5jat8kK1/kq+ClLGElrKHmbSJmrWKnLaNnrePn7mRobqTo7uVpb2Xpr6ZqL+bqsGfrcOisMWlssantciqt8qsucuvu82xvc6zvs+0wNC3wtK6xdS8x9W+yNbAydfBytjDzNnFztvI0NzJ0d3L09/M1N/O1eDQ1+HS2OPT2uTV3OXX3ebY3ubZ3+fa3+fb4Ojd4une4+rg5evh5uzj5+3k6O7l6e/o6/Dp7PHq7fHr7vLs7/Pt8PTu8fTv8vXw8/bx8/by9Pfz9ff09fj09vj29/n3+Pn3+Pr4+fr4+fr4+fv4+vv5+vv6+/v6+/z7+/z7/Pz7/Pz8/P38/P38/f39/f39/f39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBJCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bLPGewNAmSw4WGDCto8BjSxEoYmyQLafHxQYDTp1CjCrjAA0shpBzxRLkhQarXrwIo5KjyB2vFQUxegF3LNscZsxAfRQnBtm5bNXAXasKSwq5ftjrY5D0oBsZfqCJivOhw+OmONoMHBvFrgccTLGTqFFwEB8yUIzL+NhnMJzTbDT62LIJYiIuQFnV1CDKLhgTbH14w4lnCYa0KOEildP36AAgejoKSaAB7YQvNRj7W6gD+ERCSDGCLTIqZx/BXGW9H/uKJAdYHTEMqwC45GakI2CcveXy10EWllw1eHXxpKeXrCcgr2UGeVBm4sdIaEXg1Qx8uRUKEVyfwkRIgKHj1wmowJeFVDI+gdINXJOQhkyY5eLWeSVp4RQFeMxWSXlQX7GESbFJlYRMc2EUFRElZeHUEVl1I5QCAItEIFQ6amNWDVDiM1GNUFTBoFh0JRiVGkVIVMdgQUrlgCUhPQlWBhHn1YYFUV4CkVlRaRsYEkx/lIVWUkZGCyAhRPTBbR1FkWadAGkZlhUcfRhXHn6SsIZUOHSHyQFQpICpQhVBJgAhHW0hFhKSkGFEjRz9IdZSkaEjFw0aaNAWVBdtxahtU/idsdIapnArEZVSRaNSfoLWSgoVUh2b0ZlRr9EqGVPtl9GBUItZah1RSaBRqVEnWGomfGZUIlQe9CoQnVKdmZNpTLHRLindPwaDRClHRYO64TrmgkQdR7WDui0/VoNGrTzHaLX7gajRDVC10q4lUQWgUnZjVcipnVElohIRUx9XahlRRaESFVGP0KoZUWGj0cVRV9AqFqBo9q2OvhUIlJUaRQBDVBw3/2chw6XI0cFRkcMqFVEhw1GdUm0o6Gc8cPQwVCpyWENUGrW5Eg1SC/QkHrR3tCpUSiN4BRFRUePSHVCNciiggUND4Mkc2SMVEr2G06VEVUmmwtrkbTcKCu1RD4P1RplFFQIffHqH7VA+Ed3SsVM4lvpEOc7LoOEZxOCAVCWROftHXUnGo+UWCsCvVD59fRAdjUvnQSOkVkVFlVDHIyPpEVnxVAhqzT7SsVBKkmTtEluAAFhFf/u7QIgt71YIVURu/kHBgoSAFhs4rZAa/XomQcfUKlbZWuNwnFMmtXl0Z/kJntB2VCuc7lD5UULT/EBltU7Cn/A6RET/+/Pfv//8ADKAAB0jAAhrwgAhMoAIXyECKBAQAIfkECQMAtAAsAAAAAG4AbgCHAAAAGzpqHD5xHD5xHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHkByHkByH0BzH0FzIEFzIEJ0IUJ0IkN0I0R1I0R1JEV2JUZ3Jkd4KEh4KUl5K0t6K0t7LUx8Lk18Lk59L099ME9+MVB+MlF/M1KANFOANVOBNlSBOFaCOleEPFmFPluGQF2HQl6IQ1+JRWGLSGSMS2aOTWiQUGqRU22TVW+VWHGWWnOYXHWZXnaaX3ebX3ebYHicYXmcYnqdZHueZXyfZn2gaX+ha4GiboSkcIWlcYamc4iodYqpd4uqeY2rfI+tfZGuf5KvgJOwgpWxhZezhpi0iZu1jJ23jp+4kKG6k6S7laW9mKi+m6rAnazCoK7Doa/Eo7HFpbPHp7XIqrfKrLjLrbnMrrrMr7vNsLzNsb3Osr7PtL/QtcDRt8HSucPTvMXVvsfWv8jXwMrYwsvZxMzaxc7bx8/cyNDdytLey9PfzdXg0Nfh0dji0tnj09rj1Nrk1dvk1tzl193m2d/n2uDo2+Ho3eLq3+Tr4OXs4ubt4+ft5Oju5env5urv5+rw6Ovw6ezx6+7y7O/z7fD07vH08PL18fP28vT38/X49Pb49fb49vf59/j59/n6+Pn6+fr7+vr7+/v8+/z8/Pz8/Pz9/f39/f39/f39/f39/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AaQkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmS06D5IC58gRJkBxEmlzxoubOJpskRdmhEqOA06dQoz6IoSRMoFJIN0YSQ8RD1K9go5KowiirRUFDwqpd6/QBkDipzEL0A4StXbYv7MhlyGfH3b9seRjae/AODsBPM6CQYaOFBsROmUgiPJAJ4BtY0uzBZPBSoTlairC4y4EL4Uk27H5AksZSREtu/LI94smsHxRrM0TBgxFRFA5raTxCioatlEgcOXH5oNbEHpqpqKi94AQSSExVMoTNsGbmE7VLGv6RfIRELZWYY8J+4IPSjIWwUV7akQB2xSGVe0iEPdPSUAewNEy20iMzgHVBHytVMtpXO3TiUidFgHUCciiFktpXNpASU4Rf1aDhSVCAxUIlM9EAVhMnHUJfVBwMNpMkJoB1h0k9gBWHTX9oFxUNJdkBVhZZuQEWHCTJ8FUOcinx1QwjkQHWIHI1oiNU3YHkyQlfKUHYFF+9gNVHWXx1gYByWeJVVGN8lAoIX1lBGS1bdPiRHl+JcBRloaTw1SQeSReVm2/ScsVXYnj0wleBBErLH18J0VEiX7WgqEBYQqXBJxxp8VUVk9LixFdEbnQhVH50KsdXKGo0yVcqdErLJ/6PQXXCRnF8dZ6rRHxlXUZlfOWGq7SA8VWpGcUZVR7AChnVGxpxGVUiwO7xVRgaJfGVKMAy8hUWGvEQ1QfA0hIKqhqZCBUM4dIiQlSOZrRCVEiG2xRUNWi04FM4pGskVDxmdENULqSrH1RBaGREVBWEm8pXTGgkxVeUAAtJmxpxgSiwfnz1hUZrgAosHF+xoRGdUVHranrHaqRtVEYA28RX92m0LlQexNVpjFB18GFG1qY8KclQIcFRx1FxOqmfUIm8kSUrPtWvou9CZQEnHf0bFZmUFfJVDx6Fiaain5bsUSBfPU1YI00/xadHM1P5ZnlR1fsRFl+xsLNZhTzwlbwZIGnCZlRgEBbEVzGIZCxUJWgiFx9gySGSJzhDxa1Zh8FLkhdispeVGWc+JQhJn6hQp3hZOZLDUy2XhHJULyhuVhcZSACtSd5uvZchXaCUyaFfQZHuR4d0DlUT2P7O0Rxh1bC28Rp5/VUKgDC/UVoGKi09RkuExcEl12f0BQVfldG9Rnb87VQR42/EyLwqcJ++RptEqMf7Hc1I//3456///vz37///AAygAAdIwAIa8IAITKACF8jABt4vIAAh+QQJAwDJACwAAAAAbgBuAIcAAAAECA4bPG0cPnEcPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHIfQHMfQXMgQXMgQnQhQnQiQ3QiQ3UjRHUjRHYkRXYlRncmRncnR3gnSHgoSXkpSXkqSnkqSnorS3osTHstTHstTXwuTXwvTn0wT30xUH4yUX8zUX80UoA2VIE4VYI5VoM6V4Q7WIQ8WYU+W4Y/XIdAXYhBXYhCXolDX4lEYIpFYYtHYoxKZY1MZ49OaJBQa5JSbJNUbpRVb5VXcJZZcpdac5hcdJledppfd5theZxke55mfaBqgKJtg6RwhaVxh6ZziKh1iql4jKp7j6x+kq+ClbGFl7OImrWKnLaNn7iRorqUpLyVpb2Xp76ZqL+bqsCdq8KfrcOhr8Sjscakssals8entMiotcmqt8qtucyvu82xvc6zvs+0v9C2wdG3wtK4wtK5xNO7xdS9x9a+yNfBytjDzNnFztvH0NzJ0d3M09/O1eDR2OLT2ePU2uTW3OXX3ebZ3+fa4Ojc4end4urf5Ovg5Ovh5ezi5+3j6O7k6O7l6e/m6u/n6/Do6/Ho7PHp7PHp7fLr7vPt7/Tu8fTv8fXv8vXw8vbw8vbw8/bx8/fy9Pfz9fj19vn3+Pr4+fv4+fv4+fv4+fv3+Pr3+Pr3+Pr3+Pr4+fv4+fv5+vz6+vz6+/z6+/z6+/z7+/z7/P37/P38/P39/f39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gCTCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bLUYwC0UkDBssTJVG4lKEzyJIvmyRH3dFCo4DTp1CjftABZc0mpBt9HSKjREPUr2ChYlCS5hLWir7wCAnLtu3TI2YmnYW4Z63bu26zdJq7kA8RvIDdsmBzlG9BP0UCO8XgggcSJURgKHZaBJFhgbiyAIY7qJGnwgRlRRJEx8yUD3cxcCHFFxQStxyYrNEkkZQcKBzc4nh0lhGOtjDQgMII6o0Tr2FZFELKxwRbGGZMdXykhK2IPjXVsHVRRjpIOSzC/mKQM/MN2yR7R4LSwlZMzD4YwnbRdVIParBgXh4SAVYEHZWDhAfWHS1N4gJYOCjC0iO/fSUCIyuJogNYSIji0iaJfbVDKSnJYgRYOlj4EipQgBVFSmCA5YJcMaFiV1RknERJB1+VcAhNk6jwFQaBmDTFVxr8YdMfYNGAC0mCgEUeUmOAxcZIuvjwFRVn+RLFVzgcGVIaX3XAIlaa8BdVGyGJcsJXXxj2BZZaenTGVzBwyNcoJXzlBkhHfEXmZWKw6ZEmXwEBGl+m6BgVHx6h8dWTlwlUxldeePRaVJ40KpAoXwnREaBRHWHpQHlGddVG2kVlxqcC9RnVkhpVF9WX/pYS8hUWHCH3VBCoCuTLClHFsBEnX2WRq0BVfLWIRod8NcawycTxlR0a6fEVq6gW8tUbGq3xlSDMNvIVGhqlGBUlzG7ylXsZWRGVBoN+ispXXbQalQ7MChQfVMJm1ERUPdSbjGRQUZkRFVHJ4O8OUTWhkWZR+dvgU0to5MVXpzDri61OXaFRk1GZNewkX4WR7VcKDptkVNhmNMe2zMrxlR8a8WEnsxxD1YhGkXxVBbNbfNUmRghDtQKzf0Fl8EY9R3UjqiBHZQRHd3x1KqpkwMuRJ185kWuGUA3SEddOgYDKp01DZYNHa0Z1p6VvRhVpR358NYMsjdLy8FPLdYRL2NBQgXuZGV+d/ZHLUbng3VygnBlVfh/tAoSyhnHxFQiYhFRHjaPM5QjGTqELki+PRzXFXFJ8RcPYIuUBVhlYmTdtSUWL1WNN8H1FhEmI0BgVC7DCtB9YhJzkBlhCoA6TgWBZkZK6UaFQ8ksSgtWDiCehIuVTLlgWkxNgyeBxSo44V0ANN8vER25QnfC8SnsUkEPvMOVxbwEfcOtSGqPWRDgGevhL0vAp899IvCbAAhrwgAhMoAIXyMAGOvCBEIygBCdIwQpa8IIYzKAGN8jBDnrwgyAMob8CAgAh+QQJAwCtACwAAAAAbgBuAIcAAAAcPnAcPnEcPnEcPnEdPnEdPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHIeQHMfQXMfQXMfQXMfQXMgQXMgQnQhQnQiQ3QjRHUjRHYkRXYkRXYlRnclRncnR3goSHkqSnorS3osTHsuTXwvTn0xT34zUX81U4A2VIE2VIE3VYI4VYI5VoM6V4Q8WYU+W4ZAXYdCXohEYIpFYYtGYotIY4xKZY5MZo9OaJBPapFRa5JUbZRVb5VXcZZZcpdbdJhedppfd5theZxiep1ke55mfZ9pf6FrgaJtg6RvhKVwhaVziKh3i6p7j6x/kq+BlLCFl7KHmbSJm7WKnLaMnbeNnreOn7iQobqUpLyXp76aqcCcq8GercKgr8SisMWkssals8eptsmtusywvM6zvs+2wdG4w9O7xdS+x9a/yNfAydjBy9nDzNnEzdrH0NzK0t7M1N/P1uHS2ePW3OXY3ubb4eje4+rg5Ovh5uzk6O7m6e/m6u/n6/Do6/Do7PHp7fHq7fLr7vLs7/Pu8PTv8fXv8vXw8vXw8/by9Pbz9ff09vj09vj19/n2+Pn3+Pr4+fr4+fv5+vv6+/z7/P38/P38/P38/P39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBbCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bLOmOqNBFyI8WBDyhi3PARxYwgmyMZjWFS44DTp1CjOn3BpMwjpBzjNPkgtatXpx+UpKGEteIkLjC+qlUrwombshAvjVGxtu5aGWrgMkQzw67ftT7u6D3Yp8dfpyZgDMUR48Rhp08KDR6IhoRdHVHO7El4KA4YKDzsiugyeNKTujfAMJIIqEuOujkkY8VDY60TOhj1ZOn7FYYepGI6fC1hxVBHNTGGz6mZ5euJL1dBbhHuFc3MMF9/DCIZiIlXCV5i/prximELp5N0bnh9cr5lmwldVyxPeUmJ1ywt51CPekQRS07eSSXBfCnZIUJXTbwEYHyLpDTJCl0RoQlMnJwmVRIpadEVD2TJBERXZJzUxwZS0bDaTIX4FFUIv5V0hFQvEGJTHF3pUBIcXeGGFBZd5SVSJWlFtURZmhgWVQ4jbSHVB0eVFYhlUb0RUiUlSLXFYEpG9UNIaki1QiWDMXJgVHKAZF9UaUzWihVSCfFRJPs5FYOarSASp1N1eDReVFfQ2YoUUkXhURFSCUZnIRpERUNHiGQQ1Zx+tmKEVIdwJIZU+EX6hVRmcLSEVC36eYdUT3D0GlQyRDqQY1BBqhGJ/lAdoapAZ0LVJEZ/SEXFrK2MIVWIGb3xK697SFWFRmBIRaCqGEQlaEZRSNUIr62M+VSpGQkRFQrUtoJCVEpopENUqVLbAn8a/RBVC93y9pSbGQ0R1Qnd4hBVDxohEZUI3Qb5FA4aNRFVBtReAh9UQGgEhVTU5iEVFBoBGlV0qq4h1RcaXSGVHbxuGtVbGZUhVXizRhuVHxoBIpURvGoLVQgc+evUCLyeC5WNGzmxsap1SMUERyJHRVqkU0g1BkcqR8Wyn5xACFUG03L0QlQayKYmjUp7pHNUU/hpIVRneIRjVB0gouYlVULVQSQfhcanmthF9fNHbUhVwolwKQIlwVRrhGRvVFfqtXBUJVwSksVQiQBsWaNKxcVIf0/wRKV6GQkVDGCKlMYBgU12RldSksSGmnikHWu3HgGiIlQb9IE6R4rI0FWfr2sUybheTlJ7Rpe4HNUHHO9+0SCWQ6VBHMJfBAerUU3gY/ITXVLFV51CP9EgO3xFsvUS2fDVrtxPtCfZYIRfEe5PzWCo+RPZAdUTurNf0WkjpCm/RYcI4fr9/Pfv//8ADKAAB0jAAhrwgAhMoAIXyMAGOvCBEFRJQAAAIfkECQMAoQAsAAAAAG4AbgCHAAAAHD5wHD5xHD5xHD5xHD5xHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHkByH0BzH0FzIEF0IEJ0IUJ0IUJ0IUN0IkN0IkN1I0R1I0R1I0R1I0R1JEV2JUZ3Jkd3J0h4KUl5K0t6LEx7Lk18L059MVB+MlF/NFKANVSBN1WBOVaDOliEPFmFPluGQF2HQV6IQ1+JRGCKRmKLSGONSmWOS2aOTGePTWiQTmiQT2mRUWqSUWuSUmyTU22TVG6UVnCVWXKXXHWZXneaYHibYnqdZHyeZ36gaoCia4GjboSkcYamdImod4uqe4+sfZCugJOvgpWxhZeziJm0ipy2jJ23jp+4kqK7lKS8l6a+mam/nazCn63Doa/Eo7HFprTHqbbJrrrMsb3OtL/QucPTvsjWwsvYxM3ayNDcytLdy9PezNTfztXgz9bh0Nfi0djj09rk193m2+Ho3uPq4OXr4ebs4+ft5env6Ovw6e3x6+7y7e/z7vD07vH07/L18fP28vT39PX39fb49vf59vf59vj59/j59/j6+Pn6+fr7+vr7+vv8+/v8+/v8+/v8+vv8+vv8+vv8+vv8+/v8+/v8/Pz8/Pz9/f39/f39/f39/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AQwkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmyzZYnigRUoNFiAMjVszwoQQLmTk2RwYaw8TEgadQo0p9GiIJGUJJNw7iAmSq169QPRwpk9XinSgiwKpVC+MLorIQ1SBZS3ftiCpY4Sa8JOZG3b9rV5DVa1CODMBRUdDgEQOFB8QHiNwhPLALYB5Vzszpc7DPmSxJUPzNQrgPEbouopgZFHHOl7lrZbQpm+bE2iBlNl3kQ4XE2jBJpaxlIocjoS0/wWqhiWkIWBNW+IDko0RtlJlNwBYRRDKNC7BNdP6/xPI1A5eTirA89oqkkUsxX1fEURmnxFcpLdFI8DoEEMs6Knx1xkp9jOBVEeKxlAcMXpkgXUpJeOWDIjAB0oNXQqR0hlcwcBdTIkV4tcVJiKQwVQp50NQIDVNlUFxJUXjlhk1zZDDVC6yNFIdXUGSlhVekiXTJYVKx8FZSm+wwlQqYiOSFV2jAdccHU5Eh0gtTOUGYFVP5ENIaJ+YI1x82SjXfR9lJBRxlT0zVxEeDgCAVCIlQFoodU2nwh0dgZGmnQEdMhYVHOUwFx5+hvDEVDh3NMdUMiArEw1RHavSjVOdFmsVUUW60hFQV+BcpmFJdwRGLUfUQqUCNrAdVEP4bYVKBVFquGsoPUnngXkZyTJXpqlVMNVtG8EnV6apmTLVcRlNMpYetoQgCgVRPaORcVCRAK5BTUb2ZkV9ReamtiVEpoZEPUhWhbSgsSHWERkJIBcS6WEZFhEYhRlXDujNIBWtGsEHlwro1SLWDRp9GdcK67eqrUZphaavIVP9i1KZUD64Kx1TXZbRFldAWGxUYGrkxFX62UiGsRq0aDG2gUuWVURCgMmIrg1GxwBGXUqmxah5TqbvRhlIti+gVU1HB0SDYNvHGqi1M5TNHNagABRqX2JrGVAN3hMe6oTDhK9geDaKBVBoEQnZHYUy1xNocIRJgz3BvJJxUXdeNUbqvU32hd0Y2PJr13xZ94dWhhFdUoJ+JU4SIDlOVIGrjESkS71RiUC7RJadNdbDmEGES4VQUIAX6QwlLBcEYpzvEx+WYt95QGb551YXsCwFS3Vem4p5QbWD16LtBg4BxIVi1Dj+QGkzICRYIXihPEKpq+WCH9ATB/JUHWzSJ/UAiT2VDHd8XJEiZ4eZWvkFGQEWBEmeubxB8I0yRovwICaKFzPj37///AAygAAdIwAIa8IAITKACF/iQgAAAIfkECQMArQAsAAAAAG4AbgCHAAAACxcpGTdjHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHkBzH0FzIUN0IkR1I0R1I0R2JEV2JUZ3Jkd4J0h4KEh5Kkp5K0t6LUx8ME99MVB+M1F/NVOANlSBOFaDOleEO1iEPFmFPVqFP1uHQFyHQV2IQl6JQ1+JRWGKRmKMSGSNSmWOTGePTmiQUGqRU2yTVm+VWXKXXXWZX3ebYnmcZHueZn2faH6gaYChbIKjboSkcYamdYmod4uqeY2re4+sfpGugJOwhJayipu2jp+4kaG6lKS8lqW9mKe+mqrAnq3Doa/Eo7HFpLLGprPHp7TIqbbJqrfKrLjLrbnLrrrMsLzOsr7PtMDRuMPTu8XUvMbVwMnYw8zaxs/byNHdytLezNTfztXg0dji1Nrk193m2d/n3OHp3+Pr4ebs4uft4+jt5env5urv5+rw5+vw6Ozw6ezx6u3y6+7y7O/z7fD07vD07vH07/H18PL18fP28fP28vT38/X39Pb49fb49ff59vf59vf59/j6+Pn6+fr7+fr7+fr7+fr7+fr7+fr7+vv8+/v8+/z9/Pz9/Pz9/f39/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AWwkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbPmS0RqqkRpkmQIECNMplz5giaOTZKT4GRJAmOA06dQo5ogosXOUY6JsPCIyrUrVxVL2Fy1GGdJCK9o0zrlgQbU2IeQuORQS1dtjTCc3i5Mk6KuX7UzjOo1WAjJ36coYOj4MePEYadRJA0eSKZvXR1QxNRB2GfOmSct6sJoM3iQEbo5sLyReIcLEbpOFo0l4xhtCCaCLQaaUiLtitU2qaTFoYURR0hbYtgmTTMLWhJdQn6y8sHrB7EyuaDtsYeknR1eO/6oiQnG+pVPJj9dqc61Q5mXYrzmsJrSzgyvYlqa8fpD8kpBOHgFXEp5jNAVDo24dMhcXLUgW0o+dCXDITAtshVXSqSkHVcv/CFTIxFyZcZJBXK1QnczLRJaVCV4WFKIUQ04UxwbcPWDWyNtGBUUV03R1RUjlRiVC/7Z9IkOXH3wIEhMdCWjTXgYGFUWIUEiAlc86lVeVDHg6FEXXBE5mQ1crQESeFGFMVkrX3BFxEd1cFXCJGtO0htUG+jhkRNYrimQFFxN0dEkV0Z1h5+t6MFVDR2tYSOiAg3BVSIcXcHVGJC24gVX2GmUxKSZzsFVFRzVMGSmrXzSQVRvaqRJjf5QtZppD1GlsFEcXFGBaitPcKVnRjo+hcau8UU1Yka9RvVrpnFGJWhGp0F1wq4C9ZnREVHJQG0rsD71hKenUutBVE1opERUK2xb6FNLaNQkVChse+dTGWbUBIvbohBVEhrxCVUI21r2lBEaQQHvDttyVYRGa4DBBn3bNgtVudt+tF9UW1T8kY8xauzRa1FB4nFHTUEVw8jHcXUEyhtdDBWpLGcEBFdpxIzRHVyJILLNFhkc1bc8V2QnV4cGTdGWUAFhNEWOuCDi0hMlC5UKm0Ad0Rtd6Wr1Q5I4XSulWzskNVTjhd0Q1iqb3dAdAj9lAoVqK5THCl3lF3dCfKwYVZwQdycEiNdRkdBH3wcNYmpXZxBukBsseEWG4gRREgVaYEA+EB2Hd8WF5a10UsWqXlEJ+SFYlOwVzISXdRZaJmDa9yRfoJmWD4ObnYcaViiRA3tpeXCe2sHWVQMdd6Nx2BOU9C1HXSZAAfHdgailgxdFEg4K6FGFsERunK9Ywg9PeCEHnZwTRBQe5aev/vrst+/++/DHL//89NffUUAAIfkECQMArAAsAAAAAG4AbgCHAAAAHDxtHD5xHD5xHD5xHD5xHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHkByHkBzH0FzIEJ0IUJ0IkN1IkR1I0R2JEV2JEV2JUZ3Jkd3J0d4KEh4KEh4KUl5Kkp6K0t6LUx7Lk18MVB+MlF/NFKANlSBN1WBOFWCOVeDO1iEPFmFPFqFPluGP1yHQF2IQV6IQl+JQ1+JRGCKRmGLR2OMSWSNS2aPTWiQT2qRUWySU2yTVG2UVW+VVnCWWHGWWHGXWnOYXHWZYHicZXyeaH+ha4GibYOkcIWlcoenc4iodImodYqpdouqeY2re4+sfZCtfpGvgJOwg5WxhpiziZu1jZ64kKG5k6O7lqa9mai/nKvBnq3CoK7DobDEpLHGprPHqLXIqrbJq7jKrrrMsLvNsr7Ps7/QtcDRt8LSuMLSucTTvcbVwMnXwsvZxM3ax8/bydHdy9PezdTfz9bh0tnj1Nvk193m2uDo3OHp3eLq3+Pq4OTr4eXs4uft5Oju5Oju5enu5env5env5urv5+vw6Ovw6ezx6u3y6+7y7O/z7vD07/H18PL18fP28vT28vT38/X38/T38vT38vT38/X39PX49fb49vf59/j6+fn7+fr7+vv8+/v8/Pz9/Pz9/f39/f39/f39/v7+/v7+/v7+/v7+/////////v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AWQkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmyzxuynjJEiXJECRLpFzhIkeSzZJ9wiAZcaCp06dQYSwBgwfUUY5ylpyAyrUrVx9gKl2tWIrNDq9o0zb18CTPWIihzMhQS1ftjjKc3i7E86KuX7Un4Og9yMnKX6clZADR8cLE4aZKIg0eSIdF3RdU2uxZhJDPmSo6/KJwM3hSFLpJxhCSaMcLDrpLII29kyJtCS2PMOKBArjNUTsc0MYY44njpDA20n6pGUeDVw5eSoUc8wGtmJlwLnjt4YekIB9oy/7EZFOhK3TpJUt1yeAVzcszXmkEUrnnddc0Let4xSF7ZSfwXfmmkiW1cZXDJC5ZkkNXIAyiUhJd9SDWS5DMxdUPKaHRFRDFxbTICl2RcdIhIXDlQl4zCYICVyAokl4PXFWwh012dEVESV10xcVVVXQlnkiVOAdVD+jZ5EkLLLoYkhdchXDIWzVyRUVIqIAIFX56UcHVB5+AFAdXOky2CZJQnQHSEVy5N1kZX310CFcmdDkZJ9VB9YdHWHCVxWQDaQmVFR7FAFUFT/LJCh9ckSCnRpVwlYShA8EIFR1YcWUmpKzAB9VyG23BFR+YsjIJV01whOZTHBQJqQpQ4cARU/5PARGqQKc6VUEoGgXC1RWzsqIFV3popAZXavTKBldmaDSHE0PEENwBgPSqK1RVfPRIsL2yUqdTS2QrkgtQMeFtSKw+Veq4H2311BPofgSrU1K069GzTk0pL0dcAXrvRlxhsa9GfXClxb8ZaQhVsQRfZBhU0SZsEYBOjeCwRaXQ29QQE1eEKFR7ZjyRpk+x4fFESHDl4MgQCcKVxChD1CNUUbT8kCUecNWHzA59wRXGODNUipVPvdEzQ2BwtYKqQxvkB3ubJp2QKPY95YElTiP0K1deVH0QHuVBtQMqWhcUiLqozhf2QIMUCNUYZ6MN9FNCtC1QIm9HzIjcjIB7n57cgQiqY9uofGHxU2yffcgPXlWAZdhkgOAVBoJpPUoaoT1HadWbfKF2Vyjc4XQfYBwxOFdLICizInu0EYVldJ0gtMOCcCBDEEEAIUMJjx2AhCMZ65f7UyNcmrHBv6/Qheke55i7D2qMIvMUf2EwxBeCDF0rWig0wcYmVY8RBRK0D5FEFFp4YYYbbsmt/vrst+/++/DHL//89Ndvf0MBAQAh+QQJAwCgACwAAAAAbgBuAIcAAAAcPnAcPnEcPnEcPnEcPnEcPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHIfQHMfQXMgQXQhQnQiQ3UjRHUkRXYlRncmR3gnSHgpSXkqSnkqSnorS3osTHsuTXwvTn0wT34xUH4yUX8zUn80U4A1VIE2VIE4VYI5V4M6WIQ+W4ZBXYhDX4lFYYtHY4xJZI1KZY5MZ49OaZBQa5JTbZNVb5VXcJZZcpdac5hddZpgeJtheZ1je55mfZ9pf6FrgaJtg6NuhKRvhaVxhqZziKd1iql3jKp7j6x+ka6Ak7CDlrKGmLOLnLaOn7mRobqTpLyVpb2YqL+bqsCfrcOisMWms8eruMqvu82yvs+1wNG5w9O7xdS+x9bBytjCy9nEzdrHz9zK0t3M1N/O1uHR2OLT2uTX3eba3+jc4ene4+rg5ezi5u3k6O7m6u/n6/Dp7PHq7fLs7/Pt8PPt8PTu8fTv8vXx8/by9Pfz9ff09vj19vj19/n29/n2+Pn3+Pr4+fr5+vv6+/v7/Pz8/P38/P38/Pz7/Pz7/Pz7/Pz7/Pz8/Pz8/f39/f39/f39/f39/f39/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBBCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs2bLNV2kDMEBYwWIAxxWzOAxZMmUMzZHAuIiZMOBp1CjSn1K4kiXPUk5egGSYarXr1BxXOmTtSIgLC7AqlX7wUmcshABQemwtu5aIWXgMuyiwq7ftTW2GNJrEE6Pv08zmHhxQ4YJxFBhsCE8cIpfFEKoiMlz8M6aMFBs/MVCuMyLukGwtInYB0yTFnV/cM6aZW0IKHUuVvqSY62JMUmlqOVQBRBHNUbWPqm5RC2R3B/pQBkBFgikmJWOgHVBhiSfH2CV/sA0FORrBimDTVqx8JXKy+ZeR6xReQbFVy4twXxd8YZlnh1eWSDGSnP8NBUM0LEECXhTgXBHSpXc4JUNfMBESA1eFZESFV71MIhMeqQ1VXcmpVHBgenJJEcJU7UgSEmAsDDVBZPVRIZXy5Ek3FRWZKXEVBSoMZIhLEqFQyVZ9WGfVDQgGdIWU3HwVllieEVaSKJJJQVh2kn1QkhpTJXBbHDpUWRUZoBExFRMUAaKFlOJ5xEdJ0YlQX+UCeJUVBu82FFtUg3hpkA/SqXFR3JckQMFTwk56BlT3SBSHlk4MehAMEy12qUlWcEjpyXVwV5USIBaEoZR0WAqSUhIdcF1/quGVMVUNcb6kX5S4WfrR3FMBcWuIHEg1Q/AfpQlVJIW2xEPUumgbEcSRtXDsxxlGhUQ1G60QqDZahSCVKV2i5EEUskpbkVwTNXEuRZBKdUV7FbExFRpxEsRDVJxAKu9EAlCblQ88CvRjVoKHJFlUgFn8EM4TOXnwgypMZUNEDtUxFRbVrwQna6SqTFCT0wV7scICSKsVLWSbNAVUwWs8kF2UCcVGC8fpMNULjhZ80CeTpXFzgStccFUMqS4MyAiRpWBG0ALJEjDPjcNyh7HRuWD1HfEEJ/HL8uRtFQDAg3Htl79vDMkWHw7lQS61nyG1l5V4MXOdbT6FQY0vwxImRUne5WBwiTXAYXaX3WQpq1UNPGFHxGxgQUQdfGAp60yH3ADFGKs8aBBd4gxhRCP1SXCFsVWCZYJMtzwggldIYbE5sDaDVldKwBerIGzgwUCFA8X+0Xu22FhXLZg8KAB8FCNMMTc9pYhRW9/acDDFGhoPEgZWkyhhA8yiHAACCvAgAMSWdQr9fnop6/++uy37/778Mcvv/wBAQAh+QQJAwC0ACwAAAAAbgBuAIcAAAABAQEGDBUIEBwcPnAcPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHIfQHMgQnQiQ3UjRHYkRXYkRXYlRncnR3goSXksS3suTXwwT30yUX8zUoA2VIE3VYI4VoM5V4M6WIQ7WYU9WoY+W4ZAXYhCXolDX4lEYIpFYYtHYoxJZI1KZY5MZ49OaZFQapJSbJNUbZRWb5VcdJlgeJxieZ1je55kfJ5nfqBqgKJsgqNuhKVwhaVxhqZyiKd0iah1iql2iql5jat8kK1/kq+ClbGFl7OHmbSJm7WLnbeMnreOn7iRobqTo7yXp76bqsGerMKhr8SkscantMiptsmqt8qruMusucuuusywu82yvc6zv8+1wNG3wtK6xNS7xdS8xtW+yNfBytjDzNrGztvI0NzK0t7N1eDP1+HT2uTZ3+fc4ung5Ovi5u3j5+3k6O7l6e/m6u/m6vDn6vDo6/Hp7PHq7fLq7fLr7vLr7vPs7/Pt8PTu8PTu8fTu8fXv8vXw8/bx9Pby9Pfy9Pfz9ffz9fj09fj09vj19vn19/n29/r3+Pr4+fv5+vv5+vv5+vv5+vv6+vz6+/z6+/z7+/z7/Pz8/P38/P38/f39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBpCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6ZLQmmmANERQ0UJAyt0DGGChUwemyQxnVHiwoDTp1CjOsXBZMwlpBs5tUEyQqrXr05NOLGD1aIcJybAqlUr4wunshDbyFhLd20LMqngLtQTpK7ftTfc6D1oCMrfpypk7AjCM8VhA0AADR7Y5SddH1LC1HGUsI+aKTzqohCsV5EOuj2+EJIIKQwOulPeYt3TFOwNLnww3mGyFscepHdOgJVBeqMiLCjAmiBTUw3YEl1CXvri+Gt0mV7AMklE0pAQsGVg/qaS8pUHnpOruHzw6oHNSyxfk6xSeaeFVxByWtb5ymT+SkhEeDXCeSo9soJXUfjX0hJeoaCHSgFKFUVMpgzhVQyioDSGV0PMtEkPXl1X0h5dRcUCJDRBQoNUJaxWUhZekVUTIbVBhcRJddgAFRdY7SfVHCelEoZjPyhoUxJSYYgSJFUYAtcgJULlxWQpcSEVCqZQeRInNT4Vh5YnuSEVE2CeNENUJ2xSZknwRbXGmiTlIdURcJJ0JlQgUFKnSG1CxdyeIOkh1RKAhtSlAT0UClIRaCr6kRVSuejoRmRIRcekHNkhlRiYbrSIVFV0upFwUBEhqkYxRPXDqRkdCFWH/qxelBxURcR6UZROKWGrRVJBsStFnEhFxa8TQSLVFcRKhIdUPCYLUXZRqeEsRBFCVci0Dq2SFlQ0YOvQslFN6C1D0EKVxrgMWRjVtegmREgIUc3QrkJUSDgvQovg6tQd9x7U51NC9GvQJdtCdanABFkZlQ8IE0TIrFDl1zAtqfwglQ4TC6SFV3Bk7OPCGTOiglQn9JHxd1IVJ3AqSnjla8OcqBuVDGoiDIkPAj6IcCEresUpwnzY59UWCHPCBambTvZEGCKRwQJY0g42h1MxlJFXpq99NYLEeomS6lMtYJHbRYF0kYNaJxA4WBdf/TBGJRIZ8gWIa6mg82CEWAZWgQ9UqGEyQo7QEYYUFtclhSJawnhYCjHoEMQOMoz8mBB3awnHaY9l7pQMbey5yho1aP7XCV5kWGgqciihr+hPjVBEGpiIWskYhbMuQhFoXLUrH2Ak8fRfOzhxhu7Y9nEGFkwMocPIKuQwRBNYnFF5xtRXb/312Gev/fbcd+/99wIHBAAh+QQJAwCwACwAAAAAbgBuAIcAAAABAQEKFSYcPnEcPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHMfQXMgQXMgQnQhQnQjRHUkRXYlRncnR3goSXkrSnosS3stTXwuTn0wT30yUH4zUoA1U4E3VYI4VoM5V4M6WIQ7WYU9WoU+W4ZAXIdBXohEYIpFYYtHY4xKZY5MZ49NaJBPaZFRa5JTbZRWb5VYcZZZcpdbdJhcdZled5theZxke55nfqBrgaJug6RwhaVxh6ZziKh2iql4jKt8j62Akq+DlbGGmLOImrWKnLaOn7iQoLmRobqTo7uUpLyXpr6ZqL+bqsGdrMKfrsOhr8SkssaptsmsucuuusywvM2yvc+0v9C2wdG4w9O5xNO7xdS8xtW+yNa/ydfAytjCy9nEzdrGz9vI0d3M1N/N1eDO1uHP1+HR2OLT2ePU2uTV2+TW3OXX3ebY3uba4Ojc4ene4+rg5Ovg5evi5uzj5+3k6O7l6e/m6u/o6/Dp7fHq7fLs7/Pt7/Tu8PTv8fXv8vXw8/bx9Pbz9Pfz9ff09fjz9fjz9ffy9Pfy9Pfy9Pf09fj19vj29/n29/n3+Pr4+fr5+fv6+vz7+/z8/P38/f39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBhCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs+bLQW/AVFkCRIePI06wgGmzh5FNkoe0/GBRoKnTp1ALnEAiZtJRjoSw5LgQtavXAhp0VLFztSIgKza+ql07g8yosg8PEVlLly4NM3AXitISoq7ftTbU5D04h8ZfpyRo6MjhQsThpjgED4Y1SYlfIVfAuPmDENGeN1Zu+EUyuI+KtRyCeLkkkZAWHhjW4lhUFo7jrz66WL2o6MoItSz0HEXT4auOPh0xWfnt9cOamly+mgATElKV212zzITi9YKS3SIT/uX42iXmIBJe8Z5s8hVNzD8poJKYozIMh64f6MQk5MJpC0As2XFaVCQACFMihuGgiEuM4NAVDEbBxMgTm0gIQ1c5TIYSIOhFBYWGJ9FRHFQcGAgiSWhwBdUQJ5oUXVRttFhSEFHF8JaMIvWxQVRb4DgSE1GJAJ6PHk2CnVNYEBmSFlFlqORHn/QHFSFPfrRFVFpU6REhUe2gpUeiQZXIlxxVERUXZG60R1Q9pLnRClB54KZGR0QV4ZwWRREVHnhe1EVU7vVZERtnClqRHx4aSpEnUR2hKEXxPdXmoxK9ANWklELUoVMsZgpRVEl4+hAkUTkhqkOCRFXFqQ3dUSir/gu1EVUYsC50JVTP1ZqQEFEdoitCo3wAFQy/IgRHVEsUexAVUZWhrEE7RMXaswNtEttTOFBL0K1PfagtLJqYEJUb38JiRVQshPLtJX1BReu33A1briLCQjVGuUBENUO5zEalHrVrdLWvtoG0+xQHfFKLiQxdUUftJvmCOhMVd66ESFpR0TATkCrkwZIfkUIVQiAyndtUB/emZJtXucLkRVRMoBTGV97ClMa1UOUw5kiDzOWVFDMx6ZUIVEACEibxeuVFTW4w19UIVRi90ShfoPDVB+TaNEgNakEttUV3PMHUVyd4fBUnRqzlgQ9W1HHjQ31MEQNdMRgymNB0iTCEgRWamTgQH2hYkYQOm64FRYWT9eHzYybcoMPcjxUwhN8a1uFD5JgX4EKMRLbBdeZ1gXDFJ1qOcSHoXW0AhBdfaznKHFPkoAHqF+zAxYKGRjJGEiH7hUMWhbDKyB5tgIGFE0b4oMMPSECRhRhv+IF4udRXb/312Gev/fbcd+/994oGBAAh+QQJAwC5ACwAAAAAbgBuAIcAAAAcPnAcPnEcPnEdPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHIeQHIeQHMfQXMfQXMgQXQhQnQiQ3UjRHUjRHUkRXYkRXYlRnYlRncmR3cnSHgoSXkpSXkqSnorS3osTHstTHsuTnwvT30xUH4zUn80U4A2VIE3VYI5V4M6V4Q6WIQ7WYQ8WYU9WoU+W4ZAXIdBXohEYIpFYYtIY4xKZY5OaJBRa5JTbZRWb5VYcZdbc5hddZpfd5theJxjep1lfJ9mfZ9nfqBqgaJtg6RuhKVwhaVyh6d0iah3i6p4jKt6jqx8kK1/kq+ClbGFl7OGmbSHmbSImrWKm7aMnbeNnriQoLmSo7uUpLyXp76bqsCercOhr8Slssaotcmsucuvu82xvc6zvs+1wNG4w9K5xNO7xdS8xtW+yNbAytjCy9nEzdrFztvHz9zI0NzJ0t3K0t7M1N/O1eDP1uHQ1+LR2OPT2uTU2uTV2+XW3ObX3ebY3ufa4Ojc4une4+rg5ezh5uzj5+3l6e/n6vDo6/Hp7fHq7fLs7vPs7/Pu8PTu8PTu8fXv8vXx8/bx8/fy9Pfz9ff09fj09vj19vn19vn19/n19/n3+Pr5+fv6+/z8/P39/f7+/v7+/v7+/v7+/v7+/v7+/v79/f79/f39/f38/P38/P38/P37/Pz7/Pz7/P38/P38/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBzCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6ZLTHPOgNEC5YgPIkuiaBHjJlAnmyNB9RHT5MaEAlCjSp2Ko8qcV0g5GqqCYqrXr1NHHBmzKGvFUGyEPAXLtu2EI4HMRpRjo63duwWI/JHLMBAQvIDtCtHD9+CiJoGjepDB48aKDYmh/qBTeKAeD3hhHPECRxAlg5TwmNnSIzCUygJLsyWyZlLESWaWkLjbw1HlQyG8jphiCCMdKZDZsuhT2YzUEl+OblQUpa2HM5WVFNhwpRLIRFAwsMUSim8lKYlI/hpywnYKapN2SoAVc74kIRdfKdRpT7JRjq8lCtEfqenHVxqf7ReSJzx85cMnAoYECXxemZcgSIAEJxUFgjwIUhpfDWEhSFp8ZceGH/nglQ4gegTIWlKVUWJHS3i1gicrboSIhFF5EeNGV3ilwo0aXaLeVITxiJEVXmUhJEZ6eHXDkRi14JV+TFZEhVdfRFkRHl71YGVFTk4lyZYTTeEVHGBKdIZXZpQZER1egaEmRIN4hcWbD13ilRN0PgTCVETk6dAMU+3gZ0OqRSXDoAwVKBUNiC7EYFQ+NJpQKBZMtYSkCC3i1RWYHpTkVGF0apAaXqkhakFheBXkqQIh4ZUi/qwKFMoIU50Qq0B1eNXErbnkOBUavOIwFQWa3JqIV5HeKoZXNt56g1dxxWrcVDvG+smjUXVxa6pTlcBJrD5SqdIbcm3hYkqQDFEAF1npkYFX7J3URldQtWHTISd49QKCJVXCxFQgAELTJXV5RcZJWHwFAyQz/eVVnyd9ouhUPPD70r9e1XAJuix89UOALLUinW6ErBThVzL0tlIjO3w1AZksYYifHCr1oQJYzbZkbnxjoGTGu18hEdMRbAEh8EiOIAZWFDJ1kgRbEywR3kevfEHrVxYcTNMXFLC1ARUgawQHoGCZcAdSb/wIFnLKWQQJGPexhcMhZg1Sg10fCOEFlB4SabJGEXclUdglQQAGQhBbmKGHdQd1AgcWE7e1QZWomSFDZNOtgEMPOcigwgeJSU3fJ2Ngi3liOqy6Xydg3Hw6YCqM0d2GnHSh9usGltF2iY5fsUPXuBfAQhYqR1mJGlEUjBcFODwxhiCzv8lJIG6IoUUUSxDhwxFQaBHGGXRszOv45Jdv/vnop6/++uy37z6IAQEAIfkECQMAogAsAAAAAG4AbgCHAAAAHD5xHD5xHD5xHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHkByHkByHkBzH0BzH0BzIEFzIUJ0IkN0IkR1I0R1I0R2JEV2JEV2JUZ3JkZ3J0d4J0h4KEh5Kkp6K0t6LUx7Lk18L059L059MlB+NFKANlSBOFaDO1iEPluGQV2IRF+KRmGLSGOMSWWNS2aOTGePTmmQUmyTVW6UV3CWWXKXW3SYXnaaYHibY3qdZXyfZ36gaYCha4GibYOjboSkcYamdYmoeY2rfJCtf5KvgZSxhZeziZu1jJ23jp+4kaG6kqK7lKS8mai/nazCoK7EpLHGp7TIq7jLrrrMr7vNsb3Osr7Ps7/QtcHRuMPSucTTvMbVvsfWwMnYwsvZxM3axs/byNHdy9PeztXg0dji09rk193m2+Ho3eLp3uPr4OTr4ebs5Oju5urv5+vw6Ovx6ezx6e3x6u7y7O/z7fDz7fD07vH08fP28/X39ff59vf59/j69vj59/j69/j69/n6+Pn7+Pn7+Pn7+fr7+fr7+vv8+/v8+/z8+/z9/Pz9/Pz9/Pz9/Pz9/P39/f39/f39/f39/f3+/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4ARQkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbNmS0NlsEhRIgTHCxEjYvhAImVLmjo2SfrREuRDgadQo0otgMKIlz9JOfK50iPD1K9gC2zgYQVpVotkwqpdOyOKn7MTDY1YSxcsiiqL4EZUUrfvVBdbMul16IZuCRk1UPiNOsPM4IY6pN5ocmVMG0MF45zZMiVIh75IHi/cUgBGEjBvHxr6QmTu2ht5RCe8gzFMkbUq1MgWWedIhbAZsOwW2caHWiSOhodEUyMsbOUhn4SFAQg6SDBOvwqxDpINC7BWuP5/3NN8aoc14j0GmvG1Rer0G+sonvoDfsc0G76Csc+Ry9cZgvGnERNffSGgRpT0MBUMAR54kR6fSWWggxjxJRWDFD4YYVReZHjRElPR4KFFEE41x4gVWRhVFShS1MZUPLRIkQtSbYCVjHtNtR+OEJUx1RE8QvRICFKhECREQUyl25ENYTHVFUw2tMZUUkTJUB1TMWHlQon8uOVCJEhV35cJ0RgVDmQmdINUL6SJkHFRneDmQTxItcKcBpkJFZp4EvRbVEX0OVAcUz0hqEA+SiXcoVZMdcahohgxFR2HPuIaVBVAasZUOkCqIlThHaqCVBXwMZIhfeymBowivbFECf5L7NbEkx8twkVkT3Wgh2iFzIepqR7VKZUSokXB6kdffGUWXHlkF1UWIGXCnlRJDJbEVC9QEhIYU2WwbFJx/BnVjiFNGxUPDdokxFQ3kCTGV05k1cVXS4605lRj2LRGflIBYVJaU5UgB011jEpqHCcR8ZUMmMVkiLlRhXaSITR8FWhMSWL7nkl0mGBxIy4Zsm7ACKt0BgVfPbdSHTJ8hQEaLU0BVm4qqeGrVFq8BARYGXCBEhdefaXlS4kMERYP6I30yKdS+ZCuS9KFNQQcIDlyxQthFZEITVsE7TISeHBkCBXfgbVBqDWhcYJaHRgRBkZ5SHHzVCvUaxMcWK81wo0QXdz4EBtR3KsWDrHBBYgTfrnQgxJVlDFwQXWwMYYSeq5FrGhzKLwYVDPU0MKlfvGQhnJpVLz56U+Jzl0mWKyAeuijwwdIFDG8rpYPsR8IhxTl2Y5CEVxsnOEcVOCAsl8xNIHGJVG+YQYWUBzBAwwilEADEEtQAQYbwkPq/ffghy/++OSXb/756KdvXUAAIfkECQMApQAsAAAAAG4AbgCHAAAAHD5xHD5xHD5xHD5xHD5xHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHkByHkBzHkBzH0BzH0FzH0FzIEJ0IEJ0IUJ0IUN0IkN1IkR1I0R1JEV2JUV2JkZ3KEh4KUl5Kkp6K0t7LEx7Lk18ME9+M1F/NFOANlSBN1WCOFWCOVaDO1iEPVqFP1yHQl6JRGCKRmKLSWSNSmWOTGePTmmQUGqRUGuSUWuSUWuSU22TVW+VWHGWW3OYX3ebY3qdZ36gaoGib4SldImodoqpeY2re4+tfpGvgpWxhZezh5m0iZu1i523jp+4kaK6lKS8l6a+mqnAnavBoK7EorDFo7HGpbLHp7TIq7fKrbnLr7vNsr3PtL/QtsHSucTTu8XUvMbVvsjWwMnXw8zZxs/bydHdytLezNPfztbg0dji09rk1dzl2N7n2d/n2uDo3OHp3eLq3uPr4OXs4ebs4+ft5Oju5env5urv5+rw6ezx6+7z7fD07/H18fP28vT38/X49Pb49ff59vj69/j6+Pn6+Pn7+fr7+fr7+vr8+/v8/Pz9/f3+/v7+/v7+/f39/f39/f39/f39/P39/Pz9/Pz8/Pz8/Pz8/Pz9/f39/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4ASwkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbPmyzhjuFyBsuQIESRNqGQJs4aQzZRKDihdypTpjSZjBB0laaWp1as3qASaCtLM1a9NOyBhw7XjHbBonW45VDajpA1p4x5Y8YVS24s5lra4AaTGCblNe9C5W7HOnUEGF+lxk+UIC8BRGhEOSYeLkLg3+EwWmeeJCrQs5GwWmShKCLAm0owWqYcIWAxcVos8QwMsFLuyQU4BGyV3SDIjvpbxDfLNiqsmBhP3qKe21RiFlnsk1OMqEUvSOyaycRVK9o56/v5aHf59I5qrKtiW1xjl6pX1Gi1dbsrCEfyMfTpY3XI/IxOrLkTS30X5WQXGgBf911QN2CFIUR+nNfWGgxU1YZUVFFIUSIRLDZEhRUaEtciHEmFh1RokRhSHVVOkCJEl4i3Fg4sQhcgUBojQ6JCJTZGlI0NsWEXGjwzRYVUXRC4EyIVJKrSIVd41mRAJTS0hZUIvNHXElQjh0JQQXB7EnVNhGkQlUzuUSZAgViGh5kArNtViR4K44cUevpVhoEZ8KNHDZ0ph4VsWVrWhESIYNFWEb09YBchGOzRFgoCy6dDUCBy115Qbsulh1Q0cqWFVFbJVYVUTHC2iH1NgruYcU/4TcjTfUh2MuJkcVtHgkalNeTGapkxR4VEbz1F6FyGAMoVnR5bMYJWvhDXa1IwfgVHsXXnA1ZQWIEXibFNItmUjUywkElIXz9nHFbFWfSFSJC5AyZUkN1iVA24hbXHVkEcRalWsIjkSb1Mm2GHTGok2lYRJouYa3Ux0mGDVCFuZJIV1+L4ESAtXCYvSrEwhIdlLhtSbq7koDcKxVTtUzBIkIC+lQh4rvbFqUy/MwZIgPlwVAhwt+WuVCWio9MbA472021eknnQFWILC5EXCVtkAcEiFjGuVEjOhEdxXSyD2USFWPPYVEZLQ5EayVp3whGYbETIFCmgxMTJNdiB9Fa0GSHB6USBQSAwWCWJw5ceYaNHQxBkoO+QIG1P0oC1YNRhcVmmAHUAEFm7oYWtBhrxxRRFnxoVEjoTR0XPmSp1QgxCwC6E3YPyNRskXx7GuO1MkNLGsbIZk8e3ugKEghcvESUJGdcSj1YIVD68HBxKTNx+CEFW4kTaChZjxhJeZY7CDFGp8nuIgZFABRRNKIFHEELEbAcUWaUT/5v3456///vz37///AAygALkUEAAh+QQJAwCmACwAAAAAbgBuAIcAAAAULFAcPnEcPnEcPnEcPnEcPnEdPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHIgQXMhQnQhQ3QiQ3UjRHYkRXYlRncmRncmR3gnR3gnR3gnSHgoSHkpSnkrS3osTHstTXwvTn0wT30xUH4zUn80U4A2VIE3VYI5VoM6V4Q7WIQ8WYU9WoY/XIdDX4pHY4xLZo5MZ49OaZFRa5JSbZNVbpRWcJZZcpdcdZlheJxjep1lfJ9nfqBpf6Ftg6NxhqZziKh2i6l5jat7jqx+ka6Bk7CClbGFl7OHmbSKm7aMnbeOn7iQobqSo7uTpLyVpb2Xpr6ZqL+cq8GfrsOhr8SkssantMiqt8qsuMuuusywvM6yvc+0v9C2wNG4wtK6xNS9x9W/yNfAydfCy9jDzNnFzdrHz9zI0NzK0t7M1N/O1eDR2OLV2+Ta3+jd4urg5Ovi5+3k6O7m6u/n6/Do6/Hq7fHs7vPt8PPu8PTu8fTu8fXv8vXw8/by9Pbz9ff09fj09vj19vj19vn29/n29/n29/n3+Pr4+fr5+vv5+vz6+vz6+/z6+/z6+vz5+vv6+/z7+/z7/Pz8/P39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBNCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6ZNgU6abFmT56ZMGwiCIuhgg8iUOj5ZyhDKNKgNLHuSokTRtKoFHlwGSSVpoapXBB+qQNoK0tHXszLSkPVIiMbZs0HurPV4Z80WJkBEvBUqZW5IR2OAYNhro4/fkIG25Hj7ws5hkXBqnDUh53HITFj0euWAxnLIPUS+WtjiOSSbpV6flAapSMfXKas/tvZq4U1sj7OrrvBzu2Pupj449eao6IZXK8M55ilRFUOc5BvPeG2hFXrGJV6XWM/4CGhTDoK2/mO8M6IqFfEYq1RN8Qi9xULlm3JxbzFKVRjC6U8UxKFqGf0UNVEVEQBO1IcGTZ1Q4ERAVIXUghBhUVUXEEIkR1VGVPiQJvEJFYOGD/1QlR4gNnRFVWGUyFAc5qm4UCBVQeGiQopU1YRGX1yhhRdimAFHbFUpoZGITMEQ22BMHaGREE2tEFuHQRWhURFNkRAbVUwJoRESTWkQWwtN/aARdk3FZkJTQWj0RFWJlPaHjRpNUZVhnsFRFWkZSdjUc555URUbGpVR1RWlQVFVTxm92RQQpQ3R1AYcucXUCKVJxlQNHHHZFB2W9dEVU0Nw9MWdlmVRlWob2VGVlI8Z19Qa/h2t0JQI1c11h275bRRaU335ZV9TMnZkRlUlHOKXrE3J1REnM7S4VhhV5QASGMQ2QlYjyDI130eavDAoWU40h0hIW1Q1grI+2YEkU06I9AiWTNnQnk89VNWCtSLp2ZR2N43h1X8jNWJpU2fYVAdzYZpUR39NlYCoTHlkK9QGD5PEhVc4tBlTH6g1dR5KTFZ1wx8wDTJwkZikVAiYVc1AYkuNuNqUCZyqxOJ0D6rUBw9efVAZS3J6lcIcKrUhsVAc8MkSJ0l81QEWmZjEyRQXeIUBrDBJcVYNP4sUiA9fXQBwTOWKtkQhrFVx5ldi1ATGuvaOrVEjWMBbFQlm3ITGrQZv1UAFuhVBksXRTdmAR1JukLAXAjdAJZEfXhCB8FlLjCXVHUEsHpQLPzjxRdcF9UFHG1LgoDkJcm+FRgyaNzUDDzzoQMParTsF+FqQVPFB7bx7RYMXUXsGWu/E1xDGJr3VEUXHxJ91Q+rDxbGECs0zxcEPWNTsXiZqGAGl5jQsgYYjIO4hRxlbQGGED7D7YMQTWYjhRh2KzGj//fjnr//+/Pfv//8ADKAACxQQACH5BAkDAKgALAAAAABuAG4AhwAAAAEBAQICAhw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch5Acx9BcyBBcyBCdCFCdCJDdSNEdSRFdiRFdiVGdyZGdyZHeCdIeChJeSpKeitLeixLey1MfC5NfDBPfTBPfjJRfzRSgDVTgTZUgTdVgjhWgzpXhDtYhT1ahj5bh0FdiEJfiURgikVgi0dijEhkjUpljkxnj1BqkVNtk1VulFZwllhxllpzmFx0mV53mmB4nGJ5nWN6nWV9n2mAoW2Do3CGpnSJqHeMqnqOrHyPrX6SroOVsYSXsoaYs4eZtIiatYqctoyet46fuZGiupWlvJinvpuqwJ6tw6KwxKWzx6i1yau4y625zK+7zbG9zrS/0LbB0bjC0rrE1LzG1b7I1sHK2MXN28fQ3MrS3svT383V4M/W4dHY4tPa49Xc5dje5trf59zh6d7j6t/k6+Dk6+Hl7OPn7eTo7uXp7+fq8Ons8evu8uzv8+7x9fDy9vL09/P19/T2+PX2+fb4+ff4+vj5+vj6+/n6+/r7+/r7/Pv8/Pv8/Pz8/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AFEJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOBUiyjnzEQgjaCDxfOmGgFEVU+wMZUnFqFMCO8IcWoqSxtOnIbxYokqyz9WvPfJwFTnm61cPWiSN/ciozBCzV3XcWQvSTxYZcI16WEMX5CUxKvISMNMXJKIpgskUBplHSF4xiz9uQoPX7JfIHxX9gIsFs0dGjs2e8dzRURGzKQyR5ihJiVkkqzleaiI69sZLPb6uUG07ox4QX2H3zujFrJrhGHF/5bEJ+UU9Hr7GcX5xS3DqFhuZ+KoHe8UrX6P+eKcoqMNVEIXGT3zyNYt6iXe+1ugo6M0jz0S+Tt1YhkCIImDk0VxfZHzF10ZVXNVCJH3p8ZUVHOX3lAyFaULCVUFwtN1TSiyWxFUdMJgRIF9psdgXX8mhURtfHVfYHF95oVFxV/GxWCTmPSWFRk5cFYImkcVwlXgZSegUhZHNcBUUGhlxFZKL1XDVExohcVUMmN1wFRMaLXHVC5jlcFWHGdH2lAuY7XCVcBix91QLmPFwlREaQXHVCpitMKVGUnzFyGKDfAXGjCkuVtRVb2gUx1eXFUbjU4NoxMhXZPbl5VMmcJTbUyosVplTRXDU1FV99FXIgxyd8RVhdIWxKkf+f3yVRF9qXuVHRy98tcdadnwlhEcJDrnWqE8pRl+OToHA21KSoODjIh+5+VRnVKXxFZMf4fGVCo0sdUmtT00H0mlXbbEUGF/RINKhT3WgVE6CjPAVFyJtgsNXNjiSk5N3KjISGmZRgZO1r5LkWqE1LeLCV0OYlEgLX8Hg70yRkPsUCH+cxO5TQ/wZUyRHmNVFSoh9BUQiMFES8lc3UJKSIzaYtcNOLV1y8Fd0rNSrWTksm1ImTMA1RksAm3VDpCkN8pZlL60BVwtmDFgSGRt+dUVMa0Rn1hC7jmQIv2ZVMZPTeVnRLUho6AkXhDS5AdzTWSCtkSZpyJnXFDfB8TazXB0sEYfUFF1yhg6CmWDsTXoAIZhROYwBbUSZzEEFDIsLAchSY1QtWBBTlCFWQn+08YUTEC9OQBhjGSKt6UalIMMOQhThgw1qs27UDl2v9YaStvcOlwkyLkaJGmD73vsKXjzuGSBYUG784i6AcbZtlrBh5fPnLbGGWtgNYsYUm/lOQhFj0PyeQI/MEYYVUBjBA8QqyKBDEEdggYaN5+ev//789+///wAMoAAHSMACGpA6AQEAIfkECQMAsgAsAAAAAG4AbgCHAAAAGzxtHD5xHD5xHD5xHD5xHD5xHD5xHT5xHT9yHT9yHT9yHT9yHT9yHT9yHkByHkBzH0FzIEFzIEFzIEJ0IUJ0IUN0IkN1I0R1I0R1JEV2JUZ3Jkd3J0d4KEh4KEh4KUl5Kkl5Kkp6K0p6LEt7LU18L059MVB+M1F/NFOANVSBN1WCOVaDOVeDOliEO1mEPFmFPFqFPVuGPluGQF2HQV6IQ1+JRGCKRmKLSWSNSmWOTGePTmiQT2qRUWuSU22UVW+VV3CWWXKXW3OYXHWZXXWaX3ebX3ebYXicYnqdZHueZn2gaoCibYOjboSkcIamcoemdYmoeIyre4+tfpGugpSxhZeziJq1ipy2jZ63j6C5kaG6k6O7lKS8l6a+mKi/mqnAnKrBnq3Coa/EpLLGqLXIq7fKrrrMsr3PtsHRuMPTusTUvMbVvsjWwcrYw8zZxs7bytHdztXg0Nfh0dji09nj1dvk1tzl193m2N7m2d/n2+Do3OHp3eLq3+Pr4OXs4uft5Oju5unv5+vw6ezx6u3y7O/z7fD07vD07vH07/H17/H18PL18PL18PL28fP28vP28/T39PX49fb49fb59vf59vf59/j69/j6+Pn6+fn7+vr7+vv8+/v8+/z8/Pz8/Pz9/Pz9/Pz9/Pz9/f39/f39/f39/f39/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/////////////////////v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AZQkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz58moZAButJOggRAABFFaeRoAg5iSC0lOcepUx58pooMYtUphi6etHqM07VrkbBiNx5iUtaqElBpObI50fYoE6lxNT6CUjeBE7x5M8JRUdcJqsAaFd2oGwZx4sVlNfhxnFFx2x2AKVe0XLaLZoycrV7Y8/mioA5lcaAtTVFMWy0kqwwCyqOtI5FnEmCgYshnHgplG4fs4XSDFUU9sZSdEfJOWRo9L4koGwdklLJcfFIp2+RjJAxdKf4g7+mnbIVHHsGUdQJ0SFkwHmOUnQN0zfOOeMrmIEpqRVlBHJVRlhlLdVFWGhxJURZ6RNVR1hUc6dCVC1ORUkFXQmzEyYVWMaFVbVaJsFFVXXmh1XZdZZXRGGW9oVVuXZ2hEV9dMbhUH2VRoZF7VlEo1nRuaUREVz2kRUNXSmhURFc6GNlVEho1ZRUOTlqFhEZIdFVDWjN0ZYRGSXQlA5ddEQFmVy2kJUNXQ2ikRFcVZEaUBhhqNEVZd2j1x3oamVFWGVqhEZxGe5Q1hVZXULcRnVbxoNWSVkFwyUY/wCmnTyh0ZQNHVZRlx1KFlPUER4J2BR9RZJQlBkeAlBXDYf5A1aAoR2t25eJPZHWFQnplJfkTW11t4dF3XUFAiE+KAGeVeB89UVYWPm3B50dylLUrT5ekUFYdIdlQ1hc8ddqVoyGl2tUFk+VEYowiVQJCWU3mdGRXK5D0RVvZ3ZRoiyShskNZFJBWkx0RlAWFSX5cUFYLAM5ECGFdnWCjvW0xLJMhtXbFBkr+VtywS4rIyp1KCVd8bEuP4NAWCeOldG9bMZysUiUStoUGS6hc19YJbahkx7zPvnRnXU20PJInWCj7bUzitmXCGiTxoXJd4MqkRV8JMGE0R6R4AV5dq9L0cl0eUKHURpGAIV9fYdfUBl1YJwEHRnlEwWhdKPSMk6QiS2B9lAtZnA1RJGhw5TcTt+2EBgl+H8VDFWTQoRAgZ0wxtd8kIOhTIVI27lQHKtjwww41qMC4504p0RtRZryL+ut1kSCjVo5oYQLsuCdAgxiR5HXJGC7k7ncFTMxNGSpwTAG38E6psMXqrMnyxhPBw34CE2N8Gv1BjrTBBRI70JDCuyLE4AMSUFxhhuDbt+/++/DHL//89Ndv//3456///ioFBAAh+QQJAwCcACwAAAAAbgBuAIcAAAABAQEXGyAdPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHIfQHMfQXMgQnQhQ3QiQ3UjRHUkRXYlRncmR3cnR3goSHkpSXkrS3osS3ssTHstTHwvTn0wT34yUX81U4A2VIE4VoI5V4M7WYQ8WoU+W4ZAXIdCXolFYYpHYotJZY1MZo9OaJBPapFRa5JSbJNTbZRWb5VYcZZZcpdbdJlddZpgeJtiep1lfJ9qgKJtg6RwhaVyh6d0iah3i6p5jat7j6x9ka6BlLCFl7KImrWLnbeNn7iRobqVpbyXpr6ZqL+cq8GfrsOhr8SjscWlssentMiptcmsuMuvu82zvtC2wdG4wtO6xNS8xdW9x9a/ydfBytjEzNrGz9vJ0d3M1N/P1uHS2OLU2uTW3OXY3uba3+jc4une4+rf5Ovg5ezh5ezh5u3i5+3j5+7k6O7l6e/m6u/m6vDn6/Do6/Hp7PHq7fLr7vPt8PTv8fXw8vbx8/bw8/bw8/bw8/bx8/by9Pf09fj19vj29/n29/n29/r3+Pr4+fv5+vv6+/z7/P38/P38/P39/f3+/v7+/v7+/v7+/v7+/v7+/v7////+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gA5CRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRozfZeEE6Ms+JC2KYglT0ggCBDFGlcqzEw6rVDGReErKZxKvXDWFZpglhhqaiFWbPnlmpKAUBC1ho4rEbl0CIPyqLmFVSaSYdvnF9pAzTt0ciwyf6EuBy0o+IviUA0YRTou+IQCZzSE5LM43kICWnSE6Cc4nkpSIXfejr4hFORy08gw5Jpe+FNjpN920S0hKLvlF4uo6LovBHMH1RSOKJu28YkDr6SvG5pS+Qj276/m543PNRh7gUAHc00pf1TyTaPYLoSweomr4vOr7xLrRqXDkcdReXFkL1FhdsGpUV1xtCwdGXExzNENcHRJ1n1g8bOUJBYkTVwNxGZ/T1BFFH9DVWRlL0RVpQVaiokRJ9kSdUiHFtl5GCXlFIlCJ9EaERfGaFYNQIcQmhEXtBGnWZWUNoJJhZIxg1n1k+ZkREXCUYZaFXRmg0RFwmGLVBXEdoJASWRmUQFxJe9qVIURbE5R5GUPSVBlGA9KWERl/0lddQYiCnURx6EvVEX21ppKZZOxD1A3qObEQDmER1ZlYMHD1p1m5A8dFXmRupNqBQ0I26ERl92SDUlXEBt5F5/n0x+NMfF8S1gUc4erXnT0306FEbfYVgW0+QLGkWGx9JGNcWPl3RFw8gYdHXCpHuZAlccY0x1ZZeLcFTi3HlFxKSca2h0xtjmgpSHemaBcN0N0ECQ18mQDKSqHGNeFOuXjE7kiUy+OYqTaj2hWFJbdQalwp50MSHpWaVIMhJvfalgh8y+eFfXCuSBElufbWA8Ut6HNeeSsKFPDJLdqggGQvDpiStZC3gwZIcKEh2gRotCdiXCF+oJIcJkllAmUs+92XEIiZZkkUIRQcNExeSWdUCsiPBgUPVF0gdExdx6mzEHSBB8sSivl1HUxcaVE3ABWNzpMcTkVWtQccytbGxvM5H6HGRJWQEEbbdid7kCL99WUADE2QwDREgU5jsNgE0uMFTGBBPfgEOTWhRhhzwDsSHGVcs4UMLG05OgAdUWOKTH9mp3hcFKNggAwoKy25WDw0DZckXMeguvOolHE2UGJMOr7xVMlwho1FliLa86h0YcadWAtFxRRCzTW9W889jP9AkaDxhw+DE99DEFzaLz1Akd6DhRRVMEMFDDvj70IQXdrjv//8ADKAAB0jAAhrwgAhMoAIXyMAGQiQgACH5BAkDANQALAAAAABuAG4AhwAAAAIECA8hOxcyWh0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch5Ach9BcyBBcyBCdCFCdCJDdSNEdSNEdSRFdiVGdyZHdydIeChIeSlJeSpKeitLeixMey1NfC5OfDBPfTJRfzNSgDVTgDZUgTdVgjhWgzpXhDtYhDxZhT5bhj9ch0Bdh0FeiEJfiURgikRgikVhi0Zhi0dijEhjjUlkjUpljktmjkxnj01oj05okE5pkFBqkVFrklNtk1VulVZwlVhxlllyl1pzmFtzmFx0mV11ml93m2B4m2F5nGN6nWV8nmZ9n2d+oGl/oWqBomyCo26EpHGGpnSJqHeLqnqOrH6Rrn+Sr4CTsIKVsYOWsoWYs4eZtIiatYudt46fuJGiupOju5WlvZinvpqpwJ2swp+uw6GvxKOxxaWyx6azx6e0yKi1yam2yaq3yqy4y625zK+7zbG9zrO+z7TA0LbB0bjC07vF1L3H1sDK2MPM2cbP28nR3cvS3szU387V4NDX4dHY4tTa5NXc5dfd5dje5tnf59vg6Nzh6d3i6d7j6t/j6+Dl6+Hl7OLm7ePn7uTo7ubp7+bq7+fr8Ojs8ert8uvu8uzv8+7x9O/y9e/y9fDy9fDy9fDz9vHz9vH09vL09/P19/T2+PX2+PX3+fb4+vf4+vf4+vf4+vf4+vf4+vj5+vn6+/r6+/r7/Pv7/Pv8/Pv8/Pv8/Pv8/Pv8/Pv8/Pv8/Pv8/Pv8/Pz8/fz9/f39/f39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AKkJHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHdoTUyuiJyW1qIK05CITBAjMaSrSUIioBEBAovqRD1asM45y3ejm61cvYzXWMYt1RaS0GCddZRsDE9yLsGywJbBDFM5VKrHsHZLq5qwuT1KuZSuF1k1KOqL+OSmXrQ5eN/mUwOpC7Mi8eyvdLMN2TMk1e+vgLMvW0UhbKRjn3HWD7Q5gIhd/fXFK56K9b0Iuq20WD88wbFHYAkmIbQvMO1GxYDv5IxO2cHx6NRvlIyS2JQr+92xGg63fjmfYmgHahm0cj0TMdhgFlBNbHB1ldTDrRKgRto9whAhbbQilG1bZbcQGW4kIZYoHZoHBURPyLSfUEGYFsZEtIJiFBFFfmDVCMhr9ZpYaRL3BliYa2cHWIUQNwpYhGsVhHlGUuKdRe2Z5FtQubIWhUXpmLYMUDmZdodEYZoXQFIZfdaFRiF+10BSSXwmZURZm0dDUC2aRoREUZvHQ1GZfoaEREmbNgNQyBGo0BVu7ELUKdhqhwdYkRIHCFh0a6cEWIUQdwpZxGTWi41ComcWIRrKURpQTZoGAm0YxmNXEUMB0+NUSHEVhVgmzCKXoiRyZcahQcszIkaH+HgrFpVmocLRMpmZdAlQqaGKlg0esfYXiT8FiZVpHn7D1gpE92dICgx/NaZYdPtHB1g8gyWhWCqTwBIwMbAECki8rsPUFT32wJcOlH1nL1iI6oQIDW1OFlMwP99V5UzNkbhvLSJHs5QZOrbI17EiksdWITY7sRYOPIbUC5raizdTKDGx1sJVJf+wFAygytRIfWwOjdB1bOZQCEyk87IUEsyd5Mi9bQ/zb0iZ6JffJSpXExlYPLK5EycyussSICHudEIhKkPjMlhgvHbLfXmToS1IycIywFwFaWN3SHlsT8EMnJEmC79ZpNCOTjVuXYMZ5Hu2iBoRbIzrTHr2yFcLCGJtw5EocuO5VAo02QRY2AR14QQlGn5hxwuEtvIWTLGAcHtUPaCBi4UOMuHGE5QQ44QlPeICOFRRxbHwQKJDkwQUKpqugx0+U5GD6VzQk8cQTTuhQ7u1YXdEtULzkERnwyCu7NFHNGJJE8snfQIcsYzFyBfSgN0EIzGmZ8kcYRGOf1ReS32XQJHNQkbflLFTxRiI2m79QIm+QsQUUu0OxBRltzNHHIRWTnwAHSMACGvCACEygAhfIwAY68IEQjGBDAgIAIfkECQMAsQAsAAAAAG4AbgCHAAAAHDxtHD5xHD5xHD5xHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHkByH0FzH0FzIEJ0IUN0IkN1I0R1I0R1I0R1JEV2JUZ3Jkd3J0h4KEl5KUl5Kkp6LEx7LU18Lk58ME99MVB+M1F/NFKANVOANlSBN1WCOFaCOVeDO1mFPVqFPluGQFyHQl6JRGCKRWGLR2KMSGSNSmWOS2aOTWePTmmRUGuSU22TVW6VVm+VWHGWW3OYXnaaYXmcZXyfZ36gaX+ha4GibYOkb4Wlc4indYqpd4yqe4+tfZGuf5KvgZSwg5WxhJeyhpiziJq0ipy2jp+4kaG6lKS8lqa9mai/nKvBn67Do7HFpbPHp7TIqrfKrbrMsb3OtL/QuMLSvMbVvsjXwcrYw8zaxs7bx8/cyNDcytLezNTfztXgztbg0Nfi09rj1dvk193m2N7n2uDo2+Do3eLp3uPq3+Tr4ebs4+ft5Onu5urv6ezx6u3y6+7z7e/z7vD07vH07/H18PL28PL28fP28fP28vT38vT38/X38/X49Pb49ff59vf59/j6+Pn6+Pn6+fr7+fr7+vr7+vv8+vv8+/v8+/z8+/z8/Pz8/Pz9/Pz9/Pz9/Pz9/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AYwkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnw0hVVDjyuRLMCgMGsBBFOWcHUqQpOi0lKShJhKdPv0wV+YYEVqwztoIko+Hr1zNiO255YPbphyuX0m580hZphCSC5Gp09KOugR1x9Gr8U6PuCq2CM24q3FbHosQapdT1EQlyRjZXzQrZZBkjohRtjUjtfLFIWx+kMYJpm8JQaouORpiN0Oa1xSxtr9iuuAmFWdS7KXYxe4FPcIouzC4Ri/jj6q/Fl0bS0sJAGJAyzCohSoiKbKRDPv6maZuHqFesGh53hGI2yVLTX7t4tGG2PNEyvzsiMotjaicRXz3wB0dfmCXFVkyYpdtGSJiVxlZtmAUERyx8lcFoUx2F1Qsb4WHWD2k1iBUFG2mhYFpVmFWHRgl+NUdaBX4FhkZHfOWAXHCYVYVGQnzVgVyLmHWERj58RYJeJnzVX0Y6fNWCXjl8JYNGNHwVllw8KKlRdVjloBdjTwGH0XlPXZmWCl8JsaWPenXw1ZAZ9fUVIGl1YlYTGtH11Rpp8WGgRluYJZ9Y+H21IEbjfXWgWFGYJYZGhJhVRFo4fBUBIxuF8NUKYjGS2VNLalTpnluJYRYUHDX61XJT6YkVGf4c1WGWCBj6RN+IlHQ0KlZlLJWHWTt4hIWQSy3xZ0eAmOUBUX9cYBYbHwFxLE/saflRjFhhYJ9OiLj51aMgkflUeDtRYdaUIXHR1oM5OQKCWV6MBOZTMeikhFkr1PpRhGZtgdNzX/lLEnxYbfCGTXSU9RUKuZLEBwazbhuTIlx+BatJ5prVAp0yyfkVnidFckJbNQz10iY1mkVDwyexkcFpnLW0SA9tdYDHSmN8itUOxq30xwx1XceSF3WN0GtKdqDZlnsuZWzWA1LoK1Ib77YFQ2UvidgWzyQBsgQFddHQR0ydSFtXB0/07NEiU3h7mskxXeJqWxcgcQdHl2Qh7rapN5EBoF8REAEHokrs/dUE8eLER5N+IQWDE2aw7FAbT4DWuAEe8Fnu5U9t8MMWatSBSEJyRFHx5Ubs4VMaSXIOnQky4BDDCiS47XoObky1yBW+ue574yo0t9UlXMDw+/FPcUAF1oKFESXynLtwxSGpsQHFrdAXLARaxwnihRGt//6CE2VIftxAfbDxhRVM/FCDBwZ8kEIMOySBhRl5na///vz37///AAygAAdIwAIa8IAI3EhAAAAh+QQJAwClACwAAAAAbgBuAIcAAAAcPnEcPnEcPnEcPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeP3IeQHIfQXMgQXMgQnQhQ3QiQ3UjRHYkRXYmRncnR3goSHgpSXkrSnosS3stTHsuTXwwT30yUX80UoA2VIE3VYI4VoM7WIQ+W4ZAXYhDX4lFYYtHYoxIY4xJZI1LZo5NaJBPaZFRa5JUbZRWb5VZcpdbdJledptheZxjep5kfJ9mfaBof6FpgKFrgaJsg6NvhaVwhqZyiKd1iql4jKt8j62Ak7CElrKImrWKnLaMnbeOn7iQoLmRobqTo7uVpb2bqsCgrsOkscamtMeptsmtucuxvM60v9C2wdG4wtK6xdS9x9a/ydfBy9jDzNnFzdrHz9zJ0d3L09/N1ODP1uHQ1+LR2OLT2ePV2+TX3eba3+jc4ene4+rf5Ovh5ezj5+3k6O7m6e/n6/Dp7PHq7fHr7vLs7/Pt8PPt8PTu8PTu8fTv8fXv8vXx8/bx8/by9Pf09fj19/n4+fr5+vv6+vz8/P38/P39/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v79/f39/f39/f38/P38/P38/f39/f39/f39/f7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBLCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmyzDJMGC82WhLkRCFChgpOdKQFl6cBjK1IVRlIWaLGVKtcCgpyWzoKjKVQxWkWxocB0r5etHPkjGjp2hxWxHNiXUMsWAo0odtx3FdJDLoQcWQHg9ZrEg10ifwB+lyHVhBrHHS0bUepiSyLHHJWpPwLHs8YvaF3g4d4zjYSyOQqI5Fmoxlkjl1Bt9jPUBmyOVsS1Q186oZiyIOLs12hjrNTjGMWOdGM84g2sORssveuGKIXR0iy64KrlucQtXD3+4/lO8tIIrE/EUkVcNEQj9RMxVy7qXmL3qnvkR93CtgT/iFa7y9efQD1yxIaBDiexF1QmiHWLGFDzEsFEZXCFh2RbDUbVRFVx5YdkTXMmhkWJV0WEZFlyNoRF8VBFiGRlc8ZTREVxxNgdXT2gkG1UkcMYIBlUVoREOVa0gmgpV3aBRDFXNIBprVNGgEZJU5SCaCVXpoBGUTNkg2lRMCaERD1WVwNklXCWhkRJcGWKZHlw1odFtVa1hWRxcTaHRdFVtYVlvVV2hkRsAnsgVFxtxRYRlQnC1mUYnVEXCa3gxIhRVKHAERIqIAUqVhRtpoR1iJFLVBUeDaFCVCYjdUJUF/i5ytANXauBFCGFUednRf1XJ6RadVAW4UR9clRArVoSIQOtHrlaV41cgVvUCSMAy5UEeWP1RWlVfgPQHCBVixWaTIlU7lAWP4lQHkFWFIRIiVFLVQ0+M5MCVkiOJGiNOToyFRkkycGUBGTaJMZaWJZkx1gdu0CQHuFzZaRKBXKlwX0yG1FcVFSjtES9VM7gJ0xCzqQQHxFXVcFhLiUTGVW4rkcFuVSi0wRIgzVbVAXAs6ctVB6emFMfHVCHqUhNyPWsSGShXtR1MjarVQ3sj2VGEXGrGlMi4Y4lABSIgRaUgVxVwTJMWYHK1gp8cJWJFXGpx4KFNbpQnVwtUUG3RphlKYCkXCbXiNAiZchXAQRGNSdQGE3YXzoKJT0VROFMl8CBFGMceRIcXTnA5ORO6YVUGDJNXxUEJK8Bww+o32NB06UDMERgjWRBd+u2flcHZIVNcivvvTJmABXSpEXJFc8CXLkIRXhyynBtKKJt8mUeAQSl3D/LwAfAuJKHigQKxUYUSQuTgQlwm0NBDElN4wTP48Mcv//z012///fjnr//+/PdPUkAAIfkECQMApQAsAAAAAG4AbgCHAAAAChQlGztrHD5xHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yH0BzIEJzIUN0I0R1JUZ2J0h4KUl5K0t6LEx7LUx8Lk18Lk58L099MVB+MlF/NVOAN1WCOleEPVqGQF2HQl6JRGCKRWGLRmKLR2OMSWSNS2aOTGePTmiQT2mRUGqSUmyTU22TVW6UWHGWW3SYX3ebZHueZ36gaYChbYOkcIWlc4endYqpeY2rfZGugJOwg5WxhJayhpizh5m0iZq1jJ23jp+4kaG6k6O8lqa9mqnAn63Do7DFprPHqLXIqrbJq7jKrbnLrrrMr7rMsLvNsbzOsr7PtcDQt8LSusTUvMbVvsjWwMnYwsvZxc7byNDdy9PezNTfz9bh0Nfh0Nji0dji0tnj09rk1Nvk1dzl193m2t/n3OHp3uPq4OTr4ebs4+ft5Oju5env5+vw6ezx6ezx6uzx6u3x6u3x6u3y6+7y7O/z7e/z7fD07vH08PL18fP28vP28/X39Pb49ff49vf59vj59/j6+Pn6+Pn7+fr7+fr7+vv8+/v8+/z8/Pz9/P39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4ASwkcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmS0NzzniZ0oSIjzU2VyLSEiREgaNIj5IJenKOlBwakkpVypSkmRtTsx4tUzVkmhxaw5rp6tENj7Box5LVCMcH2rAmaMBZmxHKW6QniEzxkiYPXY2Ofrz94GPKnL8e+chAG2Mp4o9sTIRd4YXT449bOGgVMWXS5Y9OwiJB9PljF60l3JT+qEbzVBZ6VnvMIyKrjUSyOzJikfWH59wbNZ2d6sMy8I1JsraAdHxjmqwl9jTfOGNqB9XTM4LJCiZ7Rky8pf4G8Z6xylQOfMhfhCRZ6hL1F+1KFaEIvsURU6nYr/jmNab9FD2RH4AU0TBVHwRKZMhUNCQokRVTQeFgRIJJddiEDk3igVQrYPjQHFMl4aFDZkzVxYgNeTGVWigqRMVUF7aYUBNTCSKjQkVMZdyNB1WIlAk8JoSDVC4EiZAOUrWQWwtS7aBREFKFkJtRSY2X0RFT/fZZJVMdoZF8SUlXWh5TRaERhFKxsZoaU12hkRhTjbFaGFM5htEaba5mnlTYYUSmVEaslqNU6WXECZVIobAafkmVwJEQU8nxmRtTDcHRFmV+JqBUX3CUyFQ3fGZgUhrgxhFWUhXy2IJS6eARmP5IYfEYmklJ4VF/Us2AGCcuwPhRe0lp8dcVUyn6EaxHpcAcWY4Ai5SZHzFyQoRrhSaVCct+tGdSHwzSFR8dTGWFSJisMBUPO9akCZJSsaDJSNtN1QRTSmQlRkmjSiVnTfFKhYNJz031QR001bHhVG+chERWKzAiUyLmTqUESprskFVxMHEynFQ8vIuSIuFJ9UO2KwWmnMMq4VHbVDIUqhIfL2QlgpgrpRHVVCbMlVJkWXGgxku0SuVBpyd94ZqJMW2a1bwl1avVEzNtsYFWNNj5kRiL9bxFTWkwahuLG5GR71QjqGnTHjGHZUMaGl2F1gs02+SIW2ixgIQZlUhUSYwZR4Ss1Q+OrEXjXR78gMUadhyCkCF2rIHFDwe/xTRdaoB113ws3EADCytfjpQOP182Rtqel55VY7JtokXEppu+whbprjYJFc62DhcVeWc3yRlLwGA7y0uckbt9hGQhRAmmmyBEFoSgeAgdaOzUkw8+ENHEXmjQQZqR3Hfv/ffghy/++OSXb/756KcUEAA7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
    load += '  <div id="'+id_load+'" class="'+$divs.loader.n+' '+use_msg+'">';
    load += '<img src="'+img_s+'">';
    //load += '  <svg width="110px"  height="110px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-rolling" style="background: none;"><circle cx="50" cy="50" fill="none" ng-attr-stroke="{{config.color}}" ng-attr-stroke-width="{{config.width}}" ng-attr-r="{{config.radius}}" ng-attr-stroke-dasharray="{{config.dasharray}}" stroke="#1d3f72" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138" transform="rotate(264 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg>';
    load += msg;
    load += ' </div>';

    if(!remove || use_msg.length > 0) {
        if($($divs.loader.class).length == 0) {
            $('body').prepend(load);
        } else {
            $(load).insertAfter($($divs.loader.class).last());
        }
    }
    else if(remove) {
        //console.log('CHAMARAM-ME', this, arguments, id_load,arguments.callee.caller);
        //$($divs.loader.class).fadeTo( 650, 0, function(){ $(this).remove(); });
    } else {
        //$($divs.loader.class).fadeTo( 650, 0, function(){ $(this).remove(); });
    }

    /*if($($divs.loader.class).hasClass('use_msg') && ($($divs.loader.class).length == 0 || remove)) {
     Mask(true);
     }*/

    var load_return = $("#"+id_load);

    var r = {};
    r.RemoverLoad = function() {
        $(load_return).fadeTo( 650, 0, function(){ $(this).remove(); });
        if(typeof xm != "undefined") {
            xm.RemoverMascara();
        }
    }

    return r;
}

window.loadTabelas = function(tabela,fechar) {
    fechar = fechar == undefined ? false : fechar;
    var load = '<div class="'+$divs.loader_tabela.n+'"><center><svg width="80px" height="80px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-ring-alt"><rect x="0" y="0" width="100" height="100" fill="none" class="bk"></rect><circle cx="50" cy="50" r="40" stroke="#dddddf" fill="none" stroke-width="10" stroke-linecap="round"></circle><circle cx="50" cy="50" r="40" stroke="#16409b" fill="none" stroke-width="6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" dur="4s" repeatCount="indefinite" from="0" to="502"></animate><animate attributeName="stroke-dasharray" dur="4s" repeatCount="indefinite" values="150.6 100.4;1 250;150.6 100.4"></animate></circle></svg></center></div>';
    if(tabela.find($divs.loader_tabela.class).length == 0) {
        tabela.prepend(load);
    }
    if(!fechar) {
        $($divs.loader_tabela.class).show(400);
    } else {
        $($divs.loader_tabela.class).hide(400, function(){ $(this).remove() });
    }
}

window.getDataFormatada = function(data,tipo_retorno,separador_data_hora) {
    data = data == undefined ? false : data;
    tipo_retorno = tipo_retorno == undefined ? 0 : tipo_retorno;

    if(tipo_retorno == 'bd') {
        data = data.match(/\d+-+\d+-\d*/);
        if(data != null) return getDataBR(data[0]);

        return data;
    }

    separador_data_hora = separador_data_hora == undefined ? "" : separador_data_hora;

    var data_obj = data == false ? new Date() : new Date(data);
    var ano = data_obj.getFullYear();
    var mes = (parseInt(data_obj.getMonth()) + 1 < 10) ? "0"+(parseInt(data_obj.getMonth()) + 1) : parseInt(data_obj.getMonth()) + 1;
    var dia = (data_obj.getDate() < 10) ? "0"+data_obj.getDate() : data_obj.getDate();
    var horas = (data_obj.getHours() < 10) ? "0"+data_obj.getHours() : data_obj.getHours();
    var minutos = (data_obj.getMinutes() < 10) ? "0"+data_obj.getMinutes() : data_obj.getMinutes();
    var segundos = (data_obj.getSeconds() < 10) ? "0"+data_obj.getSeconds() : data_obj.getSeconds();

    var data_emissao;

    switch(tipo_retorno) {
        case 0:
            data_emissao = dia+"/"+mes+"/"+ano;
            break;
        case 1:
            data_emissao = dia+"/"+mes+"/"+ano+" "+separador_data_hora+" "+horas+":"+minutos;
            break;
        case 2:
            data_emissao = dia+"/"+mes+"/"+ano+" "+separador_data_hora+" "+horas+":"+minutos+":"+segundos;
            break;
        case 3:
            data_emissao = ano+"-"+mes+"-"+dia;
            break;
        case 4:
            data_emissao = horas+":"+minutos;
            break;
        case 5:
            data_emissao = ano+''+mes+''+dia+''+horas+''+minutos;
            break;
        default:
            data_emissao = horas+":"+minutos+":"+segundos;

    }

    return data_emissao;
}

window.getDataBR = function(data,padrao_usa) {
    var separador = padrao_usa != true ? '-' : '/';
    data = data.split(separador);
    if(padrao_usa != true) {

        return data.length == 2 ? data[1]+'/'+data[0] : data[2]+'/'+data[1]+'/'+data[0];
    }
    else {
        return data.length == 2 ? data[1]+'-'+data[0] : data[2]+'-'+data[1]+'-'+data[0];
    }
}

window.formatarDataRelatorio = function(data) {
    if(data.indexOf('/') == -1) {
        return data;
    } else {
        var data_ajustar = data.split(' '),
            data_formatada = getDataBR(data_ajustar[0], true);

        if(typeof data_ajustar[1] != "undefined") {
            data_formatada += ' '+data_ajustar[1];
        }
        return data_formatada;
    }
}

window.fecharAlerta = function() {
    if( $($divs.jq_toast.class).length != 0 ) {
        $($botao.fechar_alerta.class).click();
    }
}

window.mostrarMensagemErroSucessoAlerta =  function(msg,focar,is_erro,time,opcs) {
    focar = focar == undefined ? false : focar;
    is_erro = is_erro == undefined ? true : is_erro;
    time = time == undefined ? false : time;

    is_erro = typeof is_erro == "string" ? is_erro.toLowerCase() : is_erro

    var tipo_mostrar, titulo_exibir, fechar=false;

    if(typeof opcs == 'object') {
        if(opcs.NuncaFechar) {
            fechar = true
        }
    }

    switch(is_erro) {
        case true:
            tipo_mostrar = 'erro';
            titulo_exibir = 'Erro';
            break;
        case 'warning':
            tipo_mostrar = 'alerta';
            titulo_exibir = 'Alerta';
            break;
        default:
            tipo_mostrar = 'sucesso';
            titulo_exibir = 'Sucesso';
    }

    criarModal({
        classModal: $modais.modal_alerta_erro.n,
        title: '',
        conteudo: '',
        btns: [],
        notClose: fechar,
        usarFade: false,
        usarClick: false,
        ModalCentralizado: true,
        Open: function(e)
        {
            //console.log(e);
        },
        Close: function(c)
        {
            if(focar != false) {
                if(!$(focar).is(":focus")) {
                    $(focar).focus();
                    setTimeout(function(){ $(focar).select(); },200);
                    //($divs.jq_toast.class).remove();
                }
            }  else if(typeof focar == 'string') {
                var modal = $('.modal');
                if(modal.is(':visible')) {
                    modal.find('input:visible').first().focus();
                } else {
                    $('input:visible').first().focus();
                }
            }
        }
    });

    var modal_alerta = $($modais.modal_alerta_erro.class);
    modal_alerta.removeClass('erro').removeClass('sucesso').removeClass('alerta').addClass(tipo_mostrar);
    modal_alerta.find('.modal-title').html('<div class="'+$divs.barra_progresso_alerta.n+'"></div> '+titulo_exibir);
    modal_alerta.find('.modal-body').html(msg);
    modal_alerta.modal('show');

    var modal_backdrop = $(".modal-backdrop");
    if(modal_backdrop.length > 1) {
        modal_backdrop.last().hide();//remove();
    }

    if(time != false) {
        var time_step = 100;

        var t = setInterval(function(){
            var tempo_percent = Math.ceil( (time_step * 100) / time  ),
                barra_progresso =  $($divs.barra_progresso_alerta.class);

            if(tempo_percent <= 100) {
                barra_progresso.css({width: tempo_percent+"%"});
            } else {
                modal_alerta.modal('hide');
                barra_progresso.css({width: "0%"});
                clearInterval(t);
            }

            time_step += 100;
        }, 100);
    }
}

window.checkUrl = function(url) {
    //expressão regular para validar URL
    var pattern = /^(http|https)?:\/\/[a-zA-Z0-9-\.]+\.[a-z]{2,4}/;

    if(pattern.test(url)) {
        return true;
    } else {
        return false;
    }
}

window.strPad = function(string, direction, pad_length,pad_string) {
    /*
     * @param string = dado a ser adicionado o pad
     * @param direction = left, right, lef-rig. Direção do pad
     * @param (int) pad_length = quantidade de caracteres a serem adicionados
     * @param pad_string = string do pad
     */
    var msg;
    if(direction == "left" || direction == "right" || direction == "lef-rig") {
        if(!isNaN(pad_length)) {
            var pad_string_add = '';
            for(var i = 0; i < pad_length; i++) {
                pad_string_add += pad_string;
            }

            var valor_retorno;

            switch(direction) {
                case "left":
                    valor_retorno = (pad_string_add + string).slice(-pad_string_add.length);
                    break;
                case "right":
                    valor_retorno = (string + pad_string_add).substring(0, pad_string_add.length);
                    break;
                default:
                    var valor_1 = (pad_string_add + string).slice(- pad_string_add.length);
                    var valor_2 = (pad_string_add).substring(0, pad_string_add.length);
                    valor_retorno = valor_1 + valor_2;

            }

            return valor_retorno;

        } else {
            msg = "O pad_length deve ser um inteiro";
            return msg;
            //console.log(msg);
        }
    } else {
        msg = "Tipo "+direction+" não reconhecido";
        return msg;
        //console.log(msg);
    }
}

window.number_format = function(number, decimals, decPoint, thousandsSep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
    var n = !isFinite(+number) ? 0 : +number
    var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
    var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
    var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
    var s = ''
    var toFixedFix = function (n, prec) {
        var k = Math.pow(10, prec)
        return '' + (Math.round(n * k) / k)
                .toFixed(prec)
    }
    // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
    
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }

    if ((s[1] || '').length < prec) {
        s[1] = s[1] || ''
        s[1] += new Array(prec - s[1].length + 1).join('0')
    }

    return s.join(dec)
}

window.formatarValorParaPadraoBr = function(valor) {
    return number_format(valor, 2, ',','.');
}

window.formatarNumeroCompleto = function(valor) {
    valor = typeof valor == "string" ? valor : ''+valor+'';
    valor = valor.indexOf('.') == -1 ? valor+'.00' : valor;
    
    try {
        if(parseFloat(valor) != 0) {
            var n = !isFinite(+valor) ? 0 : +valor;
            var prec = !isFinite(+2) ? 0 : Math.abs(2);
            var n_v = valor.split(".");
            var sep = '.';
            var s = '';
            var toFixedFix = function (n, prec) {
                var k = Math.pow(10, prec)
                return '' + ((n * k) / k)
                        .toFixed(prec)
            }
            // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
            s = (prec ? toFixedFix(n, prec) : '' + n).split('.')

            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
            }

            var new_nv = n_v[1].length;

            var numero = s[0];
            var new_sufix = '';
            for(var n = 0; n < n_v[1].length; n++) {

                if(n != 0 && n_v[1][n] == 0 && n_v[1][n+1] == 0){}
                else {
                    new_sufix += n_v[1][n];
                }
            }

            if(new_sufix.length == 1) {
                new_sufix = new_sufix+"0";
            } else if(new_sufix.length == 0) {
                new_sufix = new_sufix+"00";
            } else {
                new_sufix = new_sufix;
            }



        } else {
            numero = 0;
            new_sufix = "00";
        }

        return numero+','+new_sufix;
    }
    catch(err) {
        return "0,00";
    }
}

window.transformarEmValorMonetario = function(valor, formatar_inteiro) {
    formatar_inteiro = formatar_inteiro == undefined ? false : formatar_inteiro;

    var cifrao = 'R$',
        valor_formatado = formatar_inteiro ? formatarNumeroCompleto(valor) : formatarValorParaPadraoBr(valor);

    return cifrao+" "+valor_formatado;
}

window.valorMonetarioParaFloat = function(valor) {
    valor = typeof valor == "string" ? valor : ""+valor+"";
    return parseFloat(valor.replace('R$ ','').replace(/\./g,'').replace(',','.'));
}

window.permitirSomenteNumeroNoCampo = function(obj, e, com_virgula, com_ponto,per_cent,max_decimal, negativo) {
    max_decimal = max_decimal == undefined ? 3 : max_decimal;
    var tecla = (window.event) ? e.keyCode : e.which,
        texto = $(obj).val(),
        indexvir = texto.indexOf(","),
        indexpon = texto.indexOf("."),
        tirar = false;

    indexvir = com_virgula == false ? 1 : indexvir;
    indexpon = com_ponto == false ? 1 : indexpon;

    if(!(com_virgula == false && com_ponto == false)) {
        if (indexvir !== -1) {
            tirar = ',';
        } else {
            tirar = '.';
        }
    }

    if(tirar != false) {
        var str = texto.split(tirar);

        if(str.length >= 2)
        {
            var selecao = window.getSelection(),
                anchorNode = selecao.anchorNode;


            if((str[1].length + 1) > max_decimal && obj == $( anchorNode ).children()[0] && selecao.type.toLowerCase() == 'range' && !(e.shiftKey && tecla == 37)) {
                return false
            }
        } else {
            if(!e.shiftKey) {
                if(tirar == ',' && tecla == 44) {
                    return true;
                } else if(tirar == '.' && tecla == 46) {
                    return true;
                }
            }
        }
    }
    if(per_cent)
        if(e.shiftKey && tecla == 37 && texto.indexOf('%') == -1 && texto.length > 0 && $(obj).getCursorPosition() == texto.length) return true;
    if(negativo)
        if((tecla == 45 && texto.indexOf('-') == -1 && $(obj).getCursorPosition() == 0 /*|| (e.shiftKey && tecla == 189))*/)) return true;


    if (tecla == 8 || tecla == 0 || tecla == 13 || tecla == 9)
        return true;
    if (tecla != 44 && tecla != 46 && tecla < 48 || tecla > 57)
        return false;
    
    if (tecla == 44) {
        if (indexvir !== -1 || indexpon !== -1) {
            return false
        }

    }

    if (tecla == 46) {
        if (indexvir !== -1 || indexpon !== -1) {
            return false
        }
    }
}

window.validarInputsEscondidos = function(form) {
    form = form instanceof jQuery ? form : $(form);

    var inputErro = []

    form.find('input:hidden[required], select:hidden[required]').each((i, item) => {
        item = $(item);

        const valor = item.val();

        if(valor.length == 0 && item.closest('.chosen-container').length == 0) {
            inputErro.push(item);
            return false;
        }
    });

    return inputErro.length == 0 ? false : inputErro;
}

window.limparErroInput = function(input) {
    input = input instanceof jQuery ? input : $(input);

    input.removeClass('input-erro').tooltip('dispose')
}

window.erroNoInput = function(input, mensagem, limpar) {
    input = input instanceof jQuery ? input : $(input);
    mensagem = mensagem == undefined ? 'É necessário preencher este campo' : mensagem;

    if(limpar != false) limparErroInput(input)

    input.tooltip(
        {
            title: mensagem,
            placement: 'bottom',
            trigger: 'focus'

        }).attr('data-original-title',mensagem).tooltip('show').addClass('input-erro')
}

window.validarFormulario = function(form) {
    form = form instanceof jQuery ? form : $(form)
    var sucesso = true;

    form.find('input[required], select[required]').each((i, item) => {
        const valor = $(item).val();
        let valido = $(item)[0].validity.valid;
        let mensagem = $(item)[0].validationMessage;

        limparErroInput(item)

        if(!valido) {
            let idTab = $(item).closest('.tab-pane');
            let timeout = 250

            if (idTab.length > 0) {
                idTab = idTab.attr('id')
                const acionador = $(`#myTab a.nav-link[href="#${idTab}"]`)
                timeout = 400
                acionador.click();
            }

            setTimeout(() => {
                erroNoInput($(item), mensagem, false)
                $(item).select().focus()
            }, timeout)

            sucesso = false;
            return false
        }
    })

    return sucesso;
}

$('body').on('keyup', '.input-erro', function() {
    $(this).removeClass('input-erro').tooltip('dispose')
})

// Manipulação do campo #cpf_cnpj afim de validar os dados e mascará-los
$(`.validar-cpf-cnpj`).on("keyup focus", function() {

    var valor = $(this).unmask().val();

    if(valor.length == 11) {

        if(verificarIguais(valor, "cpf")) {

            if(valor == validarCpf(valor)) limparErroInput(this)
            else erroNoInput(this, `CPF inválido`)

        } else erroNoInput(this, `CPF inválido`)

    } else if(valor.length == 14) {

        if(verificarIguais(valor, "cnpj")) {

            if(valor == validarCnpj(valor)) limparErroInput(this)
            else erroNoInput(this, `CNPJ inválido`)

        } else erroNoInput(this, `CNPJ inválido`)

    }

    else if(valor.length == 0) limparErroInput(this)

    else erroNoInput(this, `${valor.length < 14 ? 'CPF' : 'CNPJ'} inválido`)
});

// Aqui se mascara o CPF ou CNPJ assim que o campo é clicado fora
$(`.validar-cpf-cnpj`).on("blur", function(){
    try {
        $(this).unmask();
    } catch (e) {}

    var tamanho = $(this).val().length;

    if(tamanho == 11) $(this).unmask().mask("999.999.999-99");

    else if(tamanho == 14) $(this).unmask().mask("99.999.999/9999-99");

    else erroNoInput(this, `${tamanho == 11 ? 'CPF' : 'CNPJ'} inválido`)
});

if(typeof $.fn.maskMoney == "function") {
    var opcs_maskMoney = {allowNegative: false, thousands:'.', decimal:',', affixesStay: false};
    $("."+$inputs.somente_numero+":not(.per,.not-blur)").addClass('masked').maskMoney(opcs_maskMoney);
}

$('body').on('keypress','.'+$inputs.somente_numero, function(e){
    var ponto = false, virgula = false, per_cent = false, decs = 3, negativo = false,
        opcoes = $(this).attr($roles.data_option);
    if($(this).hasClass('masked') && !$(this).hasClass('per') && !$(this).hasClass('maskarado')) {
        $(this).addClass('maskarado').maskMoney(opcs_maskMoney);
    }

    try {
        opcoes = eval('(' + opcoes + ')'); // Para transformar uma string em sintaxe JavaScript (aqui converte em objeto)
        ponto = opcoes.ponto != undefined && opcoes.ponto != null ? opcoes.ponto : ponto;
        virgula = opcoes.virgula != undefined && opcoes.virgula != null ? opcoes.virgula : virgula;
        per_cent = opcoes.per_cent != undefined && opcoes.per_cent != null ? opcoes.per_cent : per_cent;
        decs = opcoes.decs != undefined && opcoes.decs != null ? opcoes.decs : decs;
        negativo = opcoes.negativo != undefined && opcoes.negativo != null ? opcoes.negativo : negativo;

        return permitirSomenteNumeroNoCampo(this, e, ponto, virgula, per_cent, decs, negativo);

    } catch(err) {
        console.log("Tipo de configuração inválida para um campo somente números", err)
    }

});

window.executarFuncaoPorNome = function(functionName, context) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++)
    {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}

function verificarConexao(function_execute, args_function) {
    function_execute = function_execute == undefined ? false : function_execute;
    args_function = args_function == undefined ? false : args_function;

    console.log("Função que tentou a conexão: "+function_execute);
    //console.log(args_function);

    $.ajax({
        url: dados_con.url,
        type: dados_con.type,
        dataType: dados_con.dataType,
        cache: false,
        success: function(okay) {
            $($modais.modal_search_con.class).modal("close");

            if(function_execute != false) {
                var use_args = (args_function != false) ? args_function : '';
                executarFuncaoPorNome(function_execute, window, use_args);
            }

            clearTimeout();
        },
        error: function(erro)
        {
            var t = setTimeout(function(){ verificarConexao(function_execute, args_function) }, 2000);
        }
    });
}

window.buscarConexao = function(function_execute, args_function) {
    function_execute = function_execute == undefined ? false : function_execute;
    args_function = args_function == undefined ? false : args_function;

    var modal_content = '<div style="text-align:center;margin-top: 3rem;" class="load_search_con">'+
        '<div class="preloader-wrapper active">'+
        '<div class="spinner-layer spinner-blue-only">'+
        '<div class="circle-clipper left">'+
        '<div class="circle"></div>'+
        '</div><div class="gap-patch">'+
        '<div class="circle"></div>'+
        '</div><div class="circle-clipper right">'+
        '<div class="circle"></div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '<br>Aguardando Conexão de Rede<br>'+
        '</div>';
    criarModal({
        classModal: $modais.modal_search_con.n,
        title: "",
        conteudo: modal_content,
        use_btn: false,
        Criou: function(e) {
            $($modais.modal_search_con.class).modal("show");
        }
    });

    verificarConexao(function_execute, args_function);
}

window.erroAjax = function(xhr, function_execute, args_function,reconectar) {
    reconectar = retornoVar(reconectar, undefined, false);

    function_execute = function_execute == undefined ? false : function_execute;
    args_function = args_function == undefined ? false : args_function;
    var erro;

    if(xhr == 0) {
        erro = "Sem conexão com a rede";
        if(reconectar) {
            //buscarConexao(function_execute, args_function);
        }
    } else if(xhr == 404) {
        erro = "Página não encontrada";
    } else if(xhr == 500) {
        erro = "Erro interno no servidor";
    } else if(xhr == 401) {
        erro = "Acesso não autorizado";
    } else {
        erro = "";
    }

    return erro;
}

window.erroAjaxFormulario = function(opcs) {
    var jxhr = retornoVar(opcs, 'jxhr', undefined, false),
        code = retornoVar(opcs, 'code', undefined, false),
        function_execute = retornoVar(opcs, 'function_execute', undefined, false),
        args_function = retornoVar(opcs, 'args_function', undefined, false),
        NuncaFechar = retornoVar(opcs, 'NuncaFechar', undefined, false),
        NaoReconectar = retornoVar(opcs, 'NaoReconectar', undefined, false),
        campo_not_found = retornoVar(opcs, 'Campo404', undefined, false);

    function_execute = function_execute == undefined ? false : function_execute;
    args_function = args_function == undefined ? false : args_function;

    var status_ajax = erroAjax(jxhr.status, function_execute, args_function);
    
    if(jxhr.status != 0) {
        var msg_mostrar;

        try {
            msg_mostrar = $.parseJSON( jxhr.responseText ).data_msg;
        } catch(err) {
            msg_mostrar = jxhr.responseText;
        }

        var complemetar =  status_ajax.length != 0 ? ' - '+status_ajax+" - "+code : '',
            e_erro = jxhr.status != 404 ? true : 'warning';

        mostrarMensagemErroSucessoAlerta(msg_mostrar,campo_not_found,e_erro,false,{NuncaFechar: NuncaFechar});
    }

    var element_erro = $(".xdebug-error"), erro_tabela = $(".erro_tabela");

    if(element_erro.length != 0) {
        var con = 1;
        element_erro.find("tbody").children("tr").each(function(e){
            if(con != 1) {
                $(this).remove();
            } else {
                $(this).addClass("erro_tabela");
            }
            con++;
        });

        erro_tabela.children("th").css({'background':'transparent','color':'#fff'});
        erro_tabela.children("th").children("span").remove();
    }
}

window.padronizarRetornoDaRequisicao = function(data) {
    var status = [], data_msg = [], codStatus = [], outro = [], api = $api.retorno;
    for(dados in data) {
        if(dados == api.status) {
            status.push(data[api.status]);
        } else if(dados == api.data) {
            data_msg.push(data[api.data]);
        } else if(dados == api.cod) {
            codStatus.push(data[api.cod]);
        } else {
            outro.push(data[dados])
        }
    }

    var add_outros = outro.length > 0 ? ','+JSON.stringify(outro) : '';
    var final = '{"status": '+JSON.stringify(status[0])+', "data_msg": '+JSON.stringify(data_msg[0])+', "codStatus": '+JSON.stringify(codStatus[0])+' '+add_outros+'}';
    
    return $.parseJSON( final );
}

window.habilitarSubmit = function(elemento,habilitar) {
    habilitar = habilitar == undefined ? true : habilitar;

    if(elemento != undefined) {
        elemento.find('button[type="submit"]').prop('disabled', habilitar);
    }
}

window.chamadaAjax = function (call) {
    //var regex = /\{(?:[^{}]|(R))*\}/g; // para recuperar jsons com erros
    if(call.data != undefined) {
        var showErroAjaxForm = retornoVar(call,'MsgErro',undefined, true),
            url_enviar = call.urlLiteral != true ? dados_con.url+call.url : call.url,
            usar_load =   retornoVar(call,'UsarLoad',undefined, false),
            usar_load_msg = retornoVar(call,'LoadMsg',undefined, false),
            reconectar =  retornoVar(call, 'reconectar', undefined, false),
            abrir_link =  retornoVar(call, 'AbrirLink', undefined, false)
        campo_not_found = retornoVar(call, 'CampoFocar404', undefined, false);

        usar_load = usar_load_msg != false ? false : usar_load;
        usar_load_msg = usar_load ? false : usar_load_msg;

        if(usar_load) {
            var load_a = call.load_a == undefined ? Load() : call.load_a;
        }

        if(usar_load_msg != false) {
            var msg = typeof usar_load_msg == "string" ? usar_load_msg : 'Carregando';
            var load_b = call.load_b == undefined ? Load( msg ) : call.load_b;
        }

        if(call.getCsrf == undefined) {
            //var csrf_session = getStorageCsrf();
            var time_atual = (new Date()).getTime();

            if(time_atual <= auth.expira) {
                //var data_storage_csrf = $.parseJSON( csrf_session );

                if(typeof call.data === 'object') {
                    if(!(call.data instanceof FormData)) {
                        call.data.csrf_name = auth.csrf_name;
                        call.data.csrf_value = auth.csrf_value;
                        call.data.access_token = auth.token;
                        call.data.key = $api.chave_api;
                    } else {
                        call.data.append('csrf_name', auth.csrf_name);
                        call.data.append('csrf_value', auth.csrf_value);
                        call.data.append('access_token', auth.token);
                        call.data.append('key', $api.chave_api);
                    }
                } else {
                    call.data = call.data + '&key=' + $api.chave_api + '&access_token=' + auth.token+'&csrf_name='+auth.csrf_name+'&csrf_value='+auth.csrf_value;
                }
            } else {
                setTimeout(function(){
                    call.load_a = load_a;
                    call.load_b = load_b;
                    recuperarTokensCsrf(chamadaAjax, call)
                }, 600);
                return false;
            }
        }
        
        var data_enviar = call.data,
            NuncaFecharErro = call.NuncaFecharErro == undefined ? false : call.NuncaFecharErro,
            HabilitarBotao = call.HabilitarBotao != undefined ? call.HabilitarBotao : false,
            timeout = call.timeout == undefined ? 15000 : parseInt( call.timeout ),
            cache = call.cache == undefined ? true : call.cache,
            contentType = call.contentType == undefined ? 'application/x-www-form-urlencoded; charset=UTF-8' : call.contentType,
            processData = call.processData == undefined ? true : call.processData,
            dataType = retornoVar(call, 'dataType', undefined, dados_con.dataType);

        if(HabilitarBotao != false) habilitarSubmit(HabilitarBotao, false);
        
        if(abrir_link == false) {
            return $.ajax({
                xhr: function() {
                    var xhr = new window.XMLHttpRequest(),
                        load_bar = $($divs.load_bar.class);
                    //Upload progress
                    xhr.upload.addEventListener("progress", function(evt){
                        
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total;
                            //Do something with upload progress
                            var percent = percentComplete * 100;
                            load_bar.animate({width: percent+"%"},200);
                            //console.log("up", percentComplete);
                        }
                    }, false);
                    //Download progress
                    xhr.addEventListener("progress", function(evt){
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total;
                            //Do something with download progress
                            load_bar.animate({opacity: 0},300,function(){ $(this).hide(); });
                            //console.log("down", percentComplete);
                        }  else {
                            // the way jsFiddle's ajax echo service works the length
                            // is not computable, so just adding this here:
                            load_bar.animate({opacity: 0},300,function(){ $(this).hide(); });
                            //console.log("down", evt.loaded / 600000);
                        }
                    }, false);

                    return xhr;
                },
                url: url_enviar,
                type: call.type,
                dataType: dataType,
                cache: false,
                data: call.data,
                timeout: timeout, //15 segundos timeout
                cache: cache,
                contentType:  contentType,
                processData:  processData,
                success: function(data) {
                    var data_tratada = call.Literal ? data : padronizarRetornoDaRequisicao(data);
                    if(typeof call.success == "function") {
                        call.success(data_tratada);
                    }
                },
                error: function(xhr, code) {
                    $('[type="submit"]').prop('disabled', false);
                    var dados = xhr.responseJSON;
                    if(typeof dados != "undefined") {
                        if(dados.codStatus == '143') {
                            console.log('oiii')
                            call.load_a = load_a;
                            call.load_b = load_b;

                            recuperarTokensCsrf(chamadaAjax, call)
                            return false;
                        }
                    }

                    if(showErroAjaxForm) {

                        if( !(xhr.status == 404 && call.erro404 == false) ) {
                            var opcs = {jxhr: xhr, code: code,
                                function_execute: "chamadaAjax", args_function: call,
                                NuncaFechar: NuncaFecharErro, NaoReconectar: reconectar,
                                Campo404: campo_not_found}
                            erroAjaxFormulario(opcs);
                        }
                    }

                    if(typeof call.error == "function") {
                        call.error(xhr, code);
                    }
                },
                complete: function(xhr) {
                    if(HabilitarBotao != false) habilitarSubmit(HabilitarBotao, false);

                    load_a = call.load_a == undefined ? load_a : call.load_a;
                    load_b = call.load_b == undefined ? load_b : call.load_b;

                    if(typeof load_a != "undefined") {
                        //console.log(load_a);
                        load_a.RemoverLoad();
                    } else if(typeof load_b != "undefined") {
                        //console.log(load_b);
                        load_b.RemoverLoad();
                    }

                    if(typeof call.complete == "function") {
                        call.complete(xhr);
                    }
                }
            }).fail(function(jqXHR, textStatus){
                if(HabilitarBotao != false) habilitarSubmit(HabilitarBotao, false);

                if(textStatus === 'timeout') {
                    mostrarMensagemErroSucessoAlerta("Erro de timeout, por favor tente novamente!",false,true,false,{NuncaFechar: NuncaFecharErro});
                }
            });
        } else {
            var url_abrir = url_enviar+'?'+$.param(call.data);
            var abrir = window.open(url_abrir, '_blank');

            if(!abrir) {
                var link = 'https://support.google.com/chrome/answer/95472?co=GENIE.Platform%3DDesktop&hl=pt-BR';

                // Opera 8.0+
                var opera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
                    // Firefox 1.0+
                    firefox = typeof InstallTrigger !== 'undefined',
                    // At least Safari 3+: "[object HTMLElementConstructor]"
                    safari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
                    // Internet Explorer 6-11
                    ie = /*@cc_on!@*/false || !!document.documentMode,
                    // Edge 20+
                    iedge = !ie && !!window.StyleMedia,
                    // Chrome 1+
                    chrome = !!window.chrome && !!window.chrome.webstore;

                if(firefox) {
                    link = 'https://support.mozilla.org/pt-BR/kb/bloqueador-de-pop-up-excecoes-e-solucoes-de-problemas';
                } else if(opera) {
                    link = 'https://forums.opera.com/topic/12828/abrir-janelas-popups-sempre-em-nova-guia/3';
                } else if(safari) {
                    link = 'https://duvidas.terra.com.br/duvidas/3573/como-ativo-ou-desativo-o-bloqueador-de-pop-ups-no-safari'
                } else if(ie) {
                    link = 'https://answers.microsoft.com/pt-br/ie/forum/ie9-windows_7/como-fa%C3%A7o-para-desbloquear-o-popup/d3cf93b5-9948-43a2-9968-ece96583ad1d';
                } else if(iedge) {
                    link = 'https://answers.microsoft.com/pt-br/edge/forum/edge_other-edge_win10/desbloqueio-de-pop-ups/f24253eb-b0cc-4774-9e4a-3adc63c56807';
                }

                mostrarMensagemErroSucessoAlerta('É preciso habilitar a abertura de pop-ups no browser <a href="'+link+'" targe="_blank">Ajuda</a>');
            }

        }
    } else {
        alert('Os dados passados não são um objeto');
    }

}

window.recuperarTokensCsrf = function(recall, args) {
    chamadaAjax({
        url: '/token?key=' + $api.chave_api,
        data: {},
        type: 'POST',
        Literal: true,
        getCsrf: true,
        LoadMsg: 'Recuperando token...',
        success: function(data)
        {
            /*var data_salvar = { 'name': data.csrf_name, 'value': data.csrf_value, 'access': data.access_token };
            sessionStorage.setItem($sessions.dados_csrf ,JSON.stringify( data_salvar ) );*/

            auth.token = data.access_token;
            auth.csrf_name = data.csrf_name;
            auth.csrf_value = data.csrf_value;
            auth.expira = data.expira_token * 1000;

            recall(args)
        },
        complete: function(xhr)
        {
            //console.log(xhr);
        }
    })
}

var getStorageCsrf = function() {
    return sessionStorage.getItem($sessions.dados_csrf);
}

var classEsc = 'escada';

$(document).keydown(function(e) {
    var keyPress = 'which' in e ? e.which : e.keyCode;
    if(keyPress == $keys.esc.key) {
        $('body').addClass(classEsc);
        if($('.modal').is(':visible')) {
            var modal = $('.modal:visible');
            if(modal.hasClass($ClassesAvulsas.sem_principal) && modal.attr('data-keyboard') != 'false') {
                modal.modal('hide');
            }
        }
    }

    const divAutocompleteResultados = $(".ui-menu.ui-widget.ui-widget-content.ui-autocomplete.ui-front:visible");

    if(divAutocompleteResultados.length != 0) {
        const itemAtivo = divAutocompleteResultados.find('.ui-menu-item-wrapper.ui-state-active')

        let scroll = (itemAtivo.offset() == undefined ? 0 : itemAtivo.offset().top) - itemAtivo.outerHeight() - 6;

        scroll = (divAutocompleteResultados.outerHeight() < scroll) ? (scroll - divAutocompleteResultados.outerHeight()): 0;

       if(keyPress == $keys.d1.key || keyPress == $keys.d2.key) divAutocompleteResultados.scrollTop(scroll)
    }

}).click(function(e) {
    var alvo = e.target, //e.target
        modal = $('.modal:visible'),
        comparar = alvo == modal[0] || modal.find(alvo).length != 0 ||
            alvo == $('.ui-autocomplete')[0] || $('.ui-autocomplete').find(alvo) ||
            alvo == $('.ui-widget')[0] || $('.ui-widget').find(alvo);

    if( !(comparar) ) {
        if(modal.hasClass($ClassesAvulsas.sem_principal) && modal.attr('data-backdrop') != 'static') {
            modal.modal('hide');
        }
    }
})

function retornoUndefined(variavel, retorno_em_undefined) {
    if(typeof variavel == "undefined") {
        return retorno_em_undefined;
    }

    return variavel;
}

window.criarModal = function(dialog)
{
    /*
     dialog.classModal // classe do modal
     dialog.title // Titulo do modal
     dialog.conteudo // conteudo do modal
     dialog.btns [] // Botoes do modal
     dialogs.use_btn // caso não queira usar botões
     dialog.role_add [[], [], ...] // Para adicionar atributos adicionais nos botões
     dialog.classes_btn[[],[], ...] // Para adicionar classes adicionais nos botões
     dialog.classes_content // Classes para o modal-content
     dialog.classes_header // Classes para o modal-header
     dialog.classes_body // Classes para o modal-body
     dialog.classes_footer // Classes para o modal-footer
     dialog.enterFocus // Pressionar enter dará foco aos botões // 1 -> no input também foca no botão, 2 -> no input acontece outra coisa
     dialog.EscNaoFecha // Caso true, ao pressionar esc o modal não será fechado
     dialog.FocusBtn // Qual será o botão a ser focado via nth-child, portanto usando valores de array, onde o inicio é 1
     dialog.focusAuto // Se o foco será assim que entrar no modal -> default: true
     dialog.AfterPressed // Retorno ao pressionar teclas -> false or true
     dialog.btn_close // Numero do elemento dentro do array que fechará o modal
     dialog.botoesRodapeNaoFecham // Clicar nos botões do ropadé não fecham o modal
     dialog.stopPropagation // Se ativará o stopPropagation
     dialog.isLarge // Se o modal irá preencher toda a tela
     dialog.FixedFooter // Se o modal terá o footer fixo
     dialog.keyPressInput // KeyPress no input
     dialog.InputLeft [] // Numero em array dos elementos que ficarão a esquerda
     dialog.callBackPressInput // Callback KeyPress no input
     dialog.callBackPress // Callback KeyPress
     dialog.FecharOverlay // Fechar ao clicar fora
     dialog.Starttop // Modal no topo -> 1 // total, 2 -> no meio, 3 -> em cima, 4 -> um pouco mais do meio para baixo
     dialog.is_table // Se contém uma tabela e ela é scrollable (usa as keys para percorerr)
     dialog.clickBtn // callback de clique
     dialog.Open // callback de abertura do modal
     dialog.Close // Callback de fechamento do modal
     dialog.Criou // Callback após criar o modal
     dialog.ErroCriar // Callback de erro ao criar modal
     dialog.criacaoCompleta // Quando todo o modal foi criado
     dialog.usarFade // Usar efeito fade (bootstrap)
     dialog.ModalCentralizado // Modal centralizado (bootstrap)
     dialog.usarClick // Desabilita o click nos botões
     dialog.BtnAbrirModalAuto // Desabilita a abertura automática do modal ao clicar no botão setado para abrir o mesmo
     dialog.BtnAbrirModal // Botão(ões) que abrirá(ão) o modal
     dialog.CallbackBtnAbrir // Callback do clique no botão de abrir o modal
     dialog.closeCancelar // Callback de cancelamento ao fechar
     dialog.notClose // O Modal nunca será fechado
     dialog.UsarDivPrincipal // Se vai usar a div que toma a tela inteira
     */
    var modal = '';
    this.btns = (dialog.btns != undefined) ? dialog.btns : [''];
    this.Starttop = (dialog.Starttop != undefined) ? dialog.Starttop : "35%";
    this.FecharOverlay = (dialog.FecharOverlay != undefined) ? dialog.FecharOverlay : false;
    this.btn_close = (dialog.btn_close != undefined) ? dialog.btn_close : -1; // 0 -> para sempre que não houver definição, o primeiro botão será o de fechamento
    var enterFocus = (dialog.enterFocus != undefined) ? dialog.enterFocus : 1;
    var ReturnPressed = (dialog.AfterPressed != undefined) ? dialog.AfterPressed : true;
    var large = (dialog.isLarge != undefined && dialog.isLarge == true) ? 'modal-lg' : '' ;
    var fixedFooter = (dialog.FixedFooter != undefined && dialog.FixedFooter == true) ? 'modal-fixed-footer' : '';
    var focusAuto = (dialog.focusAuto != undefined) ? dialog.focusAuto : true;
    var UsarBotoes = (dialog.use_btn != undefined) ? dialog.use_btn : true;
    var FecharComEsc = (dialog.EscNaoFecha != undefined) ? dialog.EscNaoFecha : false;
    var ClasseLiberarEsc = FecharComEsc ? $ClassesAvulsas.EscFhecara : "",
        BtnAbrirModalAuto = dialog.BtnAbrirModalAuto == undefined ? true : dialog.BtnAbrirModalAuto,
        botoesRodapeNaoFecham = dialog.botoesRodapeNaoFecham == undefined ? false : dialog.botoesRodapeNaoFecham,
        not_close = dialog.notClose != undefined ? dialog.notClose : false;
    usar_Criou = false,
        usar_ErroCriar = false,
        usar_Open = false,
        usar_Close = false,
        usar_Click= false,
        usar_CallInput = false,
        usar_CallPress = false,
        desfocarInput = false,
        classes_content = retornoUndefined(dialog.classes_content, ''),
        classes_header = retornoUndefined(dialog.classes_header, ''),
        classes_body = retornoUndefined(dialog.classes_body, ''),
        classes_footer = retornoUndefined(dialog.classes_footer, ''),
        UsarDivPrincipal = retornoUndefined(dialog.UsarDivPrincipal, true);

    FecharComEsc = not_close ? not_close : FecharComEsc;

    if(typeof dialog.Criou !== "undefined") {
        usar_Criou = true;
    }

    if(typeof dialog.desfocarInput !== "undefined") {
        desfocarInput = dialog.desfocarInput;
    }

    if(typeof dialog.ErroCriar !== "undefined") {
        usar_ErroCriar = true;
    }

    if(typeof dialog.Open !== "undefined") {
        usar_Open = true;
    }

    if(typeof dialog.Close !== "undefined") {
        usar_Close = true;
    }

    if(typeof dialog.clickBtn !== "undefined") {
        usar_Click = true;
    }

    if(typeof dialog.callBackPressInput !== "undefined") {
        usar_CallInput = true;
    }

    if(typeof dialog.callBackPress !== "undefined") {
        usar_CallPress = true;
    }

    var botoes = '';
    if(UsarBotoes) {
        var classe_especial = 'botao_modal_'+Math.floor(Date.now() / 1000) * Math.ceil(Math.random() * (10 + 1) );
        
        for(var i = 0; i < this.btns.length; i++) {
            var role_add = '', left = 'btn-modal-right', classes_adicionais = '';
            if(dialog.InputLeft != undefined) {
                //console.log(i+' -- '+dialog.InputLeft[i]);
                //btn-modal-left, btn-modal-right
                left = $.inArray(i , dialog.InputLeft) !== -1 ? 'btn-modal-left' : 'btn-modal-right';
            }
            //console.log('LEFT: '+left);
            if(dialog.role_add != undefined) {
                if(dialog.role_add[i] != undefined) {
                    for (var n = 0; n < dialog.role_add[i].length; n++) {
                        role_add += dialog.role_add[i][n];
                        role_add += ' ';
                    }
                }
            }

            if(dialog.classes_btn != undefined) {
                if(dialog.classes_btn[i] != undefined) {
                    for (var n = 0; n < dialog.classes_btn[i].length; n++) {
                        classes_adicionais += dialog.classes_btn[i][n];
                        classes_adicionais += ' ';
                    }
                }
            }
            var close_modal = (i == this.btn_close) ? 'btn-default' : '', // close
                close_modal_attr = (i == this.btn_close) ? 'data-dismiss="modal" aria-label="Close"' : '';
            botoes += '<button href="#!" class="'+left+' '+classe_especial+' btn '+close_modal+' '+$botao.btn_action_modal.n+' '+classes_adicionais+'" '+close_modal_attr+' '+$roles.role_id_seq+'="'+(i + 1)+'" '+role_add+'>'+this.btns[i]+'</button>';
        }
    }

    var fechar_fora = this.FecharOverlay ? 'data-backdrop="static"' : '',
        esc_fecha = FecharComEsc ? 'data-keyboard="false"' : '',
        not_close = not_close ? 'data-backdrop="static"' : '';
    usarFade = dialog.usarFade == false ? '' : 'fade',
        centro = dialog.ModalCentralizado == true ? 'modal-center' : '',
        class_div_principal = 'modal '+centro+' '+usarFade+' '+dialog.classModal+'';
    conteudo_div_principal = 'id="'+dialog.classModal+'" '+not_close+' '+fechar_fora+' '+esc_fecha+'  tabindex="-1" role="dialog"',
        div_principal = '<div '+conteudo_div_principal+' class="'+class_div_principal+'">',
        classear_secundaria = '',
        usar_conteudo_principal = '';

    if(UsarDivPrincipal != true) {
        div_principal = '';
        classear_secundaria = class_div_principal+' '+$ClassesAvulsas.sem_principal;
        usar_conteudo_principal = conteudo_div_principal;
        //dialog.stopPropagation = true;
    }
    //UsarDivPrincipal

    modal += div_principal;
    modal +=   '<div '+usar_conteudo_principal+' class="modal-dialog '+large+' '+classear_secundaria+'" role="document">';
    modal +=      '<div class="modal-content '+classes_content+'">'
    modal +=          '<div class="modal-header '+classes_header+'">';
    modal +=              '<span class="modal-title">'+dialog.title+'</span>';
    modal +=              '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'+
        '<span aria-hidden="true">×</span>'+
        '</button>';
    modal +=           '</div>';
    modal +=          '<div class="modal-body '+classes_body+'">';
    modal +=            dialog.conteudo;
    modal +=          '</div>';
    modal +=        '<div class="modal-footer no-display '+classes_footer+' '+fixedFooter+'">';
    modal +=          botoes;
    modal +=      '</div>';

    modal +=   '</div> ';
    modal +=  '</div> ';
    if(div_principal.length > 0) {
        modal +='</div> ';
    }

    var class_modal = "."+dialog.classModal;

    if($(class_modal).length == 0) {
        $("body").append(modal);

    } else {
        if(usar_ErroCriar) {
            dialog.ErroCriar("Não foi criado o modal pois o mesmo já existe");
        }

        if(typeof dialog.criacaoCompleta == "function") {
            dialog.criacaoCompleta($(class_modal));
        }
    }

    if(UsarDivPrincipal != true && centro.length > 0) {
        setTimeout(function(){
            var top = ($(window).innerHeight() / 2) - ($(class_modal).innerHeight() / 2);
            $(class_modal).css({'margin-top': top+'px'});
        }, 600)
    }

    if(not_close) {
        $(class_modal).find('.close').remove();
    }

    if(usar_Criou) {
        dialog.Criou(true);
    }

    if(typeof dialog.criacaoCompleta == "function") {
        dialog.criacaoCompleta($(class_modal));
    }

    var usarClick = dialog.usarClick == undefined ? true : dialog.usarClick;
    if(usarClick) {

        $(class_modal).off('click');

        $(class_modal).on('click', function(e) {
            if(dialog.stopPropagation != undefined)
            {
                e.stopPropagation();
            }
        });

        $('body').off('click',class_modal+' .'+classe_especial);
        $('body').on('click',class_modal+' .'+classe_especial,function() {

            var id_seq = $(this).attr($roles.role_id_seq);
            var notClose = $(class_modal).attr('data-backdrop') == "static" && $(class_modal).attr('data-keyboard') == "false";
            if( ((parseInt(id_seq) - 1) == btn_close ) && !notClose && !botoesRodapeNaoFecham) {
                $(class_modal).modal('hide');
            }
            
            if(typeof dialog.clickBtn != "undefined") {
                dialog.clickBtn($(this),parseInt(id_seq), $(class_modal));
            }
        });
        $('body').off("click", class_modal+" .close");
        $('body').on("click",class_modal+" .close", function(){
            $(class_modal).modal('hide');
            if(typeof dialog.closeCancelar == "function") {
                dialog.closeCancelar(1,$(this),$(class_modal));
            }
        });

        // Abrir modal com botões selecionados
        if(typeof dialog.BtnAbrirModal != "undefined") {
            var abrir_modal = dialog.BtnAbrirModal.toString();
            $('body').off('click', abrir_modal);
            $('body').on('click', abrir_modal, function(){
                if(typeof dialog.CallbackBtnAbrir != "undefined") {
                    if(BtnAbrirModalAuto) {
                        $(class_modal).modal('show');
                    }
                    dialog.CallbackBtnAbrir(this, $(class_modal));
                }
            });
        }
    }

    $(class_modal).attr($roles.enterFocus, enterFocus);

    $(class_modal).find('input').each(function(i){
        $(this).attr($roles.pressedInput_id,(i + 1) );
        $(this).attr($roles.pressedInput,"pressed_input");
    })

    $(class_modal).attr($roles.ReturnPressed, ReturnPressed);

    if($(dialog.keyPressInput != undefined)) {
        $(class_modal).find(dialog.keyPressInput).attr($roles.pressedInput,"pressed_input");
    }

    if(dialog.FocusBtn != undefined) {
        $(class_modal).attr($roles.FocusBtn, dialog.FocusBtn);
    }

    $(class_modal).off("pressInput");
    $(class_modal).off("press");

    $(class_modal).off("pressInput");
    $(class_modal).on("pressInput",function( event, press ) {
        if(usar_CallInput) {
            dialog.callBackPressInput(press);
        }
    });

    $(class_modal).off("press");
    $(class_modal).on("press",function( event, press ) {
        if(usar_CallPress) {
            dialog.callBackPress(press);
        }
    });

    $(class_modal).off('show.bs.modal');
    $(class_modal).on('show.bs.modal', function(e) {

        $(class_modal).show().focus();
        var elemento_ativo = $(document.activeElement);

        if(getTagName(elemento_ativo) != 'input' || desfocarInput) {
            if(focusAuto) {
                $(document.activeElement).blur();
                setTimeout(function(){ $(class_modal).find($botao.btn_action_modal.class+':nth-child('+enterFocus+')').focus() }, 600);
            }
        }

        if(usar_Open && typeof dialog.Open == "function") {
            dialog.Open('modal aberto');
        }
    });

    $(class_modal).off('hidden.bs.modal');
    $(class_modal).on('hidden.bs.modal', function (e) {
        $(class_modal).hide();
        if($('body').hasClass(classEsc) && typeof dialog.closeCancelar == "function") {
            dialog.closeCancelar(2,$(class_modal));
        }

        if(/*usar_Close &&*/ typeof dialog.Close == "function") {
            dialog.Close('modal fechado', $(class_modal));
        }

        $('body').removeClass(classEsc);
    });

    dialog.abrirModal = function(){
        $(class_modal).modal('show');
    };

    dialog.fecharModal = function(){
        $(class_modal).modal('hide');
    };

    dialog.alterarTitulo = function(titulo) {
        titulo = titulo == undefined ? dialog.title : titulo;
        $(class_modal).find('.modal-title').html(titulo);
    };

    dialog.bloquearBotao = function(get, desabilitar) {
        desabilitar = desabilitar == undefined ? true : desabilitar;
        if(get != undefined) {
            $(class_modal).find('.btn-action-modal:nth-child('+get+')').prop('disabled', desabilitar)
        }
    };

    dialog.bloquearTodosBotoes = function(desbloquear) {
        desbloquear = desbloquear == undefined ? true : desbloquear;
        $(class_modal).find('.btn-action-modal').prop('disabled', desbloquear)
    };

    dialog.setConteudo = function(content) {
        $(class_modal).find('.modal-body').html(content);
    };

    dialog.evitarFechamento = function() {
        $(class_modal).modal({
            backdrop: 'static',
            keyboard: false,
            show: true,
        })
            .attr('data-backdrop','static')
            .attr('data-keyboard','false')
            .find('.close').hide();
        criarModal(dialog);
    }

    dialog.liberarFechamento = function() {
        $(class_modal).modal({
            backdrop: true,
            keyboard: true,
            show: true,
        })
            .removeAttr('data-backdrop')
            .removeAttr('data-keyboard')
            .find('.close').show();
        criarModal(dialog);
    }

    dialog.elementoModal = $(class_modal);

    return dialog;

}

$(document).on("keyup", function(e) {
    var keyPress = 'which' in e ? e.which : e.keyCode;
    var class_modal = $(".modal:visible").last(); // .last porque no bootstrap os modais ficam todos visiveis
    var input_pressed = class_modal.find('input['+$roles.pressedInput+'="pressed_input"]');
    var enterFocus = parseInt( class_modal.attr("enterFocus") );
    var ReturnPressed;
    if(class_modal.attr("ReturnPressed") != undefined) {
        ReturnPressed = class_modal.attr("ReturnPressed") == true || class_modal.attr("ReturnPressed").toLowerCase() == "true" ? true : false;
    } else {
        ReturnPressed = false;
    }


    var inputPressed = function() {
        if(input_pressed.length > 0 ) {
            if(input_pressed.is(":focus")) {
                var atual = $(document.activeElement).attr($roles.pressedInput_id);
                var ultimo = input_pressed.last().attr($roles.pressedInput_id);

                if(atual != ultimo) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    var focoBotao = function() {
        var elemento_focado = $(document.activeElement);

        if(!elemento_focado.hasClass($botao.btn_action_modal.n) && keyPress == $keys.enter.key) {
            var btn = class_modal.find($botao.btn_action_modal.class),
                enterfocus = parseInt(class_modal.attr($roles.enterFocus)),
                focus_btn = btn.length - 1;

            if(class_modal.attr("FocusBtn") != undefined) {
                var Focus = parseInt( class_modal.attr("FocusBtn") );
                focus_btn = (Focus - 1 ) > 0 && (Focus - 1 ) <= btn.length - 1 ? Focus - 1 : 0;
            }

            setTimeout(function() {
                if(btn.get(focus_btn) != undefined && enterfocus != 2) {
                    btn.get(focus_btn).focus();
                }
            }, 100);
        } else {
            if(elemento_focado.hasClass($botao.btn_action_modal.n)) {
                if(keyPress == $keys.d3.key) {
                    setTimeout(function(){
                        elemento_focado.prev($botao.btn_action_modal.class).focus(); //.prev -> antes
                    }, 100);
                } else if(keyPress == $keys.d4.key) {
                    setTimeout(function() {
                        elemento_focado.next($botao.btn_action_modal.class).focus(); // .next -> antes
                    }, 100);
                } else if(keyPress == $keys.d2.key) {
                    var inp_focar = class_modal.find('input');
                    if(inp_focar.length > 0) {
                        setTimeout(function() {
                            inp_focar.select();
                        }, 100);

                        setTimeout(function() {
                            inp_focar.focus();
                        }, 150);
                    }
                }
            }
        }

    }

    if(inputPressed()) {
        if(enterFocus == 1) {
            focoBotao();
        }

        class_modal.on("pressInput", [keyPress]);
    } else {
        class_modal.trigger("press", [keyPress])
        focoBotao();
    }

    return ReturnPressed;
});

window.navegacaoEntreInputsEmUmaMesmaDiv = function(div, callback) {
    var inputs = $(div).find('input');
    var qntd_inputs = inputs.length;

    $(div).off('keydown',div);
    $(div).on('keydown',function(e){
        if($(div).length > 0) {
            var keyPress = 'which' in e ? e.which : e.keyCode;
            if(keyPress == $keys.enter.key || keyPress == 9) {
                var elemento_ativo = $(document.activeElement),
                    inputs = $(div).find('input:visible:not(:disabled):not([readonly]),  select:visible, .chosen-search input, textarea:visible').length == 0 ? $(div).find('input[type!="hidden"],input[type!="submit"], select:visible, textarea:visible, .chosen-search input') : $(div).find('input:visible:not(:disabled):not([readonly]),  select:visible, .chosen-search input, textarea:visible'),
                    length_inputs = inputs.length,
                    input_inicial = inputs[0],
                    input_final = inputs[length_inputs - 1];

                var tagElemento = getTagName(elemento_ativo);
                if(tagElemento == "input" || tagElemento == "select" || tagElemento == "textarea") {
                    var posicao_ativo = $.inArray(elemento_ativo[0], inputs);

                    if( (posicao_ativo < (length_inputs - 1) && length_inputs >= 1 && posicao_ativo != -1) || e.shiftKey) {
                        var prox_input = posicao_ativo + 1;

                        if(e.shiftKey) {
                            prox_input = posicao_ativo - 1;
                        }

                        var input_focar = $( inputs[prox_input] );

                        setTimeout(function() {
                            if(input_focar.closest('.chosen-container').length != 0) input_focar.closest('.chosen-container').click().addClass('chosen-container-active').trigger('mousedown');
                            input_focar.focus();
                        }, 250);

                    }

                    var input_focus = typeof input_focar != "undefined" ? input_focar : undefined;
                    if(typeof callback == "function") {
                        callback((posicao_ativo == (length_inputs - 1) && !e.shiftKey), input_focus, elemento_ativo, keyPress ) // Retorna o input focado é o último e o input de foco dele
                    }


                    if(tagElemento == "textarea" && keyPress == $keys.enter.key) return true;
                    return false;
                }
            }
        }
    });


}

window.executarFuncoesViaAtributos = function(executar) {
    var regex = /\(([^)]+)\)/;
    var matches = regex.exec(executar),
        nome_funcao = '';
    if(matches != null) {
        nome_funcao = executar.replace(matches[0],"").replace(" ","");
        var argumentos = matches[1].split(',');
        argumentos = argumentos.reverse();
        argumentos.push(window);
        argumentos.push(nome_funcao);
        argumentos = argumentos.reverse();

        executarFuncaoPorNome.apply(this, argumentos);
    } else {
        nome_funcao = executar.replace("()", "").replace(" ","");
        executarFuncaoPorNome(nome_funcao, window);
    }
}

window.getArrayAtributos = function(elementos) {
    try {
        var regex = /\[(.*)\]/,
            matches = regex.exec(elementos),
            matches2 = matches[1].split(";"),
            new_arr = [];

        for(var i = 0; i < matches2.length; i++) {
            var m1 = regex.exec(matches2[i])[1].split(',');
            new_arr.push(m1);
        }


        for(var n = 0; n < new_arr.length; n++) {

            for(var f = 0; f < new_arr[n].length; f++) {
                var valor = new_arr[n][f].replace(/["']/g, "").replace(" ","");
                new_arr[n][f] = valor;
            }

        }

        return new_arr;

    } catch(err) {
        console.log(err);
        return null;
    }

}

window.dadosFormularioParaJson = function (dados_array) {
    var unindexed_array = dados_array,
        indexed_array = {};

    $.map(unindexed_array, function(n, i) {
        var input_array = n['name'].indexOf('[]');
        n['name'] = input_array != -1 ? n['name'].replace('[]','') : n['name'];

        if(indexed_array[n['name']] != undefined && input_array != -1) {

            if(typeof indexed_array[n['name']] != "object") {
                indexed_array[n['name']] = [indexed_array[n['name']]];
            }

            indexed_array[n['name']].push(n['value']);
        } else if(input_array != -1) {
            indexed_array[n['name']] = [n['value']];
        } else {
            indexed_array[n['name']] = n['value'];
        }
    });

    return indexed_array;
}

window.converterObjetoParaFloat = function(objeto, converter) {
    if(typeof objeto != "object") {
        throw new DOMException("Objeto passado não é válido");
    }

    if(typeof converter != "object") {
        throw new DOMException("A conversão só pode ser feita com os elementos passados em um array");
    }

    for(var x in converter) {
        var key = converter[x],
            elemento_converter = objeto[key];

        if(elemento_converter != undefined) {

            if(typeof elemento_converter == "object") {
                objeto[key] = converterObjetoParaFloat(elemento_converter, Object.keys(elemento_converter))
            } else {
                if($.isNumeric(elemento_converter)) {
                    objeto[key] = parseFloat(elemento_converter);
                } else {
                    objeto[key] = valorMonetarioParaFloat(elemento_converter);
                }
            }
        }
    }

    return objeto;
}

window.Percent = function(val1, val2) {
    var verificar = val1 < val2 ? (val2 - val1) : val2,
        per = (verificar * 100) / val1;
    return per

}

if(typeof $.fn.maskMoney == "function") {
    $('body').on('keypress', "."+$inputs.numero_formatado+",."+$inputs.numero_formatado_dinheiro, function(e){
        var verificar_mask = $._data( $(this)[0], "events" ) == undefined ? true : false;
        verificar_mask = verificar_mask == false ? (typeof $._data( $(this)[0], "events" ).mask == "undefined") : verificar_mask
       
       if(verificar_mask) {
            var negativo = $(this).attr($roles.role_negativo) != undefined ? ($(this).attr($roles.role_negativo) == "true") : false,
                opcs = {allowNegative: negativo, thousands:'.', decimal:',', affixesStay: false};

            if($(this).hasClass($inputs.numero_formatado_dinheiro)) {
                opcs.prefix = 'R$ ';
            }

            $(this).css({"text-align":"right"}).maskMoney(opcs);
        }
    });
}

window.limparArray = function(valor,deleteValue) {
    deleteValue = deleteValue == undefined ? '' : deleteValue;
    
    for (var i = 0; i < valor.length; i++) {
        if (valor[i] == deleteValue) {
            valor.splice(i, 1);
            i--;
        }
    }

    return valor;
}

window.escapeHtml = function(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

$('body').on('click','.'+$botao.voltar_sc,function(){
    var local = location.pathname.replace(/_lib\/(.*)/g,''),
        voltar_para = $(this).attr('href'),
        voltar_para_completo = local+voltar_para;

    window.location.href = voltar_para_completo;
})

window.htmlspecialchars_decode = function (string, quoteStyle) { 
    var optTemp = 0
    var i = 0
    var noquotes = false

    if(typeof quoteStyle === 'undefined') {
        quoteStyle = 2
    }

    string = string.toString()
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
    var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
    }

    if(quoteStyle === 0) {
        noquotes = true
    }

    if(typeof quoteStyle !== 'number') {
        // Allow for a single string or an array of string flags
        quoteStyle = [].concat(quoteStyle)
        for(i = 0; i < quoteStyle.length; i++) {
            // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
            if (OPTS[quoteStyle[i]] === 0) {
                noquotes = true
            } else if (OPTS[quoteStyle[i]]) {
                optTemp = optTemp | OPTS[quoteStyle[i]]
            }
        }
        quoteStyle = optTemp
    }

    if(quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
        // PHP doesn't currently escape if more than one 0, but it should:
        string = string.replace(/&#0*39;/g, "'")
        // This would also be useful here, but not a part of PHP:
        // string = string.replace(/&apos;|&#x0*27;/g, "'");
    }

    if(!noquotes) {
        string = string.replace(/&quot;/g, '"')
    }
    // Put this in last place to avoid escape being double-decoded
    string = string.replace(/&amp;/g, '&')

    return string
}

$("body").on('focus', '.'+$inputs.money_qnt+', .'+$inputs.money,function() {
    var valor = $(this).val();
    if(valor.length > 0) {
        valor = valorMonetarioParaFloat(valor);
        valor = ""+valor;
        if(valor.indexOf('.') != -1) {
            valor = valor.replace('.',',');
        }
        $(this).val(valor).select();
    } else {
        $(this).val(0).select();
    }
})
$("body").on('blur', '.'+$inputs.money_qnt+', .'+$inputs.money,function() {
    var valor = $(this).val();
    if(valor.length > 0) {
        valor = ""+valor;
        
        if(valor.indexOf(',') !== -1) {
            valor = valor.replace(',','.');
        }

        var array_val = valor.split('.'),
            qntd_decs = 2;

        if(array_val.length == 2) {
            qntd_decs = array_val[1].length;
        }

        $(this).val( number_format(valor, qntd_decs,',','.') );
    }
})

window.loadPage = function(page,call) {
    var x = Load('Carregando...');
    $.ajax({
        xhr: function() {
            var xhr = new window.XMLHttpRequest(),
                load_bar = $($divs.load_bar.class);
            //Upload progress
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable)
                {
                    var percentComplete = evt.loaded / evt.total;
                    //Do something with upload progress
                    var percent = percentComplete * 100;
                    load_bar.animate({width: percent+"%"},200);
                    //console.log("up", percentComplete);
                }
            }, false);
            //Download progress
            xhr.addEventListener("progress", function(evt){
                if (evt.lengthComputable){
                    var percentComplete = evt.loaded / evt.total;
                    //Do something with download progress
                    load_bar.animate({opacity: 0},300,function(){ $(this).hide(); });
                    //console.log("down", percentComplete);
                } else {
                    // the way jsFiddle's ajax echo service works the length
                    // is not computable, so just adding this here:
                    load_bar.animate({opacity: 0},300,function(){ $(this).hide(); });
                    //console.log("down", evt.loaded / 600000);
                }
            }, false);

            return xhr;
        },
        url: page,
        dataType: 'html',
        success: function(data) {
            $("body").addClass("scale-transition");
            call.success(data);
            $('body').addClass("scale-out");
            setTimeout(function(){$('body').removeClass("scale-out"); },200);
        },
        error: function(xhr, code) {
            erroAjaxFormulario(xhr, code);
            call.error(xhr, code);
        },
        complete: function() {
            x.RemoverLoad();
        }
    });

}
$('body').on('change', '.hasDatepicker', function(e){
    var id_el = $(this).attr('id'),
        name = $(this).attr($roles.role_name) != undefined ? $(this).attr($roles.role_name) : id_el,
        elemento_hidden = $('input[type="hidden"][name="'+name+'"]['+$roles.role_id+'="'+id_el+'"]');

    if(elemento_hidden.length == 0) {
        elemento_hidden = $('<input type="hidden" name="'+name+'" '+$roles.role_id+'="'+id_el+'">').insertAfter( this );

    }

    var valor = $(this).val(),
        formato = $(this).attr($roles.role_format);

    elemento_hidden.val( getDataBR(valor,true) );
})

setTimeout(function() {
    $('.hasDatepicker').trigger('change');
}, 600);

window.DownloadArquivo = function($arquivo,$excluir_apos) {
    var data = {arquivo: $arquivo};
    
    if($excluir_apos) {
        data.excluir_apos = true;
    }

    chamadaAjax({
        AbrirLink: true,
        url: '/arquivo/arquivo/baixar',
        data: data
    })
}

window.buscarVendedorSelect = function(select, texto_var) {
        chamadaAjax({
            url: '/entidade/vendedor/buscar/',
            type: 'GET',
            data: {vendedor: texto_var},
            erro404: false,
            success: function(ok) {
                $.each(ok.data_msg, function(i, dados){
                    var nome = dados.NOME,
                    id = dados.ID,
                    union = id+' - '+ nome,
                    option = '<option '+$roles.role_option_select+'="'+union+'" value="'+id+'">'+union+'</option>';

                    if(select.find('option[value='+id+']').length == 0) {
                        select.append(option).trigger('chosen:updated', [texto_var]);
                    }
                })
            }
        })
} 

window.buscarFuncionarioSelect = function(select, texto_var) {
        chamadaAjax({
            url: '/entidade/BuscarFuncionario/',
            type: 'GET',
            data: {funcionario: texto_var},
            erro404: false,
            success: function(ok) {
                $.each(ok.data_msg.DADOS, function(i, dados){
                    var nome = dados.NOME,
                    id = dados.ID,
                    union = id+' - '+ nome,
                    option = '<option '+$roles.role_option_select+'="'+union+'" value="'+id+'">'+union+'</option>';

                    if(select.find('option[value='+id+']').length == 0) {
                        select.append(option).trigger('chosen:updated', [texto_var]);
                    }
                })
            }
        })
}    
 
window.buscarCfopSelect = function(select, texto_var) {          
        chamadaAjax({
            url: '/produto/produto/get_produto_cfop/',
            type: 'GET',
            data: {cfop: texto_var},
            erro404: false,
            success: function(ok) {
                $.each(ok.data_msg, function(i, dados){
                    var nome = dados.NOME,
                    option = '<option '+$roles.role_mov_estoque+'="'+dados.MOV_ESTOQUE+'" value="'+dados.ID+'" role-option-numero="1" '+$roles.role_option+'="'+nome+'">'+dados.ID+' - '+nome+'</option>';
                    
                    if(select.find('option[value='+dados.ID+']').length == 0) {
                        select.append(option).trigger('chosen:updated', [texto_var]);
                    }
                })
            }
        })
}

/*function ajustarOptionsChosen(elemento) {
    var divChosen = $(elemento).next('.chosen-container.chosen-container-single'),
    textoExibir = $(elemento).attr($roles.role_texto_exibir);
}*/

function atualizarTextoSpanChosen(elemento) {
    const divChosen = $(elemento).next('.chosen-container.chosen-container-single');
    let regex = $(elemento).attr($roles.role_regex_texto_exibir);
    const opcoesRegex = $(elemento).attr($roles.opcoes_regex);

    if(regex != undefined) {
        regex = new RegExp(regex, opcoesRegex)
        const elementoAlterar = divChosen.find('.chosen-single span');
        var textoAlterar = elementoAlterar.text();
        textoAlterar = textoAlterar.replace(regex, '');

        elementoAlterar.text(textoAlterar)
    }
}

//window.AtivarVendedorChosen = function() {
$('body').on('chosen:ready','.'+$ClassesAvulsas.chosen_ativar, function(e) {
    //ajustarOptionsChosen(this);
}).on('chosen:updated','.'+$ClassesAvulsas.chosen_ativar, function(e,pesquisa) {
    if(pesquisa != undefined) {
        $(this).next('.chosen-container.chosen-container-single').find('.chosen-search input').val(pesquisa)
    }
}).on('chosen:no_results','.'+$ClassesAvulsas.chosen_ativar, function(e){
    var input = $(this).next('.chosen-container.chosen-container-single').find('.chosen-search input'),
        texto_var = input.val(),
        select = $(this),
        funcao_exec = select.attr($roles.role_execute);
    if(texto_var.length > 0 && typeof funcao_exec != 'undefined') {
        if(funcao_exec.length == 0) return false;
        executarFuncaoPorNome(funcao_exec, window, select, texto_var)
    }

}).on('chosen:hiding_dropdown esconder_o_dropdown','.'+$ClassesAvulsas.chosen_ativar, function(e) {
    const divChosen = $(this).next('.chosen-container.chosen-container-single');

    if($(this).hasClass('td_input') || $(this).hasClass('ajustar-completo')) {
        var chosen = $(this).next('.chosen-container.chosen-container-single').find('.chosen-drop');
        chosen.hide();
    }

    atualizarTextoSpanChosen(this)

}).on('chosen:showing_dropdown','.'+$ClassesAvulsas.chosen_ativar, function() {

    if($(this).hasClass('td_input') || $(this).hasClass('ajustar-completo')) {
        const isInput = $(this).hasClass('td_input')

        const divChosen = $(this).next('.chosen-container.chosen-container-single');

        const offset = divChosen.offset();
        const height = divChosen.outerHeight();
        const top = offset.top;
        let left = offset.left;
        const chosenDrop = divChosen.find('.chosen-drop');

        var width = parseInt($(window).width()) - left;

        var topUsar = top + height;

        if(!isInput) {

            const modalContent = $(this).closest('.modal-content');
            const chosenFixo = $(this).closest('.chosen-fixo');

            if(modalContent.length > 0) {
                topUsar = top
                const modalContentLeft = modalContent.offset().left
                left -= modalContentLeft
                width = parseInt(modalContent.width()) - left;

            } else if(chosenFixo.length > 0) {
                width = chosenFixo.width();
            }
        }

        chosenDrop.css({top: topUsar + 'px', width: width + 'px', left: left + 'px'}).show();
    }
}).on('change','.'+$ClassesAvulsas.chosen_ativar, function() {
    atualizarTextoSpanChosen(this,'change')
}).on('chosen:updated', function() {
    atualizarTextoSpanChosen(this, 'updated')
});
//}

window.confirmar = function(conteudo, callback, matriz,btn_foco, foco_botao_inicial, foco_input_inicio) {
    btn_foco = btn_foco == undefined ? 1 : btn_foco;
    foco_botao_inicial = foco_botao_inicial == undefined ? true : foco_botao_inicial;
    foco_input_inicio = foco_input_inicio == undefined ? false : foco_input_inicio;

    var enter_focus = btn_foco > 2 ? 2 : btn_foco,
        centro = (matriz == 'centro' || foco_botao_inicial  == 'centro'),
        classes_btn = '',
        classes_content = '',
        classes_header = '',
        classes_body = '',
        classes_footer = '',
        classes_add_btn = '',
        btns = ['Cancelar','confirmar'],
        btn_close = 0;

    if(typeof btn_foco == 'string') {
        if(btn_foco.toLowerCase() == 'stimul') {
            classes_add_btn = 'stiJsViewerFormButton stiJsViewerFormButtonDefault';
            classes_content = 'stiDesignerForm';
            classes_header = 'stiDesignerFormHeader';
            classes_body = 'stiDesignerFormContainer';
            classes_footer = 'stiDesignerFormButtonsPanel';
            btns.reverse()
            btn_close = 1
            var stimul = true;
        }

        enter_focus = 2;
    }

    if($($modais.modal_confirmar.class).length != 0) {
        $($modais.modal_confirmar.class+':not(:visible)').remove();
    }

    $($modais.modal_confirmar.class).find('.modal-body').html('');

    var modal_confirmar = criarModal({
        classModal: $modais.modal_confirmar.n,
        title: 'confirmar',
        conteudo: conteudo,
        btns: btns,
        classes_btn: [['btn-default '+classes_add_btn],['btn-primary '+classes_add_btn]],
        btn_close: btn_close,
        FecharOverlay: true,
        enterFocus: enter_focus,
        FocusBtn: enter_focus,
        focusAuto: foco_botao_inicial,
        ModalCentralizado: centro,
        desfocarInput: true,
        classes_content: classes_content,
        classes_header: classes_header,
        classes_body: classes_body,
        classes_footer: classes_footer,
        clickBtn: function(a,b) {
            var tipo_retorno = b == 2;
            if(typeof stimul != "undefined") {
                tipo_retorno = b == 1;
            }
            callback(tipo_retorno, $($modais.modal_confirmar.class), matriz);

        },
        criacaoCompleta: function(c) {
            $($modais.modal_confirmar.class).css({'z-index':'9998'});
            $($modais.modal_confirmar.class).find('.modal-body').html(conteudo);
        },
        Open: function(o) {
            if(foco_input_inicio != false)
            {
                setTimeout(function(){ $(foco_input_inicio).focus() }, 600);
            }
        },
        Close: function(c) {
            setTimeout(function(){
                $('.modal:visible').find('input:visible').first().focus();
            }, 300);
        }

    });

    modal_confirmar.elementoModal.attr($roles.enterFocus,enter_focus);
    modal_confirmar.abrirModal();

    if(typeof stimul != "undefined") {
        setTimeout(function() {
            modal_confirmar.elementoModal.css({'z-index': '10001'})
        }, 50);
    }

    return modal_confirmar;
}

window.preencherCamposEstoqueMov = function(dados,input, focar) {
    if(dados[0] == undefined) return false;
    
    focar = focar == undefined ? true : focar;
    var tipo =  1,
        id_c = $(input).attr('role-id');
    var tr = $(input).closest('tr');
    if($(input).hasClass("cod_produto") || $(input).hasClass("nfe")) {
        //tr = '#'+$(input).closest('tr').attr('id');
        tipo = 2;
    }
    var tr_el = $(input).closest('td').closest('tr'),
    comum = tr.find("td");

    var tipo_pedido = typeof tipo_pedido1 != "undefined" ? tipo_pedido1() : tipo_uso,
    preco_usar = 0;
    $.each(dados, function(i, js) {

        var cfop_usar = js.CFOP_VENDA;
        var cst_usar = js.CST_ICMS_VENDA;
        var preco_usar = js.PRECO_VENDA;
        var aliquota_icms_usar = js.ALIQUOTA_ICMS_VENDA;

        if(tipo_pedido == 1) {
            cfop_usar = js.CFOP_COMPRA;
            cst_usar = js.CST_ICMS_COMPRA;
            preco_usar = js.PRECO_COMPRA;
            aliquota_icms_usar = js.ALIQUOTA_ICMS_COMPRA;

        } else if(tipo_pedido != 0 && tipo_pedido != 1) {
            cfop_usar = '';
            cst_usar = '';
            aliquota_icms_usar = '';
            preco_usar = js.PRECO_COMPRA;
        }

        comum.find(" ."+$inputs.desc_produto).attr('title',js.NOME).val(js.NOME);
        comum.find(" ."+$inputs.inp_codigo).val(js.ID);
        comum.find(" ."+$inputs.id_produto).attr($roles.role_val, js.ID).val(js.ID);
        comum.find(" .price").val(formatarNumeroCompleto(preco_usar));
        comum.find(" .qntd").val(formatarNumeroCompleto(1));
        comum.find(" .ncm").val(js.NCM);
        comum.find(" .aliquota_icms").val(aliquota_icms_usar).trigger('blur');
        comum.find(" .valor_icms_st, .cst_icms").val(cst_usar).trigger('blur');
        comum.find(" .unidade").val(js.UNIDADE).trigger('chosen:updated').trigger('esconder_o_dropdown');
        comum.find(" .unidade_medida").val(js.UNIDADE_MEDIDA);
        comum.find(" .cfop").val(cfop_usar).trigger('chosen:updated').trigger('esconder_o_dropdown');

        comum.find(" .valor_ipi").val(formatarNumeroCompleto(js.IPI));
        
        var desabilitar = js.PRODUTO_GRADE == 0,
            grade_a = js.PRODUTO_GRADE == 0 ? -1 : js.PRODUTO_GRADE;

        const buscarGrade = grade_a != -1 ? 1 : 2;
        
        $(tr).find('.'+$botao.add_grade).prop('disabled',false);
        $(tr).find('.'+$ClassesAvulsas.grade_td).removeAttr($roles.role_grade).find('span').html('').removeAttr('title');
        $(tr).addClass($ClassesAvulsas.ativo).attr($roles.role_grade, buscarGrade).attr($roles.role_obrig_grade, grade_a);
    });


    if(focar && !($(input).hasClass("cod_produto") || $(input).hasClass("nfe")) ) {
        var ativo = $(document.activeElement).closest('td').closest('tr');

        if(ativo[0] != tr_el[0]) {
            if($(input).hasClass($inputs.id_produto)) {
                comum.find(" ."+$inputs.desc_produto).select().focus();
            } 
            
            return false;
        } else {
            if($('.historico-materiais').length != 0) {
                comum.find(".qntd").select().focus();
                return;
            }

            if(preco_usar == 0) {
                if($('.tabela_produtos_man').length != 0) {
                    comum.find(" .qntd").select().focus();
                    return;
                }

                comum.find(" .price").select().focus();
            } else {
                if($('.tabela_produtos_man').length != 0) {
                    comum.find(" .qntd").select().focus();
                    return;
                }
                //$(comum +" .qntd").trigger('keyup').select().focus();
                if(typeof MudarFoco_Cod != "undefined") MudarFoco_Cod(tipo, id_c, input);
            }
        }
    } else {
        $(input).addClass('achado')
    }
}

window.buscarProdutoCompleto = function(buscar, retorno, campo404,erro404) {
    var funcao_retorno = false;

    if(typeof campo404 == "function"){
        funcao_retorno = campo404;
    } else if(typeof erro404 == "function") {
        funcao_retorno = erro404;
    }

    campo404 = campo404 == undefined ? false : campo404;
    erro404 = erro404 == undefined ? true : erro404;

    chamadaAjax({
        url: '/produto/produto/buscar', 
        data: {produto: buscar},
        erro404: erro404,
        CampoFocar404: campo404,
        success: function(data) {
            var usar = data.data_msg;
            usar = typeof usar.DADOS != "undefined" ? usar.DADOS : usar;
            retorno(usar);
        },
        error: function(xhr) {
            if(funcao_retorno != false) {
                funcao_retorno(xhr);
            }
        }
    })
}

window.gerarAutocompleteNomeProduto = function(input) {
    $(input).autocomplete({
        minLength: 2,
        source: function(request, response) {
            var dados_buscar = request.term;//$(input).val();
            buscarProdutoCompleto(dados_buscar, function(dados){
                response(dados);
            }, undefined, false)
        },
        focus: function(event, ui) {
            preencherCamposEstoqueMov([ui.item],input, false);
            return false;
        },
        select: function(event, ui) {
            preencherCamposEstoqueMov([ui.item],input);
            return false;
        }
    })
        .autocomplete("instance")._renderItem = function(ul, item) {
        return $('<li>')
            .append('<a style="float: left; width: 100%">' + item.NOME + " (" + item.ID + ")")
            .appendTo(ul);
    };
}


window.getProdutoId = function(input, event,blur) {
    blur = blur == undefined ? false : blur;
    var tipo = ($(input).hasClass("cod_produto")) ? 2 : 1;
    var id_c = $(input).attr('role-id');
    var tr = $("#tr_"+id_c);
    var cod =  (tipo == 1) ? tr.find("td > .qntd").val().length : tr.find("td > .qntd_estoque").val().length;
    var valor_buscar = $(input).val();
    var ch = valor_buscar.length;

    if(ch != 0) {
        if(valor_buscar == "?") {
            MudarFoco_Cod(tipo, id_c, input);
        } else {
            var role_val = $(input).attr($roles.role_val);
            if(role_val != valor_buscar) {
                buscarProdutoCompleto(valor_buscar, function(data){
                    $(input).attr($roles.role_val,valor_buscar)
                    preencherCamposEstoqueMov(data,input)
                }, input, function(erro){
                    tr.find('td').find('input').each(function(i, a){
                        $(a).val('')
                    })
                    $(input).removeAttr($roles.role_val,valor_buscar)
                })
            }
        }

        event.preventDefault();
        return false;
    }

    if(cod != 0 && ch != 0) {
        var id = $('.tbody_t1 > tr').length;
        gerar_td(id);
        event.preventDefault();
        return false;

    }

    if(event.which == 46 || event.keyCode == 46 || event.which == 109 || event.keyCode == 109) {
        if(id_c != 1) {
            $('#modal_excluir').modal('show');
        }
    }
}

$('body').on('blur', '.produto_id', function(e){ // $inputs.inp_codigo
    var valor = $(this).val();
    if(valor.length > 0) {
        var input = this;
        buscarProdutoCompleto(valor, function(data){
            $(this).attr($roles.role_val,valor)
            preencherCamposEstoqueMov(data,input)
        }, this, function(erro){
            tr.find('td').find('input').each(function(i, a){
                $(a).val('')
            })
            $(this).removeAttr($roles.role_val,valor)
        })
    }
})

window.formatarNomeGrade = function(id_grade, tamanho, cor) {
    return id_grade+'/'+tamanho+'/'+cor;
}

function limparPagamentosMultiplos(no_trigger, nao_limpar_tb) {
    $('.'+$inputs.forma_pagto).closest('div').find('input[type=hidden]').remove();
    if(nao_limpar_tb != false) $('.'+$tabelas.tabela_multiplas_formas_pagto+' tbody').html('');
    if(no_trigger != false) $('.'+$inputs.forma_pagto).trigger('change');
    // Aqui se manipula o botão limpar para que ele limpe os campos
}

var input_usando = function() {
    var input_valor_total = $('.total_nfe').length == 1 ? '.total_nfe' : '.'+$inputs.total_pedido;
    if($('.total_nfe').length == 1 && !$('.total_nfe').is(':visible')) {
        input_valor_total = $('<input>');
        input_valor_total.val(formatarNumeroCompleto( $('input[name="total_total"]').val() ))
        input_valor_total = input_valor_total[0];
    }
    return input_valor_total;
}

var input_valor_total = input_usando();

var valorPagarPedidoNfe = function() {
    var input_valor_total = input_usando();
    var retorno = valorMonetarioParaFloat($(input_valor_total).val());

    return isNaN(retorno) ? 0 : retorno;
}

function QuantidadePaga() {
    var valor_final = 0;
    $('.'+$inputs.valor_forma_pagto).each(function(i, el){
        var valor = valorMonetarioParaFloat($(el).val());
        valor = isNaN(valor) ? 0 : valor;
        valor_final += valor;
    })
    return valor_final.toFixed(2);
}

function atualizarValorPago(valor,primeiro) {
    var todos = false;
    
    if(typeof valor == "boolean" || typeof valor == "string") {
        todos = valor;
        valor = undefined;
    }

    valor = valor == undefined ? QuantidadePaga() : valor;
    var campo_att = undefined;

    if(todos || primeiro == "t")
        campo_att = $('.'+$inputs.total_valor_pago);
    else if(primeiro)
        campo_att = $('.'+$inputs.total_valor_pago).first();
    else
        campo_att = $('.'+$inputs.total_valor_pago).last();

    campo_att.val(formatarValorParaPadraoBr(valor));
}

$('body').on('change','.'+$inputs.forma_pagto, function(e, ativar, nao_abrir) {
    var selected = $(this),
        valor_selected = parseInt(selected.val()),
        classe = 'multiplas',
        desabilitar_btn = false;

    if(valor_selected == -1) {
        $(this).addClass(classe);
        $('.'+$botao.btn_multiplas_formas).addClass(classe);
        desabilitar_btn = true;
        if($('.col-md-2.s1.rw input[name="valor_forma_pagto[]"]').length == 0) {
            atualizarValorPago(0,true);
        }
        if(ativar != false) ativarMultiplasFormasPagto(undefined, nao_abrir);

    } else {
        $(this).removeClass(classe);
        $('.'+$botao.btn_multiplas_formas).removeClass(classe);
        atualizarValorPago(valorPagarPedidoNfe(), 't');
        limparPagamentosMultiplos(false);
    }
})

window.botaoLimparNfePedidos = function(sxidx) {
    var segundo = arguments[1],
        parametros = arguments[2];

    $('.'+$botao.btn_limpar).click(function(){
        $("#"+$inputs.cpf_cnpj).removeAttr('style');
        var x_load = Load('Limpando...');
        
        if(typeof doc_id != "undefined") {
            if(typeof doc_id.doc_id != "undefined") {
                doc_id.doc_id = undefined;
            }
        }
        
        if(typeof chave_nfe != "undefined") {
            if(typeof chave_nfe.chave != "undefined") {
                chave_nfe.chave = undefined;
            }
        }

        $('.'+$tabelas.tabela_produtos_man).removeAttr($roles.role_atualizar);
        $('#'+$inputs.forma_pagto).removeAttr($roles.role_id);
        limparPagamentosMultiplos(false);
        $('input[name="cancelar[]"]').remove();
        $('button[name="remover_nota"]').remove();
        $('.'+$inputs.forma_pagto).children('option').first().prop('selected', true).trigger('change');
        $('.'+$botao.importar_xml).show();

        setTimeout(function() {
            $('.'+$inputs.forma_pagto).trigger('click');
        }, 200)

        if(typeof segundo == "function") {
            segundo(parametros);
        }
        // Função para limpar somente os campos permimtidos
        $('input').each(function() {
            if($(this).hasClass('_saida')){} else if($(this).hasClass('custom-combobox-input')){}
            
            else if($(this).hasClass('money')) {
                $(this).val("0,00");
            } else {
                $(this).val('');
            }
        });
        sxidx.datepicker("setDate",new Date()).trigger('change');
        $('.'+$tabelas.tabela_produtos_man+' > tbody').html('');
        setTimeout(function(){
            if($('.'+$tabelas.tabela_produtos_man+' > tbody > tr').length == 0) {
                GerarLinhaTabelaProdutos(0);
                $('.'+$inputs.inp_codigo).val(0).val('');
            }
        }, 350)
        x_load.RemoverLoad();

        if($('#'+$inputs.documento).length != 0) {
            setTimeout(function() {
                $('#'+$inputs.documento).focus();
            }, 250);
        } 

        return false;
    });
}

/*
 total_pedido
 total_nfe
 */
$('body').on('alterado', '.'+$inputs.total_pedido+', .'+$inputs.total_nfe, function() {
    var limpar_tb = typeof doc_id == "undefined" ? true : false;
    limparPagamentosMultiplos(false, limpar_tb);
    if($('.'+$inputs.forma_pagto).val() != "-1") {
        atualizarValorPago(valorPagarPedidoNfe(),true);
    }
    /*$('#form_nfe > div.row.float-right > div > button.btn.btn-success').prop('disabled',true)*/;
})

$('body').on('blur', '.'+$inputs.desc_produto, function(e) {
    var tr = $(this).closest('tr')
    if($('.'+$tabelas.tabela_dados_nfe).is(':visible')) tr.find('.'+$inputs.inp_codigo).trigger('blur');
})
if($('.'+$inputs.forma_pagto).length > 0) {
    $('.'+$inputs.forma_pagto).trigger('change', [false]);

    window.adicionarFormasPagtosMultiplas = function(modal) {
        if(QuantidadePaga() == valorPagarPedidoNfe()) {
            var div =  $('.'+$inputs.forma_pagto).closest('div');
            div.find('input[type=hidden]').remove()
            $('.'+$inputs.valor_forma_pagto).each(function(e, el){
                var elemento = $(el),
                    select_forma = $( $('.'+$inputs.select_forma_pagto)[e] ),
                    forma_selected = select_forma.val(),
                    atualizar = select_forma.attr($roles.role_id),
                    valor = elemento.val(),
                    id_campo = 'valor_pagto_'+forma_selected
                name = elemento.attr('name'),
                    name_forma = select_forma.attr('name');
                valor = valor.indexOf(',') ? valorMonetarioParaFloat(valor) : valor;

                if($('#'+id_campo).length != 0) {
                    var campo_att = $('#'+id_campo),
                        valor_campo = parseFloat(campo_att.val()),
                        valor_att = valor_campo + parseFloat(valor);
                    campo_att.val(valor_att);
                } else {
                    atualizar = atualizar == undefined ? '' : atualizar;
                    div.append('<input type="hidden" id="'+id_campo+'" name="'+name+'" value="'+valor+'">')
                        .append('<input type="hidden" name="'+name_forma+'" value="'+forma_selected+'">');

                }
            })
            atualizarValorPago(true);
            //$('#form_nfe > div.row.float-right > div > button.btn.btn-success').prop('disabled',false)
            if(modal != undefined) {
                modal.modal('hide');
            }
            //$('.'+$inputs.forma_pagto).closest('div').append();
        } else {
            mostrarMensagemErroSucessoAlerta('A soma dos valores pagos não é igual ao valor a pagar')
        }
    }
    var conteudo_modal_formas_pagto = '<div class="row"> <div class="col col-md-12"> <span><txtprod></txtprod></span> <table class="table table-bordered table-stripped '+$tabelas.tabela_multiplas_formas_pagto+'"> <thead> <tr> <th>Forma de Pagamento</th> <th>Valor</th> <th></th> </tr></thead> <tbody></tbody> </table> <div class="col-md-4" style="float: right; padding-right: 0; text-align: right;"><label>Valor Pago</label> <input type="text" readonly class="form-control '+$inputs.total_valor_pago+'" value="0,00"></div></div></div>'
    var widths_usar = ['54%','40%','6%'];
    var modal_formas_pagto = criarModal({
        classModal: $modais.modal_multiplas_formas_pagto,
        title: "Formas de Pagamento",
        conteudo: conteudo_modal_formas_pagto,
        btns: ["OK"],
        desfocarInput: true,
        focusAuto: true,
        botoesRodapeNaoFecham: true,
        BtnAbrirModal: '.'+$botao.btn_multiplas_formas,
        BtnAbrirModalAuto: false,
        clickBtn: function(botao,select,modal){
            adicionarFormasPagtosMultiplas(modal);
        },
        CallbackBtnAbrir: function(a,b){
            ativarMultiplasFormasPagto(100);
        },
        Open: function() {
            $('.'+$tabelas.tabela_multiplas_formas_pagto).TabelaMultipla({
                height_body: 250,
                verticalSo: true,
                widths_usar: widths_usar
            });
            setTimeout(function(){ $("."+$inputs.select_forma_pagto).focus() }, 700);
        }
    })
}

var gerarLinhaFormaPagamento = function(forma_id, valor_forma, id_pagto_bd){
    var tabela = $('.'+$tabelas.tabela_multiplas_formas_pagto+' tbody'),
        trs = tabela.find('tr').length,
        tr_ultimo = tabela.find('tr').last().length == 0 ? 0 : tabela.find('tr').last().attr($roles.role_id),
        role_id_linha = parseInt(tr_ultimo) + 1,
        role_id_pagto_bd = id_pagto_bd != undefined ? $roles.role_id+'="'+id_pagto_bd+'"' : '',
        linha = '<tr '+$roles.role_id+'="'+role_id_linha+'"><td style="width: '+widths_usar[0]+';"><select '+role_id_pagto_bd+' name="forma_pagto[]" class="td_input '+$inputs.select_forma_pagto+'">'+formas_pagto_var+'</select></td><td style="width: '+widths_usar[1]+';"><input name="valor_forma_pagto[]" style="text-align: right;" data-option="{ponto: false, virgula: true, decs: 100, negativo: false, per_cent: false}" type="tel" class="td_input '+$inputs.somente_numero+' '+$inputs.money+'  not-blur '+$inputs.valor_forma_pagto+'"/></td>  <td style="width: '+widths_usar[2]+';"> <button type="button" class="'+$botao.rmv_forma_pagto+'"><i class="fas fa-trash"></i></button> </td></tr>',
        ultimo_elemento = valorMonetarioParaFloat(tabela.find('.'+$inputs.valor_forma_pagto).last().val()),
        adicionar_valor = (forma_id != undefined && valor_forma != undefined);
    //console.log(adicionar_valor, forma_id, valor_forma)
    if( (ultimo_elemento != 0 && !isNaN(ultimo_elemento))  || trs == 0 || adicionar_valor) {
        tabela.append(linha)
        var comparar_val = valor_forma;

        if($.isNumeric(valor_forma)) {
            comparar_val = parseFloat(valor_forma) == 1 ? false : comparar_val;
        }

        if(adicionar_valor && comparar_val != true) {
            var l = tabela.find('tr['+$roles.role_id+'="'+role_id_linha+'"]');
            l.find('.'+$inputs.select_forma_pagto).val(forma_id)
            l.find('.'+$inputs.valor_forma_pagto).val(formatarValorParaPadraoBr(valor_forma))
        } else {
            setTimeout(function(){ $('.'+$inputs.select_forma_pagto).focus() }, 300)
        }
        setTimeout(function(){ atualizarValorPago(); }, 300)
    }
}

$('body').on('blur','.'+$inputs.valor_forma_pagto, function(){
    var valor = $(this).val();
    valor = valorMonetarioParaFloat(valor);
    if(valor > 0) {
        var pago = QuantidadePaga(),
            paraPagar = valorPagarPedidoNfe(),
            diferenca = (pago - paraPagar).toFixed(2);

        if(pago < paraPagar) {
            gerarLinhaFormaPagamento();
            $('.'+$inputs.valor_forma_pagto).last().val( formatarValorParaPadraoBr(diferenca * -1) )
        } else if(pago > paraPagar) {
            var prev = $(this).closest('td').closest('tr').prev();

            //$(this).closest('td').closest('tr').find('.'+$botao.rmv_forma_pagto).trigger('click',[true]);
            if(prev.length != 0) {
                //setTimeout(function(){ prev.find('.'+$inputs.valor_forma_pagto).focus().select() }, 200)
            } else {
                //$(this).val(formatarValorParaPadraoBr(paraPagar))
            }
        }
        atualizarValorPago(QuantidadePaga())
    }
}).on('click','.'+$botao.rmv_forma_pagto, function(e, sem_confirmar){
    var linha = $(this).closest('td').closest('tr'),
        forma_se = linha.find('.'+$inputs.select_forma_pagto),
        forma = forma_se.find('option:selected').text(),
        valor = linha.find('.'+$inputs.valor_forma_pagto).val(),
        role_id = parseInt(linha.attr($roles.role_id));

    if(linha.closest('tbody').find('tr').length > 1) {
        var remocao = function(){
            linha.fadeTo(400, 0, function(){
                $(this).remove();
            })
            var prev = linha.prev();
            if(prev.length > 0) {
                var input_prev = prev.find('.'+$inputs.valor_forma_pagto),
                    valor_prev = valorMonetarioParaFloat(input_prev.val()) + parseFloat(valor);
                input_prev.val( formatarValorParaPadraoBr(valor_prev) );
                setTimeout(function(){ input_prev.select().focus(); atualizarValorPago();}, 800);
            }

        }
        var remover = function(){
            var forma_id = forma_se.attr($roles.role_id);
            if(forma_id != undefined && typeof doc_id != "undefined") {
                if(doc_id.doc_id != "undefined") {
                    remocao();
                    /*chamadaAjax({
                     url: '/pre_vendas/RemoverPagtoPedido',
                     type: 'DELETE',
                     LoadMsg: 'Removendo...',
                     data: {pedido_id: doc_id.doc_id, pagto_id: forma_id},
                     success: function(ok) {
                     remocao();
                     }
                     })*/
                } else {
                    remocao();
                }
            } else {
                remocao()
            }
        }
        if(sem_confirmar) {
            remover();
            return false;
        }
        confirmar('Deseja remover a forma de pagamento: '+forma+' de valor: '+valor, function(a,modal){
            if(a == 1) {
                remover()
                modal.modal('hide');
            }
        })
    }
})

window.ativarMultiplasFormasPagto = function(tempo, nao_abrir){
    var tabela = $('.'+$tabelas.tabela_multiplas_formas_pagto+' tbody'),
        valor_pagto = valorPagarPedidoNfe();
    tempo = tempo == undefined ? 0 : tempo;
    if(valor_pagto > 0) {
        setTimeout(function(){
            if(tabela.find('tr').length == 0) {
                gerarLinhaFormaPagamento('okok', true);
                $('.'+$inputs.valor_forma_pagto).val( formatarValorParaPadraoBr(valorPagarPedidoNfe()) );
            }
            if(nao_abrir != false) modal_formas_pagto.abrirModal();
        }, tempo)
    }
}

window.idTabelaProdutos = function(prox) {
    var tabela = $tabelas.tabela_produtos_man;
    if($('.'+tabela).length == 0) {
        tabela = $tabelas.tabela_transferencia;
    }
    var atual = $("."+tabela+" > tbody > tr").length;
    return prox == true ? (atual + 1) : atual;
}


window.ativarGrades = function(GerarLinhaTabelaProdutos, opcoes) {

    opcoes = typeof opcoes != 'object' ? {} : opcoes;

    function multiplicarLinhasTabela(multiplicar, id_tr, grade_id) {
        var linha_gerada = undefined;

        for(var i in multiplicar) {
            var novo_tr = id_tr;
            var valor = multiplicar[i];
            if(i == 0) {
                $( "#"+id_tr ).attr($roles.role_grade, '1')
                    .find('.qntd').val(valor).trigger('keyup');

                $( "#"+id_tr ).attr($roles.role_obrig_grade, 1).find('td.grade_td').attr($roles.role_grade, grade_id[0][i]).children('span').attr('title',grade_id[1][i]).html(grade_id[1][i]);
            } else {
                var novo_id = idTabelaProdutos(true),
                    novo_tr = 'tr_'+novo_id,
                    tr = linha_gerada != undefined ? $(linha_gerada[0]) : $("#"+id_tr);
                if($('.'+$tabelas.table_nfe).is(':visible')) {
                    var tbody = tr.closest('tbody'),
                        id_usar = tr.attr('id')+''+i,
                        tr_usar = tr.clone();
                    tr_usar.attr('id', id_usar).insertBefore(tr[0]);
                    linha_gerada = $('#'+id_usar);
                } else {
                    linha_gerada = GerarLinhaTabelaProdutos((novo_id-1), false, tr);
                }

                tr.find('td').each(function(nf,a){
                    var valor_elemento = $(this).find('input:visible, select:visible').val(),
                        td = 'td:nth-child('+(nf + 1)+')',
                        tr_new = $("#"+novo_tr),
                        td_elemento = linha_gerada.find(td);

                    if(td_elemento.find('input').length != 0) {
                        var valor_add = (td_elemento.find('input').hasClass('qntd')) ? valor : valor_elemento;
                        td_elemento.find('input').val(valor_add);
                    } else if(td_elemento.find('select').length != 0) {
                        td_elemento.find('select').val(valor_elemento);
                    }
                })
            }
            if(linha_gerada != undefined) {
                var classe = !$('.'+$tabelas.table_nfe).is(':visible') ? 'class="td_input"' : '';
                linha_gerada.attr($roles.role_grade, 1).attr($roles.role_obrig_grade, 1).find('td.grade_td').html('<span data-placement="right" '+classe+' title="'+grade_id[1][i]+'">'+grade_id[1][i]+'</span>').attr($roles.role_grade, grade_id[0][i]);
                $('.'+$tabelas.tabela_produtos_man+' .'+$ClassesAvulsas.grade_td+' span').tooltip();
            }
        }
        $("."+$tabelas.tabela_produtos_man+" > tbody > tr:nth-child(1) > td:nth-child(1) > input").attr($roles.role_use, "false");
        GerarLinhaTabelaProdutos( ($("."+$tabelas.tabela_produtos_man+" > tbody > tr").length), true, 550 );
    }

    window.gerarLinhaGrade = function(grades,qntd,primeiro) {
        var linha = '<tr><td>'+'<select class="td_input no">',
            opc_grades = '<option value="-1"></option>', opc_cor = '', opc_taman = '';
        $.each(grades, function(i, a){
            var separado = ["TAMANHOS", "CORES"]
            if(separado.indexOf(i) == -1) {
                opc_grades += '<option '+$roles.role_cor+'="'+a.COR+'" '+$roles.role_tam+'="'+a.TAMANHO+'" value="'+a.ID+'">'+formatarNomeGrade(a.ID,a.TAMANHO,a.COR)+'</option>';
            } else if(separado[0].indexOf(i) !== -1) {
                $.each(a, function(b, f){
                    opc_cor += '<option '+$roles.role_id+'="'+f.ID+'" value="'+f.TAMANHO+'">'+f.TAMANHO+'</option>';
                });
            } else if (separado[1].indexOf(i) !== -1) {
                $.each(a, function(n, h){
                    opc_taman += '<option '+$roles.role_id+'="'+h.ID+'" value="'+h.COR+'">'+h.COR+'</option>';
                })
            }
            //+' - '+a.TAMANHO+' - '+a.COR
        });
        linha += opc_grades+'</select></td>';
        linha += '<td><select class="td_input no">'+opc_cor+'</select></td>';
        linha += '<td><select class="td_input no">'+opc_taman+'</select></td>';
        linha += '<td><input type="tel" id="'+$inputs.quantidade_grade+'" '+$roles.role_quant+'='+formatarValorParaPadraoBr(qntd)+' value="'+formatarValorParaPadraoBr(qntd)+'" class="td_input '+$inputs.quantidade_grade+' '+$inputs.money_qnt+' '+$inputs.prod_grade+'"><button class="btn btn-danger '+$botao.rmv_prod_grade+'"><i class="fas fa-trash"></i></button></td>';
        linha += '</tr>';

        $("."+$tabelas.tabela_grades+" > tbody").append(linha);
        $("."+$tabelas.tabela_grades).find('tr').last().find('.'+$inputs.quantidade_grade).trigger('keypress')
        $('.'+$inputs.controlar_qntd_grade).val(qntd);
        //'+$inputs.quantidade_grade+' '+$inputs.numero_formatado+'" value="'+formatarValorParaPadraoBr(qntd)+'"
    }

    $('body').on('click', '.'+$botao.rmv_prod_grade, function(e){
        var tr = $(this).closest('tr'),
            tbody = tr.closest('tbody'),
            primeiro_tr = tbody.find('tr').first(),
            prev = tr.prev('tr'),
            next = tr.next('tr'),
            qntd = valorMonetarioParaFloat( tr.find('.'+$inputs.quantidade_grade).val() ),
            input_atualizar =  primeiro_tr.find('.'+$inputs.quantidade_grade);

        if(tbody.find('tr').length == 1 && tr[0] == primeiro_tr[0]){
            tr.find('select').first().val('').trigger('change').focus();
            return false;
        }

        if(next.length != 0) {
            input_atualizar = next.find('.'+$inputs.quantidade_grade);
        } else if(prev.length != 0) {
            input_atualizar = prev.find('.'+$inputs.quantidade_grade);
        }
        //console.log(input_atualizar,next, prev )
        var valor_atualizar = valorMonetarioParaFloat(input_atualizar.val()),
            valor_novo = qntd + valor_atualizar,
            valor_save = formatarValorParaPadraoBr(valor_novo);
        input_atualizar.attr($roles.role_quant, valor_save).val(valor_save).select().focus();
        tr.fadeTo(400, 0, function(){ $(this).remove() })

    })

    $('body').on('change', '.'+$tabelas.tabela_grades+' td:nth-child(1) select', function(e){
        var selecionado = $(this).children('option:selected'),
            tr_tabela = $(this).closest('tr'),
            select_tamanho = tr_tabela.find('td:nth-child(2) select'),
            select_cor = tr_tabela.find('td:nth-child(3) select'),
            selecionado_texto = selecionado.text();
        if(selecionado_texto.length == 0) {
            select_tamanho.prop('disabled', false)
            select_cor.prop('disabled', false)
        } else {
            var cor = selecionado.attr($roles.role_cor),
                tamanho = selecionado.attr($roles.role_tam);
            select_cor.prop('disabled', true).val(cor);
            select_tamanho.prop('disabled', true).val(tamanho);
        }
    })

    var quantidadeComputadaGrade = function() {
        var total = 0;
        $('.'+$tabelas.tabela_grades+' .'+$inputs.quantidade_grade).each(function(e){
            total += valorMonetarioParaFloat( $(this).val() );
        });
        return total;
    }
    // Trocar para usar o CFOP cfop
    $('body').on('blur', "."+$inputs.quantidade_grade, function(e){
        var quantidade_campo = $(this).val(),
            quantidade_max = parseFloat( $('.'+$tabelas.tabela_grades).attr($roles.role_max) ),
            quantidade_campo = quantidade_campo.length == 0 ? 0 : valorMonetarioParaFloat(quantidade_campo),
            quantidade_retornar_erro = $(this).attr($roles.role_quant),
            soma_dos_campos = quantidadeComputadaGrade();

        quantidade_retornar_erro = quantidade_retornar_erro.indexOf(',') == -1 ? formatarValorParaPadraoBr(quantidade_retornar_erro) : quantidade_retornar_erro;

        if( quantidade_campo > 0 ) {
            var quantidade_computada = $('.'+$inputs.controlar_qntd_grade).val().length > 0 ? parseFloat( $('.'+$inputs.controlar_qntd_grade).val() ) : 0,
                quantidade_sobrou = quantidade_max - soma_dos_campos;

            //console.log("Computada: ", quantidade_computada, "Qntd Campo: ", quantidade_campo, "Sobrou: ", quantidade_sobrou, "MAX: ",quantidade_max)

            if( soma_dos_campos < quantidade_computada && quantidade_sobrou > 0 ) { /* quantidade_sobrou != 0 && !isNaN(quantidade_sobrou) && quantidade_computada < quantidade_max */
                // Ajustar, tá vindo como o valor errado -> revise o role_ deles
                var quantidade_role = quantidade_campo;//$('.'+$tabelas.tabela_grades).find('tbody tr').length == 1 ? quantidade_campo : quantidade_sobrou;
                $(this).attr($roles.role_quant, quantidade_role);
                var tr_clonada = $(this).closest('tr').clone().appendTo('.'+$tabelas.tabela_grades+' > tbody');
                tr_clonada.find('.'+$inputs.quantidade_grade)
                    .val( formatarValorParaPadraoBr(quantidade_sobrou) )
                    .attr($roles.role_quant, formatarValorParaPadraoBr(quantidade_sobrou))
                    .trigger('keypress');

                tr_clonada.find('select').first().focus();
                tr_clonada.find('td:nth-child(1) > select').val('-1').trigger('change');

                $('.'+$inputs.controlar_qntd_grade).val( quantidadeComputadaGrade() );
                //gerarLinhaGrade( DadosGradeSalvos(), quantidade_sobrou );
            } else {
                $(this).val( quantidade_retornar_erro );
            }
        } else {
            $(this).val( quantidade_retornar_erro );
        }
    });
    //'+$inputs.select-grade+'
    var classe_nope = 'nao_cancelou';
    var conteudo_modal_grade = '<div class="row"> <div class="col col-md-12"> <span><txtprod></txtprod></span><table class="table table-bordered table-stripped '+$tabelas.tabela_grades+'"> <thead> <tr> <th>Grade</th> <th>Tamanho <button class="btn btn-default '+$botao.btn_tabela_grade+' float-right" '+$roles.role_id+'="1"><i class="fas fa-plus"></i></button></th> <th>Cor <button class="btn btn-default '+$botao.btn_tabela_grade+' float-right" '+$roles.role_id+'="2"><i class="fas fa-plus"></i></button></th> <th>Quantidade</th> </tr></thead> <tbody></tbody> </table> </div></div><input type="hidden" class="'+$inputs.controlar_qntd_grade+'">';

    const modal_grade = criarModal({
            classModal: $modais.modal_produto_grade,
            title: "Grade de Produtos",
            conteudo: conteudo_modal_grade,
            enterFocus: 2,
            btns: ["OK"],
            desfocarInput: true,
            focusAuto: true,
            botoesRodapeNaoFecham: true,
            clickBtn: function(a,b,c) {
                var load = Load('Adicionando...');
                var produto_id = $("."+$tabelas.tabela_grades).attr($roles.role_produto_id),
                    valor_add_linhas = $("."+$tabelas.tabela_grades+" ."+$inputs.quantidade_grade),
                    id_tr = $("."+$tabelas.tabela_grades).attr($roles.role_id),
                    multiplicar = [], grades_id = [], grades_nome = [], grades_usar = [],
                    tamanho = [], cor = [], tamanho_nome = [], cor_nome = [];

                valor_add_linhas.each(function(i,a){
                    multiplicar.push( $(this).val() );
                });

                $('.'+$tabelas.tabela_grades+' tbody > tr > td:nth-child(1) > select').each(function(i,a){
                    var valor = $(this).val();
                    if(valor == "-1") {
                        var tr = $(this).closest('td').closest('tr');
                        tamanho.push( tr.find('td:nth-child(2) > select > option:selected').attr($roles.role_id) );
                        tamanho_nome.push( tr.find('td:nth-child(2) > select > option:selected').val() );
                        cor.push( tr.find('td:nth-child(3) > select > option:selected').attr($roles.role_id) );
                        cor_nome.push( tr.find('td:nth-child(3) > select > option:selected').val() );
                    } else {
                        grades_nome.push( $(this).find('option:selected').html() );
                        grades_id.push( valor );
                    }
                });
                grades_usar = [grades_id, grades_nome];
                if(tamanho.length > 0) {
                    chamadaAjax({
                        url: '/produto/produto/criar_grade',
                        type: 'POST',
                        data: {produto_id: produto_id, tamanho_id: tamanho, cor_id: cor},
                        LoadMsg: true,
                        success: function(data) {
                            $.each(data.data_msg, function(i,a){
                                grades_nome.push( formatarNomeGrade(a.ID,tamanho_nome[i],cor_nome[i]) );
                                grades_id.push(a.ID);
                            });
                            grades_usar = [grades_id, grades_nome];
                            multiplicarLinhasTabela(multiplicar, id_tr, grades_usar);
                            c.modal('hide');
                        }
                    });
                } else {
                    multiplicarLinhasTabela(multiplicar, id_tr, grades_usar);
                    c.modal('hide');
                }

                setTimeout(function() {
                  $('#'+id_tr).find('.'+$inputs.cfop).focus();
                }, 600);

                load.RemoverLoad();
                a.addClass(classe_nope);
                setTimeout(function(){ a.removeClass(classe_nope) }, 800)

            },
            Open: function() {
                setTimeout(() => {
                    $('.'+$tabelas.tabela_produtos_man).find('.chosen-drop').hide();
                }, 350)

                $('.'+$tabelas.tabela_grades).TabelaMultipla({
                    height_body: 250,
                    verticalSo: true,
                    widths_usar: ['27%','23%','28%','22%']
                });
                setTimeout(function(){ $('#'+$modais.modal_produto_grade).find('td:nth-child(1) > select').focus() }, 700);

            },
            closeCancelar: function(a,b,c) {
                if(!b.hasClass(classe_nope)) {
                    var id_tr = $("."+$tabelas.tabela_grades).attr($roles.role_id);
                }
            },
            Close: function() {
                if(typeof opcoes.fechado == "function") {
                    opcoes.fechado(true)
                }
            },
            BtnAbrirModal: '.'+$botao.add_grade,
            BtnAbrirModalAuto: false,
            CallbackBtnAbrir: function(a,b,c) {
                var tr = $(a).parent().parent();
                if(tr.attr($roles.role_grade) == '0') {
                    tr.attr($roles.role_grade, '2')
                }
                var grade = tr.attr($roles.role_grade) == undefined ? false : (tr.attr($roles.role_grade) == "1"),
                    grade_usando = tr.find('.grade_td').attr($roles.role_grade),
                    qntd_inserida =  tr.find(".qntd").val();
                    var input_produto_id = tr.find("."+$inputs.inp_codigo).length != 0 ? tr.find("."+$inputs.inp_codigo) : tr.find("."+$inputs.produto_id);
                    var produto_id = input_produto_id.val();

                    var qntd = valorMonetarioParaFloat(qntd_inserida),
                    produto = tr.find('.'+$inputs.desc_produto).val();

                    const preencherTamanhoCorGradeModal = function() {
                        chamadaAjax({
                            url: '/produto/produto/get_produto_tamanho_cor_juntos/',
                            data: {tipo: 3},
                            success: function(data) {
                                gradeAtivar(data.data_msg, qntd, tr.attr('id'), produto_id, produto);
                            }
                        })
                    }

                if(qntd > 0 && grade && produto_id.length > 0) {
                    $(this).addClass($ClassesAvulsas.n_gerar);
                    chamadaAjax({
                        url: '/produto/produto/get_produto_grade',
                        data: {produto_id: produto_id},
                        LoadMsg: 'Buscando Grade...',
                        erro404: false,
                        success: function(data) {
                            gradeAtivar(data.data_msg, qntd, tr.attr('id'), produto_id, produto);
                            if(grade_usando != undefined) {
                                $('#'+$modais.modal_produto_grade).find('td:nth-child(1) > select').val(grade_usando).trigger('change')
                            }
                        },
                        error: function(err) {
                            if(err.responseJSON != undefined) {
                                if(err.responseJSON.codStatus == 710) {
                                    preencherTamanhoCorGradeModal();
                                    return;
                                }
                            }
                        }
                    });
                } else if(tr.attr($roles.role_grade) == "2") {
                    preencherTamanhoCorGradeModal()
                }

                //tr.find('.'+$inputs.cfop).trigger('blur');
            }

        })

    window.gradeAtivar = function(dados, qntd, tr_id, produto_id, produto) {
        modal_grade.setConteudo(conteudo_modal_grade);
        gerarLinhaGrade(dados, qntd, true);
        $("."+$tabelas.tabela_grades).attr($roles.role_id,tr_id).attr($roles.role_produto_id,produto_id).attr($roles.role_max, qntd);
        modal_grade.elementoModal.find("txtprod").html(produto);
        modal_grade.abrirModal();
    }

    $('body').on('blur', '#'+$modais.modal_produto_grade+' select.td_input.no', function(e){
        var td = $(this).closest('td'),
            next = td.next();
        if(next.find('select').first().attr('disabled') != undefined) {
            td.closest('tr').find('.'+$inputs.quantidade_grade).select().focus();
        }
    }).on('keydown','#'+$modais.modal_produto_grade+' select.td_input.no', function(e){
        if(e.which == 13) {
            $(this).trigger('blur');
            return false;
        }
    }).on('keydown', '.'+$inputs.quantidade_grade, function(e){
        if(e.which == 13) {
            var tr = $(this).closest('tr'),
                next = tr.next(),
                select_p = next.find('select').first();
            if(select_p.length != 0)
                select_p.focus();
            else
                setTimeout(function(){
                    $('#'+$modais.modal_produto_grade).find($botao.btn_action_modal.class).first().focus()
                }, 300)

            return false;
        }
    })
    /*modal_tamanho_grade
     modal_cor_grade*/
    var /* Para criação do tamanho */
        modal_tamanho = criarModal({
            classModal: $modais.modal_tamanho_grade,
            title: "Novo Tamanho",
            btn_close: 0,
            conteudo: '<div class="form-group"> <label for="'+$inputs.tamanho_modal_grade+'">Tamanho</label> <input type="text" id="'+$inputs.tamanho_modal_grade+'" maxlength="10" class="form-control '+$inputs.tamanho_modal_grade+'"> </div>',
            btns: ["Cancelar","OK"],
            desfocarInput: true,
            focusAuto: true,
            classes_btn: [[],["btn-success"]],
            clickBtn: function(a,b,c) {
                if(b == 2) {
                    var campo_tamanho = $('.'+$inputs.tamanho_modal_grade).val();
                    //console.log(b, tamanho)
                    if(campo_tamanho.length > 0) {
                        chamadaAjax({
                            url: '/produto/produto/criar_tamanho',
                            type: 'POST',
                            data: {tamanho: campo_tamanho},
                            LoadMsg: true,
                            success: function(data) {
                                var select_tamanho = $('.'+$tabelas.tabela_grades).find('td:nth-child(2) select'),
                                    tamanho_txt = campo_tamanho.toUpperCase();
                                select_tamanho.append('<option '+$roles.role_id+'="'+data.data_msg.ID+'" value="'+tamanho_txt+'">'+tamanho_txt+'</option>');
                                c.modal('hide');
                            }
                        });
                    }
                }
            },
            Open: function() {
                $('.'+$inputs.tamanho_modal_grade).val('');
                setTimeout(function(){ $('.'+$inputs.tamanho_modal_grade).focus(); }, 700);
            }
        }),
        // Para criação da cor
        modal_cor = criarModal({
            classModal: $modais.modal_cor_grade,
            title: "Nova Cor",
            btn_close: 0,
            conteudo: '<div class="form-group"> <label for="'+$inputs.cor_modal_grade+'">Cor</label> <input type="text" maxlength="20" id="'+$inputs.cor_modal_grade+'" class="form-control '+$inputs.cor_modal_grade+'"> </div>',
            btns: ["Cancelar","OK"],
            desfocarInput: true,
            focusAuto: true,
            classes_btn: [[],["btn-success"]],
            clickBtn: function(a,b,c) {
                if(b == 2) {
                    var campo_cor = $('.'+$inputs.cor_modal_grade).val();
                    //console.log(b, tamanho)
                    if(campo_cor.length > 0) {
                        chamadaAjax({
                            url: '/produto/produto/criar_cor',
                            type: 'POST',
                            data: {cor: campo_cor},
                            LoadMsg: true,
                            success: function(data) {
                                var select_cor = $('.'+$tabelas.tabela_grades).find('td:nth-child(3) select'),
                                    cor_txt = campo_cor.toUpperCase();
                                select_cor.append('<option '+$roles.role_id+'="'+data.data_msg.ID+'" value="'+cor_txt+'">'+cor_txt+'</option>');
                                c.modal('hide');
                            }
                        });
                    }
                }
            },
            Open: function() {
                $('.'+$inputs.cor_modal_grade).val('');
                setTimeout(function(){ $('.'+$inputs.cor_modal_grade).focus(); }, 700);
            }
        });

    $('body').on('click', '.'+$botao.btn_tabela_grade, function(){
        var tipo = parseInt( $(this).attr($roles.role_id) );
        if(tipo == 1) {
            modal_tamanho.abrirModal();
        } else if(tipo == 2) {
            modal_cor.abrirModal();
        }
    })

}

function removerNotaAjax(data,url,callback){
    chamadaAjax({
        url: url,
        type: 'DELETE',
        data: data,
        LoadMsg: 'Removendo...',
        success: function(a){
            mostrarMensagemErroSucessoAlerta(a.data_msg, false, false);
            $('.'+$botao.btn_limpar).click();
        },
        complete: function(xhr){
            if(typeof callback == "function") {
                callback(xhr)
            }
        }
    });
}

window.ativarRemocaoCompletaNota = function(url, data) {
  var tipo = url.toLowerCase().indexOf('pre_vendas') != -1 ? 'pedido' : 'nota',
  artigo = tipo == 'pedido' ? 'e' : 'a',
  botao = $('button[name="remover_nota"]').length != 0 ? $('button[name="remover_nota"]') : $('button[name="remover_pedido"]');

  botao.on('click',function(){

      confirmar('Você deseja excluir est'+artigo+' '+tipo+'?', function(a, modal){
        if(a) {
          chamadaAjax({
            url: url,
            type: 'DELETE',
            data: data,
            LoadMsg: 'Removendo...',
            success: function(a){
              mostrarMensagemErroSucessoAlerta(a.data_msg, false, false);
              $('.'+$botao.btn_limpar).click();
            },
            complete: function(){
              modal.modal('hide');
            }
          });
        }
      })
  });
}

function autoCompleteClienteUniversal(url_usar, param){
    $("#"+$inputs.nome_cliente_destin).autocomplete({
        minLength: 2,
        source: function(request, response) {
            chamadaAjax({
                url: '/entidade/'+url_usar,
                type: 'GET',
                erro404: false,
                data: param+"="+$('#'+$inputs.nome_cliente_destin).val(),
                success: function(data) {
                    response(data.data_msg.DADOS);
                }
            })
        },
        focus: function(event, ui) {
            $("#"+$inputs.nome_cliente_destin).attr($roles.role_id, ui.item.ID).val(ui.item.NOME);

            $('#cep').val(ui.item.CEP);
            $('#numero').val(ui.item.NUMERO);
            console.log($('#endereco'),ui.item.LOGRADOURO)
            $('#endereco').val(ui.item.LOGRADOURO);
            $('#bairro').val(ui.item.BAIRRO);
            $('#email').val(ui.item.EMAIL);
            $('#tel').val(ui.item.TELEFONE1);
            $('#cidade').val(ui.item.CIDADE);
            $('#uf').val(ui.item.UF);
            //$("#cep").blur();

            var mask = ui.item.CNPJ.length == 11 ? "999.999.999-99" : "99.999.999/9999-99";
            $("#"+$inputs.cpf_cnpj).val();
            $("#"+$inputs.cpf_cnpj).unmask().val(ui.item.CNPJ).mask(mask);

            return false;
        },
        select: function(event, ui) {
            $("#"+$inputs.nome_cliente_destin).attr($roles.role_id, ui.item.ID).val(ui.item.NOME);
            //$("#cep").blur();
            return false;
        }
    })
        .autocomplete("instance")._renderItem = function(ul, item) {
        return $("<li>")
            .append("<a>" + item.NOME + " (" + item.ID + ")")
            .appendTo(ul);
    };
}

$.fn.autoCompleteCliente = function(opcoes) {
    var padrao = {
        url_usar: '',
        param: '',
        focus: function(event, ui) {
            return [event, ui];
        },
        select: function(event, ui) {
            return [event, ui];
        },
        close: function(event, ui) {
            return [event, ui];
        }
    }

    var configs = $.extend( {}, padrao, opcoes );

    return this.each(function(i, elemento) {
        $(elemento).autocomplete({
            minLength: 2,
            source: function(request, response) {
                chamadaAjax({
                    url: '/entidade/'+configs.url_usar,
                    type: 'GET',
                    erro404: false,
                    data: configs.param+"="+$(elemento).val(),
                    success: function(data) {
                        var retornar = data.data_msg;
                        retornar = typeof retornar.DADOS != "undefined" ? retornar.DADOS : [retornar];
                        response(retornar);
                    }
                })
            },   
            focus: function(event, ui) {
                $(elemento).attr($roles.role_id, ui.item.ID).val(ui.item.NOME);
                configs.focus(event, ui);
            },
            select: function(event, ui) {
                setTimeout(function(){ $(elemento).attr($roles.role_id, ui.item.ID).val(ui.item.NOME); }, 50)
                configs.select(event, ui);
            },
            close: function(event, ui) {
                configs.close(event, ui);
            } 
        }).autocomplete("instance")._renderItem = function(ul, item) {

            return $("<li>")
            .append("<a>" + item.NOME + " (" + item.ID + ")")
            .appendTo(ul);
        };
    });
}

function focusClientePadrao(event, ui) {
    $("#"+$inputs.nome_cliente_destin).attr($roles.role_id, ui.item.ID).val(ui.item.NOME);

    //$('.nome_cliente').val(ui.item.NOME);
    $('#cep').val(ui.item.CEP);
    $('#numero').val(ui.item.NUMERO);
    $('#endereco').val(ui.item.LOGRADOURO);
    $('#bairro').val(ui.item.BAIRRO);
    $('#email').val(ui.item.EMAIL);
    $('#tel').val(ui.item.TELEFONE1);
    $('#cidade').val(ui.item.CIDADE);
    $('#uf').val(ui.item.UF);
    //$("#cep").blur();

    var mask = ui.item.CNPJ.length == 11 ? "999.999.999-99" : "99.999.999/9999-99";
    $(".validar-cpf-cnpj").val();
    $(".validar-cpf-cnpj").unmask().val(ui.item.CNPJ).mask(mask);

    return false;   
}

function selectClientePadrao(event, ui) {
    $('.nome_cliente').attr($roles.role_id, ui.item.ID).val(ui.item.NOME);
    //$("#cep").blur();
    return false;    
}

$('body').on('blur','input[type=email]', function(){
    var valor = $(this).val();
    if(valor.length > 0)$(this).val( valor.toLowerCase() );
})

function adicionarRoleOption(elemento,data2view) {
    var buscar = $(elemento).find('option');
    buscar = buscar.length > 0 ? buscar : $(elemento);
    buscar.each(function(i,e){
        var valor = escapeHtml($(this).html()),
            valor_role = $(this).attr($roles.role_option) != undefined ? htmlspecialchars_decode($(this).attr($roles.role_option)) : '';
        if(data2view != true) {
            $(this).attr($roles.role_option, valor);
        } else {
            $(this).html(valor_role);
        }
    });
}

$('body').on('append prepend insertBefore insertAfter', 'select:not(.no), option', function(e){
    adicionarRoleOption(this);
}).on('focus click','select:not(.no)', function(e){
    var minha_classe = $(this)[0].className;
    if(minha_classe.indexOf('ui-datepicker') != -1) {
        $(this).addClass('no');
        return false;
    }
    adicionarRoleOption(this,true);

}).on('change','select:not(.no)', function(e){
        var percentual = 10.44; // Percentual de caracteres aceitos em relação a largura. É uma constante, pois foi calculado que a quantidade máxima de caracteres toma cerca de 89,56% da largura total, então essa é uma relação de diferenciação. Obs: Para o bootstrap 4 sem alterações no select
        var width = $(this).outerWidth(true),
            minha_classe = $(this)[0].className,
            selecionado = $(this).find('option:selected'),
            nao_selecionados = $(this).find('option:not(:selected)'),
            texto_selecionado = selecionado.html(),
            max_caracteres = (Math.ceil((width * percentual) / 100) - 3);

        if(minha_classe.indexOf('ui-datepicker') != -1) {
            return false;
        }

        adicionarRoleOption(nao_selecionados,true);
        
        var max_old = max_caracteres,
            role_max = $(this).attr($roles.role_max) != undefined,
            role_so_numero = $(this).attr($roles.role_option_numero) != undefined;
        max_caracteres = role_max ? parseInt($(this).attr($roles.role_max)) : max_caracteres;
        max_caracteres = (max_caracteres == 0 || isNaN(max_caracteres)) ? max_old : max_caracteres;
        // $roles.role_max
        // $roles.role_espaco_branco
        if(texto_selecionado != undefined) {
            if(texto_selecionado.length > max_caracteres) {
                var texto_conservar = texto_selecionado;
                if($(this).attr($roles.role_espaco_branco) != undefined) {
                    texto_selecionado = texto_selecionado.semEspaco();
                }

                if(role_so_numero) {
                    texto_selecionado = texto_selecionado.soNumero();
                }
                //$roles.role_option_numero
                //soNumero
                var texto_reduzido = texto_selecionado.substr(0, max_caracteres);

                if(!role_so_numero) {
                    texto_reduzido += '...';
                }
                selecionado.attr($roles.role_option, texto_conservar).html(texto_reduzido);
            }
        }

    }).on('blur', 'select:not(.no)', function(e){
    $(this).trigger('change');
});

$('body').on('keyup change','.input-invalid', function(){
    $(this).removeClass('input-invalid');
})

$('body').on('chosen:showing_dropdown', '.chosen-ativar', function() {
    const chosen = $(this).next();
    const ulChosen = chosen.find('div > ul');
    const maxHeightUl = ulChosen.css('max-height').replace(/\D?x/i, '');

    const maxHeigthReal = $(window).innerHeight() - ulChosen.offset().top - 6;

    if(maxHeigthReal < parseInt(maxHeightUl)) {
        ulChosen.css({'max-height': maxHeigthReal + 'px'})
    } else {
        ulChosen.css({'max-height': ''})
    }

}).on('focus', 'input, select', function(e){
    if($(this).is(':disabled') || $(this).is('[readonly]')) {
        setTimeout(() => {
            $(this).blur()
        }, 100)
    }
}).on('focus', '.td_input',function(e){
    if($(this).is('[readonly]') || $(this).is(':disabled')) {
        const td = $(this).parent();
        const proximo = td.next().find('input.td_input, select.td_input');

        if( !(proximo.is('[readonly]') || $(this).is(':disabled')) ) {
            proximo.select().focus();
        } else {
            $(this).blur()
        }
    }
});
