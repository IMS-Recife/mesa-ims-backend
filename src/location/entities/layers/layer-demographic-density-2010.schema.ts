import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

/// Percentage Households Wheelchair Ramp Surroundings 2010
export type LayerDemographicDensity2010Document = DemographicDensity2010 & Document

@Schema()
export class DemographicDensity2010 extends Location {}

export const DemographicDensity2010Schema = SchemaFactory.createForClass(DemographicDensity2010)
