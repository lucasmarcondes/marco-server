import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import { User } from '../models/User'
import { getUserDto, validateNewUserFields, validatePasswordFields, validateLoginFields, validateEmailConfirmation } from '../services/user'
import { IUserDocument } from '../types'
import { createUser, deleteUser, getUserByEmail, getUserById, validatePassword } from '../DAL/user'

import '../helpers/authenticate'
import { AppError, AppResponse } from '../helpers/response'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	let user = getUserDto(req.user)
	validateEmailConfirmation(user)
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
			accentColor: '#BFDBFF',
			textColor: '#000',
		},
	})

	try {
		validateNewUserFields(newUser, req.body.confirmPassword)
		const existingEmail = await getUserByEmail(newUser.email)
		if (existingEmail) {
			throw new AppError(409, 'Email is already in use')
		}
		const resp = await createUser(newUser)
		res.status(resp.code).json(resp)
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
				else return res.status(200).json(new AppResponse(200, `Welcome, ${user.firstName}`))
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
	res.send(200).json(new AppResponse(200, 'Logout successful'))
}
