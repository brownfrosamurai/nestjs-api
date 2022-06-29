import { AuthGuard } from '@nestjs/passport';

export class RtGuard extends AuthGuard('refresh-jwt') {
  constructor() {
    super();
  }
}
