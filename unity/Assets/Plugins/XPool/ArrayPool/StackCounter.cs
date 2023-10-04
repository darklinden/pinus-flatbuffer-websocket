namespace XPool
{
    public class PoolCounter
    {
        public int Power;
        public int MaxCount;

        public const int MaxPower = 8;

        public static PoolCounter CreateStart()
        {
            return new PoolCounter { Power = 3, MaxCount = 8 };
        }
    }
}