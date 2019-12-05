<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:05
 */

namespace AppModel\stimul;


use AppCore\Genericos;

class StiRequest extends Stimul
{
    #use \Info\classes\MVC\MetodosGenericosTrait;

    public $sender = null;
    public $event = null;
    public $connectionString = null;
    public $queryString = null;
    public $database = null;
    public $report = null;
    public $data = null;
    public $fileName = null;
    public $format = null;
    public $settings = null;

    public function parse($data, $decodificado=false) {

        //$data = file_get_contents("php://input");
        //print_r($data);

        $obj = json_decode($data);
        if ($obj == null) return StiResult::error("JSON parser error");

        if($decodificado) {
            return $obj;
        }

        if (isset($obj->sender)) $this->sender = $obj->sender;
        if (isset($obj->command)) $this->event = $obj->command;
        if (isset($obj->event)) $this->event = $obj->event;
        if (isset($obj->connectionString)) $this->connectionString = $obj->connectionString;
        if (isset($obj->queryString)) $this->queryString = $obj->queryString;
        if (isset($obj->database)) $this->database = $obj->database;
        if (isset($obj->dataSource)) $this->dataSource = $obj->dataSource;
        if (isset($obj->connection)) $this->connection = $obj->connection;
        if (isset($obj->data)) $this->data = $obj->data;
        if (isset($obj->fileName)) $this->fileName = $obj->fileName;
        if (isset($obj->format)) $this->format = $obj->format;
        if (isset($obj->settings)) $this->settings = $obj->settings;
        if (isset($obj->report)) {
            $this->report = $obj->report;
            if (defined('JSON_UNESCAPED_SLASHES')) $this->reportJson = json_encode($this->report, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            else {
                // for PHP 5.3
                $this->reportJson = str_replace('\/', '/', json_encode($this->report));
                $this->reportJson = preg_replace_callback('/\\\\u(\w{4})/', function ($matches) {
                    return html_entity_decode('&#x' . $matches[1] . ';', ENT_COMPAT, 'UTF-8');
                }, $this->reportJson);
            }
        }

        return StiResult::success(null, $this);
    }
}