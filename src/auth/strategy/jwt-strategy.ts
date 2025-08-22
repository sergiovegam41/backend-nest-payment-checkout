import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../../users/users.service";
import { JwtPayload } from "../interfaces";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Request } from 'express';
import { User } from "src/users/entities/user.entity";

@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        private readonly usersService: UsersService,
        configService:ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'), 
            jwtFromRequest: ExtractJwt.fromExtractors([
                // Primero intenta extraer desde cookies
                (request: Request) => {
                    return request?.cookies?.authToken;
                },
                // Si no hay cookie, intenta desde Authorization header (compatibilidad)
                ExtractJwt.fromAuthHeaderAsBearerToken()
            ])
        })
    }
    

    async validate(payload:JwtPayload): Promise<User> {

        const { id } = payload;

        const user = await this.usersService.findOneWithPermissions(id);
        
        if(!user){
            throw new NotFoundException('Usuario no encontrado')
        }

        if(!user.isActive)
            throw new UnauthorizedException('user not active, verify your email or contact with the admin')


        return user;
    }

}