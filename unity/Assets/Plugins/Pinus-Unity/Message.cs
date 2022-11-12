using UnityEngine;
using UnityWebSocket;
using XPool;

namespace PinusUnity
{
    public static class Message
    {
        public const int MSG_FLAG_BYTES = 1;
        public const int MSG_ROUTE_CODE_BYTES = 2;
        public const int MSG_ID_MAX_BYTES = 5;
        public const int MSG_ROUTE_LEN_BYTES = 1;
        public const int MSG_ROUTE_CODE_MAX = 0xffff;
        public const int MSG_COMPRESS_ROUTE_MASK = 0x1;
        public const int MSG_COMPRESS_GZIP_MASK = 0x1;
        public const int MSG_COMPRESS_GZIP_ENCODE_MASK = 1 << 4;
        public const int MSG_TYPE_MASK = 0x7;

        public static bool MessageHasId(MessageType type)
        {
            return type == MessageType.REQUEST
                || type == MessageType.RESPONSE;
        }

        public static bool MessageHasRoute(MessageType type)
        {
            return type == MessageType.REQUEST
                || type == MessageType.NOTIFY
                || type == MessageType.PUSH;
        }

        public static int CaculateMessageIdBytes(int id)
        {
            int len = 0;
            do
            {
                len += 1;
                id >>= 7;
            } while (id > 0);
            return len;
        }

        public static int EncodeMessageFlag(MessageType type, bool compressRoute, XBuffer buffer, int offset)
        {
            var typeValue = (int)type;
            buffer.Write((byte)((typeValue << 1) | (compressRoute ? 1 : 0)), offset);
            return offset + MSG_FLAG_BYTES;
        }

        public static int EncodeMessageId(int id, XBuffer buffer, int offset)
        {
            do
            {
                byte tmp = (byte)(id % 128);
                var next = Mathf.FloorToInt(id / 128);

                if (next != 0)
                {
                    tmp += 128;
                }
                buffer.Write(tmp, offset++);

                id = next;
            } while (id != 0);

            return offset;
        }

        public static int EncodeMessageRoute(int route, XBuffer buffer, int offset)
        {
            if (route > MSG_ROUTE_CODE_MAX)
            {
                Log.E("route number is overflow");
            }
            buffer.Write((byte)((route >> 8) & 0xff), offset++);
            buffer.Write((byte)(route & 0xff), offset++);
            return offset;
        }

        public static int EncodeMessageRoute(string route, XBuffer buffer, int offset)
        {
            buffer.Write((byte)(route.Length & 0xff), offset++);
            buffer.Write(route, offset);
            offset += route.Length;
            return offset;
        }

        /**
         * Message protocol encode.
         *
         * @param  {Number} id            message id
         * @param  {Number} type          message type
         * @param  {Number} compressRoute whether compress route
         * @param  {Number|String} route  route code or route string
         * @param  {Buffer} msg           message body bytes
         * @return {Buffer}               encode result
         */

        /// <summary>
        /// encode message with int route
        /// </summary>
        /// <param name="id"></param>
        /// <param name="type"></param>
        /// <param name="route"></param>
        /// <param name="msg"></param>
        /// <param name="msgLen"></param>
        /// <param name="buffer"></param>
        /// <param name="offset"></param>
        public static void Encode(
            int id,
            MessageType type,
            int route,
            XBuffer buffer,
            ref int offset)
        {
            // caculate message max length
            var idBytes = MessageHasId(type) ? CaculateMessageIdBytes(id) : 0;

            // add flag
            offset = EncodeMessageFlag(type, true, buffer, offset);

            // add message id
            if (MessageHasId(type))
            {
                offset = EncodeMessageId(id, buffer, offset);
            }

            // add route
            if (MessageHasRoute(type))
            {
                offset = EncodeMessageRoute(route, buffer, offset);
            }
        }

        /// <summary>
        /// encode message with string route
        /// </summary>
        /// <param name="id"></param>
        /// <param name="type"></param>
        /// <param name="route"></param>
        /// <param name="msg"></param>
        /// <param name="msgLen"></param>
        /// <param name="buffer"></param>
        /// <param name="offset"></param>
        public static void Encode(
            int id,
            MessageType type,
            string route,
            XBuffer buffer,
            ref int offset)
        {
            // caculate message max length
            var idBytes = MessageHasId(type) ? CaculateMessageIdBytes(id) : 0;

            // add flag
            offset = EncodeMessageFlag(type, false, buffer, offset);

            // add message id
            if (MessageHasId(type))
            {
                offset = EncodeMessageId(id, buffer, offset);
            }

            // add route
            if (MessageHasRoute(type))
            {
                offset = EncodeMessageRoute(route, buffer, offset);
            }
        }

        /**
         * Message protocol decode.
         *
         * @param  {Buffer|Uint8Array} buffer message bytes
         * @return {Object}            message object
         */
        public static void Decode(
            byte[] bytes,
            int offset,
            int length,
            out int id,
            out MessageType type,
            out int routeCode,
            out string routeStr,
            out int bodyOffset,
            out int bodyLength)
        {
            // save old offset
            bodyLength = offset;
            // parse flag
            var flag = bytes[offset++];
            bool compressRoute = (flag & MSG_COMPRESS_ROUTE_MASK) == MSG_COMPRESS_ROUTE_MASK;
            type = (MessageType)((flag >> 1) & MSG_TYPE_MASK);

            // parse id
            id = 0;
            if (MessageHasId(type))
            {
                var m = 0;
                var i = 0;
                do
                {
                    m = (int)(bytes[offset]);
                    id += (m & 0x7f) << (7 * i);
                    offset++;
                    i++;
                } while (m >= 128);
            }

            // parse route
            routeCode = 0;
            routeStr = null;
            if (MessageHasRoute(type))
            {
                if (compressRoute)
                {
                    routeCode = ((bytes[offset++]) << 8 | bytes[offset++]);
                }
                else
                {
                    throw new System.Exception("Message.Decode Has Removed String Route Support");
                }
            }

            // bodyLength = oldOffset + length - offset;
            bodyOffset = offset;
            bodyLength = bodyLength + length - offset;
        }
    }
}