import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

/// Percentage Households Wheelchair Ramp Surroundings 2010
export type LayerPopulationGrowth20002010Document = PopulationGrowth20002010 & Document

@Schema()
export class PopulationGrowth20002010 extends Location {}

export const PopulationGrowth20002010Schema = SchemaFactory.createForClass(PopulationGrowth20002010)
