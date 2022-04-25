import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { Model } from 'mongoose'
import { Area } from './entities/area.schema'

import { Project, ProjectDocument } from './entities/project.schema'

@Injectable()
export class ProjectRepository {
  constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>) {}

  async getAll(
    name?: string,
    location?: string,
    responsibleOrg?: string,
    relatedOrg?: string,
    tematicGroup?: string
  ): Promise<ProjectDocument[]> {
    const queryObj = {
      name,
      'info.location': location,
      'info.responsibleOrg': responsibleOrg,
      'info.relatedOrg': relatedOrg,
      'info.tematicGroup': tematicGroup
    }

    return this.projectModel
      .find(queryObj)
      .select(['name', 'info', 'areas.name'])
      .sort({ name: 'asc' })
  }

  async getAllByNameLike(nameSearch: string): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ name: { $regex: nameSearch, $options: 'i' } })
      .select(['name', 'info.location', 'info.lastUpdate'])
      .sort({ name: 'asc' })
  }

  async getProjectAreas(projectId: string, areaName: string): Promise<Area[]> {
    return this.projectModel
      .findOne({ '_id': projectId, 'areas.name': areaName })
      .select(['areas'])
      .then((project: ProjectDocument | null) => {
        if (!project) {
          return []
        }

        if (!areaName) {
          return project.areas
        }

        return project.areas.filter((area) => area.name === areaName)
      })
  }

  async findOneById(projectId: string, fields = ['-areas']): Promise<ProjectDocument | null> {
    return this.projectModel.findById(projectId).select(fields)
  }

  async create(project: Project): Promise<ProjectDocument> {
    return (await this.projectModel.create(project)).save()
  }

  async delete(projectId: string): Promise<ProjectDocument | null> {
    return this.projectModel.findByIdAndDelete(projectId)
  }

  async update(project: Project): Promise<ProjectDocument | null> {
    return this.projectModel.findByIdAndUpdate(project.projectId, project, { new: true })
  }
}
