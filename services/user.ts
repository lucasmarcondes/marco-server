import { User } from '../models/user'
import { IUserDocument } from '../types'
import { AppError } from '../helpers/response'

export const validateUserFields = (user: IUserDocument) => {
	if (!user.firstName || !user.lastName || !user.email) {
		throw new AppError(400, 'Please fill out all fields')
	}
	return true
}

export const validatePassword = (password: string, comparePassword?: string) => {
	if (comparePassword && password != comparePassword) {
		throw new AppError(400, "Passwords don't match")
	}

	if (password.length < 6) {
		throw new AppError(400, 'Password should be atleast 6 characters in length')
	}
	return true
}

export const validateNewUser = async (user: IUserDocument, confirmPassword: string) => {
	const validUser = validateUserFields(user)
	if (validUser) {
		if (!user.password || !confirmPassword) {
			throw new AppError(400, "Passwords don't match")
		}

		const resp = await User.find({ email: user.email })
		if (resp.length) {
			throw new AppError(400, 'Email is already in use')
		}
		return true
	}
}
