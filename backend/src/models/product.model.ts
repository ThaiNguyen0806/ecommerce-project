import { BaseEntity, model } from '@venizia/ignis';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { User } from './user.model';

@model({ type: 'entity' })
export class Product extends BaseEntity<typeof Product.schema> {
  static override schema = pgTable('products', {
    id: serial('id').primaryKey(),
    sellerId: integer('seller_id').notNull().references(() => User.schema.id),
    name: text('name').notNull(),
    description: text('description'),
    priceCents: integer('price_cents').notNull(),
    created_at: timestamp('created_at').defaultNow(),
  });
  static override relations = () => [];
  static override TABLE_NAME = 'products';
}