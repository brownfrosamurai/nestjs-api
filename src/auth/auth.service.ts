import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });
    console.log({
      user,
    });
  }

  signin(dto: AuthDto) {
    console.log({
      dto,
    });
  }
}
