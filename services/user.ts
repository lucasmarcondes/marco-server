import { User } from '../models/User'
import { IUserDocument } from '../types'
import { AppError } from '../helpers/response'
import {
	LOGIN_FIELDS_NULL_MSG,
	PASSWORD_FIELDS_NULL_MSG,
	PASSWORD_LENGTH_MSG,
	PASSWORD_MISMATCH_MSG,
	PASSWORD_REQUIRED_MSG,
	USER_REG_NULL_FIELDS_MSG,
} from '../constants'

export const getUserDto = (user: any) => {
	return {
		_id: user._id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		preferences: user.preferences,
		notifications: user.notifications,
		isEmailConfirmed: user.isEmailConfirmed,
		mobile: user.mobile,
		createdDate: user.createdDate,
		gravatar: user.gravatar,
	} as IUserDocument
}

export const validateNewUserFields = (user: IUserDocument, confirmPassword: string) => {
	if (!user.firstName || !user.lastName || !user.email) {
		throw new AppError(400, USER_REG_NULL_FIELDS_MSG)
	}
	const validPassword = validatePasswordFields(user.password, confirmPassword)
	if (!validPassword) throw new AppError(400, PASSWORD_REQUIRED_MSG)
	return true
}

export const validateLoginFields = (email: string, password: string) => {
	if (!email || !password) throw new AppError(400, LOGIN_FIELDS_NULL_MSG)
}

export const validatePasswordFields = (password: string, comparePassword?: string) => {
	if (!password && !comparePassword) return false

	if ((password && !comparePassword) || (!password && comparePassword)) {
		throw new AppError(400, PASSWORD_FIELDS_NULL_MSG)
	}

	if (password != comparePassword) {
		throw new AppError(400, PASSWORD_MISMATCH_MSG)
	}

	if (password.length < 6) {
		throw new AppError(400, PASSWORD_LENGTH_MSG)
	}
	return true
}
