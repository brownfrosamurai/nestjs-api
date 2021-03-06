import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({})], //register jwt module
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy], // Providers for the auth module
})
export class AuthModule {}
