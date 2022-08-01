import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { LayerBuiltArea, LayerBuiltAreaSchema } from './entities/layers/layer-built-area.schema'
import {
  LayerEnvironmentalLicensing,
  LayerEnvironmentalLicensingSchema
} from './entities/layers/layer-environmental-licensing.schema'
import {
  LayerNonBuiltArea,
  LayerNonBuiltAreaSchema
} from './entities/layers/layer-non-built-area.schema'
import {
  LayerPopulation2010,
  LayerPopulation2010Schema
} from './entities/layers/layer-population-2010.schema'
import {
  PercentageHouseholdsTrees,
  PercentageHouseholdsTreesSchema
} from './entities/layers/layer-percentage-households-trees.schema'
import { LayerSoilUsage, LayerSoilUsageSchema } from './entities/layers/layer-soil-usage.schema'
import { LayerTree, LayerTreeSchema } from './entities/layers/layer-tree.schema'
import {
  LayerUrbanLicensing,
  LayerUrbanLicensingSchema
} from './entities/layers/layer-urban-licensing.schema'

import { LocationController } from './location.controller'
import { LocationRepository } from './location.repository'
import { LocationService } from './location.service'
import {
  PercentageHouseholdsWheelchairRampSurroundings2010,
  PercentageHouseholdsWheelchairRampSurroundings2010Schema
} from './entities/layers/layer-percentage-households-wheelchair-ramp-surroundings-2010.schema'
import {
  PercentagePopulationPiped2010,
  PercentagePopulationPiped2010Schema
} from './entities/layers/layer-percentage-population-piped-2010.schema'
import {
  PercentagePopulationGarbageCollection2010,
  PercentagePopulationGarbageCollection2010Schema
} from './entities/layers/layer-percentage-population-garbage-collection-2010.schema'
import {
  PercentagePopulationSanitarySewage2010,
  PercentagePopulationSanitarySewage2010Schema
} from './entities/layers/layer-percentage-population-sanitary-sewage-2010.schema'
import {
  AverageIncome2010,
  AverageIncome2010Schema
} from './entities/layers/layer-average-income-2010.schema'
import {
  NumberHouseholds2010,
  NumberHouseholds2010Schema
} from './entities/layers/layer-number-households-2010.schema'
import {
  DemographicDensity2010,
  DemographicDensity2010Schema
} from './entities/layers/layer-demographic-density-2010.schema'
import {
  PopulationGrowth20002010,
  PopulationGrowth20002010Schema
} from './entities/layers/layer-population-growth-20002010.schema'
import {
  LayerMetroStation,
  LayerMetroStationSchema
} from './entities/layers/layer-metro-station.schema'
import { LayerBlueStrip, LayerBlueStripSchema } from './entities/layers/layer-blue-strip.schema'
import { LayerMetroLine, LayerMetroLineSchema } from './entities/layers/layer-metro-line.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LayerBuiltArea.name, schema: LayerBuiltAreaSchema }]),
    MongooseModule.forFeature([
      { name: LayerEnvironmentalLicensing.name, schema: LayerEnvironmentalLicensingSchema }
    ]),
    MongooseModule.forFeature([{ name: LayerNonBuiltArea.name, schema: LayerNonBuiltAreaSchema }]),
    MongooseModule.forFeature([{ name: LayerSoilUsage.name, schema: LayerSoilUsageSchema }]),
    MongooseModule.forFeature([{ name: LayerMetroStation.name, schema: LayerMetroStationSchema }]),
    MongooseModule.forFeature([{ name: LayerBlueStrip.name, schema: LayerBlueStripSchema }]),
    MongooseModule.forFeature([{ name: LayerMetroLine.name, schema: LayerMetroLineSchema }]),
    MongooseModule.forFeature([{ name: LayerTree.name, schema: LayerTreeSchema }]),
    MongooseModule.forFeature([
      { name: LayerPopulation2010.name, schema: LayerPopulation2010Schema }
    ]),
    MongooseModule.forFeature([
      { name: PercentageHouseholdsTrees.name, schema: PercentageHouseholdsTreesSchema }
    ]),
    MongooseModule.forFeature([
      {
        name: PercentageHouseholdsWheelchairRampSurroundings2010.name,
        schema: PercentageHouseholdsWheelchairRampSurroundings2010Schema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: PercentagePopulationSanitarySewage2010.name,
        schema: PercentagePopulationSanitarySewage2010Schema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: PercentagePopulationGarbageCollection2010.name,
        schema: PercentagePopulationGarbageCollection2010Schema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: PercentagePopulationPiped2010.name,
        schema: PercentagePopulationPiped2010Schema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: AverageIncome2010.name,
        schema: AverageIncome2010Schema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: NumberHouseholds2010.name,
        schema: NumberHouseholds2010Schema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: DemographicDensity2010.name,
        schema: DemographicDensity2010Schema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: PopulationGrowth20002010.name,
        schema: PopulationGrowth20002010Schema
      }
    ]),
    MongooseModule.forFeature([
      { name: LayerUrbanLicensing.name, schema: LayerUrbanLicensingSchema }
    ])
  ],
  controllers: [LocationController],
  providers: [LocationService, LocationRepository],
  exports: [LocationService]
})
export class LocationModule {}
