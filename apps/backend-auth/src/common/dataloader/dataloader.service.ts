import { Injectable } from '@nestjs/common';
// TODO: Uncomment when dataloaders are implemented
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from '../../modules/users/entities/user.entity';
// import { Session } from '../../modules/sessions/entities/session.entity';
// import { Role } from '../../modules/rbac/entities/role.entity';
// import { Permission } from '../../modules/rbac/entities/permission.entity';

/**
 * DataLoader Service - Batch loading and N+1 query prevention
 * Automatically batches and caches requests within a single request context
 * Adapted for PostgreSQL/TypeORM (Auth Service)
 */

@Injectable()
export class DataLoaderService {
  constructor() {} // private readonly _permissionRepository: Repository<Permission> // @InjectRepository(Permission) // private readonly _roleRepository: Repository<Role>, // @InjectRepository(Role) // private readonly _sessionRepository: Repository<Session>, // @InjectRepository(Session) // private readonly _userRepository: Repository<User>, // @InjectRepository(User) // TODO: Implement dataloaders

  /**
   * Create user loader
   * Batches user lookups by ID
   * Note: Disabled due to missing dataloader package dependency
   */
  createUserLoader(): unknown {
    return null;
  }

  /**
   * Create session loader
   * Batches session lookups by ID
   * Note: Disabled due to missing dataloader package dependency
   */
  createSessionLoader(): unknown {
    return null;
  }

  /**
   * Create sessions by user loader
   * Batches session lookups for multiple users
   * Note: Disabled due to missing dataloader package dependency
   */
  createSessionsByUserLoader(): unknown {
    return null;
  }

  /**
   * Create role loader
   * Batches role lookups by ID
   * Note: Disabled due to missing dataloader package dependency
   */
  createRoleLoader(): unknown {
    return null;
  }

  /**
   * Create permission loader
   * Batches permission lookups by ID
   * Note: Disabled due to missing dataloader package dependency
   */
  createPermissionLoader(): unknown {
    return null;
  }

  /**
   * Create roles by user loader
   * Batches role lookups for multiple users
   * Note: Disabled due to missing dataloader package dependency
   */
  createRolesByUserLoader(): unknown {
    return null;
  }

  /**
   * Create permissions by user loader
   * Batches permission lookups for multiple users
   * Note: Disabled due to missing dataloader package dependency
   */
  createPermissionsByUserLoader(): unknown {
    return null;
  }

  /**
   * Create a DataLoader factory for request-scoped loaders
   * This should be used in a request-scoped provider
   */
  createLoaders() {
    return {
      userLoader: this.createUserLoader(),
      sessionLoader: this.createSessionLoader(),
      sessionsByUserLoader: this.createSessionsByUserLoader(),
      roleLoader: this.createRoleLoader(),
      permissionLoader: this.createPermissionLoader(),
      rolesByUserLoader: this.createRolesByUserLoader(),
      permissionsByUserLoader: this.createPermissionsByUserLoader(),
    };
  }
}

/**
 * Request-scoped DataLoader provider
 * Creates fresh loaders for each request to prevent cross-request data leakage
 */
export const DATALOADERS = Symbol('DATALOADERS');

export interface DataLoaders {
  userLoader: unknown;
  sessionLoader: unknown;
  sessionsByUserLoader: unknown;
  roleLoader: unknown;
  permissionLoader: unknown;
  rolesByUserLoader: unknown;
  permissionsByUserLoader: unknown;
}
