import { z } from '@hono/zod-openapi';
import {
  Authentication,
  BaseRestController,
  controller,
  del,
  get,
  IJWTTokenPayload,
  inject,
  jsonContent,
  jsonResponse,
  post,
  put,
  TAuthStrategy,
  TRouteContext,
} from '@venizia/ignis';
import { HTTP } from '@venizia/ignis-helpers';
import { ProductService } from '../services/product.service';

const JWT = { strategies: [Authentication.STRATEGY_JWT] as TAuthStrategy[] };

const ProductRoutes = {
  GET_ALL: {
    path: '/',
    responses: jsonResponse({ description: 'Returns all products', schema: z.object({ products: z.array(z.any()) }) }),
  },
  GET_BY_SELLER: {
    path: '/seller/{sellerId}',
    request: { params: z.object({ sellerId: z.string() }) },
    responses: jsonResponse({ description: 'Returns all products by a seller', schema: z.object({ products: z.array(z.any()) }) }),
  },
  GET_BY_ID: {
    path: '/{id}',
    request: { params: z.object({ id: z.string() }) },
    responses: jsonResponse({ description: 'Returns a single product', schema: z.object({ product: z.any() }) }),
  },
  CREATE: {
    path: '/',
    authenticate: JWT,
    request: {
      body: jsonContent({
        description: 'List a new product',
        schema: z.object({
          name: z.string(),
          description: z.string().optional(),
          priceCents: z.number().int().positive(),
        }),
      }),
    },
    responses: jsonResponse({ description: 'Product created', schema: z.object({ product: z.any() }) }),
  },
  UPDATE: {
    path: '/{id}',
    authenticate: JWT,
    request: {
      params: z.object({ id: z.string() }),
      body: jsonContent({
        description: 'Update a product',
        schema: z.object({
          name: z.string(),
          description: z.string().optional(),
          priceCents: z.number().int().positive(),
        }),
      }),
    },
    responses: jsonResponse({ description: 'Product updated', schema: z.object({ product: z.any() }) }),
  },
  DELETE: {
    path: '/{id}',
    authenticate: JWT,
    request: { params: z.object({ id: z.string() }) },
    responses: jsonResponse({ description: 'Product deleted', schema: z.object({ message: z.string() }) }),
  },
};

@controller({ path: '/products' })
export class ProductController extends BaseRestController {
  constructor(
    @inject({ key: 'services.ProductService' })
    private productService: ProductService,
  ) {
    super({ scope: ProductController.name });
  }

  override binding() {}

  @get({ configs: ProductRoutes.GET_ALL })
  async getAllProducts(c: TRouteContext) {
    try {
      const products = await this.productService.getAllProducts();
      return c.json({ products }, HTTP.ResultCodes.RS_2.Ok);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }

  @get({ configs: ProductRoutes.GET_BY_SELLER })
  async getProductsBySeller(c: TRouteContext) {
    try {
      const { sellerId } = c.req.valid<{ sellerId: string }>('param');
      const products = await this.productService.getProductsBySeller(parseInt(sellerId));
      return c.json({ products }, HTTP.ResultCodes.RS_2.Ok);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }

  @get({ configs: ProductRoutes.GET_BY_ID })
  async getProductById(c: TRouteContext) {
    try {
      const { id } = c.req.valid<{ id: string }>('param');
      const product = await this.productService.getProductById(parseInt(id));
      return c.json({ product }, HTTP.ResultCodes.RS_2.Ok);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }

  @post({ configs: ProductRoutes.CREATE })
  async createProduct(c: TRouteContext) {
    try {
      const user = c.get(Authentication.CURRENT_USER) as IJWTTokenPayload;
      const sellerId = parseInt(user.userId as string);
      const { name, description, priceCents } = c.req.valid<{
        name: string;
        description?: string;
        priceCents: number;
      }>('json');
      const product = await this.productService.createProduct(sellerId, name, description, priceCents);
      return c.json({ product }, HTTP.ResultCodes.RS_2.Created);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }

  @put({ configs: ProductRoutes.UPDATE })
  async updateProduct(c: TRouteContext) {
    try {
      const user = c.get(Authentication.CURRENT_USER) as IJWTTokenPayload;
      const sellerId = parseInt(user.userId as string);
      const { id } = c.req.valid<{ id: string }>('param');
      const { name, description, priceCents } = c.req.valid<{
        name: string;
        description?: string;
        priceCents: number;
      }>('json');
      const product = await this.productService.updateProduct(parseInt(id), sellerId, { name, description, priceCents });
      return c.json({ product }, HTTP.ResultCodes.RS_2.Ok);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }

  @del({ configs: ProductRoutes.DELETE })
  async deleteProduct(c: TRouteContext) {
    try {
      const user = c.get(Authentication.CURRENT_USER) as IJWTTokenPayload;
      const sellerId = parseInt(user.userId as string);
      const { id } = c.req.valid<{ id: string }>('param');
      await this.productService.deleteProduct(parseInt(id), sellerId);
      return c.json({ message: 'Product deleted' }, HTTP.ResultCodes.RS_2.Ok);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }
}