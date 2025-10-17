import { TestData } from '../utils/TestData';

export interface User {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  type: 'standard' | 'locked' | 'problem' | 'performance' | 'error';
}

export class UserFactory {
  /**
   * Create a standard user
   */
  static createStandardUser(): User {
    return {
      username: TestData.VALID_USERNAME,
      password: TestData.VALID_PASSWORD,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      type: 'standard',
    };
  }

  /**
   * Create a locked user
   */
  static createLockedUser(): User {
    return {
      username: TestData.LOCKED_USERNAME,
      password: TestData.VALID_PASSWORD,
      firstName: 'Locked',
      lastName: 'User',
      email: 'locked.user@example.com',
      type: 'locked',
    };
  }

  /**
   * Create a problem user
   */
  static createProblemUser(): User {
    return {
      username: TestData.PROBLEM_USERNAME,
      password: TestData.VALID_PASSWORD,
      firstName: 'Problem',
      lastName: 'User',
      email: 'problem.user@example.com',
      type: 'problem',
    };
  }

  /**
   * Create a performance glitch user
   */
  static createPerformanceUser(): User {
    return {
      username: TestData.PERFORMANCE_USERNAME,
      password: TestData.VALID_PASSWORD,
      firstName: 'Performance',
      lastName: 'User',
      email: 'performance.user@example.com',
      type: 'performance',
    };
  }

  /**
   * Create an error user
   */
  static createErrorUser(): User {
    return {
      username: 'error_user',
      password: TestData.VALID_PASSWORD,
      firstName: 'Error',
      lastName: 'User',
      email: 'error.user@example.com',
      type: 'error',
    };
  }

  /**
   * Create a random user with valid credentials
   */
  static createRandomUser(): User {
    const randomId = Math.random().toString(36).substring(2, 8);
    return {
      username: `user_${randomId}`,
      password: TestData.VALID_PASSWORD,
      firstName: this.generateRandomName(),
      lastName: this.generateRandomName(),
      email: `user_${randomId}@example.com`,
      type: 'standard',
    };
  }

  /**
   * Create a user with invalid credentials
   */
  static createInvalidUser(): User {
    return {
      username: TestData.INVALID_USERNAME,
      password: TestData.INVALID_PASSWORD,
      firstName: 'Invalid',
      lastName: 'User',
      email: 'invalid.user@example.com',
      type: 'standard',
    };
  }

  /**
   * Create multiple users for testing
   */
  static createMultipleUsers(count: number): User[] {
    const users: User[] = [];
    
    // Add standard users
    for (let i = 0; i < count; i++) {
      users.push(this.createRandomUser());
    }
    
    return users;
  }

  /**
   * Create a user with specific type
   */
  static createUserByType(type: User['type']): User {
    switch (type) {
      case 'standard':
        return this.createStandardUser();
      case 'locked':
        return this.createLockedUser();
      case 'problem':
        return this.createProblemUser();
      case 'performance':
        return this.createPerformanceUser();
      case 'error':
        return this.createErrorUser();
      default:
        return this.createStandardUser();
    }
  }

  /**
   * Generate random name
   */
  private static generateRandomName(): string {
    const names = [
      'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
      'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul',
      'Quinn', 'Ruby', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
      'Yara', 'Zoe'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Validate user data
   */
  static validateUser(user: User): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!user.username || user.username.trim() === '') {
      errors.push('Username is required');
    }

    if (!user.password || user.password.trim() === '') {
      errors.push('Password is required');
    }

    if (!user.firstName || user.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!user.lastName || user.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    if (!user.email || !this.isValidEmail(user.email)) {
      errors.push('Valid email is required');
    }

    const validTypes: User['type'][] = ['standard', 'locked', 'problem', 'performance', 'error'];
    if (!validTypes.includes(user.type)) {
      errors.push('Invalid user type');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if email is valid
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get user by username
   */
  static getUserByUsername(username: string): User | null {
    const users = [
      this.createStandardUser(),
      this.createLockedUser(),
      this.createProblemUser(),
      this.createPerformanceUser(),
      this.createErrorUser(),
    ];

    return users.find(user => user.username === username) || null;
  }

  /**
   * Get all user types
   */
  static getAllUserTypes(): User['type'][] {
    return ['standard', 'locked', 'problem', 'performance', 'error'];
  }

  /**
   * Get users by type
   */
  static getUsersByType(type: User['type']): User[] {
    return [this.createUserByType(type)];
  }
}
