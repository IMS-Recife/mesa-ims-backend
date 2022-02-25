import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { Connection } from 'mongoose'
import * as request from 'supertest'

import { AppModule } from '../../app.module'
import { DatabaseService } from '../../database/database.service'

import { CoordinateTypes } from '../entities/enum/coordinate-types.enum'
import { Layer } from '../entities/enum/layer.enum'
import { SoilCategories } from '../entities/enum/soil-categories.enum'

import { userStub } from '../../user/test/stubs/user.stub'
import { UserService } from '../../user/user.service'

const LOGIN_URL = '/v1/auth/login'
const LOCATION_URL = '/v1/map/layers'

const defaultPoint = {
  type: CoordinateTypes.Point,
  coordinates: [0, 0]
}

const defaultPolygon = {
  type: CoordinateTypes.Polygon,
  coordinates: [
    [
      [1, -1],
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1]
    ]
  ]
}

describe('Location controller', () => {
  let app: INestApplication
  let httpServer: any
  let dbConnection: Connection
  let token: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    httpServer = app.getHttpServer()
    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDbHandler()
    const userService = moduleRef.get<UserService>(UserService)

    const user = await userService.create(userStub())
    token = (
      await request(httpServer).post(LOGIN_URL).send({ email: user.email, password: '123123' })
    ).body.token.accessToken

    await dbConnection.collection('layerurbanlicensings').insertOne({
      properties: {},
      geometry: defaultPoint
    })
  })

  afterAll(async () => {
    await dbConnection.collection('users').deleteMany({})
    await dbConnection.collection('layerurbanlicensings').deleteMany({})
    await app.close()
  })

  describe('Get locations inside search area', () => {
    it('should get all locations inside perimeter', async () => {
      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.URBAN_LICENSING }],
          searchAreas: [defaultPolygon]
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.URBAN_LICENSING]).toBeDefined()
      expect(body[Layer.URBAN_LICENSING].length).toBe(1)
    })

    it('should return empty layer if no locations are inside specified perimeter', async () => {
      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.URBAN_LICENSING }],
          searchAreas: [
            {
              type: CoordinateTypes.Polygon,
              coordinates: [
                [
                  [1, 2],
                  [1, 3],
                  [0, 3],
                  [0, 2],
                  [1, 2]
                ]
              ]
            }
          ]
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.URBAN_LICENSING]).toBeDefined()
      expect(body[Layer.URBAN_LICENSING].length).toBe(0)
    })

    it('should get all locations inside perimeter with buffer', async () => {
      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.URBAN_LICENSING }],
          searchAreas: [
            {
              type: CoordinateTypes.Polygon,
              coordinates: [
                [
                  [0.076904296875, 0.22247258550188925],
                  [0.07415771484375, -0.1812741116415032],
                  [0.49713134765625, -0.17578097424708533],
                  [0.47515869140625, 0.24444505921620713],
                  [0.076904296875, 0.22247258550188925]
                ]
              ]
            }
          ],
          buffer: 10000
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.URBAN_LICENSING]).toBeDefined()
      expect(body[Layer.URBAN_LICENSING].length).toBe(1)
    })
  })

  describe('Search area types', () => {
    it('should get all locations in proximity to line', async () => {
      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.URBAN_LICENSING }],
          searchAreas: [
            {
              type: CoordinateTypes.LineString,
              coordinates: [
                [0.0185394287109375, 0.06111143860831213],
                [0.0164794921875, -0.0669479217776813]
              ]
            }
          ],
          buffer: 10000
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.URBAN_LICENSING]).toBeDefined()
      expect(body[Layer.URBAN_LICENSING].length).toBe(1)
    })

    it('should get all locations inside circle radius', async () => {
      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.URBAN_LICENSING }],
          searchAreas: [
            {
              type: CoordinateTypes.Point,
              coordinates: [-0.03948211669921874, 0.049781793052935015]
            }
          ],
          buffer: 10000
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.URBAN_LICENSING]).toBeDefined()
      expect(body[Layer.URBAN_LICENSING].length).toBe(1)
    })
  })

  describe('Search multiple areas', () => {
    it('should not repeat coordinate inside two polygons', async () => {
      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.URBAN_LICENSING }],
          searchAreas: [
            defaultPolygon,
            {
              type: CoordinateTypes.Polygon,
              coordinates: [
                [
                  [2, -2],
                  [2, 2],
                  [-2, 2],
                  [-2, -2],
                  [2, -2]
                ]
              ]
            }
          ],
          buffer: 10000
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.URBAN_LICENSING]).toBeDefined()
      expect(body[Layer.URBAN_LICENSING].length).toBe(1)
    })

    it('should get locations inside two polygons', async () => {
      const insertedInfo = await dbConnection.collection('layerurbanlicensings').insertOne({
        properties: {},
        geometry: {
          type: CoordinateTypes.Point,
          coordinates: [3, 3]
        }
      })

      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.URBAN_LICENSING }],
          searchAreas: [
            defaultPolygon,
            {
              type: CoordinateTypes.Polygon,
              coordinates: [
                [
                  [2.8894042968749996, 3.1843944923387464],
                  [2.8894042968749996, 2.8772079526533365],
                  [3.218994140625, 2.868978563877516],
                  [3.2464599609375, 3.2200443075356553],
                  [2.8894042968749996, 3.1843944923387464]
                ]
              ]
            }
          ],
          buffer: 10000
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.URBAN_LICENSING]).toBeDefined()
      expect(body[Layer.URBAN_LICENSING].length).toBe(2)

      await dbConnection
        .collection('layerurbanlicensings')
        .deleteOne({ _id: insertedInfo.insertedId })
    })
  })

  describe('Get layer types', () => {
    it('should get all environmental licensings', async () => {
      const insertedInfo = await dbConnection.collection('layerenvironmentallicensings').insertOne({
        properties: {},
        geometry: defaultPoint
      })

      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.ENVIRONMENTAL_LICENSING }],
          searchAreas: [defaultPolygon]
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.ENVIRONMENTAL_LICENSING]).toBeDefined()
      expect(body[Layer.ENVIRONMENTAL_LICENSING].length).toBe(1)
      expect(body[Layer.ENVIRONMENTAL_LICENSING][0].geometry.type).toBe(CoordinateTypes.Point)
      expect(body[Layer.ENVIRONMENTAL_LICENSING][0].geometry.coordinates.length).toBe(2)

      await dbConnection
        .collection('layerenvironmentallicensings')
        .deleteOne({ _id: insertedInfo.insertedId })
    })

    it('should get all trees', async () => {
      const insertedInfo = await dbConnection.collection('layertrees').insertOne({
        properties: {},
        geometry: defaultPoint
      })

      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.TREE }],
          searchAreas: [defaultPolygon]
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.TREE]).toBeDefined()
      expect(body[Layer.TREE].length).toBe(1)
      expect(body[Layer.TREE][0].geometry.type).toBe(CoordinateTypes.Point)
      expect(body[Layer.TREE][0].geometry.coordinates.length).toBe(2)

      await dbConnection.collection('layertrees').deleteOne({ _id: insertedInfo.insertedId })
    })

    it('should get all built areas', async () => {
      const insertedInfo = await dbConnection.collection('layerbuiltareas').insertOne({
        properties: {},
        geometry: defaultPoint
      })

      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.BUILT_AREA }],
          searchAreas: [defaultPolygon]
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.BUILT_AREA]).toBeDefined()
      expect(body[Layer.BUILT_AREA].length).toBe(1)
      expect(body[Layer.BUILT_AREA][0].geometry.type).toBe(CoordinateTypes.Point)
      expect(body[Layer.BUILT_AREA][0].geometry.coordinates.length).toBe(2)

      await dbConnection.collection('layerbuiltareas').deleteOne({ _id: insertedInfo.insertedId })
    })

    it('should get all non built areas', async () => {
      const insertedInfo = await dbConnection.collection('layernonbuiltareas').insertOne({
        properties: {},
        geometry: defaultPoint
      })

      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.NON_BUILT_AREA }],
          searchAreas: [defaultPolygon]
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.NON_BUILT_AREA]).toBeDefined()
      expect(body[Layer.NON_BUILT_AREA].length).toBe(1)
      expect(body[Layer.NON_BUILT_AREA][0].geometry.type).toBe(CoordinateTypes.Point)
      expect(body[Layer.NON_BUILT_AREA][0].geometry.coordinates.length).toBe(2)

      await dbConnection
        .collection('layernonbuiltareas')
        .deleteOne({ _id: insertedInfo.insertedId })
    })

    describe('Soil usage', () => {
      beforeAll(async () => {
        await dbConnection.collection('layersoilusages').insertMany([
          {
            properties: {
              TIPOEMPREENDIMENTO: 'CASA'
            },
            geometry: defaultPolygon
          },
          {
            properties: {
              TIPOEMPREENDIMENTO: 'APARTAMENTO'
            },
            geometry: {
              type: CoordinateTypes.Polygon,
              coordinates: [
                [
                  [1.1, -1.1],
                  [1.1, 1.1],
                  [-1.1, 1.1],
                  [-1.1, -1.1],
                  [1.1, -1.1]
                ]
              ]
            }
          },
          {
            properties: {
              TIPOEMPREENDIMENTO: 'HOTEL'
            },
            geometry: {
              type: CoordinateTypes.Polygon,
              coordinates: [
                [
                  [1.2, -1.2],
                  [1.2, 1.2],
                  [-1.2, 1.2],
                  [-1.2, -1.2],
                  [1.2, -1.2]
                ]
              ]
            }
          }
        ])
      })

      afterAll(async () => {
        await dbConnection.collection('layersoilusages').deleteMany({})
      })

      it('should get all soil usages without filter', async () => {
        const { status, body } = await request(httpServer)
          .post(LOCATION_URL)
          .send({
            layers: [{ name: Layer.SOIL_USAGE }],
            searchAreas: [
              {
                type: CoordinateTypes.Polygon,
                coordinates: [
                  [
                    [2, -2],
                    [2, 2],
                    [-2, 2],
                    [-2, -2],
                    [2, -2]
                  ]
                ]
              }
            ]
          })
          .auth(token, { type: 'bearer' })

        expect(status).toBe(200)

        expect(body).toBeDefined()
        expect(body[Layer.SOIL_USAGE]).toBeDefined()
        expect(body[Layer.SOIL_USAGE].length).toBe(3)
        expect(body[Layer.SOIL_USAGE][0].geometry.type).toBe(CoordinateTypes.Polygon)
        expect(body[Layer.SOIL_USAGE][0].geometry.coordinates.length).toBe(1)
      })

      it('should get soil usages with Habitacional filter', async () => {
        const { status, body } = await request(httpServer)
          .post(LOCATION_URL)
          .send({
            layers: [
              {
                name: Layer.SOIL_USAGE,
                filter: {
                  soilCategories: [SoilCategories.Habitacional]
                }
              }
            ],
            searchAreas: [
              {
                type: CoordinateTypes.Polygon,
                coordinates: [
                  [
                    [2, -2],
                    [2, 2],
                    [-2, 2],
                    [-2, -2],
                    [2, -2]
                  ]
                ]
              }
            ]
          })
          .auth(token, { type: 'bearer' })

        expect(status).toBe(200)

        expect(body).toBeDefined()
        expect(body[Layer.SOIL_USAGE]).toBeDefined()
        expect(body[Layer.SOIL_USAGE].length).toBe(2)
        expect(body[Layer.SOIL_USAGE][0].geometry.type).toBe(CoordinateTypes.Polygon)
        expect(body[Layer.SOIL_USAGE][0].geometry.coordinates.length).toBe(1)

        let isHabitacional = true
        for (const soilUsage of body[Layer.SOIL_USAGE]) {
          if (
            soilUsage.properties.TIPOEMPREENDIMENTO !== 'CASA' &&
            soilUsage.properties.TIPOEMPREENDIMENTO !== 'APARTAMENTO'
          ) {
            isHabitacional = false
          }
        }
        expect(isHabitacional).toBeTruthy()
      })

      it('should get soil usages with Comercial filter', async () => {
        const { status, body } = await request(httpServer)
          .post(LOCATION_URL)
          .send({
            layers: [
              {
                name: Layer.SOIL_USAGE,
                filter: {
                  soilCategories: [SoilCategories.Comercial]
                }
              }
            ],
            searchAreas: [
              {
                type: CoordinateTypes.Polygon,
                coordinates: [
                  [
                    [2, -2],
                    [2, 2],
                    [-2, 2],
                    [-2, -2],
                    [2, -2]
                  ]
                ]
              }
            ]
          })
          .auth(token, { type: 'bearer' })

        expect(status).toBe(200)

        expect(body).toBeDefined()
        expect(body[Layer.SOIL_USAGE]).toBeDefined()
        expect(body[Layer.SOIL_USAGE].length).toBe(1)
        expect(body[Layer.SOIL_USAGE][0].geometry.type).toBe(CoordinateTypes.Polygon)
        expect(body[Layer.SOIL_USAGE][0].geometry.coordinates.length).toBe(1)

        let isComercial = true
        for (const soilUsage of body[Layer.SOIL_USAGE]) {
          if (soilUsage.properties.TIPOEMPREENDIMENTO !== 'HOTEL') {
            isComercial = false
          }
        }
        expect(isComercial).toBeTruthy()
      })

      it('should get all soil usages with multiple filters', async () => {
        const { status, body } = await request(httpServer)
          .post(LOCATION_URL)
          .send({
            layers: [
              {
                name: Layer.SOIL_USAGE,
                filter: {
                  soilCategories: [SoilCategories.Habitacional, SoilCategories.Comercial]
                }
              }
            ],
            searchAreas: [
              {
                type: CoordinateTypes.Polygon,
                coordinates: [
                  [
                    [2, -2],
                    [2, 2],
                    [-2, 2],
                    [-2, -2],
                    [2, -2]
                  ]
                ]
              }
            ]
          })
          .auth(token, { type: 'bearer' })

        expect(status).toBe(200)

        expect(body).toBeDefined()
        expect(body[Layer.SOIL_USAGE]).toBeDefined()
        expect(body[Layer.SOIL_USAGE].length).toBe(3)
        expect(body[Layer.SOIL_USAGE][0].geometry.type).toBe(CoordinateTypes.Polygon)
        expect(body[Layer.SOIL_USAGE][0].geometry.coordinates.length).toBe(1)
      })
    })
  })

  describe('Get multiple layers at once', () => {
    beforeAll(async () => {
      await Promise.all([
        dbConnection.collection('layerbuiltareas').insertOne({
          properties: {
            value: Layer.BUILT_AREA
          },
          geometry: defaultPoint
        }),
        dbConnection.collection('layerenvironmentallicensings').insertOne({
          properties: {
            value: Layer.ENVIRONMENTAL_LICENSING
          },
          geometry: defaultPoint
        }),
        dbConnection.collection('layernonbuiltareas').insertOne({
          properties: {
            value: Layer.NON_BUILT_AREA
          },
          geometry: defaultPoint
        })
      ])
    })

    afterAll(async () => {
      await Promise.all([
        dbConnection.collection('layerbuiltareas').deleteMany({}),
        dbConnection.collection('layerenvironmentallicensings').deleteMany({}),
        dbConnection.collection('layernonbuiltareas').deleteMany({})
      ])
    })

    it('should get built areas and environmental licensings at once', async () => {
      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [{ name: Layer.BUILT_AREA }, { name: Layer.ENVIRONMENTAL_LICENSING }],
          searchAreas: [defaultPolygon]
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.BUILT_AREA]).toBeDefined()
      expect(body[Layer.BUILT_AREA].length).toBe(1)
      expect(body[Layer.ENVIRONMENTAL_LICENSING]).toBeDefined()
      expect(body[Layer.ENVIRONMENTAL_LICENSING].length).toBe(1)
    })

    it('should get built areas, environmental licensings and non built areas at once', async () => {
      const { status, body } = await request(httpServer)
        .post(LOCATION_URL)
        .send({
          layers: [
            { name: Layer.BUILT_AREA },
            { name: Layer.ENVIRONMENTAL_LICENSING },
            { name: Layer.NON_BUILT_AREA }
          ],
          searchAreas: [defaultPolygon]
        })
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body[Layer.BUILT_AREA]).toBeDefined()
      expect(body[Layer.BUILT_AREA].length).toBe(1)
      expect(body[Layer.ENVIRONMENTAL_LICENSING]).toBeDefined()
      expect(body[Layer.ENVIRONMENTAL_LICENSING].length).toBe(1)
      expect(body[Layer.NON_BUILT_AREA]).toBeDefined()
      expect(body[Layer.NON_BUILT_AREA].length).toBe(1)
    })
  })

  describe('Get location properties', () => {
    let locationIds = []

    beforeAll(async () => {
      const insertedInfos = await Promise.all([
        dbConnection.collection('layerbuiltareas').insertOne({
          properties: {
            value: Layer.BUILT_AREA
          },
          geometry: defaultPoint
        }),
        dbConnection.collection('layerenvironmentallicensings').insertOne({
          properties: {
            value: Layer.ENVIRONMENTAL_LICENSING
          },
          geometry: defaultPoint
        }),
        dbConnection.collection('layernonbuiltareas').insertOne({
          properties: {
            value: Layer.NON_BUILT_AREA
          },
          geometry: defaultPoint
        }),
        dbConnection.collection('layersoilusages').insertOne({
          properties: {
            value: Layer.SOIL_USAGE
          },
          geometry: defaultPoint
        }),
        dbConnection.collection('layertrees').insertOne({
          properties: {
            value: Layer.TREE
          },
          geometry: defaultPoint
        }),
        dbConnection.collection('layerurbanlicensings').insertOne({
          properties: {
            value: Layer.URBAN_LICENSING
          },
          geometry: defaultPoint
        })
      ])

      locationIds = insertedInfos.map((insertedInfo) => insertedInfo.insertedId)
    })

    afterAll(async () => {
      await Promise.all([
        dbConnection.collection('layerbuiltareas').deleteMany({}),
        dbConnection.collection('layerenvironmentallicensings').deleteMany({}),
        dbConnection.collection('layernonbuiltareas').deleteMany({}),
        dbConnection.collection('layersoilusages').deleteMany({}),
        dbConnection.collection('layertrees').deleteMany({}),
        dbConnection.collection('layerurbanlicensings').deleteMany({})
      ])
    })

    it('should get built area location properties', async () => {
      const { status, body } = await request(httpServer)
        .get(`${LOCATION_URL}/${Layer.BUILT_AREA}/${locationIds[0].toString()}/properties`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body._id).toBe(locationIds[0].toString())
      expect(body.properties).toBeDefined()
      expect(body.properties.value).toBe(Layer.BUILT_AREA)
    })

    it('should get environmental licensing location properties', async () => {
      const { status, body } = await request(httpServer)
        .get(
          `${LOCATION_URL}/${Layer.ENVIRONMENTAL_LICENSING}/${locationIds[1].toString()}/properties`
        )
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body._id).toBe(locationIds[1].toString())
      expect(body.properties).toBeDefined()
      expect(body.properties.value).toBe(Layer.ENVIRONMENTAL_LICENSING)
    })

    it('should get non built area location properties', async () => {
      const { status, body } = await request(httpServer)
        .get(`${LOCATION_URL}/${Layer.NON_BUILT_AREA}/${locationIds[2].toString()}/properties`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body._id).toBe(locationIds[2].toString())
      expect(body.properties).toBeDefined()
      expect(body.properties.value).toBe(Layer.NON_BUILT_AREA)
    })

    it('should get soil usage location properties', async () => {
      const { status, body } = await request(httpServer)
        .get(`${LOCATION_URL}/${Layer.SOIL_USAGE}/${locationIds[3].toString()}/properties`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body._id).toBe(locationIds[3].toString())
      expect(body.properties).toBeDefined()
      expect(body.properties.value).toBe(Layer.SOIL_USAGE)
    })

    it('should get tree location properties', async () => {
      const { status, body } = await request(httpServer)
        .get(`${LOCATION_URL}/${Layer.TREE}/${locationIds[4].toString()}/properties`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body._id).toBe(locationIds[4].toString())
      expect(body.properties).toBeDefined()
      expect(body.properties.value).toBe(Layer.TREE)
    })

    it('should get urban licensing location properties', async () => {
      const { status, body } = await request(httpServer)
        .get(`${LOCATION_URL}/${Layer.URBAN_LICENSING}/${locationIds[5].toString()}/properties`)
        .auth(token, { type: 'bearer' })

      expect(status).toBe(200)

      expect(body).toBeDefined()
      expect(body._id).toBe(locationIds[5].toString())
      expect(body.properties).toBeDefined()
      expect(body.properties.value).toBe(Layer.URBAN_LICENSING)
    })
  })
})
