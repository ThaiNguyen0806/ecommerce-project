import { BaseEntity, model } from '@venizia/ignis';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

@model({
  type: 'entity',
  settings: {
    hiddenProperties: ['passwordHash'],
  },
})
export class User extends BaseEntity<typeof User.schema> {
  static override schema = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    created_at: timestamp('created_at').defaultNow(),
  });
  static override relations = () => [];
  static override TABLE_NAME = 'users';
}