import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import axios, { AxiosResponse } from 'axios'
import * as Papa from 'papaparse'
import * as FormData from 'form-data'

import { gisDataInfo } from './entities/gis-data-info.constants'
import { IntegrationInfoDocument } from './entities/integration-info.schema'
import { ExternalIntegrationRepository } from './external-integration.repository'
import { FEATURE } from '../location/entities/location.constants'
import { CoordinateTypes } from '../location/entities/enum/coordinate-types.enum'
import { LocationService } from '../location/location.service'

@Injectable()
export class ExternalIntegrationService {
  private readonly nodeEnv: string
  private readonly logger = new Logger(ExternalIntegrationService.name)

  constructor(
    configService: ConfigService,
    private readonly locationService: LocationService,
    private readonly integrationRepository: ExternalIntegrationRepository
  ) {
    this.nodeEnv = configService.get<string>('NODE_ENV')
  }

  async updateEnvironmentalLicensing() {
    const integrationInfo = await this.getEnvLicensingInfo()

    const envLicensingCsv = await this.getCsvDadosRecifeData(integrationInfo)

    const envLicensingGeoJson = this.jsonToGeoJson(envLicensingCsv)

    await this.locationService.replaceEnvironmentalLicensing(envLicensingGeoJson)

    await this.integrationRepository.updateIntegrationLastReadDate(integrationInfo)
  }

  async updateUrbanLicensing() {
    const integrationInfo = await this.getUrbanLicensingInfo()

    const urbanLicensingCsv = await this.getCsvDadosRecifeData(integrationInfo)

    const urbanLicensingGeoJson = this.jsonToGeoJson(urbanLicensingCsv)

    await this.locationService.replaceUrbanLicensing(urbanLicensingGeoJson)

    await this.integrationRepository.updateIntegrationLastReadDate(integrationInfo)
  }

  private async getEnvLicensingInfo() {
    const integrationInfo = await this.integrationRepository.getEnvLicensingIntegrationInfo()

    if (!integrationInfo) {
      throw new Error('Dados de integração de Licenciamento Ambiental não encontrados')
    }

    return integrationInfo
  }

  private async getUrbanLicensingInfo() {
    const integrationInfo = await this.integrationRepository.getUrbanLicensingIntegrationInfo()

    if (!integrationInfo) {
      throw new Error('Dados de integração de Licenciamento Urbanístico não encontrados')
    }

    return integrationInfo
  }

  private async getCsvDadosRecifeData(integrationInfo: IntegrationInfoDocument) {
    if (this.nodeEnv === 'test') {
      return []
    }

    const resource = await this.getDadosRecifeResource(integrationInfo)
    if (!resource) {
      throw new Error(
        `Novos dados ${integrationInfo.dataType} da camada ${integrationInfo.layer} não encontrados. Última leitura em ${integrationInfo.lastReadDate}`
      )
    }

    const rawCsv: AxiosResponse<any, any> = await axios.get(resource.url)
    const parsedCsvAsJson = Papa.parse(rawCsv.data, { header: true })
    if (!parsedCsvAsJson || !parsedCsvAsJson.data || parsedCsvAsJson.data.length === 0) {
      throw new Error(
        `Erro ao transformar ${integrationInfo.dataType} da camada ${integrationInfo.layer} para JSON`
      )
    }

    return parsedCsvAsJson.data
  }

  private async getDadosRecifeResource(integrationInfo: IntegrationInfoDocument): Promise<any> {
    const baseResponse: AxiosResponse<any, any> = await axios.get(integrationInfo.url)

    return baseResponse.data.result.resources.find(
      (resource: any) =>
        resource.format === integrationInfo.dataType &&
        resource.id === integrationInfo.integrationId &&
        new Date(resource.last_modified) > integrationInfo.lastReadDate
    )
  }

