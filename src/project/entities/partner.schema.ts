import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { Document } from 'mongoose'

export type PartnerDocument = Partner & Document

@Schema()
export class Partner {
  @Prop()
  responsible: string

  @Prop()
  project_type: string
}

export const PartnerSchema = SchemaFactory.createForClass(Partner)
