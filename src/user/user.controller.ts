import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser, GetUserId } from 'src/common/decorators';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  editUser(
    @Body() dto: EditUserDto,
    @GetUserId() userId: number,
  ): Promise<User> {
    return this.userService.editUser(userId, dto);
  }
}
