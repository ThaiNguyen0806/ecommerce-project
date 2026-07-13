import { z } from '@hono/zod-openapi';
import {
  Authentication,
  BaseRestController,
  controller,
  get,
  IJWTTokenPayload,
  inject,
  jsonContent,
  jsonResponse,
  post,
  TAuthStrategy,
  TRouteContext,
} from '@venizia/ignis';
import { HTTP } from '@venizia/ignis-helpers';
import { AuthService } from '../services/auth.service';

const AuthRoutes = {
  REGISTER: {
    path: '/register',
    request: {
      body: jsonContent({
        description: 'Register a new user',
        schema: z.object({
          email: z.email(),
          password: z.string().min(6),
        }),
      }),
    },
    responses: jsonResponse({
      description: 'User created',
      schema: z.object({ user: z.object({ id: z.number(), email: z.string() }) }),
    }),
  },
  LOGIN: {
    path: '/login',
    request: {
      body: jsonContent({
        description: 'Login with email and password',
        schema: z.object({
          email: z.email(),
          password: z.string(),
        }),
      }),
    },
    responses: jsonResponse({
      description: 'Returns JWT token',
      schema: z.object({ token: z.string() }),
    }),
  },
  ME: {
    path: '/me',
    authenticate: { strategies: [Authentication.STRATEGY_JWT] as TAuthStrategy[] },
    responses: jsonResponse({
      description: 'Returns current logged in user',
      schema: z.object({ id: z.number(), email: z.string() }),
    }),
  },
};

@controller({ path: '/auth' })
export class AuthController extends BaseRestController {
  constructor(
    @inject({ key: 'services.AuthService' })
    private authService: AuthService,
  ) {
    super({ scope: AuthController.name });
  }

  override binding() {}

  @post({ configs: AuthRoutes.REGISTER })
  async register(c: TRouteContext) {
    try {
      const { email, password } = c.req.valid<{ email: string; password: string }>('json');
      const user = await this.authService.register(email, password);
      return c.json({ user }, HTTP.ResultCodes.RS_2.Created);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }

  @post({ configs: AuthRoutes.LOGIN })
  async login(c: TRouteContext) {
    try {
      const { email, password } = c.req.valid<{ email: string; password: string }>('json');
      const result = await this.authService.login(email, password);
      return c.json(result, HTTP.ResultCodes.RS_2.Ok);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }

  @get({ configs: AuthRoutes.ME })
  async me(c: TRouteContext) {
    try {
      const user = c.get(Authentication.CURRENT_USER) as IJWTTokenPayload;
      const result = await this.authService.getMe(Number(user.userId));
      return c.json({ user: result }, HTTP.ResultCodes.RS_2.Ok);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }
}