using System.IO;
using System;
using System.Text;
using UnityEngine.Profiling;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;

public static partial class Log
{
    private static Queue<StringBuilder> m_StringBuilderQueue = new Queue<StringBuilder>();

    private static StringBuilder GetSb()
    {
        if (m_StringBuilderQueue.Count > 0)
        {
            return m_StringBuilderQueue.Dequeue();
        }

        return new StringBuilder();
    }

    private static void ReturnSb(StringBuilder sb)
    {
        sb.Clear();
        m_StringBuilderQueue.Enqueue(sb);
    }

    private static string NowTimeStr()
    {
        return DateTime.Now.ToString("[HH:mm:ss.fff]");
    }

    private static void InsertDepth(StringBuilder sb, int depth)
    {
        while (depth-- > 0)
        {
            sb.Insert(0, "  ");
        }
    }

    private static void AppendDepth(StringBuilder sb, int depth)
    {
        while (depth-- > 0)
        {
            sb.Append("  ");
        }
    }

    private static string BytesToStr(byte[] bytes, int depth = 0)
    {
        StringBuilder buff = GetSb();
        buff.Append("[");
        for (var i = 0; i < bytes.Length; i++)
        {
            if (buff.Length > 1)
            {
                buff.Append(" ");
            }

            buff.AppendFormat("{0:x2}", bytes[i]);
        }

        buff.Append("]>");

        buff.Insert(0, " ");
        buff.Insert(0, bytes.Length);
        buff.Insert(0, "<bytes len: ");
        InsertDepth(buff, depth);

        var ret = buff.ToString();
        ReturnSb(buff);
        return ret;
    }

    private static string ObjectToStr(object obj, int depth = 0)
    {
        if (obj == null)
        {
            return "null";
        }

        if (obj.GetType().IsValueType)
        {
            return obj.ToString();
        }

        if (obj.GetType().Name == "Byte[]")
        {
            return BytesToStr((byte[])obj, depth);
        }

        if (obj is IList)
        {
            StringBuilder buff = GetSb();
            buff.Append("[");
            foreach (var item in (IList)obj)
            {
                if (buff.Length > 1)
                {
                    buff.Append(",");
                    buff.Append("\n");
                }

                buff.Append(ObjectToStr(item));
            }

            buff.Append("]");
            var ret = buff.ToString();
            ReturnSb(buff);
            return ret;
        }

        if (obj is IDictionary)
        {
            StringBuilder buff = GetSb();
            buff.Append("{");
            foreach (DictionaryEntry item in (IDictionary)obj)
            {
                if (buff.Length > 1)
                {
                    buff.Append(",");
                    buff.Append("\n");
                }

                buff.Append(ObjectToStr(item.Key));
                buff.Append(":");
                buff.Append(ObjectToStr(item.Value));
            }

            buff.Append("}");
            var ret = buff.ToString();
            ReturnSb(buff);
            return ret;
        }

        if (obj is UnityEngine.Object)
        {
            return obj.ToString();
        }

        if (obj is Exception)
        {
            return obj.ToString();
        }

        if (obj is string)
        {
            return obj as string;
        }

        return LitJson.JsonMapper.ToJson(obj);
    }

    private static string ObjectsToString(string flag, object message1 = null, object message2 = null, object message3 = null,
            object message4 = null, object message5 = null, object message6 = null, object message7 = null,
            object message8 = null, object message9 = null, object message10 = null, object message11 = null,
            object message12 = null, object message13 = null, object message14 = null, object message15 = null)
    {
        StringBuilder result = new StringBuilder();
        result.Append(NowTimeStr());
        result.Append(flag);

        if (message1 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message1));
        }
        if (message2 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message2));
        }
        if (message3 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message3));
        }
        if (message4 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message4));
        }
        if (message5 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message5));
        }
        if (message6 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message6));
        }
        if (message7 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message7));
        }
        if (message8 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message8));
        }
        if (message9 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message9));
        }
        if (message10 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message10));
        }
        if (message11 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message11));
        }
        if (message12 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message12));
        }
        if (message13 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message13));
        }
        if (message14 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message14));
        }
        if (message15 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message15));
        }
        return result.ToString();
    }

    [Conditional("ENABLE_LOG")]
    public static void D(object message0, object message1 = null, object message2 = null, object message3 = null,
        object message4 = null, object message5 = null, object message6 = null, object message7 = null,
        object message8 = null, object message9 = null, object message10 = null, object message11 = null,
        object message12 = null, object message13 = null, object message14 = null)
    {
        Profiler.BeginSample("Log.D");
        var result = ObjectsToString("[L]:", message0, message1, message2, message3,
                 message4, message5, message6, message7,
                 message8, message9, message10, message11,
                 message12, message13, message14);

        UnityEngine.Debug.Log(result);
        Profiler.EndSample();
    }

    [Conditional("ENABLE_LOG")]
    public static void W(object message0, object message1 = null, object message2 = null,
        object message3 = null,
        object message4 = null, object message5 = null, object message6 = null, object message7 = null,
        object message8 = null, object message9 = null, object message10 = null, object message11 = null,
        object message12 = null, object message13 = null, object message14 = null)
    {

        Profiler.BeginSample("Log.W");
        var result = ObjectsToString("[W]:", message0, message1, message2, message3,
                 message4, message5, message6, message7,
                 message8, message9, message10, message11,
                 message12, message13, message14);

        UnityEngine.Debug.LogWarning(result);
        Profiler.EndSample();
    }

    private static Action<string> s_ErrToast = null;
    public static void SetErrToast(Action<string> errToast)
    {
        s_ErrToast = errToast;
    }

    // 即使关闭日志也会输出错误
    // #if !ENABLE_LOG
    //     [Conditional("CONDITIONAL_LOG")]
    // #endif
    public static void E(object message0, object message1 = null, object message2 = null, object message3 = null,
        object message4 = null, object message5 = null, object message6 = null, object message7 = null,
        object message8 = null, object message9 = null, object message10 = null, object message11 = null,
        object message12 = null, object message13 = null, object message14 = null)
    {
        Profiler.BeginSample("Log.E");
        var result = ObjectsToString("[E]:", message0, message1, message2, message3,
                 message4, message5, message6, message7,
                 message8, message9, message10, message11,
                 message12, message13, message14);

        UnityEngine.Debug.LogError(result);
        Profiler.EndSample();

        s_ErrToast?.Invoke(result);
    }
}