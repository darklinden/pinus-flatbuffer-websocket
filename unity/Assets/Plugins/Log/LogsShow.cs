using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class LogsShow : MonoBehaviour
{
    [SerializeField] private Text m_Text;

    private void Awake()
    {
        Log.D("LogsShow.Awake");
#if LOG_TO_SCREEN
        m_Text.text = Log.LogStringBuilder.ToString();
        Log.OnLog += Log_OnLog;
#endif
    }

    private void Log_OnLog(string obj)
    {
#if LOG_TO_SCREEN
        m_Text.text = Log.LogStringBuilder.ToString();
#endif
    }
}
