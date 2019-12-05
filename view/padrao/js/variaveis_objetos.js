/* Arquivo para as variáveis do Sistema
	-> Padrão adotado para as mesmas
		-> var $nome_da_variaval
 */
var $BancoDeDados = 'InfoBD';
 // Páginas
 var $liberar = false; // Controla a liberação do carregamento inicial, se vai ser login ou configs
 var $pasta_pags = "paginas";
  // Sessions e Local Storage
 var $sessions = {
 	dados_csrf: 'csrf_data',
    config: 'config',
    scripts_carregados: 'scripts_internos',
 	qntd_itens_indexed: 'qntd_itens_indexed',
 }
  // DIVs
 var $divs = {
 	jq_toast: {n: "jq-toast-wrap", id: "#jq-toast-wrap", class: ".jq-toast-wrap"},
 	resultados: {n: "resultados", id: "#resultados", class: ".resultados"},
 	loader: {n: "__loader__", id: "#__loader__", class: ".__loader__"},
 	loader_tabela: {n: "loader_tabela", id: "#loader_tabela", class: ".loader_tabela"},
 	sidebar_vendas: {n: "sidebar_vendas", id: "#sidebar_vendas", class: ".sidebar_vendas"},
 	grid_element: {n: "grid_element", id: "#grid_element", class: ".grid_element"},
 	mesas_load: {n: "mesas_load", id: "#mesas_load", class: ".mesas_load"},
    mesa_: {n: "_mesa_", id: "#_mesa_", class: "._mesa_"},
 	not_click: {n: "not-click", id: "#not-click", class: ".not-click"},
 	grid_body: {n: "grid_body", id: "#grid_body", class: ".grid_body"},
 	grid_body_2: {n: "grid_body_2", id: "#grid_body_2", class: ".grid_body_2"},
 	grid_footer: {n: "grid_footer", id: "#grid_footer", class: ".grid_footer"},
 	total_mesa_: {n: "total_mesa_", id: "#total_mesa_", class: ".total_mesa_"},
 	livre: {n: "livre", id: "#livre", class: ".livre"},
 	mesas_load_livres: {n: "mesas_load_livres", id: "#mesas_load_livres", class: ".mesas_load_livres"},
    mesas_load_ocupadas: {n: "mesas_load_ocupadas", id: "#mesas_load_ocupadas", class: ".mesas_load_ocupadas"},
    mesas_view: {n: "mesas_view", id: "#mesas_view", class: ".mesas_view"},
 	livres_c: {n: "livres_c", id: "#livres_c", class: ".livres_c"},
 	ocupadas_c: {n: "ocupadas_c", id: "#ocupadas_c", class: ".ocupadas_c"},
 	reservada_c: {n: "reservada_c", id: "#reservada_c", class: ".reservada_c"},
 	geral_c: {n: "geral_c", id: "#geral_c", class: ".geral_c"},
 	achadas_c: {n: "achadas_c", id: "#achadas_c", class: ".achadas_c"},
 	load_bar: {n: "bar", id: "#bar", class: ".bar"},
 	achadas_c_resultado: {n: "achadas_c_resultado", id: "#achadas_c_resultado", class: ".achadas_c_resultado"},
 	for_fieldset: {n: "for_fieldset", id: "#for_fieldset", class: ".for_fieldset"},
 	total_show: {n: "total_show", id: "#total_show", class: ".total_show"},
 	total_itens: {n: "total_itens", id: "#total_itens", class: ".total_itens"},
 	vendedores_garcom: {n: "vendedores_garcom", id: "#vendedores_garcom", class: ".vendedores_garcom"},
 	garcons_list: {n: "garcons_list", id: "#garcons_list", class: ".garcons_list"},
 	mostre_d: {n: "mostre_d", id: "#mostre_d", class: ".mostre_d"},
 	carregar_tabela_prod: {n: "carregar_tabela_prod", id: "#carregar_tabela_prod", class: ".carregar_tabela_prod"},
 	listar_produtos: {n: "listar_produtos", id: "#listar_produtos", class:".listar_produtos"}, 	
 	subTotal_add: {n: "subTotal_add", id: "#subTotal_add", class:".subTotal_add"}, 	
 	div_load_campo_produtos: {n: "div_load_campo_produtos", id: "#div_load_campo_produtos", class:".div_load_campo_produtos"}, 	
 	listar_produtos_pagina: {n: "listar_produtos_pagina", id: "#listar_produtos_pagina", class:".listar_produtos_pagina"}, 	
 	barra_progresso_alerta: {n: "barra_progresso_alerta", id: "#barra_progresso_alerta", class:".barra_progresso_alerta"}, 	
 	listar_elemento_grid: {n: "listar_elemento_grid", id: "#listar_elemento_grid", class:".listar_elemento_grid"}, 	
 	row: {n: "row", id: "#row", class: ".form-group"},
 	input_field: {n: "input-field", id: "#input-field", class: ".form-control"},
 	input_field2: {n: "input-group", id: "#input-group", class: ".input-group"},
 	data_filtrar_reserva: {n: "data_filtrar_reserva", id: "#data_filtrar_reserva", class: ".data_filtrar_reserva"},
 	div_editar_reserva: {n: "div_editar_reserva", id: "#div_editar_reserva", class: ".div_editar_reserva"},
 	reservada_classe: {n: "reservada_classe", id: "#reservada_classe", class: ".reservada_classe"},
 	pagto_universal: {n: "pagto_universal", id: "#pagto_universal", class: ".pagto_universal"},
 	forma_pgto: {n: "forma_pgto", id: "#forma_pgto", class: ".forma_pgto"},
 	conteudo_produtos: {n: "conteudo_produtos", id: "#conteudo_produtos", class: ".conteudo_produtos"},
 	load_pedidos: {n: "load_pedidos", id: "#load_pedidos", class: ".load_pedidos"},
 	load_vendas: {n: "load_vendas", id: "#load_vendas", class: ".load_vendas"},
 	div_total: {n: "div_total", id: "#div_total", class: ".div_total"},
 	div_troco: {n: "div_troco", id: "#div_troco", class: ".div_troco"},
 	div_total_tab_pagto: {n: "div_total_tab_pagto", id: "#div_total_tab_pagto", class: ".div_total_tab_pagto"},
 	pago_venda_tab: {n: "pago_venda_tab", id: "#pago_venda_tab", class: ".pago_venda_tab"},
	pagto_tab: {n: "pagto_tab", id: "#pagto_tab", class: ".pagto_tab"}, 
	livre_pagto_universal: {n: "livre_pagto_universal", id: "#livre_pagto_universal", class: ".livre_pagto_universal"},	
	tabs_pagto: {n: "tabs_pagto", id: "#tabs_pagto", class: ".tabs_pagto"},	
	div_tabela_prdts: {n: "div-tabela-prdts", id: "#div-tabela-prdts", class: ".div-tabela-prdts"},	
	div_btn_finalizar: {n: "div_btn_finalizar", id: "#div_btn_finalizar", class: ".div_btn_finalizar"},	
	conteudo_listar: {n: "conteudo-listar", id: "#conteudo-listar", class: ".conteudo-listar"},	
	img_prd: {n: "img_prd", id: "#img_prd", class: ".img_prd"},	
	produtos_vendas: {n: "produtos_vendas", id: "#produtos_vendas", class: ".produtos_vendas"},	
	produto_div_: {n: "produto_div_", id: "#produto_div_", class: ".produto_div_"},	
	grid_prdts: {n: "grid_prdts", id: "#grid_prdts", class: ".grid_prdts"},	
	grid_prdts_body: {n: "grid_prdts_body", id: "#grid_prdts_body", class: ".grid_prdts_body"},	
	thumb_prdts: {n: "thumb_prdts", id: "#thumb_prdts", class: ".thumb_prdts"},	
	descr_prdts: {n: "descr_prdts", id: "#descr_prdts", class: ".descr_prdts"},	
	conteudo_subprincipal: {n: "conteudo-subprincipal", id: "#conteudo-subprincipal", class: ".conteudo-subprincipal"},
	liberar_banco: "liberar-banco",	
	div_valores_tb: "div_valores_tb",
	inputs_periodo: "inputs-periodo",
	cadastro_cheque_tab: "cadastro_cheque_tab",
	lista_cheque_tab: "lista_cheque_tab",
	div_tabela_nfe: "div_tabela_nfe",
	custom_combobox: "custom-combobox",
	progresso_envio_boletos: "progresso_envio_boletos",
	div_tabela_boletos: "div_tabela_boletos",
	cabec_nfe: 'cabec_nfe',
	div_tabela_nfe: 'div_tabela_nfe',
	rodape_nfe: 'rodape_nfe',
	dados_import_nota: 'dados_import_nota',
	div_pagto_xml: "div_pagto_xml",
 };
 // Botões e links
 var $botao = {
 	btn_action_modal: {n: "btn-action-modal", id: "#btn-action-modal", class: ".btn-action-modal"},
 	btn_modal_config: {n: "btn-modal-config", id: "#btn-modal-config", class: ".btn-modal-config"},
 	btn_confirm_config: {n: "btn_confirm_config", id: "#btn_confirm_config", class: ".btn_confirm_config"},
 	exit_config: {n: "exit_config", id: "#exit_config", class: ".exit_config"},
 	fechar_alerta: {n: "close-jq-toast-single", id: "#close-jq-toast-single", class: ".close-jq-toast-single"},
	open_modal_sair: {n: "open_modal_sair", id: "#open_modal_sair", class: ".open_modal_sair"},
	link_pag_interna: {n: "link_pag_interna", id: "#link_pag_interna", class: ".link_pag_interna"},
	active: {n: "active", id: "#active", class: ".active"},
	btn_grupo_mesas: {n: "btn-grupo-mesas", id: "#btn-grupo-mesas", class: ".btn-grupo-mesas"},
	btn_acao_tabela_reserva: {n: "acao_tabela_reserva", id: "#acao_tabela_reserva", class: ".acao_tabela_reserva"},
	btn_acao_tabela_consumo: {n: "acao_tabela_consumo", id: "#acao_tabela_consumo", class: ".acao_tabela_consumo"},
	btn_limpar_filtro: {n: "btn_limpar_filtro", id: "#btn_limpar_filtro", class: ".btn_limpar_filtro"},
	aba_pagamentos: {n: "aba_pagamentos", id: "#aba_pagamentos", class: ".aba_pagamentos"},
	botao_finalizar_venda: {n: "botao_finalizar_venda", id: "#botao_finalizar_venda", class: ".botao_finalizar_venda"},
	btn_remover_item: {n: "btn_remover_item", id: "#btn_remover_item", class: ".btn_remover_item"},
	btn_remove_pgto: {n: "btn-remove-pgto", id: "#btn-remove-pgto", class: ".btn-remove-pgto"},
	bar_ico: {n: "bar-ico", id: "#bar-ico", class: ".bar-ico"},
	dropdown_menu: {n: "dropdown_menu", id: "#dropdown_menu", class: ".dropdown_menu"},
	btn_gerar_lote: "btn-gerar-lote",
	btn_gerar: "btn_gerar",
	btn_mais_lote: "btn-mais-lote",
	btn_remover_forma_pagto: "btn-remover-forma-pagto",
	btn_desfazer_lote: "btn-desfazer-lote",
	remover_cheque: "remover-cheque",
	btn_importar_xml: "btn_importar_xml",
	rmv_item: "rmv_item",
	btn_tabela_grade: "btn-tabela-grade",
	rmv_prod_grade: "rmv_prod_grade",
	btn_limpar: 'btn_limpar',
	add_grade: "add_grade",
	btn_acao: "btn_acao",
	abrir_file: "abrir-file",
	baixar_boletos: "baixar_boletos",
	btn_multiplas_formas: 'btn-multiplas-formas',
	rmv_forma_pagto: 'rmv_forma_pagto',
	importar_xml: "importar-xml",
	enviar_produtos_xml: 'enviar_produtos_xml',
	criar_produtos: "criar-produtos",
	voltar_sc: "voltar-sc",
}
 // Inputs
 var $inputs = {
 	rcperson: "r-c-person",
 	select_forma: "select-forma",
 	dp3: "dp3",
 	data_pk: "data-pk",
	data_pk1: "data-pk1",
	data_pk2: "data-pk2",
	tipo_escolha: "tipo_escolha",
	valor_pagar: "valor_pagar",
	desc_acres: "desc_acres",
	num_lote: "num_lote",
	numero_formatado: "numero_formatado",
	numero_formatado_dinheiro: "numero_formatado_dinheiro",
	venc_lote: "venc_lote",
	valor_lote: "valor_lote",
	valor_pago: "valor_pago",
	hidden_desc_acres: "desc_acres_h",
	select_conta: "select-conta",
	doc: "doc",
	banco_cheque: "banco_cheque",
	agencia_cheque: "agencia_cheque",
	conta_cheque: "conta_cheque",
	numero_cheque: "numero_cheque",
	vencimento_cheque: "vencimento_cheque",
	valor_cheque: "valor_cheque",
	cpf_cnpj_cheque: "cpf_cnpj_cheque",
	campo_data: "campo_data",
	valores_cheques_add: "valores_cheques_add",
	_saida: "_saida",
	data_servico: 'data_servico',
	previsao: 'previsao',
	cfop: "cfop",
	inp_codigo: "inp_codigo",
	combobox: "combobox",
	nome_cliente_destin: "nome_cliente_destin",
	cpf_cnpj: "cpf_cnpj",
	select_grade: "select-grade",
	desc_produto: "desc_produto",
	quantidade_grade: "quantidade_grade",
	tamanho_modal_grade: "tamanho_modal_grade",
	cor_modal_grade: "cor_modal_grade",
	controlar_qntd_grade: 'controlar_qntd_grade',
	prod_grade: "prod_grade",
	somente_numero:"somente-numero",
	money_qnt: "money_qnt",
	money: "money",
	modelo_doc: "modelo_doc",
	chave_nfe: "chave_nfe",
	autorizacao_nfe: "autorizacao_nfe",
	ajax_relatorio: 'ajax_relatorio',
	select_pai_menu: 'select-pai-menu',
	input_parametro: "input_parametro",
	documento: "documento",
	turno: "turno",
	pdv: "pdv",
	serie: "serie",
	preco_compra: "preco_compra",
	quantidade: "quantidade",
	ncm: "ncm",
	valor_icms_st: "valor_icms_st",
	aliquota_icms: "aliquota_icms",
	inp_cliente: "inp_cliente",
	cep: "cep",
	endereco: "endereco",
	tel: "tel",
	bairro: "bairro",
	cidade: "cidade",
	uf: "uf",
	numero: "numero",
	selecionar_todos: "selecionar-todos",
	data_consultar: "data_consultar",
	select_bancos: "select-bancos",
	total_acrescimo: "total_acrescimo",
	total_produtos: "total_produtos",
	total_pedido: "total_pedido",
	total_nfe: "total_nfe",
	vendedor: "vendedor",
	forma_pagto: "forma_pagto",
	valor_forma_pagto: "valor_forma_pagto",
	select_forma_pagto: "select_forma_pagto",
	total_valor_pago: "total_valor_pago",
	dados_json: 'DadosJSONSend',
	data_transferencia: 'data_transferencia',
	entidade_id: 'entidade_id',
	setor_destino: 'setor_destino',
	setor_origem: 'setor_origem',
	id_produto: 'id_produto',
	/* PDV */
	pesquisar_mesa: {n: "pesquisar_mesa", id: "#pesquisar_mesa", class: ".pesquisar_mesa"},
    buscar_produtos: {n: "buscar_produtos", id: "#buscar_produtos", class: ".buscar_produtos"},
    nome_add_produto: {n: "nome_add_produto", id: "#nome_add_produto", class: ".nome_add_produto"},
    quant_add_produto: {n: "quant_add_produto", id: "#quant_add_produto", class: ".quant_add_produto"},
    enviar_itens_mesas: {n: "enviar_itens_mesas", id: "#enviar_itens_mesas", class: ".enviar_itens_mesas"},
    enviar_total_mesas: {n: "enviar_total_mesas", id: "#enviar_total_mesas", class: ".enviar_total_mesas"},
    enviar_vendedor_mesas: {n: "enviar_vendedor_mesas", id: "#enviar_vendedor_mesas", class: ".enviar_vendedor_mesas"},
    enviar_enviado_de_mesas: {n: "enviar_enviado_de_mesas", id: "#enviar_enviado_de_mesas", class: ".enviar_enviado_de_mesas"},
    enviar_pre_venda_id: {n: "enviar_pre_venda_id", id: "#enviar_pre_venda_id", class: ".enviar_pre_venda_id"},
    campo_mesa_transferir: {n: "campo_mesa_transferir", id: "#campo_mesa_transferir", class: ".campo_mesa_transferir"},
    input_invalido: {n: "input-invalido", id: "#input-invalido", class: ".input-invalido"},
    data_reserva: {n: "data_reserva", id: "#data_reserva", class: ".data_reserva"},
    numero_ocupantes: {n: "numero_ocupantes", id: "#numero_ocupantes", class: ".numero_ocupantes"},
    nome_reserva: {n: "nome_reserva", id: "#nome_reserva", class: ".nome_reserva"},
    campo_filtrar_reserva: {n: "campo_filtrar_reserva", id: "#campo_filtrar_reserva", class: ".campo_filtrar_reserva"},
    data_use_format: {n: "data_use_format", id: "#data_use_format", class: ".data_use_format"},
    data_use: {n: "data_use", id: "#data_use", class: ".data_use"},
    motivo_cancelamento: {n: "motivo_cancelamento", id: "#motivo_cancelamento", class: ".motivo_cancelamento"},
    codigo_prod: {n: "codigo_prod", id: "#codigo_prod", class: ".codigo_prod"},
    preco_poduto: {n: "preco_poduto", id: "#preco_poduto", class: ".preco_poduto"},
    qntd_produto: {n: "qntd_produto", id: "#qntd_produto", class: ".qntd_produto"},
    nome_produto: {n: "nome_produto", id: "#nome_produto", class: ".nome_produto"},
    total_venda: {n: "total_venda", id: "#total_venda", class: ".total_venda"},
    select_pagamento: {n: "select_pagamento", id: "#select_pagamento", class: ".select_pagamento"},
    valor_pago_input: {n: "valor_pago_input", id: "#valor_pago_input", class: ".valor_pago_input"},
    input_vendedor: {n: "input_vendedor", id: "#input_vendedor", class: ".input_vendedor"},
    total_pago_hidden: {n: "total_pago_hidden", id: "#total_pago_hidden", class: ".total_pago_hidden"},
    total_desconto: {n: "total_desconto", id: "#total_desconto", class: ".total_desconto"},
    total_desc_per: {n: "total_desc_per", id: "#total_desc_per", class: ".total_desc_per"},
    total_acre: {n: "total_acre", id: "#total_acre", class: ".total_acre"},
    total_acre_per: {n: "total_acre_per", id: "#total_acre_per", class: ".total_acre_per"},
    total_pagar_hidden: {n: "total_pagar_hidden", id: "#total_pagar_hidden", class: ".total_pagar_hidden"},
    input_qntd_item_venda: {n: "input_qntd_item_venda", id: "#input_qntd_item_venda", class: ".input_qntd_item_venda"},
    forma_pgto_usada: {n: "forma_pgto_usada", id: "#forma_pgto_usada", class: ".forma_pgto_usada"},
    valor_forma_pgto_usada: {n: "valor_forma_pgto_usada", id: "#valor_forma_pgto_usada", class: ".valor_forma_pgto_usada"},
    total_venda_nao_altera: {n: "total_venda_nao_altera", id: "#total_venda_nao_altera", class: ".total_venda_nao_altera"},
    produto_div_especial: {n: "produto_div_especial", id: "#produto_div_especial", class: ".produto_div_especial"},
    quantidade_div_especial: {n: "quantidade_div_especial", id: "#quantidade_div_especial", class: ".quantidade_div_especial"},
    preco_div_especial: {n: "preco_div_especial", id: "#preco_div_especial", class: ".preco_div_especial"},
	/* FIM PDV */
 };
 // Tabelas
 var $tabelas = {
 	navegavel: {n: "navegavel", id: "#navegavel", class:".navegavel"},
 	tabela_dados: 'tabela-dados',
 	formas_pagto: "formas-pagto",
 	lista_cheque_tab: "lista_cheque_tab",
 	table_nfe: "table-nfe",
 	tabela_dados_nfe: "tabela_dados_nfe",
 	tabela_produtos_man: "tabela_produtos_man",
 	tabela_grades: "tabela_grades",
 	tbody_t1: "tbody_t1",
 	tabela_boletos: "tabela_boletos",
 	tabela_valores_boletos_ret: "tabela_valores_boletos_ret",
 	tabela_informacoes: "tabela-informacoes",
 	tabela_multiplas_formas_pagto: 'tabela_multiplas_formas_pagto',
 	tabela_dados_fatura: 'tabela_dados_fatura',
 	tabela_transferencia: 'tabela_transferencia',
 	 /* PDV */
 	tbl_list_reservadas: {n: "tbl_list_reservadas", id: "#tbl_list_reservadas", class:".tbl_list_reservadas"},
    tr_lista_reserva_: {n: "tr_lista_reserva_", id: "#tr_lista_reserva_", class:".tr_lista_reserva_"},
    mesa_tabela: {n: "mesa_tabela", id: "#mesa_tabela", class:".mesa_tabela"},
    tr_consumo: {n: "consumo_", id: "#consumo_", class:".consumo_"},
    tr_selecionado: {n: "tr_selecionado", id: "#tr_selecionado", class:".tr_selecionado"},
    tabela_produtos: {n: "tabela_produtos", id: "#tabela_produtos", class:".tabela_produtos"},
    tabela_produtos_vendas: {n: "tabela-produtos-vendas", id: "#tabela-produtos-vendas", class:".tabela-produtos-vendas"},
    tabela_pagto: {n: "tabela-pagto", id: "#tabela-pagto", class:".tabela-pagto"},
    tabela_info_pagamentos: {n: "tabela_info_pagamentos", id: "#tabela_info_pagamentos", class:".tabela_info_pagamentos"},
    tr_item_venda: {n: "tr_item_venda_", id: "#tr_item_venda_", class:".tr_item_venda_"},
    tr_tabela_formas_pagto: {n: "tr_tabela_formas_pagto", id: "#tr_tabela_formas_pagto", class:".tr_tabela_formas_pagto"},
 	/* FIM PDV */
 };
 // Modais
 var $modais = {
 	modal_search_con: {n: "modal_search_con", id: "#modal_search_con", class: ".modal_search_con"}, // n -> normal, id -> tipo id, class -> tipo class
 	modal_confirmar: {n: "modal_confirmar", id: "#modal_confirmar", class: ".modal_confirmar"}, // n -> normal, id -> tipo id, class -> tipo class
 	modal_alerta_erro: {n: "modal_alerta_erro", id: "#modal_alerta_erro", class: ".modal_alerta_erro"}, // n -> normal, id -> tipo id, class -> tipo class
 	modal_fatura: "modal_fatura",
 	modal_cheque: "modal_cheque",
 	modal_import_xml: "modal_import_xml",
 	modal_produto_grade: "modal_produto_grade",
 	modal_tamanho_grade: "modal_tamanho_grade",
 	modal_cor_grade: "modal_cor_grade",
 	modal_parametros: "modal_parametros",
 	modal_envio_progresso: "modal_envio_progresso",
 	modal_multiplas_formas_pagto: "modal_multiplas_formas_pagto",
 	modal_criar_produtos: 'modal_criar_produtos',
 	/* PDV */
 	modal_mesa: {n: "modal_mesa", id: "#modal_mesa", class: ".modal_mesa"}, // n -> normal, id -> tipo id, class -> tipo class
    modal_produtos: {n: "modal_produtos", id: "#modal_produtos", class: ".modal_produtos"}, // n -> normal, id -> tipo id, class -> tipo class
 	modal_transferencia_parcial: {n: "modal_transferencia_parcial", id: "#modal_transferencia_parcial", class: ".modal_transferencia_parcial"}, // n -> normal, id -> tipo id, class -> tipo class
	modal_reservar: {n: "modal_reservar", id: "#modal_reservar", class: ".modal_reservar"}, // n -> normal, id -> tipo id, class -> tipo class
    modal_editar_reserva: {n: "modal_editar_reserva", id: "#modal_editar_reserva", class: ".modal_editar_reserva"}, // n -> normal, id -> tipo id, class -> tipo class
 	/* FIM PDV */
 };
 // Forms 
 var $form = {
 	dados_pagamento: "dados_pagamento",
 	filtrar_contas: "filtrar-contas",
 	enviar_fatura: "enviar_fatura",
 	dados_cheque_add: "dados_cheque_add",
 	dados_cheques_adicionados: "dados_cheques_adicionados",
 	dados_produtos: "dados_produtos",
 	dados_produtos: "dados_produtos",
 	dados_filtros: "dados_filtros",
 	form_enviar_retorno: "form_enviar_retorno",
 	dados_baixar_boleto: "dados_baixar_boleto",
 	/* PDV */
	enviar_mesa: {n: "enviar_mesa", id: "#enviar_mesa", class: ".enviar_mesa"},
    dados_reservar: {n: "dados_reservar", id: "#dados_reservar", class: ".dados_reservar"},
    enviar_filtro: {n: "enviar-filtro", id: "#enviar-filtro", class: ".enviar-filtro"},
    enviar_dados_vendas: {n: "enviar_dados_vendas", id: "#enviar_dados_vendas", class: ".enviar_dados_vendas"},
    enviar_dados_tab_pagto: {n: "enviar_dados_tab_pagto", id: "#enviar_dados_tab_pagto", class: ".enviar_dados_tab_pagto"},
 	/* FIM PDV */
 }
 var $ClassesAvulsas = {
 	//EscFhecara: "EscFhecara",
 	is_edicao: 'is_edicao',
 	diferenciar: 'diferenciar',
 	principal: 'principal',
 	tbody_t1: "tbody_t1",
 	n_gerar: "n_gerar",
 	grade_td: "grade_td",
 	sem_principal: 'sem_principal',
 	concluido: 'concluido',
 	emitido: 'emitido', 
 	ativo: 'ativo',
 	chosen_ativar: 'chosen-ativar', 
 }
 // Roles
 var $roles = {
 	role_id_seq: "role-id-seq",
 	role_vendedor: "role-vendedor",
 	role_last_vend: "role-last-vend",
	role_is_pre: "role-is-pre",
	role_comanda: "role-comanda",
	role_numero_pre: "role-numero-pre",
	role_id_pre: "role-id-pre",
	role_card: "role-card",
	valor: "valor",
	valor2: "valor2",
	usar_input: "usar_input",
	role_use: "role-use",
	role_val: "role-val",
	role_data_last: "role-data-last",
	role_status: "role-status",
	role_id_item_pre: "role-id-item-pre",
	role_und_medida: "role-und-medida",
	role_cod: "role-cod",
	role_preco: "role-preco",
	role_preco_format: "role-preco-format",
	role_quant: "role-quant",
	role_nome: "role-nome",
	role_cod: "role-cod",
	role_id: "role-id",
	role_max: "role-max",
	role_espaco_branco: "role-espaco-branco",
	role_page: "role-page",
	role_cod: "role-cod",
	role_max: "role-max",
	role_page: "role-page",
	role_cod: "role-cod",
	role_execute: "role-execute",
	role_execute_muitos: "role-execute-muitos",
	role_execute_err: "role-execute-err", 
	data_page: "data-page",
	role_isSystem: "role-isSystem",
	role_data_tb_func: "data-tb-func",
	role_no_exec: "no-exec",
	role_itens_menu: "role-itens-menu", // Array com o nome da opção e a função a ser executada -> [['nome_opcao', 'Funcao_exec', ['argumentos_da_funcao?...?...']]; ['...','...']] -> Obs: a separação entre elementos é feita via ponto e vírgula (;). A separacao dos argumentos é feita via interrogação (?)
	role_data_action: "data-action",
	role_data_action_exec: "data-action-exec",
	role_tb_option: "tb_option",
	role_url: "role-url",
	role_total: "role-total",
	role_last_vend: "role-last-vend",
	role_tipo: "role-tipo",
	role_acao: "role-acao",
	role_mesa_id: "role-mesa-id",
	role_mesa: "role-mesa",
	role_prdt_pre_venda: "role-produto-pre",
	role_tr_btn: "role-tr-btn",
	role_produto_id: "role-prdt-id",
	role_produto_preco: "role-prdt-preco",
	role_id_prevenda: "role-id-prevenda",
	role_desc_max: "role-desc-max",
	role_usar_img: "role-usar-img",
	retorno: "retorno",
	script: 'script',
	evento: 'evento',
	somenteNumeros: 'somenteNumeros',
	aceitarPorcentagem: 'aceitarPorcentagem',
	pressedInput: 'role-pressed',
	pressedInput_id: 'role-pressed-id',
	usar_keypress: 'usar-keypress',
	usar_keyup: 'usar-keyup',
	e_modal: 'e_modal',
	enterFocus: 'enterFocus',
	ReturnPressed: 'ReturnPressed',
	FocusBtn: 'FocusBtn',
	data_option: "data-option",
	data_bank: "data-bank",
	data_format: "data-format",
	pag: "pag",
	faturas: "faturas",
	role_name: "role-name",
	role_negativo: "role-negativo",
	role_grade: "role-grade",
	role_obrig_grade: "role-obrig-grade",
	role_cor: "role-cor",
	role_tam: "role-tam",
	role_option: "role-option-select",
	role_atualizar: "role-atualizar",
	role_item: "role-item",
	role_ultimo_item: "role-ultimo-item",
	role_opcs_ajax: "opcs_ajax",
	role_format: "role-format",
	role_option_select: 'role-option-select',
	role_option_numero: 'role-option-numero',
	role_mov_estoque: 'role-mov-estoque',
	role_texto_exibir: 'role-texto-exibir',
	role_filial: 'role-filial',
	role_regex_texto_exibir: 'role-regex-texto-exibir',
	opcoes_regex: 'opcoes-regex'
 };

 // Variaveis sistema Stimul
