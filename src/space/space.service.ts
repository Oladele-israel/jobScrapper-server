import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateSpaceDto } from './dto';

@Injectable()
export class SpaceService {
  constructor(private prisma: PrismaService) {}
  private logger = new Logger(SpaceService.name);

  async createspace(data: CreateSpaceDto, userId: string) {
    // code to generate voting link:
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('only admins can create space');
    }

    const link = this.generateLink();
    const newSpace = await this.prisma.space.create({
      data: {
        position: data.position,
        duration: data.duration,
        votingLink: link,
        userId,
      },
    });
    this.logger.log('this is the created user ------>', newSpace);
    return newSpace;
  }

  // code that generate user voting link
  private generateLink(): string {
    const randomString = Math.random().toString(36).substring(2, 10);
    return `http://localhost:3000/${randomString}`;
  }
}
