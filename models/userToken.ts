import { Schema, model } from 'mongoose'
import { IUserToken } from '../types'

const userTokenSchema = new Schema(
	{
		token: String,
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		type: String,
		createdAt: { type: Date, expires: 86400, default: Date.now },
	},
	{ collection: 'userToken' }
)

export const UserToken = model<IUserToken>('userToken', userTokenSchema)
