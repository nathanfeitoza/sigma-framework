<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 06/07/18
 * Time: 09:04
 */

namespace AppModel\stimul;


class StiEventType
{
    const ExecuteQuery = "ExecuteQuery";
    const BeginProcessData = "BeginProcessData";
    //const EndProcessData = "EndProcessData";
    const CreateReport = "CreateReport";
    const OpenReport = "OpenReport";
    const SaveReport = "SaveReport";
    const SaveAsReport = "SaveAsReport";
    const PrintReport = "PrintReport";
    const BeginExportReport = "BeginExportReport";
    const EndExportReport = "EndExportReport";
    const EmailReport = "EmailReport";
    const DesignReport = "DesignReport";
}