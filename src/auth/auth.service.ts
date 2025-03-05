import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { loginDto, signupDto } from './dto';
import { PrismaService } from 'src/Prisma/prisma.service';
import * as argon2 from 'argon2';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async Signup(data: signupDto): Promise<Tokens> {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          email: data.email,
        },
      });
      if (user) {
        throw new BadRequestException('user already exist');
      }
      const hashedPassword = await argon2.hash(data.password);
      const newUser = await this.prisma.users.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
      });
      // get the tokens

      const tokens = await this.getTokens(newUser.id, newUser.email);
      await this.updateRtHash(newUser.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new BadRequestException('error creating user', error);
    }
  }

  async Login(data: loginDto): Promise<Tokens> {
    try {
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
      const tokens = await this.getTokens(validUser.id, validUser.email);
      await this.updateRtHash(validUser.id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new BadRequestException('error creating user', error);
    }
  }

  // helper to sign the jwt
  async getTokens(userId: string, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get<string>('AT_SECRET'),
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
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
