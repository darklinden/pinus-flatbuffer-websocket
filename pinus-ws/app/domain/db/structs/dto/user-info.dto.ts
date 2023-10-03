export class UserInfoDto {
    id: bigint;
    name: string;
    level: number;
    last_login_version: string;
}

export class UserInfoDtoFactory {

    static toDto(ent: any, dto: UserInfoDto): UserInfoDto {
        dto = dto || new UserInfoDto();
        if (ent) {
            dto.id = BigInt(ent.id) || null;
            dto.name = ent.name || null;
            dto.level = ent.level || 0;
            dto.last_login_version = ent.last_login_version || null;
        }
        return dto;
    }

    static fromJSON(json: any): UserInfoDto {
        let dto = new UserInfoDto();
        if (json) {
            dto.id = BigInt(json.id) || null;
            dto.name = json.name || null;
            dto.level = json.level || 0;
            dto.last_login_version = json.last_login_version || null;
        }

        return dto;
    }

    static fillEntity(dto: UserInfoDto, ent: any) {
        if (dto) {
            ent.id = dto.id ? dto.id.toString() : null;
            ent.name = dto.name || null;
            ent.level = dto.level || 0;
            ent.last_login_version = dto.last_login_version || null;
        }
    }
}
