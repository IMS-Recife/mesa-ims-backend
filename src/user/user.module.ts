import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthModule } from '../auth/auth.module'
import { NotificationService } from './notification.service'
import { ProjectModule } from '../project/project.module'

import { User, UserSchema } from './entities/user.schema'
import { UserController } from './user.controller'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
    ProjectModule
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, NotificationService],
  exports: [UserService]
})
export class UserModule {}
