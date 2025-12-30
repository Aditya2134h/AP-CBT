import User from '../models/User';
import { getLogger } from './logger';

export class UserService {
  private logger;

  constructor() {
    this.logger = getLogger();
  }

  public async getUsers(
    filters: {
      role?: string;
      status?: string;
      search?: string;
      classId?: string;
    } = {},
    limit: number = 100,
    skip: number = 0,
    sort: 'createdAt' | 'name' | 'loginCount' = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<any[]> {
    try {
      const query: any = {};

      if (filters.role) {
        query.role = filters.role;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.classId) {
        query.classes = filters.classId;
      }

      const sortField = sort === 'createdAt' ? { createdAt: order === 'desc' ? -1 : 1 } :
                       sort === 'name' ? { name: order === 'desc' ? -1 : 1 } :
                       { loginCount: order === 'desc' ? -1 : 1 };

      return await User.find(query)
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .select('-password -twoFactorSecret -twoFactorRecoveryCodes')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get users: ${error.message}`, 'USER');
      throw error;
    }
  }

  public async getUserCount(
    filters: {
      role?: string;
      status?: string;
      search?: string;
      classId?: string;
    } = {}
  ): Promise<number> {
    try {
      const query: any = {};

      if (filters.role) {
        query.role = filters.role;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.classId) {
        query.classes = filters.classId;
      }

      return await User.countDocuments(query);
    } catch (error) {
      this.logger.error(`Failed to get user count: ${error.message}`, 'USER');
      throw error;
    }
  }

  public async getUserById(id: string): Promise<any> {
    try {
      return await User.findById(id)
        .select('-password -twoFactorSecret -twoFactorRecoveryCodes')
        .populate('classes', 'name subject')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${id} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async getUserByEmail(email: string): Promise<any> {
    try {
      return await User.findOne({ email })
        .select('-password -twoFactorSecret -twoFactorRecoveryCodes')
        .populate('classes', 'name subject')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get user by email: ${email} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async createUser(userData: any): Promise<any> {
    try {
      const user = new User(userData);
      await user.save();

      this.logger.info(`User created: ${user._id}`, 'USER');

      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, 'USER');
      throw error;
    }
  }

  public async updateUser(id: string, updateData: any): Promise<any> {
    try {
      const user = await User.findByIdAndUpdate(id, updateData, { new: true })
        .select('-password -twoFactorSecret -twoFactorRecoveryCodes')
        .populate('classes', 'name subject')
        .exec();

      if (!user) {
        throw new Error('User not found');
      }

      this.logger.info(`User updated: ${id}`, 'USER');

      return user;
    } catch (error) {
      this.logger.error(`Failed to update user: ${id} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await User.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        throw new Error('User not found');
      }

      this.logger.info(`User deleted: ${id}`, 'USER');

      return true;
    } catch (error) {
      this.logger.error(`Failed to delete user: ${id} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async suspendUser(id: string): Promise<any> {
    try {
      return await this.updateUser(id, { status: 'suspended' });
    } catch (error) {
      this.logger.error(`Failed to suspend user: ${id} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async activateUser(id: string): Promise<any> {
    try {
      return await this.updateUser(id, { status: 'active' });
    } catch (error) {
      this.logger.error(`Failed to activate user: ${id} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async updateUserPassword(id: string, newPassword: string): Promise<any> {
    try {
      const user = await User.findById(id).exec();

      if (!user) {
        throw new Error('User not found');
      }

      user.password = newPassword;
      await user.save();

      this.logger.info(`User password updated: ${id}`, 'USER');

      return user;
    } catch (error) {
      this.logger.error(`Failed to update user password: ${id} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async updateUserAvatar(id: string, avatarUrl: string): Promise<any> {
    try {
      return await this.updateUser(id, { avatar: avatarUrl });
    } catch (error) {
      this.logger.error(`Failed to update user avatar: ${id} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async enableTwoFactor(id: string, secret: string, recoveryCodes: string[]): Promise<any> {
    try {
      return await this.updateUser(id, {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorRecoveryCodes: recoveryCodes,
      });
    } catch (error) {
      this.logger.error(`Failed to enable two-factor: ${id} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async disableTwoFactor(id: string): Promise<any> {
    try {
      return await this.updateUser(id, {
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
        twoFactorRecoveryCodes: undefined,
      });
    } catch (error) {
      this.logger.error(`Failed to disable two-factor: ${id} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async addUserToClass(userId: string, classId: string): Promise<any> {
    try {
      const user = await User.findById(userId).exec();

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.classes.includes(classId)) {
        user.classes.push(classId);
        await user.save();
      }

      this.logger.info(`User added to class: ${userId}, ${classId}`, 'USER');

      return user;
    } catch (error) {
      this.logger.error(`Failed to add user to class: ${userId}, ${classId} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async removeUserFromClass(userId: string, classId: string): Promise<any> {
    try {
      const user = await User.findById(userId).exec();

      if (!user) {
        throw new Error('User not found');
      }

      user.classes = user.classes.filter(id => id.toString() !== classId);
      await user.save();

      this.logger.info(`User removed from class: ${userId}, ${classId}`, 'USER');

      return user;
    } catch (error) {
      this.logger.error(`Failed to remove user from class: ${userId}, ${classId} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    byRole: Record<string, number>;
  }> {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ status: 'active' });
      const suspendedUsers = await User.countDocuments({ status: 'suspended' });

      const byRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);

      const roleStats: Record<string, number> = {
        'admin': 0,
        'instructor': 0,
        'student': 0,
      };

      byRole.forEach((item: any) => {
        if (item._id in roleStats) {
          roleStats[item._id] = item.count;
        }
      });

      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        byRole: roleStats,
      };
    } catch (error) {
      this.logger.error(`Failed to get user statistics: ${error.message}`, 'USER');
      throw error;
    }
  }

  public async getUserActivity(userId: string): Promise<{
    lastLogin: Date;
    loginCount: number;
    recentActivity: any[];
  }> {
    try {
      const user = await User.findById(userId)
        .select('lastLogin loginCount')
        .exec();

      if (!user) {
        throw new Error('User not found');
      }

      // In a real implementation, this would query audit logs
      // For now, we'll return mock data
      return {
        lastLogin: user.lastLogin || new Date(),
        loginCount: user.loginCount || 0,
        recentActivity: [
          { action: 'Logged in', timestamp: new Date() },
          { action: 'Viewed dashboard', timestamp: new Date(Date.now() - 3600000) },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get user activity: ${userId} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async searchUsers(query: string, limit: number = 10): Promise<any[]> {
    try {
      return await User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
        .limit(limit)
        .select('name email role status')
        .exec();
    } catch (error) {
      this.logger.error(`Failed to search users: ${error.message}`, 'USER');
      throw error;
    }
  }

  public async bulkImportUsers(users: any[]): Promise<{ success: number; failed: number }> {
    try {
      let success = 0;
      let failed = 0;

      for (const userData of users) {
        try {
          const existingUser = await User.findOne({ email: userData.email }).exec();

          if (existingUser) {
            // Update existing user
            await User.findByIdAndUpdate(existingUser._id, userData);
          } else {
            // Create new user
            const user = new User(userData);
            await user.save();
          }

          success++;
        } catch (error) {
          this.logger.warn(`Failed to import user: ${userData.email} - ${error.message}`, 'USER');
          failed++;
        }
      }

      this.logger.info(`Bulk import users: ${success} success, ${failed} failed`, 'USER');

      return { success, failed };
    } catch (error) {
      this.logger.error(`Failed to bulk import users: ${error.message}`, 'USER');
      throw error;
    }
  }

  public async exportUsers(
    filters: {
      role?: string;
      status?: string;
      classId?: string;
    } = {}
  ): Promise<string> {
    try {
      const users = await this.getUsers(filters, 10000); // Limit to 10k users for export

      // Convert to CSV format
      const header = 'Name,Email,Role,Status,Last Login,Login Count,Classes\n';

      const rows = users.map(user => {
        const classes = user.classes?.map((c: any) => c.name || c._id).join('|') || '';
        return `"${user.name}","${user.email}","${user.role}","${user.status}","${user.lastLogin || ''}",${user.loginCount || 0},"${classes}"`;
      }).join('\n');

      return header + rows;
    } catch (error) {
      this.logger.error(`Failed to export users: ${error.message}`, 'USER');
      throw error;
    }
  }

  public async getUserPreferences(userId: string): Promise<Record<string, any>> {
    try {
      const user = await User.findById(userId).exec();

      if (!user) {
        throw new Error('User not found');
      }

      // In a real implementation, this would return user preferences
      // For now, we'll return mock data
      return {
        theme: 'light',
        language: 'en',
        notifications: true,
        emailFrequency: 'daily',
      };
    } catch (error) {
      this.logger.error(`Failed to get user preferences: ${userId} - ${error.message}`, 'USER');
      throw error;
    }
  }

  public async updateUserPreferences(userId: string, preferences: Record<string, any>): Promise<any> {
    try {
      // In a real implementation, this would update user preferences
      // For now, we'll just log it
      this.logger.info(`User preferences updated: ${userId}`, 'USER', { preferences });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to update user preferences: ${userId} - ${error.message}`, 'USER');
      throw error;
    }
  }
}

// Singleton instance
let userService: UserService | null = null;

export function getUserService(): UserService {
  if (!userService) {
    userService = new UserService();
  }
  return userService;
}

export async function getUsers(
  filters: {
    role?: string;
    status?: string;
    search?: string;
    classId?: string;
  } = {},
  limit: number = 100,
  skip: number = 0,
  sort: 'createdAt' | 'name' | 'loginCount' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Promise<any[]> {
  return getUserService().getUsers(filters, limit, skip, sort, order);
}

export async function getUserCount(
  filters: {
    role?: string;
    status?: string;
    search?: string;
    classId?: string;
  } = {}
): Promise<number> {
  return getUserService().getUserCount(filters);
}

export async function getUserById(id: string): Promise<any> {
  return getUserService().getUserById(id);
}

export async function getUserByEmail(email: string): Promise<any> {
  return getUserService().getUserByEmail(email);
}

export async function createUser(userData: any): Promise<any> {
  return getUserService().createUser(userData);
}

export async function updateUser(id: string, updateData: any): Promise<any> {
  return getUserService().updateUser(id, updateData);
}

export async function deleteUser(id: string): Promise<boolean> {
  return getUserService().deleteUser(id);
}

export async function suspendUser(id: string): Promise<any> {
  return getUserService().suspendUser(id);
}

export async function activateUser(id: string): Promise<any> {
  return getUserService().activateUser(id);
}

export async function updateUserPassword(id: string, newPassword: string): Promise<any> {
  return getUserService().updateUserPassword(id, newPassword);
}

export async function updateUserAvatar(id: string, avatarUrl: string): Promise<any> {
  return getUserService().updateUserAvatar(id, avatarUrl);
}

export async function enableTwoFactor(id: string, secret: string, recoveryCodes: string[]): Promise<any> {
  return getUserService().enableTwoFactor(id, secret, recoveryCodes);
}

export async function disableTwoFactor(id: string): Promise<any> {
  return getUserService().disableTwoFactor(id);
}

export async function addUserToClass(userId: string, classId: string): Promise<any> {
  return getUserService().addUserToClass(userId, classId);
}

export async function removeUserFromClass(userId: string, classId: string): Promise<any> {
  return getUserService().removeUserFromClass(userId, classId);
}

export async function getUserStatistics(): Promise<{
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  byRole: Record<string, number>;
}> {
  return getUserService().getUserStatistics();
}

export async function getUserActivity(userId: string): Promise<{
  lastLogin: Date;
  loginCount: number;
  recentActivity: any[];
}> {
  return getUserService().getUserActivity(userId);
}

export async function searchUsers(query: string, limit: number = 10): Promise<any[]> {
  return getUserService().searchUsers(query, limit);
}

export async function bulkImportUsers(users: any[]): Promise<{ success: number; failed: number }> {
  return getUserService().bulkImportUsers(users);
}

export async function exportUsers(
  filters: {
    role?: string;
    status?: string;
    classId?: string;
  } = {}
): Promise<string> {
  return getUserService().exportUsers(filters);
}

export async function getUserPreferences(userId: string): Promise<Record<string, any>> {
  return getUserService().getUserPreferences(userId);
}

export async function updateUserPreferences(userId: string, preferences: Record<string, any>): Promise<any> {
  return getUserService().updateUserPreferences(userId, preferences);
}