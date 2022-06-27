import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signup() {
    console.log({ data: 'I am sign up' });
  }

  signin() {
    console.log({ data: 'I am sign in' });
  }
}
