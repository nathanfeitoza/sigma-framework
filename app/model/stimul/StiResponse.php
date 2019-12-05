<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:06
 */

namespace AppModel\stimul;


class StiResponse
{
    public static function json($result, $exit = true) {
        unset($result->object);
        if (defined('JSON_UNESCAPED_SLASHES')) echo json_encode($result, JSON_UNESCAPED_SLASHES);
        else echo json_encode($result);
        if ($exit) exit;
    }
}