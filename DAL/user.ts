import { IUserDocument } from 'types'
import { AppError, AppResponse } from '../helpers/response'
import { Error as MongooseError } from 'mongoose'
import { User } from '../models/User'

export const createUser = async (newUser: IUserDocument): Promise<AppResponse> => {
	return newUser
		.save()
		.then(() => new AppResponse(201, 'Account created successfully'))
		.catch((err: MongooseError) => {
			throw new AppError(500, err.message)
		})
}

export const deleteUser = async (id: string): Promise<AppResponse> => {
	return User.findByIdAndDelete(id)
		.then(() => new AppResponse(200, 'Account deleted successfully'))
		.catch((err: MongooseError) => {
			throw new AppError(500, err.message)
		})
}

export const getUserById = async (id: string): Promise<IUserDocument> => {
	return User.findById(id)
		.then(user => user)
		.catch(err => {
			throw new AppError(500, err.message)
		})
}

export const getUserByEmail = async (email: string): Promise<IUserDocument> => {
	return User.findOne({ email: email.toLowerCase() })
		.then(user => user)
		.catch(err => {
			throw new AppError(500, err.message)
		})
}

export const validatePassword = (user: IUserDocument, password: string): void => {
	const validPassword = user.comparePassword(password)
	if (!validPassword) throw new AppError(400, 'Wrong password')
}
