import { Prop, Schema } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type PasswordResetInfoDocument = PasswordResetInfo & Document

@Schema()
export class PasswordResetInfo {
  @Prop({ required: false })
  resetToken?: string

  @Prop({ required: false })
  resetExpiration?: Date

  @Prop({ required: true })
  previousPassword: string
}
