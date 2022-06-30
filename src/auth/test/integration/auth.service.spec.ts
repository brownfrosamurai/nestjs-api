import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { AppModule } from '../../../app.module';
import { AuthService } from '../../auth.service';
import { Tokens } from '../../types';
import { PrismaService } from '../../../prisma/prisma.service';

const user = {
  email: 'test@test.com',
  password: 'super-secret-pass',
};

describe('Auth flow', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get(AuthService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe('signup', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should signup', async () => {
      const tokens = await authService.signup({
        email: user.email,
        password: user.password,
      });

      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
    });

    it('should throw on duplicate sign up', async () => {
      let tokens: Tokens | undefined;
      try {
        await authService.signup({
          email: user.email,
          password: user.password,
        });
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });
  });

  describe('signin', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should throw if no existing user', async () => {
      let tokens: Tokens | undefined;
      try {
        tokens = await authService.signin({
          email: user.email,
          password: user.password,
        });
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should login', async () => {
      await authService.signup({
        email: user.email,
        password: user.password,
      });

      const tokens = await authService.signin({
        email: user.email,
        password: user.password,
      });

      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
    });

    it('should throw if password is incorrect', async () => {
      let tokens: Tokens | undefined;
      try {
        tokens = await authService.signin({
          email: user.email,
          password: user.password + 'wrongPassword',
        });
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });
  });

  describe('logout', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should pass if call to non existing user', async () => {
      try {
        await authService.logout(4);
      } catch (error) {
        expect(error.status).toBe(401);
      }
    });

    it('should logout', async () => {
      await authService.signup({
        email: user.email,
        password: user.password,
      });

      let userFromDb: User | undefined;

      userFromDb = await prisma.user.findFirst({
        where: { email: user.email },
      });

      expect(userFromDb?.hashedRt).toBeTruthy();

      // logout
      await authService.logout(userFromDb?.id);

      userFromDb = await prisma.user.findFirst({
        where: { email: user.email },
      });

      expect(userFromDb?.hashedRt).toBeFalsy();
    });
  }); //
});
