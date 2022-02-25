import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'

import { ExternalIntegrationService } from './external-integration.service'

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)
  private readonly nodeEnv: string

  constructor(
    configService: ConfigService,
    private readonly externalIntegrationService: ExternalIntegrationService
  ) {
    this.nodeEnv = configService.get<string>('NODE_ENV')
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async handleCron() {
    if (this.nodeEnv !== 'test') {
      await this.updateEnvironmentalLicensing()

      await this.updateUrbanLicensing()
    }
  }

  private async updateEnvironmentalLicensing() {
    this.logger.log('Starting update of environmental licensing')

    try {
      await this.externalIntegrationService.updateEnvironmentalLicensing()
    } catch (error) {
      this.logger.error(error)
    }

    this.logger.log('Update of environmental licensing finished')
  }

  private async updateUrbanLicensing() {
    this.logger.log('Starting update of urban licensing')

    try {
      await this.externalIntegrationService.updateUrbanLicensing()
    } catch (error) {
      this.logger.error(error)
    }
    
    this.logger.log('Update of urban licensing finished')
  }
}
