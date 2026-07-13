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
import { CartService } from '../services/cart.service';

const JWT = { strategies: [Authentication.STRATEGY_JWT] as TAuthStrategy[] };

const CartRoutes = {
  GET_CART: {
    path: '/',
    authenticate: JWT,
    responses: jsonResponse({ description: "Returns the current user's cart", schema: z.object({ items: z.array(z.any()) }) }),
  },
  ADD_ITEM: {
    path: '/',
    authenticate: JWT,
    request: {
      body: jsonContent({
        description: 'Add a product to the cart',
        schema: z.object({
          productId: z.number().int(),
          quantity: z.number().int().positive().default(1),
        }),
      }),
    },
    responses: jsonResponse({ description: 'Item added', schema: z.object({ item: z.any() }) }),
  },
  UPDATE_QUANTITY: {
    path: '/{id}',
    authenticate: JWT,
    request: {
      params: z.object({ id: z.string() }),
      body: jsonContent({ description: 'Update quantity', schema: z.object({ quantity: z.number().int().positive() }) }),
    },
    responses: jsonResponse({ description: 'Item updated', schema: z.object({ item: z.any() }) }),
  },
  REMOVE_ITEM: {
    path: '/{id}',
    authenticate: JWT,
    request: { params: z.object({ id: z.string() }) },
    responses: jsonResponse({ description: 'Item removed', schema: z.object({ message: z.string() }) }),
  },
};

@controller({ path: '/cart' })
export class CartController extends BaseRestController {
  constructor(
    @inject({ key: 'services.CartService' })
    private cartService: CartService,
  ) {
    super({ scope: CartController.name });
  }

  override binding() {}

  @get({ configs: CartRoutes.GET_CART })
  async getCart(c: TRouteContext) {
    try {
      const user = c.get(Authentication.CURRENT_USER) as IJWTTokenPayload;
      const items = await this.cartService.getCart(parseInt(user.userId as string));
      return c.json({ items }, HTTP.ResultCodes.RS_2.Ok);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }

  @post({ configs: CartRoutes.ADD_ITEM })
  async addItem(c: TRouteContext) {
    try {
      const user = c.get(Authentication.CURRENT_USER) as IJWTTokenPayload;
      const { productId, quantity } = c.req.valid<{ productId: number; quantity: number }>('json');
      const item = await this.cartService.addItem(parseInt(user.userId as string), productId, quantity);
      return c.json({ item }, HTTP.ResultCodes.RS_2.Created);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }

  @put({ configs: CartRoutes.UPDATE_QUANTITY })
  async updateQuantity(c: TRouteContext) {
    try {
      const user = c.get(Authentication.CURRENT_USER) as IJWTTokenPayload;
      const { id } = c.req.valid<{ id: string }>('param');
      const { quantity } = c.req.valid<{ quantity: number }>('json');
      const item = await this.cartService.updateQuantity(parseInt(id), parseInt(user.userId as string), quantity);
      return c.json({ item }, HTTP.ResultCodes.RS_2.Ok);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }

  @del({ configs: CartRoutes.REMOVE_ITEM })
  async removeItem(c: TRouteContext) {
    try {
      const user = c.get(Authentication.CURRENT_USER) as IJWTTokenPayload;
      const { id } = c.req.valid<{ id: string }>('param');
      await this.cartService.removeItem(parseInt(id), parseInt(user.userId as string));
      return c.json({ message: 'Item removed' }, HTTP.ResultCodes.RS_2.Ok);
    } catch (err: any) {
      return c.json({ message: err.message ?? 'Internal server error' }, err.statusCode ?? 500);
    }
  }
}