<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:06
 */

namespace AppModel\stimul;


class StiResult
{
    public $success = true;
    public $notice = null;
    public $object = null;

    public static function success($notice = null, $object = null) {
        $result = new StiResult();
        $result->success = true;
        $result->notice = $notice;
        $result->object = $object;
        return $result;
    }

    public static function error($notice = null) {
        $result = new StiResult();
        $result->success = false;
        $result->notice = $notice;
        return $result;
    }
}