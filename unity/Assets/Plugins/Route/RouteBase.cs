using System.Collections.Generic;

public class RouteBase
{
    public void GetDict(ref Dictionary<string, Cmd> dict)
    {
        foreach (var p in this.GetType().GetFields())
        {
            if (p.FieldType == typeof(Cmd))
            {
                var cmd = p.GetValue(this) as Cmd;
                dict.Add(cmd.route, cmd);
            }
        }
    }
}