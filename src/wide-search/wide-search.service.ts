import { Injectable } from '@nestjs/common'

import { ProjectService } from '../project/project.service'

@Injectable()
export class WideSearchService {
  constructor(private readonly projectService: ProjectService) {}

  async wideSearch(term: string) {
    return Promise.all([this.projectService.getAllByNameLike(term)]).then((result) => {
      return {
        projects: result[0]
      }
    })
  }
}
