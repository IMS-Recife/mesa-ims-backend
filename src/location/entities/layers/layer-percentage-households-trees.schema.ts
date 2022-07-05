import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

/// Percentage of Households With Trees in the Surroundings 2010
export type LayerPercentageHouseholdsTreesDocument = PercentageHouseholdsTrees & Document

@Schema()
export class PercentageHouseholdsTrees extends Location {}

export const PercentageHouseholdsTreesSchema =
  SchemaFactory.createForClass(PercentageHouseholdsTrees)
