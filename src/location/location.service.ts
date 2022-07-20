import { Injectable } from '@nestjs/common'
import turfBuffer from '@turf/buffer'

import { CoordinatesSearchDto } from './dto/coordinates-search.dto'
import { GetLayersDto } from './dto/get-layers.dto'
import { LayerFilterDto } from './dto/layer-filter.dto'
import { LayerSearchDto } from './dto/layer-search.dto'
import { CoordinateTypes } from './entities/enum/coordinate-types.enum'
import { Layer } from './entities/enum/layer.enum'
import { SoilUsageTypes } from './entities/location.constants'
import { LocationRepository } from './location.repository'

@Injectable()
export class LocationService {
  layerRelation = {
    [Layer.BUILT_AREA]: this.getBuiltAreas,
    [Layer.ENVIRONMENTAL_LICENSING]: this.getEnvLicensing,
    [Layer.NON_BUILT_AREA]: this.getNonBuiltAreas,
    [Layer.SOIL_USAGE]: this.getSoilUsage,
    [Layer.TREE]: this.getTree,
    [Layer.URBAN_LICENSING]: this.getUrbanLicensing,
    [Layer.POPULATION2010]: this.getPopulation,
    [Layer.PERCENTAGEHOUSEHOLDSTREES]: this.getPercentageHouseholdsTrees,
    [Layer.PERCENTAGEHOUSEHOLDSWHEELCHAIRRAMPSURROUNDINGS2010]:
      this.getPercentageHouseholdsWheelchairRampSurroundings2010,
    [Layer.PERCENTAGEPOPULATIONPIPED2010]: this.getPercentagePopulationPiped2010,
    [Layer.PERCENTAGEPOPULATIONGARBAGECOLLECTION2010]:
      this.getPercentagePopulationGarbageCollection2010,
    [Layer.PERCENTAGEPOPULATIONSANITARYSEWAGE2010]: this.getPercentagePopulationSanitarySewage2010,
    [Layer.AVERAGEINCOME2010]: this.getAverageIncome2010,
    [Layer.NUMBERHOUSEHOLDS2010]: this.getNumberHouseholds2010,
    [Layer.DEMOGRAPHICDENSITY2010]: this.getDemographicDensity2010,
    [Layer.POPULATIONGROWTH20002010]: this.getPopulationGrowth20002010
  }

  constructor(private readonly locationRepository: LocationRepository) {}

  async getLayers(payload: GetLayersDto) {
    const searchArea = this.getSearchArea(payload)

    const response = {}

    for (const layer of payload.layers) {
      response[layer.name] = await this.getLayer(layer, searchArea)
    }

    return response
  }

  private getLayer(layer: LayerSearchDto, searchArea: any) {
    return this.layerRelation[layer.name].bind(this)(searchArea, layer.filter)
  }

  async getLocationProperties(layerName: Layer, locationId: string) {
    return this.locationRepository.getLocationProperties(layerName, locationId)
  }

  private getSearchArea(payload: GetLayersDto) {
    const coordinates = payload.searchAreas.map((searchArea) => {
      if (!payload.buffer) {
        return searchArea.coordinates
      }

      return turfBuffer(searchArea, payload.buffer, {
        units: 'meters'
      }).geometry.coordinates
    })

    return {
      type: CoordinateTypes.MultiPolygon,
      coordinates
    }
  }

  private async getNonBuiltAreas(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)

    return this.locationRepository.getNonBuiltAreas(queryObj)
  }

  private async getBuiltAreas(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)

    return this.locationRepository.getBuiltAreas(queryObj)
  }

  private async getEnvLicensing(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)

    return this.locationRepository.getEnvLicensing(queryObj)
  }

  private async getSoilUsage(searchArea: CoordinatesSearchDto, filter?: LayerFilterDto) {
    const queryObj = this.buildQuery(searchArea)
    if (filter && filter.soilCategories && filter.soilCategories.length !== 0) {
      const buildingTypes = filter.soilCategories.flatMap(
        (soilCategory) => SoilUsageTypes[soilCategory]
      )

      queryObj['properties.TIPOEMPREENDIMENTO'] = { $in: buildingTypes }
    }

    return this.locationRepository.getSoilUsage(queryObj)
  }

  private async getTree(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    console.log(' tree', searchArea)
    return this.locationRepository.getTree(queryObj)
  }

  private async getUrbanLicensing(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getUrbanLicensing(queryObj)
  }
  private async getPopulation(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getPopulation(queryObj)
  }
  private async getPercentageHouseholdsTrees(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getPercentageHouseholdsTrees(queryObj)
  }
  private async getPercentageHouseholdsWheelchairRampSurroundings2010(
    searchArea: CoordinatesSearchDto
  ) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getPercentageHouseholdsWheelchairRampSurroundings2010(queryObj)
  }
  private async getPercentagePopulationPiped2010(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getPercentagePopulationPiped2010(queryObj)
  }
  private async getPercentagePopulationGarbageCollection2010(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getPercentagePopulationGarbageCollection2010(queryObj)
  }
  private async getPercentagePopulationSanitarySewage2010(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getPercentagePopulationSanitarySewage2010(queryObj)
  }
  private async getAverageIncome2010(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getAverageIncome2010(queryObj)
  }
  private async getNumberHouseholds2010(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getNumberHouseholds2010(queryObj)
  }
  private async getDemographicDensity2010(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getDemographicDensity2010(queryObj)
  }
  private async getPopulationGrowth20002010(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getPopulationGrowth20002010(queryObj)
  }

  private buildQuery(inside: CoordinatesSearchDto): {} {
    return {
      geometry: {
        $geoWithin: {
          $geometry: inside
        }
      }
    }
  }

  async replaceEnvironmentalLicensing(envLicensingData: any[]) {
    await this.locationRepository.replaceEnvironmentalLicensing(envLicensingData)
  }

  async replaceUrbanLicensing(urbanLicensingData: any[]) {
    await this.locationRepository.replaceUrbanLicensing(urbanLicensingData)
  }

  async addSoilUsage(soilUsageData: any[]) {
    await this.locationRepository.addSoilUsage(soilUsageData)
  }

  async addBuiltAreas(builtAreasData: any[]) {
    await this.locationRepository.addBuiltAreas(builtAreasData)
  }

  async addTrees(treesData: any[]) {
    await this.locationRepository.addTrees(treesData)
  }
}
