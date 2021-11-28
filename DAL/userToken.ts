import { Error as MongooseError } from 'mongoose'
import { AppError } from '../helpers/response'
import { IUserDocument, IUserToken } from 'types'
import { UserToken } from '../models/userToken'
import { encrypt } from '../services/userToken'

export const findTokenAndDelete = async (userId: string, type: string): Promise<IUserToken> => {
	return UserToken.findOneAndDelete({ userId: userId, type: type })
		.then(userToken => userToken)
		.catch(err => {
			throw new AppError(500, err.message)
		})
}

export const createToken = async (userId: string, type: string): Promise<IUserToken> => {
	const newToken: IUserToken = new UserToken({
		userId: userId,
		token: encrypt(userId),
		type: type,
	})
	return newToken
		.save()
		.then(token => token)
		.catch((err: MongooseError) => {
			throw new AppError(500, err.message)
		})
}
