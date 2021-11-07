import { Request, Response, NextFunction } from 'express'
import { Error as MongooseError } from 'mongoose'
import { User, UserDocument } from '../models/User'
import passport from 'passport'
import { IVerifyOptions } from 'passport-local'

import '../config/passport'

declare global {
	namespace Express {
		interface User extends UserDocument {}
	}
}

const userDto = (user: UserDocument) => {
	return {
		_id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		mobile: user.mobile,
		createdDate: user.createdDate,
	}
}

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	res.status(200).json(userDto(req.user))
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { firstName, lastName, email, password, confirmPassword } = req.body
	if (!firstName || !lastName || !email || !password || !confirmPassword) {
		res.status(400).send('Please fill out all fields')
		return
	}
	if (password != confirmPassword) {
		res.status(400).send('Passwords must match')
		return
	}
	if (password.length < 6) {
		res.status(400).send('Password should be atleast 6 characters in length')
		return
	}

	const response = await User.find({ email })
	if (response.length) {
		res.status(400).send('Email is already in use')
		return
	}

	const newUser: UserDocument = new User({
		firstName: firstName,
		lastName: lastName,
		email: email,
		password: password,
		createdDate: new Date(),
		lastModifiedDate: new Date(),
	})

	// save user
	newUser
		.save()
		.then(() => {
			res.sendStatus(201)
		})
		.catch((err: MongooseError) => {
			res.status(500).send('There was an error with your request')
			console.error(err)
		})
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { firstName, lastName, mobile, email, previousPassword, newPassword } = req.body

	User.findById(req.user._id, (err: MongooseError, user: UserDocument) => {
		if (err) {
			res.status(401).send('There was an error updating your account')
			console.error(err)
			return
		}

		user.lastModifiedDate = new Date()
		if (firstName) user.firstName = firstName
		if (lastName) user.lastName = lastName
		if (mobile) user.mobile = mobile
		if (email) user.email = email

		if ((previousPassword && !newPassword) || (!previousPassword && newPassword)) {
			res.status(400).send('Both password fields must be filled out to update password')
			return
		}

		if (newPassword && newPassword.length < 6) {
			res.status(400).send('Password should be atleast 6 characters in length')
			return
		}
		if (previousPassword && newPassword) {
			user.comparePassword(previousPassword, (err: Error, isMatch: boolean) => {
				if (err) {
					res.status(500).send('There was an error validating passwords')
					console.error(err)
				} else if (!isMatch) {
					res.status(400).send('Current password is incorrect')
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
		.then(() => res.sendStatus(200))
		.catch(err => {
			res.status(500).send('There was an error deleting your Account')
			console.error(err)
		})
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.body.email || !req.body.password) {
		res.status(400).send('Both fields must be filled')
		return
	}

	passport.authenticate('local', (err: any, user: UserDocument, info: IVerifyOptions) => {
		if (err) {
			res.status(500).send('There was an error authenticating your account')
			console.error(err)
			return
		}
		if (!user) {
			res.status(500).send(info.message)
			console.error(err)
			return
		}
		req.logIn(user, err => {
			if (err) {
				res.status(500).send('There was an error logging in')
				console.error(err)
				return
			}
			return res.sendStatus(200)
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
	res.sendStatus(200)
}
