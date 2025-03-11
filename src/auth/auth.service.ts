import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { loginDto, signupDto } from './dto';
import { PrismaService } from 'src/Prisma/prisma.service';
import * as argon2 from 'argon2';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Roles } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async Signup(data: signupDto): Promise<Tokens> {
    const user = await this.prisma.users.findUnique({
      where: {
        email: data.email,
      },
    });
    if (user) {
      throw new BadRequestException('user already exist');
    }

    const userRole: Roles = data.email.includes('@admin.com')
      ? Roles.ADMIN
      : Roles.VOTER;
    this.logger.log('this is the new user role', userRole);

    const hashedPassword = await argon2.hash(data.password);
    const newUser = await this.prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: userRole,
      },
    });
    // get the tokens

    const tokens = await this.getTokens(
      newUser.id,
      newUser.email,
      newUser.role,
    );
    await this.updateRtHash(newUser.id, tokens.refreshToken);

    return tokens;
  }

  async Login(data: loginDto): Promise<Tokens> {
    // find the user through the email if he exists
    const validUser = await this.prisma.users.findUnique({
      where: {
        email: data.email,
      },
    });
    if (!validUser) {
      throw new ForbiddenException('access denied user not registered');
    }

    // vet the password
    const validPassword = await argon2.verify(
      validUser.password,
      data.password,
    );
    if (!validPassword) {
      throw new ForbiddenException('access denied invalid passwords');
    }
    // generate new tokens
    const tokens = await this.getTokens(
      validUser.id,
      validUser.email,
      validUser.role,
    );
    await this.updateRtHash(validUser.id, tokens.refreshToken);
    return tokens;
  }

  async Logout(userId: string) {
    await this.prisma.users.updateMany({
      where: {
        id: userId,
        hashRt: {
          not: null,
        },
      },
      data: {
        hashRt: null,
      },
    });
    return 'logout success';
  }

  async refresh(rt: string, userId: string) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashRt) {
      throw new ForbiddenException(
        'Access denied: User not registered or missing refresh token hash',
      );
    }

    const rtMatch = await argon2.verify(user.hashRt, rt);
    if (!rtMatch) {
      throw new ForbiddenException('Access denied: Invalid refresh token');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  // helper to sign the jwt---------------------------------------
  async getTokens(userId: string, email: string, role: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('AT_SECRET'),
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('RT_SECRET'),
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return { accessToken: at, refreshToken: rt };
  }
  async updateRtHash(userId: string, rt: string) {
    const hash = await argon2.hash(rt);
    await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        hashRt: hash,
      },
    });
  }
}
