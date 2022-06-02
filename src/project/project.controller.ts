import { Controller, Get, Param, Query } from '@nestjs/common'

import { ProjectService } from './project.service'

@Controller('v1/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getAll(
    @Query('name') name: string,
    @Query('location') location: string,
    @Query('responsibleOrg') responsibleOrg: string,
    @Query('relatedOrg') relatedOrg: string,
    @Query('tematicGroup') tematicGroup: string
  ) {
    return this.projectService.getAll(name, location, responsibleOrg, relatedOrg, tematicGroup)
  }

  @Get(':projectId/areas')
  async getProjectAreas(@Param('projectId') projectId: string, @Query('areaName') areaName: string) {
    return this.projectService.getProjectAreas(projectId, areaName)
  }
}
