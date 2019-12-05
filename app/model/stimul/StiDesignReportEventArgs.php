<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:09
 */

namespace AppModel\stimul;

class StiDesignReportEventArgs
{
    public $fileName = null;

    function __construct($fileName) {
        $this->fileName = $fileName;
    }
}