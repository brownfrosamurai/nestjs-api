import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtPayload, Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // logic to update refresh token
  async updateRtHash(userId: number, rt: string) {
    // create hash for refresh token
    const hash = await argon.hash(rt);

    // save hashed refresh token in db
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRt: hash,
      },
    });
  }

  // Sign up logic
  async signup(dto: AuthDto): Promise<Tokens> {
    try {
      // create password hash
      const hash = await argon.hash(dto.password);

      // create a new user
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      // create access and refresh tokens
      const tokens = await this.getTokens(user.id, user.email);
      // update current hashed refresh token(hashedRt)in db
      await this.updateRtHash(user.id, tokens.refresh_token);
      // return tokens as json
      return tokens;
    } catch (error) {
      // catch errors if any
      if (error instanceof PrismaClientKnownRequestError)
        throw new ForbiddenException('Credentials are invalid');

      throw error;
    }
  }

  // Signin logic
  async signin(dto: AuthDto): Promise<Tokens> {
    try {
      // find user
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      // throw error if user does not exist
      if (!user) throw new ForbiddenException('Invalid Credentials');

      // chechk that password is correct
      const pwMatch = await argon.verify(user.hash, dto.password);

      // throw error is password does not match
      if (!pwMatch) throw new ForbiddenException('Invalid Credentials');

      // create access and refresh tokens
      const tokens = await this.getTokens(user.id, user.email);

      // update hashed refresh token after sign in
      await this.updateRtHash(user.id, tokens.refresh_token);
      // return tokens as json
      return tokens;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError)
        throw new ForbiddenException('Credentials are invalid');

      throw error;
    }
  }

  async logout() {
    console.log({ data: 'logging out' });
  }
  // Create access and refresh tokens
  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
