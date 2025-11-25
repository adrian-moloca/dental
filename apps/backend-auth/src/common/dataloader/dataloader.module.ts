import { Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { DataLoaderService, DATALOADERS } from './dataloader.service';
import { User } from '../../modules/users/entities/user.entity';
import { Session } from '../../modules/sessions/entities/session.entity';
import { Role } from '../../modules/rbac/entities/role.entity';
import { Permission } from '../../modules/rbac/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session, Role, Permission])],
  providers: [
    DataLoaderService,
    // Request-scoped DataLoaders provider
    {
      provide: DATALOADERS,
      scope: Scope.REQUEST,
      inject: [DataLoaderService, REQUEST],
      useFactory: (dataLoaderService: DataLoaderService) => {
        return dataLoaderService.createLoaders();
      },
    },
  ],
  exports: [DataLoaderService, DATALOADERS],
})
export class DataLoaderModule {}
