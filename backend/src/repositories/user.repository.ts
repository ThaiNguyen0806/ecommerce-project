import { DefaultCRUDRepository, inject, repository } from '@venizia/ignis';
import { Pool } from 'pg';
import { PostgresDataSource } from '../datasources/postgres.datasource';
import { User } from '../models/user.model';

@repository({ model: User, dataSource: PostgresDataSource })
export class UserRepository extends DefaultCRUDRepository<typeof User.schema> {
  private pool: Pool;

  constructor(
    @inject({ key: 'datasources.PostgresDataSource' })
    dataSource: PostgresDataSource,
  ) {
    super(dataSource);
    this.pool = dataSource.getPool();
  }

  async findByEmail(email: string) {
    const result = await this.pool.query(
      `SELECT id, email, password_hash AS "passwordHash", created_at AS "createdAt"
       FROM users WHERE email = $1`,
      [email],
    );
    return result.rows[0];
  }

  async findUserById(id: number) {
    const result = await this.pool.query(
      `SELECT id, email, created_at AS "createdAt" FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  async createUser(email: string, passwordHash: string) {
    const result = await this.pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2)
       RETURNING id, email, created_at AS "createdAt"`,
      [email, passwordHash],
    );
    return result.rows[0];
  }
}