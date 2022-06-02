import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common'

import { AuthService } from '../auth/auth.service'
import { Public } from '../auth/constants'
import { LoggedUser, LoggedUserFields } from '../auth/logged-user.decorator'

import { CreateUserDto } from './dto/create-user.dto'
import { CreateUserSSODto } from './dto/create-user-sso.dto'
import { CreateVisionDto } from './dto/create-vision.dto'
import { NotificationIdsDto } from './dto/notification-ids.dto'

import { NotificationService } from './notification.service'
import { UserService } from './user.service'

@Controller('v1/users')
export class UserController {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private userService: UserService
  ) {}

  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDto) {
    await this.userService.create(createUserDto)

    return this.authService.login(createUserDto.email, createUserDto.password)
  }

  @Post('google')
  @Public()
  async createGoogle(@Body() createUserDto: CreateUserSSODto) {
    const user = await this.userService.createGoogle(createUserDto)

    return this.authService.signUser(user)
  }

  @Post('facebook')
  @Public()
  async createFacebook(@Body() createUserDto: CreateUserSSODto) {
    const user = await this.userService.createFacebook(createUserDto)

    return this.authService.signUser(user)
  }

  @Delete('logged-user')
  @HttpCode(204)
  async deleteUser(@LoggedUser() user: LoggedUserFields) {
    return this.userService.deleteUser(user._id)
  }

  @Post('visions')
  async createVision(
    @LoggedUser() loggedUser: LoggedUserFields,
    @Body() createVisionDto: CreateVisionDto
  ) {
    return this.userService.createVision(loggedUser._id, createVisionDto)
  }

  @Get('visions')
  async getVisions(@LoggedUser() loggedUser: LoggedUserFields) {
    return this.userService.getVisions(loggedUser._id)
  }

  @Get('visions/:visionId')
  async getVision(@LoggedUser() loggedUser: LoggedUserFields, @Param('visionId') visionId: string) {
    return this.userService.getVision(loggedUser._id, visionId)
  }

  @Delete('visions/:visionId')
  @HttpCode(204)
  async deleteVision(
    @LoggedUser() loggedUser: LoggedUserFields,
    @Param('visionId') visionId: string
  ) {
    return this.userService.deleteVision(loggedUser._id, visionId)
  }

  @Put('favorite-projects/:projectId')
  @HttpCode(204)
  async addFavoriteProject(
    @LoggedUser() loggedUser: LoggedUserFields,
    @Param('projectId') projectId: string
  ) {
    return this.userService.addFavoriteProject(loggedUser._id, projectId)
  }

  @Get('favorite-projects')
  async listFavoriteProjects(@LoggedUser() loggedUser: LoggedUserFields) {
    return this.userService.listFavoriteProjects(loggedUser._id)
  }

  @Delete('favorite-projects/:projectId')
  @HttpCode(204)
  async removeFavoriteProject(
    @LoggedUser() loggedUser: LoggedUserFields,
    @Param('projectId') projectId: string
  ) {
    return this.userService.removeFavoriteProject(loggedUser._id, projectId)
  }

  @Get('notifications')
  async getNotifications(
    @LoggedUser() loggedUser: LoggedUserFields,
    @Query('limit') limit?: string
  ) {
    return this.notificationService.getNotifications(loggedUser._id, limit)
  }

  @Get('notifications/unread-count')
  async getUnreadNotificationsCount(@LoggedUser() loggedUser: LoggedUserFields) {
    return this.notificationService.getUnreadNotificationsCount(loggedUser._id)
  }

  @Put('notifications/mark-as-read')
  @HttpCode(204)
  async markNotificationsAsRead(
    @LoggedUser() loggedUser: LoggedUserFields,
    @Body() notificationIdsDto: NotificationIdsDto
  ) {
    return this.notificationService.markNotificationsAsRead(
      loggedUser._id,
      notificationIdsDto.notificationIds
    )
  }

  @Put('notifications/mark-all-as-read')
  @HttpCode(204)
  async markAllNotificationsAsRead(@LoggedUser() loggedUser: LoggedUserFields) {
    return this.notificationService.markAllNotificationsAsRead(loggedUser._id)
  }
}
