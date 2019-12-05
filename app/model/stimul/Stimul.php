<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 08:54
 */
namespace AppModel\stimul;
use AppCore\errors\AppException;
use AppCore\Genericos;
use Exception;
use AppCore\Model;

class Stimul extends Model
{

    /**
     * Objetivo: Servir como o arquivo handler.php do stimul original
     * Recebe: dados do relatorio
     * Retorna: \Closure|string -> Dados para montagem do relatório
     * Autor: Nathan Feitoza
     * Nome Método: handler
     * obs: Este método é extremamente genérico e faz parte da cadeia do stimul.
     * Ele pode retornar os dados para montar o relatório, salvar o relatório e disparar envio de email do relatório.
     * Porém, o controle das ações é feito através das classes do próprio stimul, nos dando a closure que será
     * executada quando um evento passado na requisição seja ativado
     *
     * @param $dados_relatorio
     * @return \Closure|string
     * @autor Nathan Feitoza
     */
    public function handler($dados_relatorio)
    {
        $this->loadModel('stimul/sti_handler');
        $this->loadModel('stimul/sti_request');
        $this->loadModel('entidade/empresa');

        $empresa = $this->model_entidade_empresa;
        $handler = $this->model_stimul_sti_handler;

        $StiRequest = $this->model_stimul_sti_request;
        $dados_req = $StiRequest->parse($dados_relatorio, true);

        $beginProcess = $handler->onBeginProcessData = function ($event) {
            // Current database type: 'XML', 'JSON', 'MySQL', 'MS SQL', 'PostgreSQL', 'Firebird', 'Oracle'
            $database = $event->database;
            // Current connection name
            $connection = $event->connection;
            // Current data source name
            $dataSource = $event->dataSource;
            // Connection string for the current data source
            $connectionString = $event->connectionString;
            // SQL query string for the current data source
            $queryString = $event->queryString;

            if($event->sender == "Viewer") {
                $queryString = json_decode($queryString);

                preg_match_all("/{([^}]+)}/", $queryString[3], $output_array);

                if(isset($output_array[0])) {
                    for($i = 0, $cont_params = count($output_array[0]); $i < $cont_params; $i++) {
                        //$valor[] = $queryString[0][$i];
                        $event->parameters[] = Genericos::limparStringSQL( $queryString[0][$i] );
                        $queryString[3] = str_replace($output_array[0][$i], '?',$queryString[3]);
                    }
                }

                $usar_where_enviado = isset($queryString[5]) ? Genericos::limparStringSQL($queryString[5]) : '';
                $queryString = 'SELECT '.Genericos::limparStringSQL($queryString[1]).' FROM '.Genericos::limparStringSQL($queryString[2]).' '.$usar_where_enviado.' '.Genericos::limparStringSQL($queryString[3]);
                $event->queryString = $queryString;
                //echo'OPA';
            }
            //print_r($event);

            // You can change the connection string
            //if ($connection == "MyConnectionName")
            $event->connectionString = "Server=192.168.0.205; Database=Nathan; uid=Nathan; password=info1234;";

            // You can change the SQL query
            //if ($dataSource == "MyDataSource")
            //	$event->queryString = "SELECT * FROM MyTable";

            //$event->queryString = "SELECT * FROM entidade Where id<=1790";


            //print_r( $event->parameters );



            // You can replace the SQL query parameters with the required values
            // For example: SELECT * FROM {Variable1} WHERE Id={Variable2}
            // If the report contains a variable with this name, its value will be used instead of the specified value
            //$event->parameters["Variable1"] = "TableName";
            //$event->parameters["Variable2"] = 10;

            return StiResult::success();
            //return StiResult::error("Message for some connection error.");
        };

        $print_report = $handler->onPrintReport = function ($event) {
            return StiResult::success();
        };

        $export_report = $handler->onBeginExportReport = function ($event) {
            $settings = $event->settings;
            $format = $event->format;
            return StiResult::success();
        };

        $End_export_report = $handler->onEndExportReport = function ($event) {
            $format = $event->format; // Export format
            $data = $event->data; // Base64 export data
            $fileName = $event->fileName; // Report file name

            file_put_contents('reports/'.$fileName.'.'.strtolower($format), base64_decode($data));
            //return StiResult::success();
            return StiResult::success("Export OK. Message from server side.");
            //return StiResult::error("Export ERROR. Message from server side.");
        };

        $configs_smtp = $empresa->getDadosSMTP();

        $email_report = $handler->onEmailReport = function ($event) use ($configs_smtp){
            $auth_smtp = false;
            $cript_smtp = false;
            $host = $configs_smtp->HOST;

            if(strpos($configs_smtp->HOST, '://') != false) {
                $cript_smtp = explode('://', $configs_smtp->HOST);
                $host = $cript_smtp[1];
                $cript_smtp = $cript_smtp[0];
                $auth_smtp = true;
            }

            //$event->settings->from = "******@gmail.com";
            $event->settings->to = (!empty($configs_smtp->EMAIL)) ? $configs_smtp->EMAIL : $configs_smtp->LOGIN;
            $event->settings->host = $host;
            $event->settings->login = $configs_smtp->LOGIN;
            $event->settings->password = $configs_smtp->SENHA;
            $event->settings->port = $configs_smtp->PORTA;
            $event->settings->name = 'Nathan';
            $event->settings->auth_smtp = $auth_smtp;
            $event->settings->secure = $cript_smtp;
        };

        $design_report = $handler->onDesignReport = function ($event) {
            return StiResult::success();
        };

        $create_report = $handler->onCreateReport = function ($event) {
            $fileName = $event->fileName;
            return StiResult::success();
        };

        $save_report = $handler->onSaveReport = function ($event) {
            $report = $event->report; // Report object
            $reportJson = $event->reportJson; // Report JSON
            $fileName = isset($event->fileName->fileName) ? $event->fileName->fileName : $event->fileName; // Report file name
            $arq_mrt = Genericos::removerCaracteresEspeciais($fileName).".mrt";
            $arquivo_gravar = Genericos::getTemaDir().
                '/extensao/stimul/reports/'.strtolower($arq_mrt);

            preg_match("/img_logo\"\s?(.*)\"ImageBytes\":\"(data:image\/[^;]+;base64[^\"]+)\"}/i", $reportJson, $saida_img_logo);

            if(count($saida_img_logo) == 3) {
                $base_subs = $saida_img_logo[2];
                $img_subs = $this->container->empresa->IMGEM_LOGO_RELATORIOS;
                if(file_exists($img_subs)) {
                    $extensao = pathinfo($img_subs, PATHINFO_EXTENSION);
                    $img = file_get_contents($img_subs);
                    $base64 = 'data:image/' . $extensao . ';base64,' . base64_encode($img);

                    $reportJson = str_replace($base_subs, $base64, $reportJson);
                }


            }

            if(file_put_contents($arquivo_gravar, $reportJson)) {
                $menu = new MenuSc;
                $id_pai = !isset($event->fileName->idPai) ? null : $event->fileName->idPai;

                $dados_relatorio = ['nome_menu' => $fileName,
                    'arquivo' => $arq_mrt,
                    'id_pai' => $id_pai
                ];

                $menu->setCadastrarMenuItemRelatorio($dados_relatorio);
            } else {
                throw new AppException('Erro ao salvar o arquivo '.$fileName, 283);
            }

            //return StiResult::success();
            return StiResult::success("Save Report OK: ".$fileName);
            //return StiResult::error("Save Report ERROR. Message from server side.");
        };

        $save_Asreport = $handler->onSaveAsReport = function ($event) {
            return StiResult::success();
        };

        $handler->process($dados_relatorio);

        switch ($dados_req->event) {
            case "BeginProcessData":
                $retorno = $beginProcess;
                break;
            case "EndProcessData":
                $retorno = '';
                break;
            case "SaveReport":
                $retorno = $save_report;
                break;
            case "CreateReport":
                $retorno = $create_report;
                break;
            case "PrintReport":
                $retorno = $print_report;
                break;
            case "BeginExportReport":
                $retorno = $export_report;
                break;
            case "EndExportReport":
                $retorno = $End_export_report;
                break;
            case "EmailReport":
                $retorno = $email_report;
                break;
            case "DesignReport":
                $retorno = $design_report;
                break;
            case "SaveAsReport":
                $retorno = $save_Asreport;
                break;
        }

        return $retorno;
    }

