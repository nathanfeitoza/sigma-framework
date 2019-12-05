<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:06
 */

namespace AppModel\stimul;

class StiEmailSettings
{
    /** Email address of the sender */
    public $from = null;

    /** Name and surname of the sender */
    public $name = "John Smith";

    /** Email address of the recipient */
    public $to = null;

    /** Email Subject */
    public $subject = null;

    /** Text of the Email */
    public $message = null;

    /** Attached file name */
    public $attachmentName = null;

    /** Charset for the message */
    public $charset = "UTF-8";

    /** Address of the SMTP server */
    public $host = null;

    /** Port of the SMTP server */
    public $port = 465;

    /** The secure connection prefix - ssl or tls */
    public $secure = "ssl";

    /** Login (Username or Email) */
    public $login = null;

    /** Password */
    public $password = null;

    /** To auth smtp call */
    public $auth_smtp = true;
}