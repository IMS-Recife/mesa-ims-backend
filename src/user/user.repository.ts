import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { Model, Types } from 'mongoose'

import { User, UserDocument } from './entities/user.schema'
import { Vision } from './entities/vision/vision.schema'

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: User): Promise<UserDocument> {
    const newUser = new this.userModel(user)

    return newUser.save()
  }

  async findOneById(id: string, fields = ['-visions']): Promise<UserDocument> {
    return this.userModel.findById(id).select(fields)
  }

  async findVision(userId: string, visionId: string): Promise<Vision | null> {
    return this.userModel
      .findOne({ '_id': userId, 'visions._id': visionId })
      .select(['visions'])
      .then((user: UserDocument | null) => {
        if (!user) {
          return null
        }

        return user.visions.find((vision) => vision['_id'].toString() === visionId)
      })
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email: email }).select(['-visions'])
  }

  async findOneFacebookUser(facebookId: string, email: string): Promise<UserDocument> {
    return this.userModel.findOne().or([{ facebookId }, { email }]).select(['-visions'])
  }

  async deleteVision(userId: string, visionId: string) {
    return this.userModel.updateOne({ _id: userId }, { $pull: { visions: { _id: visionId } } })
  }

  async findUserPopulateFavProjects(userId: string): Promise<UserDocument> {
    return this.userModel
      .findById(userId)
      .select(['favoriteProjects'])
      .populate('favoriteProjects', ['name', 'info.lastUpdate'])
  }

  async removeFavoriteProject(userId: string, projectId: string) {
    return this.userModel.updateOne({ _id: userId }, { $pull: { favoriteProjects: projectId } })
  }

  async getNotifications(id: string, limit = '100'): Promise<UserDocument> {
    return this.userModel.findById(id, { notifications: { $slice: ['$notifications', +limit] } })
  }

  async getUnreadNotifications(userId: string) {
    return this.userModel.findById(userId, {
      notifications: {
        $filter: {
          input: '$notifications',
          as: 'item',
          cond: {
            $eq: ['$$item.isRead', false]
          }
        }
      }
    })
  }

  async markNotificationsAsRead(userId: string, notificationIds: string[]) {
    const convertedIds = notificationIds.map((rawId) => new Types.ObjectId(rawId))

    return this.userModel.updateOne(
      { _id: userId },
      { $set: { 'notifications.$[element].isRead': true } },
      { arrayFilters: [{ 'element._id': { $in: convertedIds } }] }
    )
  }

  async markAllNotificationsAsRead(userId: string) {
    return this.userModel.updateOne(
      { _id: userId },
      { $set: { 'notifications.$[element].isRead': true } },
      { arrayFilters: [{ 'element.isRead': false }] }
    )
  }
}
