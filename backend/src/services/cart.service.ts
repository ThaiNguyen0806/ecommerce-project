import { BaseService, inject } from '@venizia/ignis';
import { getError } from '@venizia/ignis-helpers';
import { CartItemRepository } from '../repositories/cart.repository';

export class CartService extends BaseService {
  constructor(
    @inject({ key: 'repositories.CartItemRepository' })
    private cartItemRepository: CartItemRepository,
  ) {
    super({ scope: CartService.name });
  }

  async getCart(userId: number) {
    return this.cartItemRepository.findByUser(userId);
  }

  async addItem(userId: number, productId: number, quantity: number) {
    if (!productId || quantity < 1) {
      throw getError({ statusCode: 400, message: 'A valid productId and quantity are required' });
    }
    return this.cartItemRepository.addOrIncrement(userId, productId, quantity);
  }

  async updateQuantity(itemId: number, userId: number, quantity: number) {
    if (quantity < 1) {
      throw getError({ statusCode: 400, message: 'Quantity must be at least 1' });
    }
    const existing = await this.cartItemRepository.findItemById(itemId);
    if (!existing) {
      throw getError({ statusCode: 404, message: 'Cart item not found' });
    }
    if (existing.userId !== userId) {
      throw getError({ statusCode: 403, message: 'This is not your cart item' });
    }
    return this.cartItemRepository.updateQuantity(itemId, quantity);
  }

  async removeItem(itemId: number, userId: number) {
    const existing = await this.cartItemRepository.findItemById(itemId);
    if (!existing) {
      throw getError({ statusCode: 404, message: 'Cart item not found' });
    }
    if (existing.userId !== userId) {
      throw getError({ statusCode: 403, message: 'This is not your cart item' });
    }
    await this.cartItemRepository.deleteItem(itemId);
  }
}