import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'
// blue strip BlueStrip
export type LayerBlueStripDocument = LayerBlueStrip & Document

@Schema()
// metro station BlueStrip
export class LayerBlueStrip extends Location {}

export const LayerBlueStripSchema = SchemaFactory.createForClass(LayerBlueStrip)
