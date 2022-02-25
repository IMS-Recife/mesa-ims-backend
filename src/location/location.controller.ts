import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'

import { GetLayersDto } from './dto/get-layers.dto'
import { Layer } from './entities/enum/layer.enum'
import { LocationService } from './location.service'

@Controller('v1/map')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('layers')
  @HttpCode(200)
  async getLayers(@Body() getLayersDto: GetLayersDto) {
    return this.locationService.getLayers(getLayersDto)
  }

  @Get('layers/:layerName/:locationId/properties')
  async getLocationProperties(@Param('layerName') layerName: Layer, @Param('locationId') locationId: string) {
    return this.locationService.getLocationProperties(layerName, locationId)
  }
}
