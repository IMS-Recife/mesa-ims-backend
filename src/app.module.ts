import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BootstrapService } from './bootstrap.service'
import { envValidationSchema } from './app.validation'

import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './database/database.module'
import { LocationModule } from './location/location.module'
import { MailModule } from './mail/mail.module'
import { ProjectModule } from './project/project.module'
import { ExternalIntegrationModule } from './external-integration/external-integration.module'
import { FilterModule } from './filter/filter.module'
import { WideSearchModule } from './wide-search/wide-search.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UserModule,
    AuthModule,
    LocationModule,
    MailModule,
    ProjectModule,
    ExternalIntegrationModule,
    FilterModule,
    WideSearchModule
  ],
  controllers: [AppController],
  providers: [AppService, BootstrapService]
})
export class AppModule {}
