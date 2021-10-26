import mongoose from 'mongoose'

export interface TemplateDocument extends mongoose.Document {
	_id: number
	description: String
	properties: Array<any>
	createdDate: Date
	createdById: number
	lastModifiedDate: Date
}

const TemplateSchema = new mongoose.Schema(
	{
		description: { type: String, required: true },
		properties: { type: [Object], required: true },
		createdDate: { type: Date, required: true },
		createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		lastModifiedDate: { type: Date, required: true },
	},
	{ collection: 'templates' }
)

export const Template = mongoose.model<TemplateDocument>('template', TemplateSchema)