  private jsonToGeoJson(dataArray: any[]) {
    return dataArray
      .filter((csvData: any) => csvData.latitude && csvData.longitude)
      .map((csvData: any) => {
        const { latitude, longitude, ...properties } = csvData

        return {
          type: FEATURE,
          geometry: {
            type: CoordinateTypes.Point,
            coordinates: [+longitude, +latitude]
          },
          properties
        }
      })
  }

  async fetchAndSaveSoilUsage() {
    for (let i = 1508068; i <= 1614658; i = i + 1000) {
      const formData = this.createArcGisWhereFormData(i, gisDataInfo.soilUsage.fields)

      const soilUsage: AxiosResponse<any, any> = await axios.post(
        gisDataInfo.soilUsage.url,
        formData,
        {
          headers: formData.getHeaders()
        }
      )

      try {
        await this.locationService.addSoilUsage(soilUsage.data.features)
      } catch (error) {
        this.logger.error(error)
      }
    }
  }

  async fetchAndSaveBuiltAreas() {
    for (let i = 1; i <= 74013; i = i + 3000) {
      const formData = this.createArcGisWhereFormData(i, gisDataInfo.builtAreas.fields)

      const builtAreas: AxiosResponse<any, any> = await axios.post(
        gisDataInfo.builtAreas.url,
        formData,
        {
          headers: formData.getHeaders()
        }
      )

      try {
        await this.locationService.addBuiltAreas(builtAreas.data.features)
      } catch (error) {
        this.logger.error(error)
      }
    }
  }

  async fetchAndSaveTrees() {
    for (let i = 0; i <= 258810; i = i + 10000) {
      const formData = this.createArcGisPageFormData(i, gisDataInfo.trees.fields)

      const trees: AxiosResponse<any, any> = await axios.post(
        gisDataInfo.trees.url,
        formData,
        {
          headers: formData.getHeaders()
        }
      )

      try {
        await this.locationService.addTrees(trees.data.features)
      } catch (error) {
        this.logger.error(error)
      }
    }
  }

  private createArcGisWhereFormData(id: number, fields: string) {
    const formData = new FormData()

    formData.append('where', `OBJECTID >= ${id.toString()}`)
    formData.append('geometryType', 'esriGeometryEnvelope')
    formData.append('spatialRel', 'esriSpatialRelIntersects')
    formData.append('outFields', fields)
    formData.append('returnGeometry', 'true')
    formData.append('returnTrueCurves', 'false')
    formData.append('returnIdsOnly', 'false')
    formData.append('returnCountOnly', 'false')
    formData.append('orderByFields', 'OBJECTID asc')
    formData.append('returnZ', 'false')
    formData.append('returnM', 'false')
    formData.append('returnDistinctValues', 'false')
    formData.append('f', 'geojson')

    return formData
  }

  private createArcGisPageFormData(offset: number, fields: string) {
    const formData = new FormData()

    formData.append('where', 'OBJECTID is not null')
    formData.append('geometryType', 'esriGeometryEnvelope')
    formData.append('spatialRel', 'esriSpatialRelIntersects')
    formData.append('outFields', fields)
    formData.append('returnGeometry', 'true')
    formData.append('returnTrueCurves', 'false')
    formData.append('returnIdsOnly', 'false')
    formData.append('returnCountOnly', 'false')
    formData.append('orderByFields', 'OBJECTID asc')
    formData.append('returnZ', 'false')
    formData.append('returnM', 'false')
    formData.append('returnDistinctValues', 'false')
    formData.append('f', 'geojson')
    formData.append('units', 'esriSRUnit_Meter')
    formData.append('returnExtentOnly', 'false')
    formData.append('multipatchOption', 'xyFootprint')
    formData.append('resultOffset', offset.toString())
    formData.append('resultRecordCount', '10000')
    formData.append('returnExceededLimitFeatures', 'false')
    formData.append('returnCentroid', 'false')
    formData.append('sqlFormat', 'none')
    formData.append('featureEncoding', 'esriDefault')

    return formData
  }
}
