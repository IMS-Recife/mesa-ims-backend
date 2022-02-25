import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Filter, FilterSchema } from './entities/filter.schema'

import { FilterController } from './filter.controller'
import { FilterRepository } from './filter.repository'
import { FilterService } from './filter.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Filter.name, schema: FilterSchema }])],
  controllers: [FilterController],
  providers: [FilterService, FilterRepository]
})
export class FilterModule {}
