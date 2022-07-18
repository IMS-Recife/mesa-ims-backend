import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

/// Percentage Households Wheelchair Ramp Surroundings 2010
export type LayerNumberHouseholds2010Document = NumberHouseholds2010 & Document

@Schema()
export class NumberHouseholds2010 extends Location {}

export const NumberHouseholds2010Schema = SchemaFactory.createForClass(NumberHouseholds2010)
