<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:08
 */

namespace AppModel\stimul;


class StiReportEventArgs
{
    public $sender = null;
    public $report = null;

    function __construct($sender, $report = null) {
        $this->sender = $sender;
        $this->report = $report;
    }
}