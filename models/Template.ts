import { Document, Schema, model } from 'mongoose'

export interface Property {
	_id: string
	type: 'text' | 'checkbox' | 'number' | 'select'
	subType?: string
	description: string
	default?: string | boolean | number | Array<string>
	multipleValues?: boolean
	showOnCard: boolean
	options?: Array<string>
	value?: string | boolean | number | Array<string>
}

export interface TemplateDocument extends Document {
	_id: string
	description: string
	properties: Array<Property>
	createdDate: Date
	createdById: string
	lastModifiedDate: Date
}

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

export const Template = model<TemplateDocument>('template', TemplateSchema)
