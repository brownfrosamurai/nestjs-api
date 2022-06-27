import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  signup(dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  signin(dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
