/* 
	Arquivo que contém as definições de configurações do sistema
*/
 // API
 var porta = window.location.port.length == 0 ? '80' : window.location.port,
 pasta_api = window.location.pathname.match(/(.*)\/Nathan\//),
 pasta_api_usa = pasta_api == null ? '/Nathan/infoerp/_lib/Nathan/' : pasta_api[0];

 if( window.location.pathname.indexOf('index.php') != -1) pasta_api_usa += 'index.php/';


$api.pasta_api =  pasta_api_usa+$api.pasta_api;
$api.porta =  porta;
var URL_static = window.location.hostname;//'127.0.0.1',//'192.168.1.32'//127.0.0.1; // 192.168.0.205
$URL_BASE = $api.protcolo+URL_static+":"+$api.porta+$api.pasta_api,
$TYPE_BASE = $api.request,
$liberar = true;


