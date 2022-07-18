import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

/// Percentage Households Wheelchair Ramp Surroundings 2010
export type LayerAverageIncome2010Document = AverageIncome2010 & Document

@Schema()
export class AverageIncome2010 extends Location {}

export const AverageIncome2010Schema = SchemaFactory.createForClass(AverageIncome2010)
