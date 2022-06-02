import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { NotificationTag } from './notification-tag.enum'

export type NotificationDocument = Notification & Document

@Schema({ timestamps: true })
export class Notification {
  @Prop({ enum: NotificationTag, required: true })
  tag: NotificationTag

  @Prop({ required: true, default: false })
  isRead: boolean

  @Prop(raw({}))
  details: Record<string, any>
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
