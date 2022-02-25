import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Layer } from '../../location/entities/enum/layer.enum'
import { DataTypes } from '../enum/data-types.enum'

export type IntegrationInfoDocument = IntegrationInfo & Document

@Schema()
export class IntegrationInfo {
  @Prop({ required: true })
  url: string

  @Prop({ required: true })
  dataType: DataTypes

  @Prop({ required: true })
  integrationId: string

  @Prop({ required: true, unique: true })
  layer: Layer

  @Prop({ required: true })
  lastReadDate: Date
}

export const IntegrationInfoSchema = SchemaFactory.createForClass(IntegrationInfo)
