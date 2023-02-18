using System;
using System.Diagnostics;
using System.Text;
using UnityEngine.Profiling;
using System.Reflection;

public static partial class Log
{
    static Log()
    {
#if LOG_TO_SCREEN
        LogStringBuilder = new StringBuilder();
#endif
    }

#if LOG_TO_SCREEN
    public static event Action<string> OnLog;
    public static StringBuilder LogStringBuilder { get; set; }
    private static void L2S(string message)
    {
        LogStringBuilder.AppendLine(message);
        if (OnLog != null)
        {
            OnLog(message);
        }
    }
#endif

    public static void D2S(string message)
    {
#if LOG_TO_SCREEN
        L2S("[L]" + message); 
#endif
    }

    public static void W2S(string message)
    {
#if LOG_TO_SCREEN
        L2S("[W]" + message);
#endif
    }

    public static void E2S(string message)
    {
#if LOG_TO_SCREEN
        L2S("[E]" + message); 
#endif
    }

    private static string NowTimeStr()
    {
        return DateTime.Now.ToString("[HH:mm:ss.fff]: ");
    }

    private static string BytesToStr(byte[] bytes)
    {
        StringBuilder buff = new StringBuilder();
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

        return buff.ToString();
    }

    private static string ObjectToStr(object obj)
    {
        if (obj.GetType().Name == "Byte[]")
        {
            return BytesToStr((byte[])obj);
        }

        // if (Type.GetTypeCode(obj.GetType()) == TypeCode.Object)
        // {
        //     if (obj.GetType().GetMethod("ToString").DeclaringType != obj.GetType())
        //     {
        //         // return StructToJSON(obj).ToString();
        //         return obj.ToString();
        //     }
        // }

        return obj.ToString();
    }

    private static string ObjectsToString(object message0, object message1 = null, object message2 = null, object message3 = null,
            object message4 = null, object message5 = null, object message6 = null, object message7 = null,
            object message8 = null, object message9 = null, object message10 = null, object message11 = null,
            object message12 = null, object message13 = null, object message14 = null, object message15 = null)
    {
        StringBuilder result = new StringBuilder();
        result.Append(NowTimeStr());
        if (message0 != null)
        {
            result.Append("  ");
            result.Append(ObjectToStr(message0));
        }
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

#if !ENABLE_LOG
    [Conditional("CONDITIONAL_LOG")]
#endif
    public static void D(object message0, object message1 = null, object message2 = null, object message3 = null,
            object message4 = null, object message5 = null, object message6 = null, object message7 = null,
            object message8 = null, object message9 = null, object message10 = null, object message11 = null,
            object message12 = null, object message13 = null, object message14 = null, object message15 = null)
    {
        Profiler.BeginSample("Log.D");
        var result = ObjectsToString(message0, message1, message2, message3,
                 message4, message5, message6, message7,
                 message8, message9, message10, message11,
                 message12, message13, message14, message15);

        D2S(result);
        UnityEngine.Debug.Log(result);

        Profiler.EndSample();
    }

#if !ENABLE_LOG
    [Conditional("CONDITIONAL_LOG")]
#endif
    public static void W(object message0, object message1 = null, object message2 = null,
        object message3 = null,
        object message4 = null, object message5 = null, object message6 = null, object message7 = null,
        object message8 = null, object message9 = null, object message10 = null, object message11 = null,
        object message12 = null, object message13 = null, object message14 = null, object message15 = null)
    {
        Profiler.BeginSample("Log.W");
        var result = ObjectsToString(message0, message1, message2, message3,
                 message4, message5, message6, message7,
                 message8, message9, message10, message11,
                 message12, message13, message14, message15);

        W2S(result);
        UnityEngine.Debug.LogWarning(result);

        Profiler.EndSample();
    }

    // 即使关闭日志也会输出错误
    // #if !ENABLE_LOG
    //     [Conditional("CONDITIONAL_LOG")]
    // #endif
    public static void E(object message0, object message1 = null, object message2 = null, object message3 = null,
        object message4 = null, object message5 = null, object message6 = null, object message7 = null,
        object message8 = null, object message9 = null, object message10 = null, object message11 = null,
        object message12 = null, object message13 = null, object message14 = null, object message15 = null)
    {
        Profiler.BeginSample("Log.E");

        var result = ObjectsToString(message0, message1, message2, message3,
                         message4, message5, message6, message7,
                         message8, message9, message10, message11,
                         message12, message13, message14, message15);

        E2S(result);
        UnityEngine.Debug.LogError(result);

        Profiler.EndSample();
    }
}