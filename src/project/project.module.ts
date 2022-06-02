import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { LocationModule } from '../location/location.module'

import { Project, ProjectSchema } from './entities/project.schema'
import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'
import { ProjectRepository } from './project.repository'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    LocationModule
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
  exports: [ProjectService]
})
export class ProjectModule {}
