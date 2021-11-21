import { User } from '../models/user'
import { success, error } from '../utils/api'
import { IAPIReponse, IUserDocument } from '../types'

export const validateUser = (user: IUserDocument): IAPIReponse => {
	if (!user.firstName || !user.lastName || !user.email) {
		throw error(400, 'Please fill out all fields')
	}

	return success(200, 'Valid User')
}

export const validatePassword = (password: string, comparePassword?: string): IAPIReponse => {
	if (comparePassword && password != comparePassword) {
		throw error(400, "Passwords don't match")
	}

	if (password.length < 6) {
		throw error(400, 'Password should be atleast 6 characters in length')
	}

	throw error(200, 'Valid Password')
}

export const validateNewUser = async (user: IUserDocument, confirmPassword: string): Promise<IAPIReponse> => {
	validateUser(user)

	if (!user.password || !confirmPassword) {
		throw error(400, "Passwords don't match")
	}

	const response = await User.find({ email: user.email })
	if (response.length) {
		throw error(400, 'Email is already in use')
	}

	return success(200, 'Valid User')
}
