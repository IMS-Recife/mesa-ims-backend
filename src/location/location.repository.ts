import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Layer } from './entities/enum/layer.enum'
import { LayerBuiltArea, LayerBuiltAreaDocument } from './entities/layers/layer-built-area.schema'
import {
  LayerEnvironmentalLicensing,
  LayerEnvironmentalLicensingDocument
} from './entities/layers/layer-environmental-licensing.schema'
import {
  LayerNonBuiltArea,
  LayerNonBuiltAreaDocument
} from './entities/layers/layer-non-built-area.schema'
import {
  LayerPopulation2010,
  LayerPopulation2010Document
} from './entities/layers/layer-population-2010.schema'
import {
  LayerPercentageHouseholdsTreesDocument,
  PercentageHouseholdsTrees
} from './entities/layers/layer-percentage-households-trees.schema'
import { LayerSoilUsage, LayerSoilUsageDocument } from './entities/layers/layer-soil-usage.schema'
import { LayerTree, LayerTreeDocument } from './entities/layers/layer-tree.schema'
import {
  LayerUrbanLicensing,
  LayerUrbanLicensingDocument
} from './entities/layers/layer-urban-licensing.schema'

const DEFAULT_CHUNK_SIZE = 10000

const DEFAULT_LOCATION_FIELDS = ['type', 'geometry.coordinates', 'geometry.type']

@Injectable()
export class LocationRepository {
  layerModelRelation = {}

  constructor(
    @InjectModel(LayerBuiltArea.name) private builtAreaModel: Model<LayerBuiltAreaDocument>,

    @InjectModel(LayerEnvironmentalLicensing.name)
    private envLicensingModel: Model<LayerEnvironmentalLicensingDocument>,

    @InjectModel(LayerNonBuiltArea.name)
    private nonBuiltAreaModel: Model<LayerNonBuiltAreaDocument>,

    @InjectModel(LayerTree.name)
    private treeModel: Model<LayerTreeDocument>,

    @InjectModel(LayerSoilUsage.name)
    private soilUsageModel: Model<LayerSoilUsageDocument>,

    @InjectModel(LayerUrbanLicensing.name)
    private urbanLicensingModel: Model<LayerUrbanLicensingDocument>,

    @InjectModel(LayerPopulation2010.name)
    private populationModel: Model<LayerPopulation2010Document>,
    @InjectModel(PercentageHouseholdsTrees.name)
    private percentageHouseholdsTreesModel: Model<LayerPercentageHouseholdsTreesDocument>
  ) {
    this.layerModelRelation = {
      [Layer.BUILT_AREA]: this.builtAreaModel,
      [Layer.ENVIRONMENTAL_LICENSING]: this.envLicensingModel,
      [Layer.NON_BUILT_AREA]: this.nonBuiltAreaModel,
      [Layer.SOIL_USAGE]: this.soilUsageModel,
      [Layer.TREE]: this.treeModel,
      [Layer.URBAN_LICENSING]: this.urbanLicensingModel,
      [Layer.POPULATION2010]: this.populationModel,
      [Layer.PERCENTAGEHOUSEHOLDSTREES]: this.percentageHouseholdsTreesModel
    }
  }

  async getNonBuiltAreas(queryObj: any): Promise<LayerNonBuiltAreaDocument[]> {
    return this.nonBuiltAreaModel.find(queryObj).select(DEFAULT_LOCATION_FIELDS)
  }

  async getBuiltAreas(queryObj: any): Promise<LayerBuiltAreaDocument[]> {
    return this.builtAreaModel.find(queryObj).select(DEFAULT_LOCATION_FIELDS)
  }

  async getEnvLicensing(queryObj: any): Promise<LayerEnvironmentalLicensingDocument[]> {
    return this.envLicensingModel
      .find(queryObj)
      .select([...DEFAULT_LOCATION_FIELDS, 'properties.potencial_empreendimento'])
  }

  async getSoilUsage(queryObj: any): Promise<LayerSoilUsageDocument[]> {
    return this.soilUsageModel
      .find(queryObj)
      .select([...DEFAULT_LOCATION_FIELDS, 'properties.TIPOEMPREENDIMENTO'])
  }

  async getTree(queryObj: any): Promise<LayerTreeDocument[]> {
    console.log(queryObj)
    return this.treeModel.find(queryObj).select(DEFAULT_LOCATION_FIELDS)
  }

  async getUrbanLicensing(queryObj: any): Promise<LayerUrbanLicensingDocument[]> {
    return this.urbanLicensingModel
      .find(queryObj)
      .select([
        ...DEFAULT_LOCATION_FIELDS,
        'properties.categoria_empreendimento',
        'properties.empreendimento_de_impacto'
      ])
  }
  async getPopulation(queryObj: any): Promise<LayerPopulation2010Document[]> {
    // console.log('aqui',queryObj)
    let teste = await this.populationModel.find(queryObj)
    // .select(['geometry.coordinates'])
    console.log(teste)
    return teste
  }
  async getPercentageHouseholdsTrees(
    queryObj: any
  ): Promise<LayerPercentageHouseholdsTreesDocument[]> {
    return this.percentageHouseholdsTreesModel.find(queryObj)
  }
  async getPopulationNoPost(nameColection: any) {
    let teste = await this.populationModel.find({ nameColection })
    console.log(teste)
    return teste
  }

  async getLocationProperties(layerName: Layer, locationId: string) {
    return this.layerModelRelation[layerName].findById(locationId).select(['properties'])
  }

  async replaceEnvironmentalLicensing(envLicensingData: any[]) {
    await this.envLicensingModel.deleteMany({})

    const envLicensingChunks = this.splitArrayInChunks(envLicensingData, DEFAULT_CHUNK_SIZE)

    for (const envLicensingChunk of envLicensingChunks) {
      await this.envLicensingModel.insertMany(envLicensingChunk, { ordered: false })
    }
  }

  async replaceUrbanLicensing(urbanLicensingData: any[]) {
    await this.urbanLicensingModel.deleteMany({})

    const urbanLicensingChunks = this.splitArrayInChunks(urbanLicensingData, DEFAULT_CHUNK_SIZE)

    for (const urbanLicensingChunk of urbanLicensingChunks) {
      await this.urbanLicensingModel.insertMany(urbanLicensingChunk, { ordered: false })
    }
  }

  private splitArrayInChunks(originalArray: any[], chunkSize: number) {
    return originalArray.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / chunkSize)

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []
      }

      resultArray[chunkIndex].push(item)

      return resultArray
    }, [])
  }

  async addSoilUsage(soilUsageData: any[]) {
    await this.soilUsageModel.insertMany(soilUsageData, { ordered: false })
  }

  async addBuiltAreas(builtAreaData: any[]) {
    await this.builtAreaModel.insertMany(builtAreaData, { ordered: false })
  }

  async addTrees(treesData: any[]) {
    await this.treeModel.insertMany(treesData, { ordered: false })
  }
  async addPopulation(populationData: any[]) {
    await this.populationModel.insertMany(populationData, { ordered: false })
  }
}
