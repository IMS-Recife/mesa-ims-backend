import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { LayerBuiltArea, LayerBuiltAreaSchema } from './entities/layers/layer-built-area.schema'
import { LayerEnvironmentalLicensing, LayerEnvironmentalLicensingSchema } from './entities/layers/layer-environmental-licensing.schema'
import { LayerNonBuiltArea, LayerNonBuiltAreaSchema } from './entities/layers/layer-non-built-area.schema'
import { LayerSoilUsage, LayerSoilUsageSchema } from './entities/layers/layer-soil-usage.schema'
import { LayerTree, LayerTreeSchema } from './entities/layers/layer-tree.schema'
import { LayerUrbanLicensing, LayerUrbanLicensingSchema } from './entities/layers/layer-urban-licensing.schema'

import { LocationController } from './location.controller'
import { LocationRepository } from './location.repository'
import { LocationService } from './location.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LayerBuiltArea.name, schema: LayerBuiltAreaSchema }]),
    MongooseModule.forFeature([{ name: LayerEnvironmentalLicensing.name, schema: LayerEnvironmentalLicensingSchema }]),
    MongooseModule.forFeature([{ name: LayerNonBuiltArea.name, schema: LayerNonBuiltAreaSchema }]),
    MongooseModule.forFeature([{ name: LayerSoilUsage.name, schema: LayerSoilUsageSchema }]),
    MongooseModule.forFeature([{ name: LayerTree.name, schema: LayerTreeSchema }]),
    MongooseModule.forFeature([{ name: LayerUrbanLicensing.name, schema: LayerUrbanLicensingSchema }]),
  ],
  controllers: [LocationController],
  providers: [LocationService, LocationRepository],
  exports: [LocationService]
})
export class LocationModule {}
