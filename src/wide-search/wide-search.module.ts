import { Module } from '@nestjs/common'

import { ProjectModule } from '../project/project.module'

import { WideSearchController } from './wide-search.controller'
import { WideSearchService } from './wide-search.service'

@Module({
  imports: [ProjectModule],
  controllers: [WideSearchController],
  providers: [WideSearchService]
})
export class WideSearchModule {}
