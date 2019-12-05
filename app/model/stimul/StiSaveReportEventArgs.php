<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:09
 */

namespace AppModel\stimul;


class StiSaveReportEventArgs
{
    public $sender = null;
    public $report = null;
    public $fileName = null;

    function __construct($report, $fileName) {
        $this->report = $report;
        $this->fileName = $fileName;
    }
}