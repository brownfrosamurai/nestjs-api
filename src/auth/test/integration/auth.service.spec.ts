import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { AppModule } from '../../../app.module';
import { AuthService } from '../../auth.service';
import { Tokens } from '../../types';
import { PrismaService } from '../../../prisma/prisma.service';
import { decode } from 'jsonwebtoken';

const user = {
  email: 'test@test.com',
  password: 'super-secret-pass',
};

describe('Auth flow', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    // create test module
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // add prisma and auth service to test module
    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get(AuthService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  // test signup logic
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

  // test signin logic
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

  // test logout logic
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
  });

  // test refresh token logic
  describe('refresh', () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it('should throw error if no existing user', async () => {
      let tokens: Tokens | undefined;
      try {
        tokens = await authService.refreshTokens(1, '');
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should throw if user is logged out', async () => {
      // signup and save refresh token
      const _tokens = await authService.signup({
        email: user.email,
        password: user.password,
      });
      // get refresh token
      const rt = _tokens.refresh_token;

      // get id from user
      const decoded = decode(rt);
      const userId = Number(decoded?.sub);

      await authService.logout(userId);

      let tokens: Tokens | undefined;

      try {
        tokens = await authService.refreshTokens(userId, rt);
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should throw if refresh token is incorrect', async () => {
      await prisma.cleanDatabase();

      const _tokens = await authService.signup({
        email: user.email,
        password: user.password,
      });
      // get refresh token
      const rt = _tokens.refresh_token;

      // get id from user
      const decoded = decode(rt);
      const userId = Number(decoded?.sub);

      let tokens: Tokens | undefined;

      try {
        tokens = await authService.refreshTokens(userId, rt + '25sg');
      } catch (error) {
        expect(error.status).toBe(403);
      }

      expect(tokens).toBeUndefined();
    });

    it('should refresh tokens', async () => {
      await prisma.cleanDatabase();
      // log in the user again and save rt and at
      const _tokens = await authService.signup({
        email: user.email,
        password: user.password,
      });

      const rt = _tokens.refresh_token;
      const at = _tokens.access_token;

      // get id from user
      const decoded = decode(rt);
      const userId = Number(decoded?.sub);

      // since jwt uses seconds signature we need to wait for 1 second to have new jwts
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });

      const tokens = await authService.refreshTokens(userId, rt);
      expect(tokens).toBeDefined();

      // refreshed tokens should be different
      expect(tokens.access_token).not.toBe(at);
      expect(tokens.refresh_token).not.toBe(rt);
    });
  });
});
