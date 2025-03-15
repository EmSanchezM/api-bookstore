import Surreal, { ConnectionStatus } from 'surrealdb';
import { getDatabaseConnection } from './connection';

export class Database {
  private static instance: Database;
  private db: Surreal | null = null;

  private constructor() {}

  public static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async getConnection() {
    if (!this.db) {
      this.db = await getDatabaseConnection();
    }

    return this.db;
  }

  public async closeConnection() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  public isConnected() {
    if (this.db === null) return false;

    return this.db.status === ConnectionStatus.Connected;
  }

  public async reconnect() {
    await this.closeConnection();
    return this.getConnection();
  }
}

export const database = Database.getInstance();