var $sysRela = {
	_filter: '_filter',
	_user: '_user',
}
// Teclas de atalho para o modo PC
 var $keys = { 
      f1: {key: 112, text: '(F1)' },
      f2: {key: 113, text: '(F2)' },
      f3: {key: 114, text: '(F3)' },
      f4: {key: 115, text: '(F4)' },
      f5: {key: 116, text: '(F5)' },
      f6: {key: 117, text: '(F6)' },
      f7: {key: 118, text: '(F7)' },
      f8: {key: 119, text: '(F8)' },
      f9: {key: 120, text: '(F9)' },
      f10: {key: 121, text: '(F10)' },
      f11: {key: 122, text: '(F11)' },
      f12: {key: 123, text: '(F12)' },
      add: {key: 107, text: '' }, // mais -> numpad
      sub: {key: 109, text: '' }, // menos -> numpad
      r_item: {key: 46, text: '' }, // menos -> numpad
      enter: {key: 13, text: ''},
      esc: {key: 27, text: ''},      
      tab: {key: 9, text: ''},
      d1: {key: 40, text: '' }, //Direcionais -> Abaixo
      d2: {key: 38, text: '' }, // -> Acima
      d3: {key: 37, text: '' }, // -> Esquerda
      d4: {key: 39, text: '' }, // -> Direita
 };
 // Para traduzir o plugin de tabela
var idioma = {
    "sEmptyTable": "Nenhum registro encontrado",
    "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
    "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
    "sInfoFiltered": "(Filtrados de _MAX_ registros)",
    "sInfoPostFix": "",
    "sInfoThousands": ".",
    "sLengthMenu": "_MENU_ resultados por página",
    "sLoadingRecords": "Carregando...",
    "sProcessing": "Processando...",
    "sZeroRecords": "Nenhum registro encontrado",
    "sSearch": "", //Pesquisar
    "oPaginate": {
        "sNext": "Próximo",
        "sPrevious": "Anterior",
        "sFirst": "Primeiro",
        "sLast": "Último"
    },
    "oAria": {
        "sSortAscending": ": Ordenar colunas de forma ascendente",
        "sSortDescending": ": Ordenar colunas de forma descendente"
    },
	"decimal": ",",
	"thousands": "."
}
// Opções do plugin de data
var options_datePicker = {
    changeMonth: true,
    changeYear: true,
};