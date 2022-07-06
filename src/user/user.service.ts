import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private Config: ConfigService) {}

  // get all users
  async getUsers(): Promise<User[]> {
    let users = await this.prisma.user.findMany();

    users = users.map((user) => {
      delete user.hash;
      return user;
    });

    return users;
  }

  // update or edit a user
  async editUser(userId: number, dto: EditUserDto): Promise<User> {
    let user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');

    user = await this.prisma.user.update({
      where: { id: user.id },
      data: { ...dto },
    });

    delete user.hash;

    return user;
  }
}
