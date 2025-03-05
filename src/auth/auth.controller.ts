import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto, loginDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async Signup(@Body() data: signupDto): Promise<Tokens> {
    return this.authService.Signup(data);
  }

  @Post('login')
  async Login(@Body() data: loginDto): Promise<Tokens> {
    return this.authService.Login(data);
  }
}
