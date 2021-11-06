import mongoose from 'mongoose'
import { Property } from './Template'
export interface EntryDocument extends mongoose.Document {
	_id: number
	text?: string
	title: string
	createdDate: Date
	lastModifiedDate?: Date
	createdById: number
	templateId: number
	properties: Array<Property>
}

const EntrySchema = new mongoose.Schema(
	{
		text: { type: String, required: true },
		title: { type: String, required: true },
		createdDate: { type: Date, required: true },
		lastModifiedDate: { type: Date },
		createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
		properties: { type: [Object], required: true },
	},
	{ collection: 'entries' }
)

export const Entry = mongoose.model<EntryDocument>('entry', EntrySchema)
