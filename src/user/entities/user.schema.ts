import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'

import { Project } from '../../project/entities/project.schema'
import { Notification, NotificationSchema } from './notification/notification.schema'
import { PasswordResetInfo } from './password-reset-info.schema'
import { Role } from './role.enum'
import { Vision, VisionSchema } from './vision/vision.schema'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string

  @Prop({ unique: true, required: false })
  email?: string

  @Prop({ required: false })
  password: string

  @Prop({ type: PasswordResetInfo, required: false })
  passwordResetInfo?: PasswordResetInfo

  @Prop({ type: [String], enum: Role, required: true})
  roles: Role[]

  @Prop({ required: false })
  facebookId?: string

  @Prop({ type: [VisionSchema], required: false })
  visions?: Vision[]

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: Project.name }], required: false })
  favoriteProjects?: Project[]

  @Prop({ type: [NotificationSchema], required: false })
  notifications?: Notification[]
}

export const UserSchema = SchemaFactory.createForClass(User)
