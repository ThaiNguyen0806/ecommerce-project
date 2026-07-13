import { BaseService, inject } from '@venizia/ignis';
import { getError } from '@venizia/ignis-helpers';
import { ProductRepository } from '../repositories/product.repository';

export class ProductService extends BaseService {
  constructor(
    @inject({ key: 'repositories.ProductRepository' })
    private productRepository: ProductRepository,
  ) {
    super({ scope: ProductService.name });
  }

  async getAllProducts() {
    return this.productRepository.findAllProducts();
  }

  async getProductsBySeller(sellerId: number) {
    return this.productRepository.findBySeller(sellerId);
  }

  async getProductById(id: number) {
    const product = await this.productRepository.findProductById(id);
    if (!product) {
      throw getError({ statusCode: 404, message: 'Product not found' });
    }
    return product;
  }

  async createProduct(sellerId: number, name: string, description: string | undefined, priceCents: number) {
    if (!name) {
      throw getError({ statusCode: 400, message: 'Name is required' });
    }
    return this.productRepository.createProduct(sellerId, name, description, priceCents);
  }

  async updateProduct(id: number, sellerId: number, updates: { name: string; description?: string; priceCents: number }) {
    const existing = await this.productRepository.findProductById(id);
    if (!existing) {
      throw getError({ statusCode: 404, message: 'Product not found' });
    }
    if (existing.sellerId !== sellerId) {
      throw getError({ statusCode: 403, message: 'You do not own this product' });
    }
    return this.productRepository.updateProduct(id, updates.name, updates.description, updates.priceCents);
  }

  async deleteProduct(id: number, sellerId: number) {
    const existing = await this.productRepository.findProductById(id);
    if (!existing) {
      throw getError({ statusCode: 404, message: 'Product not found' });
    }
    if (existing.sellerId !== sellerId) {
      throw getError({ statusCode: 403, message: 'You do not own this product' });
    }
    await this.productRepository.deleteProduct(id);
  }
}