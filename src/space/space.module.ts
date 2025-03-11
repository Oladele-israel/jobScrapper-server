import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';
import { PrismaModule } from 'src/Prisma/prisma.module';

@Module({
  providers: [SpaceService],
  controllers: [SpaceController],
  imports: [PrismaModule],
})
export class SpaceModule {}
