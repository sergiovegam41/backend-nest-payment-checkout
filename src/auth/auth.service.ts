import { Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {

    constructor() {}

    async register(registerDto: RegisterDto): Promise<RegisterDto> {
        return registerDto;
    }


    async login(loginDto: LoginDto): Promise<LoginDto> {
        return loginDto;
    }

}
