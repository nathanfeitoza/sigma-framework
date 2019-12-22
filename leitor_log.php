<style>
	.tabela {
		border: 1px solid #333;
	}
	.tabela th {
		border: 1px solid #333;
	}
	.tabela td {
		border: 1px solid #333;
	}
	.rastro p {
	    background: #e8e8e8;
	    color: #006880;
	    font-weight: 800;
	    font-size: 14px;
	    padding: 6px 11px;
	}
	.rastro {
		display: none;
	}
	.rastro.abrir {
		display: block;
	}
	.btn:hover {
		cursor: pointer;
	}
</style>
<script type="text/javascript">
	function revelar(eu) {
		var div = eu.parentNode.querySelector('.rastro');
		if (div.classList.contains('abrir')) {
			div.classList.remove('abrir');
		} else {
			div.classList.add('abrir');
		}
	}
</script>
<?php

/**
 * @Author: dev01
 * @Date:   2019-03-18 14:48:01
 * @Last Modified by:   Nathan Feitoza
 * @Last Modified time: 2019-03-28 09:57:36
 */

function leitorLog($log) {
	$quebrar = explode(' - ',$log);
	
	if (count($quebrar) != 7) {
		return -1;
	}
	
	$primeira_parte = $quebrar[0];
	preg_match('/\[+(.*?)\]/', $primeira_parte, $data_log_arr);
	
	if (count($data_log_arr) != 2) {
		return -2;
	}
	
	$remover_data = $data_log_arr[0];
	$primeira_parte = str_replace($remover_data, '', $primeira_parte);
	$data_log = $data_log_arr[1];
	
	preg_match('/(.*?):/', $primeira_parte, $tipo_log_arr);
	
	if (count($tipo_log_arr) != 2) {
		return -3;
	}
	
	$tipo_log = explode('.',$tipo_log_arr[1]);
	
	if (count($tipo_log) != 2) {
		return -4;
	}
	
	$msg_erro = str_replace($tipo_log_arr[0],'',$primeira_parte);
	
	$app_log = $tipo_log[0];
	$tipo_erro = $tipo_log[1];
	
	$cod_erro = preg_replace('/\D/i', '', $quebrar[1]);
	$cod_http_erro = preg_replace('/\D/i', '', $quebrar[2]);
	$msg_usuario = preg_replace('/Msg_Usuario:\s?/i', '', $quebrar[3]);
	$arquivo = preg_replace('/Arquivo:\s?/i', '', $quebrar[4]);
	$linha = preg_replace('/\D/i', '', $quebrar[5]);
	$rastro = preg_replace('/Rastro:\s?/i', '', $quebrar[6]);

	preg_match('/{"rastro":"(.*)"}/', $rastro, $rastro_arr);
	
	if (count($rastro_arr) == 0) {
		return -5;
	}

	$rastro = str_replace('"',"'", $rastro_arr[1]);
	$rastro = str_replace('\\','\\\\', $rastro);

	$rastro = '{"rastro":"'.$rastro.'"}';
	
	$rastro = preg_split('/#(\d*)?\s/', json_decode($rastro)->rastro);

	if (strlen(@$rastro[0]) == 0) {
		unset($rastro[0]);
		$rastro = array_values($rastro);
	}

	return [
		'app_log' => $app_log,
		'tipo_erro' => $tipo_erro,
		'data' => $data_log,
		'erro' => $msg_erro,
		'cod_erro' => $cod_erro,
		'cod_http_erro' => $cod_http_erro,
		'msg_usuario' => $msg_usuario,
		'arquivo' => $arquivo,
		'linha' => $linha,
		'rastro' => $rastro
	];
}

$nome_arq = isset($_GET['arq']) ? $_GET['arq'] : date('d-m-Y');
$arq = './logs/'.$nome_arq.'.app.log';
$parts = new SplFileObject($arq);
$log_horas = [];
$linhas_erradas = [];
$linha = 1;

foreach ($parts as $line) {
    $ler = leitorLog($line);
    
    if (is_int($ler)) {
    	$linhas_erradas[] = 'Erro na linha '.$linha.' - Cod: '.$ler;
    } else {
    	$log_horas[$ler['data']][] = $ler;
    }

    $linha++;
}

$log_horas = array_reverse($log_horas);

foreach ($log_horas as $i => $hora_log) {
	
	$head = '';
	$body = '';
	echo '<h1>'.date('d/m/Y H:i:s', strtotime($i)).'</h1>';
	foreach ($hora_log as $j => $log) {
		
		$body .= '<tr>';

		foreach ($log as $k => $valor_log) {

			if ($j == 0) {
				$th = str_replace('_',' ',$k);
				$th = ucfirst($th);
				$head .= '<th>'.$th.'</th>';
			}

			$revelador = '';
			$class = '';

			if (is_array($valor_log)) {
				$valor_reveal = implode('</p><p>',$valor_log);
				$valor_reveal = str_replace('\/','/',$valor_reveal);
				$valor_reveal = str_replace('\n','',$valor_reveal);
				$revelador = 'revelar(this)';
				$class = 'hover';
				$valor_log = '<button onclick="revelar(this)" class="btn">'.$k.'</button> <div class="rastro" onclick="event.stopPropagation();"><h3>Rastro do erro</h3><p>'.$valor_reveal.'</div>';
			}

			$body .= '<td>'.$valor_log.'</td>';
		}

		$body .= '</tr>';
	}

	echo '
	<table class="tabela">
		<thead>
			<tr>
			'.$head.'
			</tr>
		</thead>

		<tbody>
			'.$body.'
		</tbody>
	</table>	
	';	
}

/*$arq = file_get_contents($arq);
$arq = str_replace('\r',PHP_EOL,$arq);
$arq = str_replace('\n\r',PHP_EOL,$arq);
echo '<pre>';
var_dump(explode(PHP_EOL, $arq));*/
