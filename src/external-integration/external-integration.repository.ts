import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { Model } from 'mongoose'

import { Layer } from '../location/entities/enum/layer.enum'
import { IntegrationInfo, IntegrationInfoDocument } from './entities/integration-info.schema'

@Injectable()
export class ExternalIntegrationRepository {
  constructor(
    @InjectModel(IntegrationInfo.name) private integrationInfoModel: Model<IntegrationInfoDocument>
  ) {}

  async updateIntegrationLastReadDate(integrationInfo: IntegrationInfoDocument) {
    integrationInfo.lastReadDate = new Date()
    await integrationInfo.save()
  }

  async getEnvLicensingIntegrationInfo() {
    return this.getIntegrationInfo(Layer.ENVIRONMENTAL_LICENSING)
  }

  async getUrbanLicensingIntegrationInfo() {
    return this.getIntegrationInfo(Layer.URBAN_LICENSING)
  }

  private async getIntegrationInfo(layer: Layer) {
    return this.integrationInfoModel.findOne({ layer })
  }
}
