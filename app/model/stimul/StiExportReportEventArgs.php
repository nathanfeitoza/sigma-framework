<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:09
 */

namespace AppModel\stimul;


class StiExportReportEventArgs
{
    public $sender = null;
    public $settings = null;
    public $format = null;
    public $fileName = null;
    public $data = null;

    function __construct($settings, $format, $fileName, $data = null) {
        $this->settings = $settings;
        $this->format = $format;
        $this->fileName = $fileName;
        $this->data = $data;
    }
}