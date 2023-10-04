using System;
using System.Collections.Generic;
using UnityEngine;
using XPool;
using Cysharp.Threading.Tasks;
using System.Threading;

namespace Http
{
    public partial class Request : IDisposable
    {
        private static int sm_uniqueId = 0;
        private static int GetUniqueId()
        {
            if (sm_uniqueId >= int.MaxValue - 10)
            {
                sm_uniqueId = 0;
            }
            return ++sm_uniqueId;
        }

        public static Request Create()
        {
            var request = new Request(); // AnyPool<Request>.Get();
            request.Id = GetUniqueId();
            sm_requests.Add(request.Id, request);
            return request;
        }

        public virtual void Dispose()
        {
            sm_requests.Remove(Id);
            Clear();
            // AnyPool<Request>.Release(this);
        }

        private static Dictionary<int, Request> sm_requests = new Dictionary<int, Request>(16);
        public int Id { get; private set; }
        public bool IsRunning { get; private set; }

        internal string NormalizeUrl(string url)
        {
            if (url.StartsWith("http://") || url.StartsWith("https://"))
            {
                return url;
            }
            return "http://" + url;
        }

        CancellationTokenSource cts = null;
        public string Error { get; private set; }
        public object Result { get; private set; }

        public void Clear()
        {
            IsRunning = false;
            if (cts != null)
            {
                cts.Cancel();
                cts.Dispose();
                cts = null;
            }
            if (Error != null)
            {
                Error = null;
            }
            if (Result != null)
            {
                if (Result is IDisposable)
                {
                    (Result as IDisposable).Dispose();
                }
                Result = null;
            }
        }

        public void Cancel()
        {
            if (cts != null)
            {
                cts.Cancel();
                cts.Dispose();
                cts = null;
            }
        }
    }
}