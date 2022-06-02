import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { ProjectPatchDTO } from './dto/project-patch.dto'
import { ProjectDTO } from './dto/project-create.dto'

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
  @Get('/getPaged')
  async getPaged(
    @Query('name') name: string,
    @Query('location') location: string,
    @Query('responsibleOrg') responsibleOrg: string,
    @Query('relatedOrg') relatedOrg: string,
    @Query('tematicGroup') tematicGroup: string
  ) {
    return this.projectService.getPaged(name)
  }

  @Get(':projectId/areas')
  async getProjectAreas(
    @Param('projectId') projectId: string,
    @Query('areaName') areaName: string
  ) {
    return this.projectService.getProjectAreas(projectId, areaName)
  }

  @Get(':projectId')
  findOneById(@Param('projectId') projectId: string) {
    return this.projectService.findOneById(projectId)
  }

  @Post()
  @HttpCode(200)
  async create(@Body() project: ProjectDTO) {
    return this.projectService.create(project)
  }

  @Put(':projectId')
  async update(@Param('projectId') projectId: string, @Body() project: ProjectDTO) {
    return this.projectService.update(projectId, project)
  }

  @Patch(':projectId')
  async patch(@Param('projectId') projectId: string, @Body() project: ProjectPatchDTO) {
    return this.projectService.update(projectId, project)
  }

  @Delete(':projectId')
  async delete(@Param('projectId') projectId: string) {
    return this.projectService.delete(projectId)
  }
}
