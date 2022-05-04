import { Injectable } from '@nestjs/common'
import { ProjectPatchDTO } from './dto/project-patch.dto'
import { Project } from './entities/project.schema'

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
    try {
      return this.projectRepository.findOneById(projectId)
    } catch (error) {
      console.log(error)
    }
  }

  async create(project: Project) {
    const newProject = {
      ...project,
      lastUpdate: new Date()
    }

    if (!newProject.location) {
      newProject.location = 'Recife - PE'
    }
    return this.projectRepository.create(newProject)
  }

  async update(projectId: string, project: ProjectPatchDTO) {
    return this.projectRepository.update(projectId, project)
  }

  async delete(projectId: string) {
    return this.projectRepository.delete(projectId)
  }
}
