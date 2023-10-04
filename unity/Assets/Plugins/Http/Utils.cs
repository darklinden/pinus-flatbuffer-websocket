using System;
using System.Text;

namespace Http
{
    public static class Utils
    {
        private static StringBuilder m_CachedSB = null;
        internal static StringBuilder CachedSB
        {
            get
            {
                if (m_CachedSB == null)
                {
                    m_CachedSB = new StringBuilder();
                }
                m_CachedSB.Clear();
                return m_CachedSB;
            }
        }

        public static byte[] Str2Utf8(string string_)
        {
            if (string.IsNullOrEmpty(string_))
            {
                return new byte[] { 0x00 };
            }

            var tmp = Encoding.UTF8.GetBytes(string_);
            return tmp;
        }

        internal static string StructValuesToFormStr(object obj)
        {
            var sb = CachedSB;
            var type = obj.GetType();
            var fields = type.GetFields();
            foreach (var field in fields)
            {
                var value = field.GetValue(obj);
                if (value == null)
                {
                    continue;
                }

                if (sb.Length > 0) sb.Append("&");
                sb.Append(field.Name);
                sb.Append("=");
                sb.Append(value);
            }
            return sb.ToString();
        }

        internal static string StructValuesToJSON(object obj)
        {
            var type = obj.GetType();
            var fields = type.GetFields();
            return LitJson.JsonMapper.ToJson(obj);
        }
    }
}