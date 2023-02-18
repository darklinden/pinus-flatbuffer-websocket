namespace XPool
{
    public struct PoolCounter
    {
        public int Power;
        public int MaxCount;

        public static PoolCounter Start
        {
            get
            {
                return new PoolCounter
                {
                    Power = 3,
                    MaxCount = 8
                };
            }
        }
    }
}