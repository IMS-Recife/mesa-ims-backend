import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { DatabaseService } from './database.service'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        ignoreUndefined: true,
        uri:
          configService.get<string>('NODE_ENV') === 'test'
            ? configService.get<string>('MONGO_DATABASE_TEST_URL')
            : configService.get<string>('MONGO_DATABASE_URL')
      }),
      inject: [ConfigService]
    })
  ],
  providers: [DatabaseService],
  exports: [DatabaseService]
})
export class DatabaseModule {}
