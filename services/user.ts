import { User } from '../models/User'
import { IUserDocument } from '../types'
import { AppError } from '../helpers/response'

export const getUserDto = (user: IUserDocument) => {
	return {
		_id: user._id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		preferences: user.preferences,
		mobile: user.mobile,
		createdDate: user.createdDate,
	}
}

export const validateNewUserFields = (user: IUserDocument, confirmPassword: string) => {
	if (!user.firstName || !user.lastName || !user.email) {
		throw new AppError(400, 'Please fill out all fields')
	}
	const validPassword = validatePasswordFields(user.password, confirmPassword)
	if (!validPassword) throw new AppError(400, 'Password is required')
	return true
}

export const validateLoginFields = (email: string, password: string) => {
	if (!email || !password) throw new AppError(400, 'Both fields must be filled')
}

export const validatePasswordFields = (password: string, comparePassword?: string) => {
	if (!password && !comparePassword) return false

	if ((password && !comparePassword) || (!password && comparePassword)) {
		throw new AppError(400, 'Both password fields must be filled out')
	}

	if (password != comparePassword) {
		throw new AppError(400, "Passwords don't match")
	}

	if (password.length < 6) {
		throw new AppError(400, 'Password should be atleast 6 characters in length')
	}
	return true
}
