import { Body, Controller, Post, Req } from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto';
import { Request } from 'express';
import { Roles } from '@prisma/client';

interface AuthenticatedUser {
  sub: string;
  email: string;
  role: Roles;
  refreshToken: string;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('create')
  async createSpace(
    @Body() data: CreateSpaceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    const userRole = req.user.role;
    console.log('this is the user Role', userRole);
    if (userRole === 'ADMIN') {
      return this.spaceService.createspace(data, user.sub);
    } else {
      return;
    }
  }
}
