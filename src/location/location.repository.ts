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
import {
  LayerPercentageHouseholdsWheelchairRampSurroundings2010Document,
  PercentageHouseholdsWheelchairRampSurroundings2010
} from './entities/layers/layer-percentage-households-wheelchair-ramp-surroundings-2010.schema'
import { LayerPercentagePopulationPiped2010Document } from './entities/layers/layer-percentage-population-piped-2010.schema'
import {
  LayerPercentagePopulationGarbageCollection2010Document,
  PercentagePopulationGarbageCollection2010
} from './entities/layers/layer-percentage-population-garbage-collection-2010.schema'
import {
  LayerPercentagePopulationSanitarySewage2010Document,
  PercentagePopulationSanitarySewage2010
} from './entities/layers/layer-percentage-population-sanitary-sewage-2010.schema'
import {
  AverageIncome2010,
  LayerAverageIncome2010Document
} from './entities/layers/layer-average-income-2010.schema'
import {
  LayerNumberHouseholds2010Document,
  NumberHouseholds2010
} from './entities/layers/layer-number-households-2010.schema'
import {
  DemographicDensity2010,
  LayerDemographicDensity2010Document
} from './entities/layers/layer-demographic-density-2010.schema'
import {
  LayerPopulationGrowth20002010Document,
  PopulationGrowth20002010
} from './entities/layers/layer-population-growth-20002010.schema'

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
    private percentageHouseholdsTreesModel: Model<LayerPercentageHouseholdsTreesDocument>,
    @InjectModel(PercentageHouseholdsWheelchairRampSurroundings2010.name)
    private percentageHouseholdsWheelchairRampSurroundings2010Model: Model<LayerPercentageHouseholdsWheelchairRampSurroundings2010Document>,
    @InjectModel(PercentageHouseholdsTrees.name)
    private percentagePopulationPiped2010Model: Model<LayerPercentagePopulationPiped2010Document>,
    @InjectModel(PercentagePopulationGarbageCollection2010.name)
    private percentagePopulationGarbageCollection2010Model: Model<LayerPercentagePopulationGarbageCollection2010Document>,
    @InjectModel(PercentagePopulationSanitarySewage2010.name)
    private percentagePopulationSanitarySewage2010Model: Model<LayerPercentagePopulationSanitarySewage2010Document>,
    @InjectModel(AverageIncome2010.name)
    private averageIncome2010Model: Model<LayerAverageIncome2010Document>,
    @InjectModel(NumberHouseholds2010.name)
    private numberHouseholds2010Model: Model<LayerNumberHouseholds2010Document>,
    @InjectModel(DemographicDensity2010.name)
    private demographicDensity2010Model: Model<LayerDemographicDensity2010Document>,
    @InjectModel(PopulationGrowth20002010.name)
    private populationGrowth20002010Model: Model<LayerPopulationGrowth20002010Document>
  ) {
    this.layerModelRelation = {
      [Layer.BUILT_AREA]: this.builtAreaModel,
      [Layer.ENVIRONMENTAL_LICENSING]: this.envLicensingModel,
      [Layer.NON_BUILT_AREA]: this.nonBuiltAreaModel,
      [Layer.SOIL_USAGE]: this.soilUsageModel,
      [Layer.TREE]: this.treeModel,
      [Layer.URBAN_LICENSING]: this.urbanLicensingModel,
      [Layer.POPULATION2010]: this.populationModel,
      [Layer.PERCENTAGEHOUSEHOLDSTREES]: this.percentageHouseholdsTreesModel,
      [Layer.PERCENTAGEHOUSEHOLDSWHEELCHAIRRAMPSURROUNDINGS2010]:
        this.percentageHouseholdsWheelchairRampSurroundings2010Model,
      [Layer.PERCENTAGEPOPULATIONPIPED2010]: this.percentagePopulationPiped2010Model,
      [Layer.PERCENTAGEPOPULATIONGARBAGECOLLECTION2010]:
        this.percentagePopulationGarbageCollection2010Model,
      [Layer.PERCENTAGEPOPULATIONSANITARYSEWAGE2010]:
        this.percentagePopulationSanitarySewage2010Model,
      [Layer.AVERAGEINCOME2010]: this.averageIncome2010Model,
      [Layer.NUMBERHOUSEHOLDS2010]: this.numberHouseholds2010Model,
      [Layer.DEMOGRAPHICDENSITY2010]: this.demographicDensity2010Model,
      [Layer.POPULATIONGROWTH20002010]: this.populationGrowth20002010Model
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
    return this.populationModel.find(queryObj)
  }
  async getPercentageHouseholdsTrees(
    queryObj: any
  ): Promise<LayerPercentageHouseholdsTreesDocument[]> {
    return this.percentageHouseholdsTreesModel.find(queryObj)
  }
  async getPercentageHouseholdsWheelchairRampSurroundings2010(
    queryObj: any
  ): Promise<LayerPercentageHouseholdsWheelchairRampSurroundings2010Document[]> {
    return this.percentageHouseholdsWheelchairRampSurroundings2010Model.find(queryObj)
  }
  async getPercentagePopulationPiped2010(
    queryObj: any
  ): Promise<LayerPercentagePopulationPiped2010Document[]> {
    return this.percentagePopulationPiped2010Model.find(queryObj)
  }
  async getPercentagePopulationGarbageCollection2010(
    queryObj: any
  ): Promise<LayerPercentagePopulationGarbageCollection2010Document[]> {
    return this.percentagePopulationGarbageCollection2010Model.find(queryObj)
  }
  async getPercentagePopulationSanitarySewage2010(
    queryObj: any
  ): Promise<LayerPercentagePopulationSanitarySewage2010Document[]> {
    return this.percentagePopulationSanitarySewage2010Model.find(queryObj)
  }
  async getAverageIncome2010(queryObj: any): Promise<LayerAverageIncome2010Document[]> {
    return this.averageIncome2010Model.find(queryObj)
  }
  async getNumberHouseholds2010(queryObj: any): Promise<LayerNumberHouseholds2010Document[]> {
    return this.numberHouseholds2010Model.find(queryObj)
  }
  async getDemographicDensity2010(queryObj: any): Promise<LayerDemographicDensity2010Document[]> {
    return this.demographicDensity2010Model.find(queryObj)
  }
  async getPopulationGrowth20002010(
    queryObj: any
  ): Promise<LayerPopulationGrowth20002010Document[]> {
    return this.populationGrowth20002010Model.find(queryObj)
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
