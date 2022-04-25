import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { Project } from './entities/project.schema'

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
  async getProjectAreas(
    @Param('projectId') projectId: string,
    @Query('areaName') areaName: string
  ) {
    return this.projectService.getProjectAreas(projectId, areaName)
  }

  @Post()
  async create(@Body() project: Project) {
    return this.projectService.create(project)
  }

  @Put(':projectId')
  async update(@Param('projectId') projectId: string, @Body() project: Project) {
    return this.projectService.update({ ...project, projectId })
  }

  @Delete(':projectId')
  async delete(@Param('projectId') projectId: string) {
    return this.projectService.delete(projectId)
  }
}
