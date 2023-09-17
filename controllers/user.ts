import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import { User } from '../models/User'
import { getUserDto, validateNewUserFields, validatePasswordFields, validateLoginFields } from '../services/user'
import { IUserDocument } from '../types'
import { createUser, deleteUser, getUserByEmail, getUserById, validatePassword } from '../DAL/user'
import { sendResetPasswordEmail, sendVerifyEmail } from '../services/email'
import { createToken, findTokenAndDelete } from '../DAL/userToken'
import '../helpers/authenticate'
import { AppError, AppResponse } from '../helpers/response'
import {
	DEFAULT_ACCENT_COLOR,
	USER_EMAIL_409_MSG,
	LOGOUT_MSG,
	WELCOME_MSG,
	PASSWORD_RESET_SUCCESS_MSG,
	PASSWORD_RESET_TOKEN_ERROR_MSG,
} from '../constants'
import { createTemplate } from '../DAL/template'
import { Template } from '../models/Template'
import { decrypt } from '../services/userToken'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	let user = getUserDto(req.user)
	res.status(200).json(new AppResponse(200, undefined, user))
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const newUser: IUserDocument = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password,
		createdDate: new Date(),
		lastModifiedDate: new Date(),
		notifications: [],
		preferences: {
			darkMode: false,
			accentColor: DEFAULT_ACCENT_COLOR,
		},
	})

	try {
		validateNewUserFields(newUser, req.body.confirmPassword)
		const existingEmail = await getUserByEmail(newUser.email)
		if (existingEmail) {
			throw new AppError(409, USER_EMAIL_409_MSG)
		}
		await createUser(newUser)
		const token = await createToken(newUser._id.valueOf(), 'verifyEmail')
		if (token) {
			await sendVerifyEmail(newUser, token)
		}
		// TODO: this can be removed later, but for now lets create a template when user is created
		await createTemplate(
			new Template({
				description: 'New Template',
				createdDate: new Date(),
				createdById: newUser._id,
				properties: [],
				lastModifiedDate: new Date(),
			})
		)
		req.logIn(newUser, err => {
			if (err) next(err)
			else return res.status(200).json(new AppResponse(200, WELCOME_MSG.replace('{0}', newUser.firstName)))
		})
	} catch (err) {
		next(err)
	}
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { firstName, lastName, mobile, email, previousPassword, newPassword, preferences } = req.body

	try {
		const user = await getUserById((req.user as IUserDocument)._id)
		user.lastModifiedDate = new Date()
		if (firstName) user.firstName = firstName
		if (lastName) user.lastName = lastName
		if (mobile) user.mobile = mobile

		let emailChanged = false
		if (email && user.email != email) {
			user.email = email
			emailChanged = true
			user.isEmailConfirmed = false
		}
		if (preferences) user.preferences = preferences

		const validPasswordFields = validatePasswordFields(previousPassword, newPassword)
		if (validPasswordFields) {
			validatePassword(user, newPassword)
			user.password = newPassword
		}

		await user.save()
		if (emailChanged) {
			const userId = user._id.valueOf()
			// delete old token
			await findTokenAndDelete(userId, 'verifyEmail')
			const token = await createToken(userId, 'verifyEmail')
			const resp = await sendVerifyEmail(user, token)
		}
		res.status(200).json(new AppResponse(200, null, getUserDto(user)))
	} catch (err) {
		next(err)
	}
}

export const sendConfirmationEmail = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let user = req.user as IUserDocument
		const type = req.body.type
		if (type == 'passwordReset' && !user) {
			const email = req.body.email
			user = await getUserByEmail(email)
		}
		const userId = user._id.valueOf()
		// delete old token
		await findTokenAndDelete(userId, type)
		const token = await createToken(userId, type)
		let resp
		if (type == 'verifyEmail') resp = await sendVerifyEmail(user, token)
		else if (type == 'passwordReset') resp = await sendResetPasswordEmail(user, token)
		res.status(resp.code).json(resp)
	} catch (err) {
		next(err)
	}
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.body.token
		const password = req.body.password
		const confirmPassword = req.body.confirmPassword
		const validPasswordFields = validatePasswordFields(password, confirmPassword)
		if (validPasswordFields) {
			const userId = decrypt(token)
			const tokenResponse = await findTokenAndDelete(userId, 'passwordReset')
			if (tokenResponse) {
				const user = await getUserById(userId)
				user.lastModifiedDate = new Date()
				user.password = password
				await user.save()
				res.status(200).json(new AppResponse(200, PASSWORD_RESET_SUCCESS_MSG))
			} else {
				throw new AppError(404, PASSWORD_RESET_TOKEN_ERROR_MSG)
			}
		}
	} catch (err) {
		next(err)
	}
}

export const remove = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const resp = await deleteUser((req.user as IUserDocument)._id)
		res.status(resp.code).json(resp)
	} catch (err) {
		next(err)
	}
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	validateLoginFields(req.body.email, req.body.password)

	passport.authenticate('local', (err: any, user: any) => {
		if (err) next(err)
		else {
			req.logIn(user, err => {
				if (err) next(err)
				else return res.status(200).json(new AppResponse(200, WELCOME_MSG.replace('{0}', user.firstName)))
			})
		}
	})(req, res, next)
}

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	passport.authenticate('google', {
		scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
	})
}

export const googleRedirect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	passport.authenticate('google'),
		() => {
			res.redirect('/entries')
		}
}

export const logout = (req: Request, res: Response): void => {
	req.logout(null, null)
	res.status(200).json(new AppResponse(200, LOGOUT_MSG))
}
