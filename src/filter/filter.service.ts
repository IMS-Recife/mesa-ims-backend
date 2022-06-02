import { Injectable } from '@nestjs/common'

import { FilterRepository } from './filter.repository'

@Injectable()
export class FilterService {
  constructor(private readonly filterRepository: FilterRepository) {}

  async getValues(key: string) {
    return this.filterRepository.getValues(key)
  }
}
