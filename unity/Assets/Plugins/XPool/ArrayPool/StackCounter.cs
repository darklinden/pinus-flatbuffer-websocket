namespace XPool
{
    public struct StackCounter
    {
        public int Power;
        public int MaxCount;

        public static StackCounter Start
        {
            get
            {
                return new StackCounter
                {
                    Power = 3,
                    MaxCount = 8
                };
            }
        }
    }
}