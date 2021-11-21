import { Schema, model } from 'mongoose'
import { IEntryDocument } from 'types'

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

export const Entry = model<IEntryDocument>('entry', EntrySchema)
