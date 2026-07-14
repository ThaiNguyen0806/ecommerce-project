import type { IApplicationInfo } from '@venizia/ignis';
import {
  AuthenticateBindingKeys,
  AuthenticateComponent,
  Authentication,
  AuthenticationStrategyRegistry,
  BaseApplication,
  JOSEStandards,
  JWSAuthenticationStrategy,
  SwaggerBindingKeys,
  SwaggerComponent,
} from '@venizia/ignis';
import appInfo from './../package.json' with { type: 'json' };
import { AuthController } from './controllers/auth.controller';
import { CartController } from './controllers/cart.controller';
import { ProductController } from './controllers/product.controller';
import { PostgresDataSource } from './datasources/postgres.datasource';
import { CartItemRepository } from './repositories/cart.repository';
import { ProductRepository } from './repositories/product.repository';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { ProductService } from './services/product.service';
import { cors } from 'hono/cors'

export class Application extends BaseApplication {
  constructor() {
    super({
      scope: Application.name,
      config: {
        host: process.env.APP_ENV_SERVER_HOST ?? '0.0.0.0',
        port: +(process.env.APP_ENV_SERVER_PORT ?? 3000),
        path: { base: '/api', isStrict: false },
        debug: { shouldShowRoutes: true },
      },
    });
    this.init();
  }

  getAppInfo(): IApplicationInfo {
    return appInfo;
  }

  staticConfigure() {}

  preConfigure() {
    //Swagger docs
    this.bind({ key: SwaggerBindingKeys.SWAGGER_OPTIONS }).toValue({
      restOptions: {
        base: { path: '/docs' },
        doc: { path: '/openapi.json' },
        ui: { path: '/explorer', type: 'swagger' },
      },
      explorer: {
        openapi: '3.0.0',
        info: { title: 'Storefront API', version: '1.0.0', description: 'Storefront backend' },
        servers: [{ url: 'http://localhost:3000/api', description: 'Local development' }],
      },
    });
    this.component(SwaggerComponent);

    //JWT auth
    this.bind({ key: AuthenticateBindingKeys.JWT_OPTIONS }).toValue({
      standard: JOSEStandards.JWS,
      options: {
        jwtSecret: process.env.JWT_SECRET!,
        getTokenExpiresFn: () => 7 * 24 * 60 * 60, // 7 days, as a duration in seconds
      },
    });
    this.component(AuthenticateComponent);

    AuthenticationStrategyRegistry.getInstance().register({
      container: this,
      strategies: [{ name: Authentication.STRATEGY_JWT, strategy: JWSAuthenticationStrategy }],
    });

    //Database
    this.dataSource(PostgresDataSource);
    this.repository(UserRepository);
    this.repository(ProductRepository);
    this.repository(CartItemRepository);

    //Services
    this.service(AuthService);
    this.service(ProductService);
    this.service(CartService);

    //Controllers
    this.controller(AuthController);
    this.controller(ProductController);
    this.controller(CartController);
  }

  postConfigure() {}

  setupMiddlewares() {
    const server = this.getServer();
    server.use('*', cors({
      origin: ['http://localhost:3001'],
      credentials: true,
    }));
  }
}