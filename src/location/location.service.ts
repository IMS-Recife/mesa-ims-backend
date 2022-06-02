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
    [Layer.POPULATION2010]: this.getPopulation
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
    console.log(' tree', searchArea);
    return this.locationRepository.getTree(queryObj)
  }

  private async getUrbanLicensing(searchArea: CoordinatesSearchDto) {
    const queryObj = this.buildQuery(searchArea)
    console.log(queryObj);
    return this.locationRepository.getUrbanLicensing(queryObj)
  }
  private async getPopulation(searchArea: CoordinatesSearchDto) {
    console.log(' POP', searchArea);
    const queryObj = this.buildQuery(searchArea)
    return this.locationRepository.getPopulation(queryObj)
  }
  public async getPopulationNoPost(collectionName: string) {
    console.log(collectionName)
    return this.locationRepository.getPopulationNoPost(collectionName)
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
