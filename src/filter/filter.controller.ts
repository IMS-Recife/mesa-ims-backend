import { Controller, Get, Param } from '@nestjs/common'

import { FilterService } from './filter.service'

@Controller('v1/filters')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Get(':key')
  async getValues(@Param('key') key: string) {
    return this.filterService.getValues(key)
  }
}
