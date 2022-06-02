import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { Connection } from 'mongoose'

import { AppModule } from '../../app.module'
import { DatabaseService } from '../../database/database.service'
import { ExternalIntegrationService } from '../external-integration.service'
import { CoordinateTypes } from '../../location/entities/enum/coordinate-types.enum'
import { Layer } from '../../location/entities/enum/layer.enum'

describe('External integration service', () => {
  let app: INestApplication
  let dbConnection: Connection
  let httpServer: any
  let externalIntegrationService: ExternalIntegrationService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDbHandler()
    httpServer = app.getHttpServer()
    externalIntegrationService = moduleRef.get<ExternalIntegrationService>(
      ExternalIntegrationService
    )
  })

  afterEach(async () => {
    await dbConnection.collection('layerenvironmentallicensings').deleteMany({})
    await dbConnection.collection('layerurbanlicensings').deleteMany({})
    await dbConnection.collection('integrationinfos').deleteMany({})
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Environmental licensing integration', () => {
    it('should create new environmental licensing documents', async () => {
      await dbConnection.collection('integrationinfos').insertOne({
        url: 'http://url.com',
        dataType: 'CSV',
        integrationId: '123456',
        layer: Layer.ENVIRONMENTAL_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })

      const parsedData = [
        {
          bairro: 'PINA',
          categoria: 'Atividade',
          latitude: 1,
          longitude: 2
        },
        {
          bairro: 'SAN MARTIN',
          categoria: 'Obra',
          latitude: 3,
          longitude: 4
        }
      ]

      jest
        // @ts-ignore-start
        .spyOn(ExternalIntegrationService.prototype, 'getCsvDadosRecifeData')
        // @ts-ignore-end
        .mockImplementationOnce(async () => {
          return parsedData
        })

      await externalIntegrationService.updateEnvironmentalLicensing()

      const envLicensings = await dbConnection
        .collection('layerenvironmentallicensings')
        .find({})
        .sort({ 'properties.categoria': 1 })
        .toArray()

      expect(envLicensings.length).toBe(2)

      expect(envLicensings[0].properties.bairro).toBe(parsedData[0].bairro)
      expect(envLicensings[0].properties.categoria).toBe(parsedData[0].categoria)
      expect(envLicensings[0].geometry.type).toBe(CoordinateTypes.Point)
      expect(envLicensings[0].geometry.coordinates[0]).toBe(parsedData[0].longitude)
      expect(envLicensings[0].geometry.coordinates[1]).toBe(parsedData[0].latitude)

      expect(envLicensings[1].properties.bairro).toBe(parsedData[1].bairro)
      expect(envLicensings[1].properties.categoria).toBe(parsedData[1].categoria)
      expect(envLicensings[1].geometry.type).toBe(CoordinateTypes.Point)
      expect(envLicensings[1].geometry.coordinates[0]).toBe(parsedData[1].longitude)
      expect(envLicensings[1].geometry.coordinates[1]).toBe(parsedData[1].latitude)

      const integrationInfo = await dbConnection.collection('integrationinfos').findOne({
        layer: Layer.ENVIRONMENTAL_LICENSING
      })
      expect(integrationInfo.lastReadDate).not.toBe('2022-01-01T00:00:00.0')
    })

    it('should replace existing environmental licensing documents', async () => {
      await dbConnection.collection('integrationinfos').insertOne({
        url: 'http://url.com',
        dataType: 'CSV',
        integrationId: '123456',
        layer: Layer.ENVIRONMENTAL_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })

      await dbConnection.collection('layerenvironmentallicensings').insertOne({
        properties: {
          bairro: 'PINA',
          categoria: 'Atividade'
        },
        geometry: {
          type: CoordinateTypes.Point,
          coordinates: [2, 1]
        }
      })

      const parsedData = [
        {
          bairro: 'SAN MARTIN',
          categoria: 'Obra',
          latitude: 3,
          longitude: 4
        }
      ]

      jest
        // @ts-ignore-start
        .spyOn(ExternalIntegrationService.prototype, 'getCsvDadosRecifeData')
        // @ts-ignore-end
        .mockImplementationOnce(async () => {
          return parsedData
        })

      await externalIntegrationService.updateEnvironmentalLicensing()

      const envLicensings = await dbConnection
        .collection('layerenvironmentallicensings')
        .find({})
        .sort({ 'properties.categoria': 1 })
        .toArray()

      expect(envLicensings.length).toBe(1)

      expect(envLicensings[0].properties.bairro).toBe(parsedData[0].bairro)
      expect(envLicensings[0].properties.categoria).toBe(parsedData[0].categoria)
      expect(envLicensings[0].geometry.type).toBe(CoordinateTypes.Point)
      expect(envLicensings[0].geometry.coordinates[0]).toBe(parsedData[0].longitude)
      expect(envLicensings[0].geometry.coordinates[1]).toBe(parsedData[0].latitude)
    })

    it('should fail if integration info does not exist', async () => {
      await expect(externalIntegrationService.updateEnvironmentalLicensing()).rejects.toThrow(
        'Dados de integração de Licenciamento Ambiental não encontrados'
      )

      const envLicensingCount = await dbConnection
        .collection('layerenvironmentallicensings')
        .countDocuments({})
      expect(envLicensingCount).toBe(0)
    })

    it('should fail if dados recife resource is not found', async () => {
      await dbConnection.collection('integrationinfos').insertOne({
        url: 'http://url.com',
        dataType: 'CSV',
        integrationId: '123456',
        layer: Layer.ENVIRONMENTAL_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })

      const errorMessage = 'Dados CSV de Licenciamento Ambiental não encontrados'

      jest
        // @ts-ignore-start
        .spyOn(ExternalIntegrationService.prototype, 'getCsvDadosRecifeData')
        // @ts-ignore-end
        .mockImplementationOnce(async () => {
          throw new Error(errorMessage)
        })

      await expect(externalIntegrationService.updateEnvironmentalLicensing()).rejects.toThrow(
        errorMessage
      )

      const envLicensingCount = await dbConnection
        .collection('layerenvironmentallicensings')
        .countDocuments({})
      expect(envLicensingCount).toBe(0)
    })

    it('should fail if integration last updated date is before stored last read date', async () => {
      await dbConnection.collection('integrationinfos').insertOne({
        url: 'http://url.com',
        dataType: 'CSV',
        integrationId: '123456',
        layer: Layer.ENVIRONMENTAL_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })

      const errorMessage = 'Dados CSV de Licenciamento Ambiental não encontrados'

      jest
        // @ts-ignore-start
        .spyOn(ExternalIntegrationService.prototype, 'getCsvDadosRecifeData')
        // @ts-ignore-end
        .mockImplementationOnce(async () => {
          throw new Error(errorMessage)
        })

      await expect(externalIntegrationService.updateEnvironmentalLicensing()).rejects.toThrow(
        errorMessage
      )

      const envLicensingCount = await dbConnection
        .collection('layerenvironmentallicensings')
        .countDocuments({})
      expect(envLicensingCount).toBe(0)
    })

    it('should fail if csv to json conversion has erros', async () => {
      await dbConnection.collection('integrationinfos').insertOne({
        url: 'http://url.com',
        dataType: 'CSV',
        integrationId: '123456',
        layer: Layer.ENVIRONMENTAL_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })

      const errorMessage = 'Erro ao transformar CSV de Licenciamento Ambiental para JSON'

      jest
        // @ts-ignore-start
        .spyOn(ExternalIntegrationService.prototype, 'getCsvDadosRecifeData')
        // @ts-ignore-end
        .mockImplementationOnce(async () => {
          throw new Error(errorMessage)
        })

      await expect(externalIntegrationService.updateEnvironmentalLicensing()).rejects.toThrow(
        errorMessage
      )

      const envLicensingCount = await dbConnection
        .collection('layerenvironmentallicensings')
        .countDocuments({})
      expect(envLicensingCount).toBe(0)
    })
  })

  describe('Urban licensing integration', () => {
    it('should create new urban licensing documents', async () => {
      await dbConnection.collection('integrationinfos').insertOne({
        url: 'http://url.com',
        dataType: 'CSV',
        integrationId: '123456',
        layer: Layer.URBAN_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })

      const parsedData = [
        {
          bairro: 'PINA',
          categoria: 'Atividade',
          latitude: 1,
          longitude: 2
        },
        {
          bairro: 'SAN MARTIN',
          categoria: 'Obra',
          latitude: 3,
          longitude: 4
        }
      ]

      jest
        // @ts-ignore-start
        .spyOn(ExternalIntegrationService.prototype, 'getCsvDadosRecifeData')
        // @ts-ignore-end
        .mockImplementationOnce(async () => {
          return parsedData
        })

      await externalIntegrationService.updateUrbanLicensing()

      const urbanLicensings = await dbConnection
        .collection('layerurbanlicensings')
        .find({})
        .sort({ 'properties.categoria': 1 })
        .toArray()

      expect(urbanLicensings.length).toBe(2)

      expect(urbanLicensings[0].properties.bairro).toBe(parsedData[0].bairro)
      expect(urbanLicensings[0].properties.categoria).toBe(parsedData[0].categoria)
      expect(urbanLicensings[0].geometry.type).toBe(CoordinateTypes.Point)
      expect(urbanLicensings[0].geometry.coordinates[0]).toBe(parsedData[0].longitude)
      expect(urbanLicensings[0].geometry.coordinates[1]).toBe(parsedData[0].latitude)

      expect(urbanLicensings[1].properties.bairro).toBe(parsedData[1].bairro)
      expect(urbanLicensings[1].properties.categoria).toBe(parsedData[1].categoria)
      expect(urbanLicensings[1].geometry.type).toBe(CoordinateTypes.Point)
      expect(urbanLicensings[1].geometry.coordinates[0]).toBe(parsedData[1].longitude)
      expect(urbanLicensings[1].geometry.coordinates[1]).toBe(parsedData[1].latitude)

      const integrationInfo = await dbConnection.collection('integrationinfos').findOne({
        layer: Layer.URBAN_LICENSING
      })
      expect(integrationInfo.lastReadDate).not.toBe('2022-01-01T00:00:00.0')
    })

    it('should replace existing urban licensing documents', async () => {
      await dbConnection.collection('integrationinfos').insertOne({
        url: 'http://url.com',
        dataType: 'CSV',
        integrationId: '123456',
        layer: Layer.URBAN_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })

      await dbConnection.collection('layerurbanlicensings').insertOne({
        properties: {
          bairro: 'PINA',
          categoria: 'Atividade'
        },
        geometry: {
          type: CoordinateTypes.Point,
          coordinates: [2, 1]
        }
      })

      const parsedData = [
        {
          bairro: 'SAN MARTIN',
          categoria: 'Obra',
          latitude: 3,
          longitude: 4
        }
      ]

      jest
        // @ts-ignore-start
        .spyOn(ExternalIntegrationService.prototype, 'getCsvDadosRecifeData')
        // @ts-ignore-end
        .mockImplementationOnce(async () => {
          return parsedData
        })

      await externalIntegrationService.updateUrbanLicensing()

      const urbanLicensings = await dbConnection
        .collection('layerurbanlicensings')
        .find({})
        .sort({ 'properties.categoria': 1 })
        .toArray()

      expect(urbanLicensings.length).toBe(1)

      expect(urbanLicensings[0].properties.bairro).toBe(parsedData[0].bairro)
      expect(urbanLicensings[0].properties.categoria).toBe(parsedData[0].categoria)
      expect(urbanLicensings[0].geometry.type).toBe(CoordinateTypes.Point)
      expect(urbanLicensings[0].geometry.coordinates[0]).toBe(parsedData[0].longitude)
      expect(urbanLicensings[0].geometry.coordinates[1]).toBe(parsedData[0].latitude)
    })

    it('should fail if integration info does not exist', async () => {
      await expect(externalIntegrationService.updateUrbanLicensing()).rejects.toThrow(
        'Dados de integração de Licenciamento Urbanístico não encontrados'
      )

      const urbanLicensingCount = await dbConnection
        .collection('layerurbanlicensings')
        .countDocuments({})
      expect(urbanLicensingCount).toBe(0)
    })

    it('should fail if dados recife resource is not found', async () => {
      await dbConnection.collection('integrationinfos').insertOne({
        url: 'http://url.com',
        dataType: 'CSV',
        integrationId: '123456',
        layer: Layer.URBAN_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })

      const errorMessage = 'Dados CSV de Licenciamento Urbanístico não encontrados'

      jest
        // @ts-ignore-start
        .spyOn(ExternalIntegrationService.prototype, 'getCsvDadosRecifeData')
        // @ts-ignore-end
        .mockImplementationOnce(async () => {
          throw new Error(errorMessage)
        })

      await expect(externalIntegrationService.updateUrbanLicensing()).rejects.toThrow(
        errorMessage
      )

      const urbanLicensingCount = await dbConnection
        .collection('layerurbanlicensings')
        .countDocuments({})
      expect(urbanLicensingCount).toBe(0)
    })

    it('should fail if integration last updated date is before stored last read date', async () => {
      await dbConnection.collection('integrationinfos').insertOne({
        url: 'http://url.com',
        dataType: 'CSV',
        integrationId: '123456',
        layer: Layer.URBAN_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })

      const errorMessage = 'Dados CSV de Licenciamento Urbanístico não encontrados'

      jest
        // @ts-ignore-start
        .spyOn(ExternalIntegrationService.prototype, 'getCsvDadosRecifeData')
        // @ts-ignore-end
        .mockImplementationOnce(async () => {
          throw new Error(errorMessage)
        })

      await expect(externalIntegrationService.updateUrbanLicensing()).rejects.toThrow(
        errorMessage
      )

      const urbanLicensingCount = await dbConnection
        .collection('layerurbanlicensings')
        .countDocuments({})
      expect(urbanLicensingCount).toBe(0)
    })

    it('should fail if csv to json conversion has erros', async () => {
      await dbConnection.collection('integrationinfos').insertOne({
        url: 'http://url.com',
        dataType: 'CSV',
        integrationId: '123456',
        layer: Layer.URBAN_LICENSING,
        lastReadDate: '2022-01-01T00:00:00.0'
      })

      const errorMessage = 'Erro ao transformar CSV de Licenciamento Urbanístico para JSON'

      jest
        // @ts-ignore-start
        .spyOn(ExternalIntegrationService.prototype, 'getCsvDadosRecifeData')
        // @ts-ignore-end
        .mockImplementationOnce(async () => {
          throw new Error(errorMessage)
        })

      await expect(externalIntegrationService.updateUrbanLicensing()).rejects.toThrow(
        errorMessage
      )

      const urbanLicensingCount = await dbConnection
        .collection('layerurbanlicensings')
        .countDocuments({})
      expect(urbanLicensingCount).toBe(0)
    })
  })
})
