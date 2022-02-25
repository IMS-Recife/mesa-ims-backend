import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerEnvironmentalLicensingDocument = LayerEnvironmentalLicensing & Document

@Schema()
export class LayerEnvironmentalLicensing extends Location {}

export const LayerEnvironmentalLicensingSchema = SchemaFactory.createForClass(LayerEnvironmentalLicensing)
