import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      Logger.log('Database connected');
    } catch (error) {
      Logger.error('Failed to connect to the database:', error);
      process.exit(1);
    }
  }
}
