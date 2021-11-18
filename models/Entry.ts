import { Document, Schema, model } from 'mongoose'
import { Property } from './Template'
export interface EntryDocument extends Document {
	_id: string
	text?: string
	title: string
	createdDate: Date
	lastModifiedDate: Date
	createdById: string
	templateId: string
	properties?: Property[]
}

const EntrySchema = new Schema(
	{
		text: { type: String, required: true },
		title: { type: String, required: true },
		createdDate: { type: Date, required: true },
		lastModifiedDate: { type: Date, required: true },
		createdById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
		properties: { type: [Object] },
	},
	{ collection: 'entries' }
)

export const Entry = model<EntryDocument>('entry', EntrySchema)
