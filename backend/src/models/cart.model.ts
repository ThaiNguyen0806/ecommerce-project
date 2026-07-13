import { BaseEntity, model } from '@venizia/ignis';
import { integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';
import { Product } from './product.model';
import { User } from './user.model';

@model({ type: 'entity' })
export class CartItem extends BaseEntity<typeof CartItem.schema> {
  static override schema = pgTable('cart_items', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => User.schema.id),
    productId: integer('product_id').notNull().references(() => Product.schema.id),
    quantity: integer('quantity').notNull().default(1),
    created_at: timestamp('created_at').defaultNow(),
  });
  static override relations = () => [];
  static override TABLE_NAME = 'cart_items';
}