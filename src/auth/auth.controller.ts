import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto, loginDto } from './dto';
import { Tokens } from './types';
import { Request } from 'express';
import { Public } from 'src/common/decorators';
import { RtGuard } from 'src/common/guards';

interface AuthenticatedUser {
  sub: string;
  email: string;
  refreshToken: string;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async Signup(@Body() data: signupDto): Promise<Tokens> {
    return this.authService.Signup(data);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async Login(@Body() data: loginDto): Promise<Tokens> {
    return this.authService.Login(data);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async Logout(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.authService.Logout(user.sub);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.authService.refresh(user.refreshToken, user.sub);
  }
}
