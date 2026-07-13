import { DefaultCRUDRepository, inject, repository } from '@venizia/ignis';
import { Pool } from 'pg';
import { PostgresDataSource } from '../datasources/postgres.datasource';
import { Product } from '../models/product.model';

@repository({ model: Product, dataSource: PostgresDataSource })
export class ProductRepository extends DefaultCRUDRepository<typeof Product.schema> {
  private pool: Pool;

  constructor(
    @inject({ key: 'datasources.PostgresDataSource' })
    dataSource: PostgresDataSource,
  ) {
    super(dataSource);
    this.pool = dataSource.getPool();
  }

  async findAllProducts() {
    const result = await this.pool.query(
      `SELECT products.id, products.seller_id AS "sellerId", products.name,
              products.description, products.price_cents AS "priceCents",
              products.created_at AS "createdAt", users.email AS "sellerEmail"
       FROM products
       JOIN users ON products.seller_id = users.id
       ORDER BY products.created_at DESC`,
    );
    return result.rows;
  }

  async findProductById(id: number) {
    const result = await this.pool.query(
      `SELECT id, seller_id AS "sellerId", name, description,
              price_cents AS "priceCents", created_at AS "createdAt"
       FROM products WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  async findBySeller(sellerId: number) {
    const result = await this.pool.query(
      `SELECT id, seller_id AS "sellerId", name, description,
              price_cents AS "priceCents", created_at AS "createdAt"
       FROM products WHERE seller_id = $1 ORDER BY created_at DESC`,
      [sellerId],
    );
    return result.rows;
  }

  async createProduct(sellerId: number, name: string, description: string | undefined, priceCents: number) {
    const result = await this.pool.query(
      `INSERT INTO products (seller_id, name, description, price_cents)
       VALUES ($1, $2, $3, $4)
       RETURNING id, seller_id AS "sellerId", name, description,
                 price_cents AS "priceCents", created_at AS "createdAt"`,
      [sellerId, name, description ?? null, priceCents],
    );
    return result.rows[0];
  }

  async updateProduct(id: number, name: string, description: string | undefined, priceCents: number) {
    const result = await this.pool.query(
      `UPDATE products SET name = $1, description = $2, price_cents = $3
       WHERE id = $4
       RETURNING id, seller_id AS "sellerId", name, description,
                 price_cents AS "priceCents", created_at AS "createdAt"`,
      [name, description ?? null, priceCents, id],
    );
    return result.rows[0];
  }

  async deleteProduct(id: number) {
    await this.pool.query(`DELETE FROM products WHERE id = $1`, [id]);
  }
}