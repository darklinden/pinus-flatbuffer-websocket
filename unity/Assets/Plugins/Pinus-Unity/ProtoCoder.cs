using System.Diagnostics;
using System.IO;
using System;
using Google.FlatBuffers;

namespace PinusUnity
{
    public static class ProtoCoder
    {
        private static bool StrAllPrintable(string str)
        {
            foreach (var c in str)
            {
                if (c < 32 || c > 126)
                {
                    return false;
                }
            }
            return true;
        }

        [Conditional("DEBUG")]
        public static void LogUnusualMessage(string route, byte[] bytes, int offset, int length)
        {
            try
            {
                var str = Protocol.StrDecode(bytes, offset, length).Trim();
                if (StrAllPrintable(str))
                {
                    Log.E("ParseProto", route, str);
                }
            }
            catch (System.Exception)
            {
            }
        }
    }
}