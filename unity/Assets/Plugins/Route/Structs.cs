using System.Collections.Generic;
using System.Reflection;

public class Structs
{
    // --- property routes begin ---
    protected FooBar m_FooBar = null;
    public static FooBar FooBar { get => Instance.m_FooBar; }
    // --- property routes end ---

    // --- instance begin ---
    private static Structs _instance = null;
    public static Structs Instance
    {
        get
        {
            if (_instance == null) _instance = new Structs();
            return _instance;
        }
    }
    // --- instance end ---

    Structs()
    {
        // --- instantiate routes begin ---
        m_FooBar = new FooBar();
        // --- instantiate routes end ---
    }

    private Dictionary<string, Cmd> m_Route = null;
    public Dictionary<string, Cmd> Routes
    {
        get
        {
            if (m_Route == null)
            {
                m_Route = new Dictionary<string, Cmd>();
                var fields = this.GetType().GetProperties();
                foreach (var p in fields)
                {
                    if (p.PropertyType.IsSubclassOf(typeof(RouteBase)))
                    {
                        var route = p.GetValue(this) as RouteBase;
                        route.GetDict(ref m_Route);
                    }
                }
            }
            return m_Route;
        }
    }

    public static Cmd getCmd(string route)
    {
        Cmd cmd = null;
        if (!Instance.Routes.TryGetValue(route, out cmd)) cmd = null;
        return cmd;
    }
}