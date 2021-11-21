import { IUserDocument } from 'types'
import { AppError, AppResponse } from '../helpers/response'
import { Error as MongooseError } from 'mongoose'

export const createUser = async (newUser: IUserDocument) => {
	return newUser
		.save()
		.then(() => {
			return new AppResponse(201, 'Account created successfully')
		})
		.catch((err: MongooseError) => {
			throw new AppError(500, err.message)
		})
}
