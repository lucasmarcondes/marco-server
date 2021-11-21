import { Request, Response, NextFunction } from 'express'
import { Error as MongooseError } from 'mongoose'
import { User } from '../models/user'
import passport from 'passport'
import { IVerifyOptions } from 'passport-local'
import { validateNewUser } from '../services/user'
import { IUserDocument } from '../types'
import { createUser } from '../DAL/user'

import '../helpers/authenticate'
import { AppError, AppResponse } from '../helpers/response'

declare global {
	namespace Express {
		interface User extends IUserDocument {}
	}
}

const userDto = (user: IUserDocument) => {
	return {
		_id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		preferences: user.preferences,
		mobile: user.mobile,
		createdDate: user.createdDate,
	}
}

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	res.status(200).json(userDto(req.user))
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const newUser: IUserDocument = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password,
		createdDate: new Date(),
		lastModifiedDate: new Date(),
		preferences: {},
	})

	try {
		const validUser = await validateNewUser(newUser, req.body.confirmPassword)
		if (validUser) {
			const resp = await createUser(newUser)
			res.status(resp.code).send(resp)
		}
	} catch (err) {
		next(err)
	}
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { firstName, lastName, mobile, email, previousPassword, newPassword, preferences } = req.body

	User.findById(req.user._id, (err: MongooseError, user: IUserDocument) => {
		if (err) {
			res.status(401).json('There was an error updating your account')
			console.error(err)
			return
		}

		user.lastModifiedDate = new Date()
		if (firstName) user.firstName = firstName
		if (lastName) user.lastName = lastName
		if (mobile) user.mobile = mobile
		if (email) user.email = email
		if (preferences) user.preferences = preferences

		if ((previousPassword && !newPassword) || (!previousPassword && newPassword)) {
			res.status(400).json('Both password fields must be filled out to update password')
			return
		}

		if (newPassword && newPassword.length < 6) {
			res.status(400).json('Password should be atleast 6 characters in length')
			return
		}
		if (previousPassword && newPassword) {
			user.comparePassword(previousPassword, (err: Error, isMatch: boolean) => {
				if (err) {
					res.status(500).json('There was an error validating passwords')
					console.error(err)
				} else if (!isMatch) {
					res.status(400).json('Current password is incorrect')
				} else {
					user.password = newPassword
					user.save()
					res.status(200).json(userDto(user))
				}
			})
		} else {
			user.save()
			res.status(200).json(userDto(user))
		}
	})
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	User.findByIdAndDelete(req.user._id)
		.then(() => res.status(200).json('User deleted successfully'))
		.catch(err => {
			res.status(500).json('There was an error deleting your Account')
			console.error(err)
		})
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.body.email || !req.body.password) {
		res.status(400).json('Both fields must be filled')
		return
	}

	passport.authenticate('local', (err: any, user: IUserDocument, info: IVerifyOptions) => {
		if (err) {
			res.status(500).json('There was an error authenticating your account')
			console.error(err)
			return
		}
		if (!user) {
			res.status(401).json(info.message)
			console.error(err)
			return
		}
		req.logIn(user, err => {
			if (err) {
				res.status(500).json('There was an error logging in')
				console.error(err)
				return
			}
			return res.status(200).json({ message: 'Welcome, ' + user.firstName })
		})
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
	res.send(200).json('Logged out successfully')
}
