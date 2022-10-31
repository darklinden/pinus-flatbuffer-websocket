using UnityWebSocket;
using XPool;

namespace PinusUnity
{

    internal static class Package
    {
        internal const int PKG_HEAD_BYTES = 4;

        internal static PooledBuffer SimplePack(PackageType type)
        {
            var length = 0;
            var buffer = PooledBuffer.Create();
            buffer.Resize(PKG_HEAD_BYTES);
            var index = 0;
            buffer.Write((byte)((int)type & 0xff), index++);
            buffer.Write((byte)((length >> 16) & 0xff), index++);
            buffer.Write((byte)((length >> 8) & 0xff), index++);
            buffer.Write((byte)(length & 0xff), index++);
            return buffer;
        }

        /**
         * Package protocol encode.
         *
         * Pomelo package format:
         * +------+-------------+------------------+
         * | type | body length |       body       |
         * +------+-------------+------------------+
         *
         * Head: 4bytes
         *   0: package type,
         *      1 - handshake,
         *      2 - handshake ack,
         *      3 - heartbeat,
         *      4 - data
         *      5 - kick
         *   1 - 3: big-endian body length
         * Body: body length bytes
         *
         * @param  {Number}    type   package type
         * @param  {Uint8Array} body   body content in bytes
         * @return {Uint8Array}        new byte array that contains encode result
         */

        internal static void Encode(PackageType type, PooledBuffer buffer, int length)
        {
            var index = 0;
            buffer.Write((byte)((int)type & 0xff), index++);
            buffer.Write((byte)((length >> 16) & 0xff), index++);
            buffer.Write((byte)((length >> 8) & 0xff), index++);
            buffer.Write((byte)(length & 0xff), index++);
        }

        /**
         * Package protocol decode.
         * See encode for package format.
         *
         * @param  {Uint8Array} buffer byte array containing package content
         * @return {Object}           {type: package type, buffer: body byte array}
         */
        internal static PackageType Decode(PooledBuffer buffer, ref int offset, out int dataLength)
        {
            if (offset < buffer.Length)
            {
                var type = (PackageType)buffer.Bytes[offset++];
                dataLength = (buffer.Bytes[offset++]) << 16 | (buffer.Bytes[offset++]) << 8 | buffer.Bytes[offset++];
                return type;
            }
            dataLength = 0;
            return PackageType.Unknown;
        }
    }
}