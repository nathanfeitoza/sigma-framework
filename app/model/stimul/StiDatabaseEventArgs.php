<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:07
 */

namespace AppModel\stimul;


class StiDatabaseEventArgs
{
    public $sender = null;
    public $database = null;
    public $connectionInfo = null;
    public $queryString = null;

    function __construct($sender, $database, $connectionInfo, $queryString = null) {
        $this->sender = $sender;
        $this->database = $database;
        $this->connectionInfo = $connectionInfo;
        $this->queryString = $queryString;
    }
}