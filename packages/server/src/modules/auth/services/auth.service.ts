// Auth service implementation
import { Db as _Db } from "mongodb";
import bcryptjs from "bcryptjs";
import { AuthRepository } from "../repositories/auth.repository";

export class AuthService {
  private repository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.repository = authRepository;
  }

  /**
   * Authenticate a user with username and password
   * @param username The user's username
   * @param password The user's password
   * @returns User object without password if authentication is successful, null otherwise
   */
  async authenticateUser(username: string, password: string): Promise<Record<string, any> | null> {
    // Find user using repository
    const user = await this.repository.findByUsername(username);

    if (!user) {
      return null;
    }

    // Check password
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
