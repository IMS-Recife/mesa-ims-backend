import { Controller, Get, Param } from '@nestjs/common'

import { WideSearchService } from './wide-search.service'

@Controller('v1/wide-search')
export class WideSearchController {
  constructor(private readonly wideSearchService: WideSearchService) {}

  @Get(':term')
  async wideSearch(@Param('term') term: string) {
    return this.wideSearchService.wideSearch(term)
  }
}
