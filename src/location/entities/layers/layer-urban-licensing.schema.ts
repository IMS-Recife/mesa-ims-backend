import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { Location } from '../abstract-location/location.schema'

export type LayerUrbanLicensingDocument = LayerUrbanLicensing & Document

@Schema()
export class LayerUrbanLicensing extends Location {}

export const LayerUrbanLicensingSchema = SchemaFactory.createForClass(LayerUrbanLicensing)
