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
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface AuthenticatedUser {
  id: string;
  email: string;
  refreshToken: string;
  // Add other properties as needed
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async Signup(@Body() data: signupDto): Promise<Tokens> {
    return this.authService.Signup(data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async Login(@Body() data: loginDto): Promise<Tokens> {
    return this.authService.Login(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async Logout(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.authService.Logout(user.id);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.authService.refresh(user.id, user.refreshToken);
  }
}
