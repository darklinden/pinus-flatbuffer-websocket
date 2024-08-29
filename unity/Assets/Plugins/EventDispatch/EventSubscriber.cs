using UnityEngine;

[DisallowMultipleComponent]
public class EventSubscriber : MonoBehaviour
{
    private bool m_UnsubscribeOnDisable = false;
    public bool UnsubscribeOnDisable
    {
        get
        {
            return m_UnsubscribeOnDisable;
        }

        set
        {
            m_UnsubscribeOnDisable = value;
            if (value && !gameObject.activeInHierarchy)
            {
                UnsubscribeAll();
            }
        }
    }

    private void OnDisable()
    {
        if (UnsubscribeOnDisable)
        {
            UnsubscribeAll();
        }
    }

    private void OnDestroy()
    {
        UnsubscribeAll();
    }

    public void UnsubscribeAll()
    {
        EventDispatcher.RemoveAllListeners(gameObject);
    }

    public static EventSubscriber Bind(GameObject tar)
    {
        if (tar != null)
        {
            if (tar.TryGetComponent<EventSubscriber>(out var comp) == false)
                comp = tar.AddComponent<EventSubscriber>();
            return comp;
        }

        return null;
    }
}
