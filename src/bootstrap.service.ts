import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Connection } from 'mongoose'

import { DatabaseService } from './database/database.service'
import { DataTypes } from './external-integration/enum/data-types.enum'
import { Layer } from './location/entities/enum/layer.enum'

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name)
  private readonly dbConnection: Connection
  private readonly nodeEnv: string

  constructor(databaseService: DatabaseService, configService: ConfigService) {
    this.dbConnection = databaseService.getDbHandler()
    this.nodeEnv = configService.get<string>('NODE_ENV')
  }

  async onApplicationBootstrap() {
    if (this.nodeEnv === 'test') {
      return
    }

    await this.checkEnvLicensingIntegrationInfo()
    await this.checkUrbanLicensingIntegrationInfo()

    await this.checkProjectFilters()
  }

  private async checkEnvLicensingIntegrationInfo() {
    const envLicensingIntegrationInfo = await this.dbConnection
      .collection('integrationinfos')
      .findOne({
        layer: Layer.ENVIRONMENTAL_LICENSING
      })

    if (!envLicensingIntegrationInfo) {
      this.logger.log('Environmental licensing integration info not found. Creating now.')

      await this.dbConnection.collection('integrationinfos').insertOne({
        url: 'http://dados.recife.pe.gov.br/api/3/action/package_show?id=licenciamento-ambiental',
        dataType: DataTypes.CSV,
        integrationId: '921244a8-fe47-4192-a57d-084830337f99',
        layer: Layer.ENVIRONMENTAL_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })
    }
  }

  private async checkUrbanLicensingIntegrationInfo() {
    const urbanLicensingIntegrationInfo = await this.dbConnection
      .collection('integrationinfos')
      .findOne({
        layer: Layer.URBAN_LICENSING
      })

    if (!urbanLicensingIntegrationInfo) {
      this.logger.log('Urban licensing integration info not found. Creating now.')

      await this.dbConnection.collection('integrationinfos').insertOne({
        url: 'http://dados.recife.pe.gov.br/api/3/action/package_show?id=licenciamento-urbanistico',
        dataType: DataTypes.CSV,
        integrationId: '77c885c4-76ca-45eb-9209-06c5d217122d',
        layer: Layer.URBAN_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })
    }
  }

  private async checkProjectFilters() {
    const projectFilter = await this.dbConnection.collection('filters').findOne({
      key: 'project'
    })

    if (!projectFilter) {
      this.logger.log('Project filter not found. Creating now.')

      await this.dbConnection.collection('filters').insertOne({
        key: 'project',
        values: {
          name: ['Parque Capibaribe'],
          location: ['Recife'],
          responsibleOrg: ['URB'],
          relatedOrg: ['INCITI/UFPE', 'CTTU', 'EMLURB', 'URB', 'Consórcio Beira Rio'],
          tematicGroup: ['Meio Ambiente']
        }
      })
    }
  }
}
