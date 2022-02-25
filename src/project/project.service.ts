import { Injectable } from '@nestjs/common'

import { ProjectRepository } from './project.repository'

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async getAll(
    name?: string,
    location?: string,
    responsibleOrg?: string,
    relatedOrg?: string,
    tematicGroup?: string
  ) {
    return this.projectRepository.getAll(name, location, responsibleOrg, relatedOrg, tematicGroup)
  }

  async getAllByNameLike(name: string) {
    return this.projectRepository.getAllByNameLike(name)
  }

  async getProjectAreas(projectId: string, areaName: string) {
    return this.projectRepository.getProjectAreas(projectId, areaName)
  }

  async findOneById(projectId: string) {
    return this.projectRepository.findOneById(projectId)
  }
}
