import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerPedestrianMobilityTacticalUrbanismDocument =
  LayerPedestrianMobilityTacticalUrbanism & Document

@Schema()
// PedestrianMobilityTacticalUrbanism
export class LayerPedestrianMobilityTacticalUrbanism extends Location {}

export const LayerPedestrianMobilityTacticalUrbanismSchema = SchemaFactory.createForClass(
  LayerPedestrianMobilityTacticalUrbanism
)
