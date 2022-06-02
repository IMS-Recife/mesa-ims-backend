import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common'

import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

import { CreateUserDto } from './dto/create-user.dto'
import { CreateUserSSODto } from './dto/create-user-sso.dto'
import { CreateVisionDto } from './dto/create-vision.dto'

import { UserDocument } from './entities/user.schema'

import { AuthService } from '../auth/auth.service'
import { NotificationService } from './notification.service'
import { ProjectService } from '../project/project.service'
import { UserRepository } from './user.repository'

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly projectService: ProjectService,
    private readonly userRepository: UserRepository
  ) {}

  async create(userDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.findOneByEmail(userDto.email)
    if (existingUser) {
      throw new UnprocessableEntityException('Já existe usuário cadastrado com o e-mail informado')
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10)

    return this.userRepository.create({
      name: userDto.name,
      email: userDto.email,
      password: hashedPassword,
      passwordResetInfo: {
        previousPassword: hashedPassword
      },
      roles: [userDto.roles[0]],
      facebookId: null,
      visions: [],
      favoriteProjects: [],
      notifications: []
    })
  }

  async createGoogle(userDto: CreateUserSSODto): Promise<UserDocument> {
    const userData = await this.authService.verifyGoogleToken(userDto.credential)

    const existingUser = await this.findOneByEmail(userData.email)
    if (existingUser) {
      throw new UnprocessableEntityException('Já existe usuário cadastrado com o e-mail informado')
    }

    return this.userRepository.create({
      name: userData.name,
      email: userData.email,
      password: null,
      passwordResetInfo: null,
      roles: [userDto.roles[0]],
      facebookId: null,
      visions: [],
      favoriteProjects: [],
      notifications: []
    })
  }

  async createFacebook(userDto: CreateUserSSODto): Promise<UserDocument> {
    const userData = await this.authService.getFacebookUserData(userDto.credential)

    const existingUser = await this.findOneFacebookUser(userData.facebookId, userData.email)
    if (existingUser) {
      throw new UnprocessableEntityException(
        'Já existe usuário cadastrado com o e-mail ou ID do Facebook informado'
      )
    }

    return this.userRepository.create({
      name: userData.name,
      email: userData.email,
      password: null,
      passwordResetInfo: null,
      roles: [userDto.roles[0]],
      facebookId: userData.facebookId,
      visions: [],
      favoriteProjects: [],
      notifications: []
    })
  }

  async findOneById(id: string, fields = ['-visions', '-favoriteProjects', '-notifications']) {
    const user = await this.userRepository.findOneById(id, fields)
    if (!user) {
      throw new NotFoundException('Usuário com ID informado não encontrado')
    }

    return user
  }

  async findOneByEmail(email: string) {
    return this.userRepository.findOneByEmail(email)
  }

  async findOneFacebookUser(facebookId: string, email: string) {
    return this.userRepository.findOneFacebookUser(facebookId, email)
  }

  async setUserResetPasswordInfo(user: UserDocument): Promise<void> {
    const expirationDate = new Date()
    expirationDate.setTime(expirationDate.getTime() + 30 * 60 * 1000)

    user.passwordResetInfo = {
      previousPassword: user.password,
      resetToken: uuidv4(),
      resetExpiration: expirationDate
    }

    await user.save()
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findOneById(id)

    await user.delete()
  }

  async createVision(userId: string, visionDto: CreateVisionDto) {
    const user = await this.findOneById(userId, ['visions.name'])

    if (!user.visions) {
      user.visions = []
    }

    user.visions.push(visionDto)
    await user.save()

    await this.notificationService.createNewVisionNotification(user, visionDto.name)

    return user.visions[user.visions.length - 1]
  }

  async getVisions(userId: string) {
    const user = await this.findOneById(userId, [
      'visions._id',
      'visions.name',
      'visions.createdAt'
    ])

    if (!user.visions || user.visions.length === 0) {
      return []
    }

    return user.visions.sort((a, b) => {
      if (a.name > b.name) {
        return 1
      }
      if (a.name < b.name) {
        return -1
      }
      return 0
    })
  }

  async getVision(userId: string, visionId: string) {
    return this.userRepository.findVision(userId, visionId)
  }

  async deleteVision(userId: string, visionId: string) {
    return this.userRepository.deleteVision(userId, visionId)
  }

  async addFavoriteProject(userId: string, projectId: string) {
    const user = await this.findOneById(userId, ['favoriteProjects'])

    if (!user.favoriteProjects || user.favoriteProjects.length === 0) {
      user.favoriteProjects = []
    }

    const existingProject = await this.validateAndGetProject(user, projectId)

    user.favoriteProjects.push(existingProject)
    await user.save()
  }

  private async validateAndGetProject(user: UserDocument, projectId: string) {
    if (user.favoriteProjects.some((favProject) => favProject['_id'].toString() === projectId)) {
      throw new UnprocessableEntityException('Projeto informado já é um favorito do usuário')
    }

    const existingProject = await this.projectService.findOneById(projectId)
    if (!existingProject) {
      throw new NotFoundException('Projeto informado não existe')
    }

    return existingProject
  }

  async listFavoriteProjects(userId: string) {
    return this.userRepository.findUserPopulateFavProjects(userId).then((user) => {
      return user.favoriteProjects.sort((a, b) => {
        if (a.name > b.name) {
          return 1
        }
        if (a.name < b.name) {
          return -1
        }
        return 0
      })
    })
  }

  async removeFavoriteProject(userId: string, projectId: string) {
    return this.userRepository.removeFavoriteProject(userId, projectId)
  }
}
