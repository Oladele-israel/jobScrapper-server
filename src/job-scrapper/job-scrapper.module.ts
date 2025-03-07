import { Module } from '@nestjs/common';
import { JobScrapperService } from './job-scrapper.service';
import { JobScrapperController } from './job-scrapper.controller';
import { PrismaService } from 'src/Prisma/prisma.service';

@Module({
  providers: [JobScrapperService, PrismaService],
  controllers: [JobScrapperController],
})
export class JobScrapperModule {}
