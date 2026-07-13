import { DefaultCRUDRepository, inject, repository } from '@venizia/ignis';
import { Pool } from 'pg';
import { PostgresDataSource } from '../datasources/postgres.datasource';
import { CartItem } from '../models/cart.model';

@repository({ model: CartItem, dataSource: PostgresDataSource })
export class CartItemRepository extends DefaultCRUDRepository<typeof CartItem.schema> {
  private pool: Pool;

  constructor(
    @inject({ key: 'datasources.PostgresDataSource' })
    dataSource: PostgresDataSource,
  ) {
    super(dataSource);
    this.pool = dataSource.getPool();
  }

  async findByUser(userId: number) {
    const result = await this.pool.query(
      `SELECT cart_items.id, cart_items.quantity,
              cart_items.user_id AS "userId",
              cart_items.product_id AS "productId",
              products.name, products.price_cents AS "priceCents"
       FROM cart_items
       JOIN products ON cart_items.product_id = products.id
       WHERE cart_items.user_id = $1
       ORDER BY cart_items.created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findOneByUserAndProduct(userId: number, productId: number) {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", product_id AS "productId", quantity
       FROM cart_items WHERE user_id = $1 AND product_id = $2`,
      [userId, productId],
    );
    return result.rows[0];
  }

  async findItemById(id: number) {
    const result = await this.pool.query(
      `SELECT id, user_id AS "userId", product_id AS "productId", quantity
       FROM cart_items WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  async addOrIncrement(userId: number, productId: number, quantity: number) {
    const existing = await this.findOneByUserAndProduct(userId, productId);

    if (existing) {
      const result = await this.pool.query(
        `UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2
         RETURNING id, user_id AS "userId", product_id AS "productId", quantity`,
        [quantity, existing.id],
      );
      return result.rows[0];
    }

    const result = await this.pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)
       RETURNING id, user_id AS "userId", product_id AS "productId", quantity`,
      [userId, productId, quantity],
    );
    return result.rows[0];
  }

  async updateQuantity(id: number, quantity: number) {
    const result = await this.pool.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2
       RETURNING id, user_id AS "userId", product_id AS "productId", quantity`,
      [quantity, id],
    );
    return result.rows[0];
  }

  async deleteItem(id: number) {
    await this.pool.query(`DELETE FROM cart_items WHERE id = $1`, [id]);
  }
}