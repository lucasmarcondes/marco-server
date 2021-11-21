import { Schema, model } from 'mongoose'
import { ITemplateDocument } from 'types'

const TemplateSchema = new Schema(
	{
		description: { type: String, required: true },
		properties: { type: [Object], required: true },
		createdDate: { type: Date, required: true },
		createdById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		lastModifiedDate: { type: Date, required: true },
	},
	{ collection: 'templates' }
)

export const Template = model<ITemplateDocument>('template', TemplateSchema)
