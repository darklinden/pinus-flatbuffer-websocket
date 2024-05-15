using System.Collections.Generic;
using System.Diagnostics;
using Proto;
using UnityEngine;
using Utils;

namespace App
{
    internal class Constants
    {
        internal const string HTTP_SERVER = "http://127.0.0.1:8080/";
        internal const string HTTP_REGISTER = HTTP_SERVER + "user/register";
        internal const string HTTP_LOGIN = HTTP_SERVER + "user/login";

        internal const string WS_SERVER = "ws://127.0.0.1:8081/";
    }
}