    /**
     * Objetivo: Receber os dados via url para buscar os dados que serão usados para montagem do autocomplete no relatório
     * Recebe: dados do relatorio
     * Retorna: Retorna os dados para montagem do autocomplete no relátorio
     * Autor: Nathan Feitoza
     * Nome Método: getAutoCompleteRelatorio
     *
     * @param $dados_relatorio
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getAutoCompleteRelatorio($tabela, $campo_exibir, $campo_buscado, $pesquisar)
    {
        $campo_usar_where = $campo_exibir;
        
        preg_match("/\sas\s/", $campo_exibir, $contem_as); // Verifica se contem o "as" que seria para dar outro nome ao campo

        if(count($contem_as) != 0) { // Caso tenha "as", remove-o
            $campo_usar_where = explode('as', $campo_exibir);
            $campo_usar_where = count($campo_usar_where) == 2 ? $campo_usar_where[0] : $campo_exibir;
        }

        return $this->setMsgNaoEncontrado('Nenhum resultado encontrado para o termo buscado em '.$tabela)
            ->db()->tabela($tabela)
                ->campos([$campo_buscado,$campo_exibir])
                ->where($campo_usar_where, 'ilike','%'.(string) $pesquisar.'%')
                ->buildQuery('select');
    }

    /**
     * Objetivo: ecuperar a licença do stimul
     * Retorna: dados da licença do stimul
     * Autor: Nathan Feitoza
     * Nome Método: getLicencaStimul
     *
     * @return bool|string
     * @autor Nathan Feitoza
     */
    public function getLicenca()
    {
        if (file_exists("license.key")) {
            $license = file_get_contents("license.key");
            return $license;
        }
    }
}