import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { Model } from 'mongoose'

import { Filter, FilterDocument } from './entities/filter.schema'

@Injectable()
export class FilterRepository {
  constructor(@InjectModel(Filter.name) private filterModel: Model<FilterDocument>) {}

  async getValues(key: string) {
    return this.filterModel.findOne({ key }).then((filter: FilterDocument | null) => {
      if (!filter) {
        return {}
      }

      return filter.values
    })
  }
}
