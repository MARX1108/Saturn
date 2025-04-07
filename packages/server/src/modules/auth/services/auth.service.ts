// Auth service implementation
import { Db } from "mongodb";
import { AuthRepository } from "../repositories/auth.repository";

export class AuthService {
  private repository: AuthRepository;

  constructor(db: Db) {
    this.repository = new AuthRepository(db);
  }

  // Add Auth related methods here (login, registration, token validation, etc.)
}