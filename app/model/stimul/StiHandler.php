<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:45
 */

namespace AppModel\stimul;
use AppCore\Engine;
use StdClass;
use phpmailerException;
use PHPMailer\PHPMailer\PHPMailer;
use Exception;

class StiHandler extends Stimul
{
    private function checkEventResult($event, $args) {
        if (isset($event)) $result = $event($args);
        if (!isset($result)) $result = StiResult::success();
        if ($result === true) return StiResult::success();
        if ($result === false) return StiResult::error();
        if (gettype($result) == "string") return StiResult::error($result);
        if (isset($args)) $result->object = $args;
        return $result;
    }

    private function getQueryParameters($query) {
        $result = array();
        while (strpos($query, "{") !== false) {
            $query = substr($query, strpos($query, "{") + 1);
            $parameterName = substr($query, 0, strpos($query, "}"));
            $result[$parameterName] = null;
        }

        return $result;
    }

    private function applyQueryParameters($query, $values) {
        $result = "";

        while (strpos($query, "{") !== false) {
            $result .= substr($query, 0, strpos($query, "{"));
            $query = substr($query, strpos($query, "{") + 1);
            $parameterName = substr($query, 0, strpos($query, "}"));
            if (isset($values) && isset($values[$parameterName]) && !is_null($values[$parameterName])) $result .= strval($values[$parameterName]);
            else $result .= "{".$parameterName."}";
            $query = substr($query, strpos($query, "}") + 1);
        }
        return $result.$query;
    }

//--- Events

    public $onBeginProcessData = null;
    private function invokeBeginProcessData($request) {
        $args = new stdClass();
        $args->sender = $request->sender;
        $args->database = $request->database;
        $args->connectionString = isset($request->connectionString) ? $request->connectionString : null;
        $args->queryString = isset($request->queryString) ? $request->queryString : null;
        $args->dataSource = isset($request->dataSource) ? $request->dataSource : null;
        $args->connection = isset($request->connection) ? $request->connection : null;

        if (isset($request->queryString)) $args->parameters = $this->getQueryParameters($request->queryString);

        $result = $this->checkEventResult($this->onBeginProcessData, $args);
        if (isset($result->object->queryString) && isset($args->parameters)) $result->object->queryString = $this->applyQueryParameters($result->object->queryString, $args->parameters);
        return $result;
    }

    public $onEndProcessData = null;
    private function invokeEndProcessData($request, $result) {
        $args = new stdClass();
        $args->sender = $request->sender;
        $args->result = $result;
        return $this->checkEventResult($this->onEndProcessData, $args);
    }

    public $onCreateReport = null;
    private function invokeCreateReport($request) {
        $args = new stdClass();
        $args->sender = $request->sender;
        return $this->checkEventResult($this->onCreateReport, $args);
    }

    public $onOpenReport = null;
    private function invokeOpenReport($request) {
        $args = new stdClass();
        $args->sender = $request->sender;
        return $this->checkEventResult($this->onOpenReport, $args);
    }

    public $onSaveReport = null;
    private function invokeSaveReport($request) {
        $args = new stdClass();
        $args->sender = $request->sender;
        $args->report = $request->report;
        $args->reportJson = $request->reportJson;
        $args->fileName = $request->fileName;
        return $this->checkEventResult($this->onSaveReport, $args);
    }

    public $onSaveAsReport = null;
    private function invokeSaveAsReport($request) {
        $args = new stdClass();
        $args->sender = $request->sender;
        $args->report = $request->report;
        $args->reportJson = $request->reportJson;
        $args->fileName = $request->fileName;
        return $this->checkEventResult($this->onSaveAsReport, $args);
    }

    public $onPrintReport = null;
    private function invokePrintReport($request) {
        $args = new stdClass();
        $args->sender = $request->sender;
        $args->fileName = $request->fileName;
        return $this->checkEventResult($this->onPrintReport, $args);
    }

    public $onBeginExportReport = null;
    private function invokeBeginExportReport($request) {
        $args = new stdClass();
        $args->sender = $request->sender;
        $args->settings = $request->settings;
        $args->format = $request->format;
        $args->fileName = $request->fileName;
        return $this->checkEventResult($this->onBeginExportReport, $args);
    }

    public $onEndExportReport = null;
    private function invokeEndExportReport($request) {
        $args = new stdClass();
        $args->sender = $request->sender;
        $args->format = $request->format;
        $args->fileName = $request->fileName;
        $args->data = $request->data;
        return $this->checkEventResult($this->onEndExportReport, $args);
    }

