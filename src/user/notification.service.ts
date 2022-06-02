import { Injectable } from '@nestjs/common'

import { NotificationTag } from './entities/notification/notification-tag.enum'
import { UserDocument } from './entities/user.schema'
import { UserRepository } from './user.repository'

@Injectable()
export class NotificationService {
  constructor(private readonly userRepository: UserRepository) {}

  async createNewVisionNotification(user: UserDocument, visionName: string) {
    const details = {
      visionName
    }

    return this.createNotification(user, NotificationTag.NEW_VISION, details)
  }

  private async createNotification(
    user: UserDocument,
    tag: NotificationTag,
    details: any,
    isRead = false
  ) {
    return user.updateOne({ $push: { notifications: { tag, details, isRead } } })
  }

  async getNotifications(userId: string, limit?: string) {
    return this.userRepository.getNotifications(userId, limit).then((loggedUser) => {
      if (loggedUser.notifications) {
        return loggedUser.notifications
      }

      return []
    })
  }

  async getUnreadNotificationsCount(userId: string) {
    return this.userRepository.getUnreadNotifications(userId).then((loggedUser) => {
      let notificationsCount = 0

      if (loggedUser.notifications) {
        notificationsCount = loggedUser.notifications.length
      }

      return {
        notificationsCount
      }
    })
  }

  async markNotificationsAsRead(userId: string, notificationIds: string[]) {
    return this.userRepository.markNotificationsAsRead(userId, notificationIds)
  }

  async markAllNotificationsAsRead(userId: string) {
    return this.userRepository.markAllNotificationsAsRead(userId)
  }
}
