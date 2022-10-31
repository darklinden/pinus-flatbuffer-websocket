namespace XPool
{
    public interface IRelease
    {
        int RetainCount { get; set; }
        void DoRelease();
    }

    public static class IReleaseExtension
    {
        public static void Retain(this IRelease releaseable)
        {
            releaseable.RetainCount++;
        }

        public static void Release(this IRelease releaseable)
        {
            releaseable.RetainCount--;
            if (releaseable.RetainCount <= 0)
            {
                releaseable.DoRelease();
            }
        }

        public static void ForceRelease(this IRelease releaseable)
        {
            releaseable.RetainCount = 0;
            releaseable.DoRelease();
        }
    }
}