"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = void 0;
const pinus_protocol_1 = require("pinus-protocol");
const pinus_logger_1 = require("pinus-logger");
const path = require("path");
const route_1 = require("route");
const flatbuffers = require("flatbuffers");
let logger = (0, pinus_logger_1.getLogger)('pinus', path.basename(__filename));
let packProto = function (data, protoStruct) {
    // flatbuffers encode 无法写为通用函数
    // let buffer: Uint8Array = null;
    if (data && protoStruct) {
        return data;
    }
    return null;
};
let parseProto = function (buffer, protoStruct) {
    let decoded = null;
    if (buffer && buffer.length && protoStruct) {
        try {
            let bb = new flatbuffers.ByteBuffer(buffer);
            decoded = protoStruct.getRoot(bb);
        }
        catch (e) {
            logger.error(e);
            decoded = null;
        }
    }
    return decoded;
};
let encode = function (reqId, route, msg) {
    if (!!reqId) {
        return composeResponse(this, reqId, route, msg);
    }
    else {
        return composePush(this, route, msg);
    }
};
exports.encode = encode;
let decode = function (msg) {
    msg = pinus_protocol_1.Message.decode(msg.body);
    let route = msg.route;
    const connector = this.connector;
    // decode use dictionary
    if (!!msg.compressRoute) {
        if (!!connector.useDict) {
            let abbrs = connector.dictionary.getAbbrs();
            if (!abbrs[route]) {
                logger.error('dictionary error! no abbrs for route : %s', route);
                return null;
            }
            route = msg.route = abbrs[route];
        }
        else {
            logger.error('fail to uncompress route code for msg: %j, server not enable dictionary.', msg);
            return null;
        }
    }
    // decode use struct map
    logger.log('decode', route, 'buffer.length', msg.body.length);
    const cmd = route_1.Structs.getCmd(route);
    if (cmd) {
        if (msg.body.length)
            msg.body = parseProto(msg.body, cmd.client);
    }
    else {
        try {
            msg.body = JSON.parse(msg.body.toString('utf8'));
        }
        catch (ex) {
            msg.body = {};
        }
    }
    return msg;
};
exports.decode = decode;
let composeResponse = function (server, msgId, route, msgBody) {
    if (!msgId || !route || !msgBody) {
        return null;
    }
    msgBody = encodeBody(server, route, msgBody);
    return pinus_protocol_1.Message.encode(msgId, pinus_protocol_1.Message.TYPE_RESPONSE, false, null, msgBody);
};
let composePush = function (server, route, msgBody) {
    if (!route || !msgBody) {
        return null;
    }
    msgBody = encodeBody(server, route, msgBody);
    // encode use dictionary
    let compressRoute = false;
    if (!!server.connector.dictionary) {
        let dict = server.connector.dictionary.getDict();
        if (!!server.connector.useDict && !!dict[route]) {
            route = dict[route];
            compressRoute = true;
        }
    }
    return pinus_protocol_1.Message.encode(0, pinus_protocol_1.Message.TYPE_PUSH, compressRoute, route, msgBody);
};
let encodeBody = function (server, route, msgBody) {
    // encode use protobuf
    const cmd = route_1.Structs.getCmd(route);
    if (cmd) {
        msgBody = packProto(msgBody, cmd.server);
    }
    else {
        msgBody = Buffer.from(JSON.stringify(msgBody), 'utf8');
    }
    return msgBody;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9fY29kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvdXRpbHMvcHJvdG9fY29kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbURBQXlDO0FBQ3pDLCtDQUF5QztBQUN6Qyw2QkFBNkI7QUFFN0IsaUNBQWdDO0FBR2hDLDJDQUEyQztBQUUzQyxJQUFJLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUUzRCxJQUFJLFNBQVMsR0FBRyxVQUFVLElBQVMsRUFBRSxXQUFnQjtJQUNqRCw4QkFBOEI7SUFFOUIsaUNBQWlDO0lBQ2pDLElBQUksSUFBSSxJQUFJLFdBQVcsRUFBRTtRQUNyQixPQUFPLElBQWtCLENBQUE7S0FDNUI7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDLENBQUE7QUFFRCxJQUFJLFVBQVUsR0FBRyxVQUFVLE1BQWtCLEVBQUUsV0FBZ0I7SUFDM0QsSUFBSSxPQUFPLEdBQVEsSUFBSSxDQUFDO0lBQ3hCLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksV0FBVyxFQUFFO1FBQ3hDLElBQUk7WUFDQSxJQUFJLEVBQUUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDckM7UUFDRCxPQUFPLENBQUMsRUFBRTtZQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNsQjtLQUNKO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQyxDQUFBO0FBRUQsSUFBSSxNQUFNLEdBQUcsVUFBNEIsS0FBYSxFQUFFLEtBQWEsRUFBRSxHQUFRO0lBQzNFLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRTtRQUNULE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ25EO1NBQU07UUFDSCxPQUFPLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3hDO0FBQ0wsQ0FBQyxDQUFDO0FBNkVFLHdCQUFNO0FBM0VWLElBQUksTUFBTSxHQUFHLFVBQW9DLEdBQVE7SUFDckQsR0FBRyxHQUFHLHdCQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0lBRXRCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUE0QixDQUFDO0lBRXBELHdCQUF3QjtJQUN4QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFO1FBQ3JCLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7WUFDckIsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNmLE1BQU0sQ0FBQyxLQUFLLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pFLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFDRCxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEM7YUFBTTtZQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsMEVBQTBFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDOUYsT0FBTyxJQUFJLENBQUM7U0FDZjtLQUNKO0lBRUQsd0JBQXdCO0lBQ3hCLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5RCxNQUFNLEdBQUcsR0FBRyxlQUFPLENBQUMsTUFBTSxDQUFDLEtBQWUsQ0FBQyxDQUFDO0lBQzVDLElBQUksR0FBRyxFQUFFO1FBQ0wsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU07WUFDZixHQUFHLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNuRDtTQUFNO1FBQ0gsSUFBSTtZQUNBLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ3BEO1FBQUMsT0FBTyxFQUFFLEVBQUU7WUFDVCxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztTQUNqQjtLQUNKO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDLENBQUM7QUF3Q0Usd0JBQU07QUF0Q1YsSUFBSSxlQUFlLEdBQUcsVUFBVSxNQUFXLEVBQUUsS0FBYSxFQUFFLEtBQWEsRUFBRSxPQUFZO0lBQ25GLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDOUIsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUNELE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM3QyxPQUFPLHdCQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSx3QkFBTyxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzlFLENBQUMsQ0FBQztBQUVGLElBQUksV0FBVyxHQUFHLFVBQVUsTUFBVyxFQUFFLEtBQWEsRUFBRSxPQUFZO0lBQ2hFLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDcEIsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUNELE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM3Qyx3QkFBd0I7SUFDeEIsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBQzFCLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFO1FBQy9CLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pELElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDN0MsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwQixhQUFhLEdBQUcsSUFBSSxDQUFDO1NBQ3hCO0tBQ0o7SUFDRCxPQUFPLHdCQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSx3QkFBTyxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQy9FLENBQUMsQ0FBQztBQUVGLElBQUksVUFBVSxHQUFHLFVBQVUsTUFBVyxFQUFFLEtBQWEsRUFBRSxPQUFZO0lBQy9ELHNCQUFzQjtJQUN0QixNQUFNLEdBQUcsR0FBRyxlQUFPLENBQUMsTUFBTSxDQUFDLEtBQWUsQ0FBQyxDQUFDO0lBQzVDLElBQUksR0FBRyxFQUFFO1FBQ0wsT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzVDO1NBQU07UUFDSCxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzFEO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQyxDQUFDIn0=