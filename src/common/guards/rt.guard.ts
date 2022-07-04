import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class RtGuard extends AuthGuard('refresh-jwt') {
  constructor() {
    super();
  }
}
