"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfoDtoFactory = exports.UserInfoDto = void 0;
class UserInfoDto {
}
exports.UserInfoDto = UserInfoDto;
class UserInfoDtoFactory {
    static toDto(ent, dto) {
        dto = dto || new UserInfoDto();
        if (ent) {
            dto.id = BigInt(ent.id) || null;
            dto.name = ent.name || null;
            dto.level = ent.level || 0;
            dto.last_login_version = ent.last_login_version || null;
        }
        return dto;
    }
    static fromJSON(json) {
        let dto = new UserInfoDto();
        if (json) {
            dto.id = BigInt(json.id) || null;
            dto.name = json.name || null;
            dto.level = json.level || 0;
            dto.last_login_version = json.last_login_version || null;
        }
        return dto;
    }
    static fillEntity(dto, ent) {
        if (dto) {
            ent.id = dto.id ? dto.id.toString() : null;
            ent.name = dto.name || null;
            ent.level = dto.level || 0;
            ent.last_login_version = dto.last_login_version || null;
        }
    }
}
exports.UserInfoDtoFactory = UserInfoDtoFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1pbmZvLmR0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9kb21haW4vZGIvc3RydWN0cy9kdG8vdXNlci1pbmZvLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFhLFdBQVc7Q0FLdkI7QUFMRCxrQ0FLQztBQUVELE1BQWEsa0JBQWtCO0lBRTNCLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBUSxFQUFFLEdBQWdCO1FBQ25DLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUMvQixJQUFJLEdBQUcsRUFBRTtZQUNMLEdBQUcsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDaEMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztZQUM1QixHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQzNCLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDO1NBQzNEO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFTO1FBQ3JCLElBQUksR0FBRyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDNUIsSUFBSSxJQUFJLEVBQUU7WUFDTixHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ2pDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7WUFDN0IsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUM1QixHQUFHLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUksQ0FBQztTQUM1RDtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVELE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBZ0IsRUFBRSxHQUFRO1FBQ3hDLElBQUksR0FBRyxFQUFFO1lBQ0wsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDM0MsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztZQUM1QixHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQzNCLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDO1NBQzNEO0lBQ0wsQ0FBQztDQUNKO0FBakNELGdEQWlDQyJ9