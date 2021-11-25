import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import { User } from '../models/user'
import { getUserDto, validateNewUserFields, validatePasswordFields, validateLoginFields } from '../services/user'
import { IUserDocument } from '../types'
import { createUser, deleteUser, getUserByEmail, getUserById, validatePassword } from '../DAL/user'
import { sendConfirmationEmail } from '../services/email'
import { createToken } from '../DAL/userToken'
import '../helpers/authenticate'
import { AppError, AppResponse } from '../helpers/response'
import { DEFAULT_ACCENT_COLOR, DEFAULT_TEXT_COLOR, USER_EMAIL_409_MSG, LOGOUT_MSG, WELCOME_MSG } from '../constants'

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
			textColor: DEFAULT_TEXT_COLOR,
		},
	})

	try {
		validateNewUserFields(newUser, req.body.confirmPassword)
		const existingEmail = await getUserByEmail(newUser.email)
		if (existingEmail) {
			throw new AppError(409, USER_EMAIL_409_MSG)
		}
		await createUser(newUser)
		const token = await createToken(newUser._id.valueOf())
		if (token) {
			await sendConfirmationEmail(newUser.email, token)
		}
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
		if (email) user.email = email
		if (preferences) user.preferences = preferences

		const validPasswordFields = validatePasswordFields(previousPassword, newPassword)
		if (validPasswordFields) {
			validatePassword(user, newPassword)
			user.password = newPassword
		}

		user.save()
		res.status(200).json(new AppResponse(200, null, getUserDto(user)))
	} catch (err) {
		next(err)
	}
}

export const resendConfirmationEmail = async (req: Request, res: Response, next: NextFunction) => {
	try {
		console.log(req)
		const token = await createToken(req.user._id.valueOf())
		const resp = await sendConfirmationEmail(req.user.email, token)
		res.status(resp.code).json(resp)
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

	passport.authenticate('local', (err, user) => {
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
	req.logout()
	res.status(200).json(new AppResponse(200, LOGOUT_MSG))
}
