import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { IntegrationInfo, IntegrationInfoSchema } from './entities/integration-info.schema'
import { ExternalIntegrationService } from './external-integration.service'
import { ExternalIntegrationRepository } from './external-integration.repository'
import { LocationModule } from '../location/location.module'
import { TasksService } from './tasks.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: IntegrationInfo.name, schema: IntegrationInfoSchema }]),
    LocationModule
  ],
  providers: [ExternalIntegrationService, ExternalIntegrationRepository, TasksService]
})
export class ExternalIntegrationModule {}