    public $onEmailReport = null;
    private function invokeEmailReport($request) {
        $settings = new StiEmailSettings();
        $settings->to = $request->settings->email;
        $settings->subject = $request->settings->subject;
        $settings->message = $request->settings->message;
        $settings->attachmentName = $request->fileName.'.'.$this->getFileExtension($request->format);

        $args = new stdClass();
        $args->sender = $request->sender;
        $args->settings = $settings;
        $args->format = $request->format;
        $args->fileName = $request->fileName;
        $args->data = base64_decode($request->data);

        $result = $this->checkEventResult($this->onEmailReport, $args);
        if (!$result->success) return $result;

        $guid = substr(md5(uniqid().mt_rand()), 0, 12);

        $pasta_salvar = $this->engine()->criarPasta(Engine::PASTA_ARQUIVOS_TMP.'/stimul/');
        $this->engine()->saveArquivo($pasta_salvar.$guid.'.'.$args->fileName, $args->data, false);

        // Detect auth mode
        $auth = $settings->host != null && $settings->login != null && $settings->password != null;

        $mail = new PHPMailer(true);
        if ($auth) $mail->IsSMTP();
        //var_dump($settings); exit;
        //$entidade = new Entidade();
        //$entidade = $this->container->entidade;
        try {
            /*$configs_smtp = $entidade->getDadosSMTP();
            $auth_smtp = false;
            $cript_smtp = false;
            $host = $configs_smtp->HOST;
            if(strpos($configs_smtp->HOST, '://') != false) {
                $cript_smtp = explode('://', $configs_smtp->HOST);
                $host = $cript_smtp[1];
                $cript_smtp = $cript_smtp[0];
                $auth_smtp = true;
            }*/

            $mail->CharSet = $settings->charset;
            $mail->IsHTML(false);
            $mail->From = $settings->to;//(!empty($configs_smtp->EMAIL)) ? $configs_smtp->EMAIL : $configs_smtp->LOGIN;
            $mail->FromName = $settings->name; // 'Nathan'

            // Add Emails list
            $emails = preg_split('/,|;/', $request->settings->email);
            foreach ($emails as $request->email) {
                $mail->AddAddress(trim($request->email));
            }

            // Fill email fields
            $mail->Subject = htmlspecialchars($settings->subject);
            $mail->Body = $settings->message;
            $mail->AddAttachment($pasta_salvar.$guid.'.'.$args->fileName, $settings->attachmentName);

            // Fill auth fields
            if ($auth) {
                $mail->Host = $settings->host; //$host;
                $mail->Port = $settings->port; // $configs_smtp->PORTA;
                $mail->SMTPAuth = $settings->auth_smtp;//$auth_smtp;
                $mail->SMTPSecure = $settings->secure; //$cript_smtp;
                $mail->Username = $settings->login; //$configs_smtp->LOGIN;
                $mail->Password = $settings->password; //$configs_smtp->SENHA;

            }

            $mail->Send();
        }
        catch (phpmailerException $e) {
            $error = strip_tags($e->errorMessage());
            return StiResult::error($error);
        }
        catch (Exception $e) {
            $error = strip_tags($e->getMessage());
        }

        unlink($pasta_salvar.$guid.'.'.$args->fileName);

        if (isset($error)) return StiResult::error($error);
        return $result;
    }

    public $onDesignReport = null;
    private function invokeDesignReport($request) {
        $args = new stdClass();
        $args->sender = $request->sender;
        $args->fileName = $request->fileName;
        return $this->checkEventResult($this->onDesignReport, $args);
    }

//--- Methods

    public function process($params,$response = true) {
        $result = $this->innerProcess($params);
        if ($response) StiResponse::json($result);
        return $result;
    }


//--- Private methods

    private function createConnection($args) {
        switch ($args->database) {
            //case StiDatabaseType::MySQL: $connection = new \StiMySqlAdapter(); break;
            //case StiDatabaseType::MSSQL: $connection = new \StiMsSqlAdapter(); break;
            //case StiDatabaseType::Firebird: $connection = new \StiFirebirdAdapter(); break;
            case StiDatabaseType::PostgreSQL: $connection = new StiPostgreSqlAdapter(); break;
            //case StiDatabaseType::Oracle: $connection = new \StiOracleAdapter(); break;
        }

        if (isset($connection)) {
            $connection->parse($args->connectionString);
            return StiResult::success(null, $connection);
        }

        return StiResult::error("Unknown database type [".$args->database."]");
    }

    private function innerProcess($params) {
        $request = new StiRequest();
        $result = $request->parse($params);
        if ($result->success) {
            switch ($request->event) {
                case StiEventType::BeginProcessData:
                case StiEventType::ExecuteQuery:
                    $result = $this->invokeBeginProcessData($request);
                    if (!$result->success) return $result;
                    $queryString = $result->object->queryString;
                    $array_parametros = $result->object->parameters;
                    $array_chave_parametros = array_keys($array_parametros);
                    $filtro_parametros = array_filter(
                        $array_parametros,
                        function ($key) use ($array_chave_parametros) { // N.b. $val, $key not $key, $val
                            if(isset($array_chave_parametros[$key])) {
                                return $array_chave_parametros[$key];
                            }
                        },
                        ARRAY_FILTER_USE_KEY
                    );
                    $result = $this->createConnection($result->object);
                    if (!$result->success) return $result;
                    $connection = $result->object;
                    if (isset($queryString)) $result = $connection->execute($queryString, $filtro_parametros);
                    else $result = $connection->test();
                    $result = $this->invokeEndProcessData($request, $result);
                    if (!$result->success) return $result;
                    if (isset($result->object) && isset($result->object->result)) return $result->object->result;
                    return $result;

                case StiEventType::CreateReport:
                    return $this->invokeCreateReport($request);

                case StiEventType::OpenReport:
                    return $this->invokeOpenReport($request);

                case StiEventType::SaveReport:
                    return $this->invokeSaveReport($request);

                case StiEventType::SaveAsReport:
                    return $this->invokeSaveReport($request);

                case StiEventType::PrintReport:
                    return $this->invokePrintReport($request);

                case StiEventType::BeginExportReport:
                    return $this->invokeBeginExportReport($request);

                case StiEventType::EndExportReport:
                    return $this->invokeEndExportReport($request);

                case StiEventType::EmailReport:
                    return $this->invokeEmailReport($request);

                case StiEventType::DesignReport;
                    return $this->invokeDesignReport($request);
            }

            $result = StiResult::error("Unknown event [".$request->event."]");
        }

        return $result;
    }

    private function getFileExtension($format) {
        switch ($format) {
            case StiExportFormat::Html:
            case StiExportFormat::Html5:
                return "html";

            case StiExportFormat::Pdf:
                return "pdf";

            case StiExportFormat::Excel2007:
                return "xlsx";

            case StiExportFormat::Word2007:
                return "docx";

            case StiExportFormat::Csv:
                return "csv";
        }
        return "";
    }
}