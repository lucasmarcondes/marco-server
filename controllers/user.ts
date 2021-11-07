import { Request, Response, NextFunction } from 'express'
import { Error as MongooseError } from 'mongoose'
import { User, UserDocument } from '../models/User'
import { ApiResponse } from 'routes'
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
	res.status(200).json({ message: 'Success', result: userDto(req.user) })
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { firstName, lastName, email, password, confirmPassword } = req.body
	if (!firstName || !lastName || !email || !password || !confirmPassword) {
		res.status(400).json({ message: 'Please fill out all fields' } as ApiResponse)
		return
	}
	if (password != confirmPassword) {
		res.status(400).json({ message: 'Passwords must match' } as ApiResponse)
		return
	}
	if (password.length < 6) {
		res.status(400).json({ message: 'Password should be atleast 6 characters in length' } as ApiResponse)
		return
	}

	const response = await User.find({ email })
	if (response.length) {
		res.status(400).json({ message: 'Email is already in use' } as ApiResponse)
		return
	}

	const newUser: UserDocument = new User({
		firstName: firstName,
		lastName: lastName,
		email: email,
		password: password,
		createdDate: new Date(),
	})

	// save user
	newUser
		.save()
		.then(() => {
			res.status(201).json({ message: 'Account created successfully' } as ApiResponse)
		})
		.catch((err: MongooseError) => {
			res.status(500).json({ message: 'There was an error with your request' } as ApiResponse)
			console.error(err)
		})
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { firstName, lastName, mobile, email, previousPassword, newPassword } = req.body

	User.findById(req.user._id, (err: MongooseError, user: UserDocument) => {
		if (err) {
			res.status(401).json({ message: 'There was an error updating your account' } as ApiResponse)
			console.error(err)
			return
		}

		if (firstName) user.firstName = firstName
		if (lastName) user.lastName = lastName
		if (mobile) user.mobile = mobile
		if (email) user.email = email

		if ((previousPassword && !newPassword) || (!previousPassword && newPassword)) {
			res.status(400).json({ message: 'Both password fields must be filled out to update password' } as ApiResponse)
			return
		}

		if (newPassword && newPassword.length < 6) {
			res.status(400).json({ message: 'Password should be atleast 6 characters in length' } as ApiResponse)
			return
		}
		if (previousPassword && newPassword) {
			user.comparePassword(previousPassword, (err: Error, isMatch: boolean) => {
				if (err) {
					res.status(500).json({ message: 'There was an error validating passwords' } as ApiResponse)
					console.error(err)
				} else if (!isMatch) {
					res.status(400).json({ message: 'Current password is incorrect' } as ApiResponse)
				} else {
					user.password = newPassword
					user.save()
					res.status(200).json({
						message: 'Account updated successfully',
						result: userDto(user),
					} as ApiResponse)
				}
			})
		} else {
			user.save()
			res.status(200).json({
				message: 'Account updated successfully',
				result: userDto(user),
			} as ApiResponse)
		}
	})
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	User.findByIdAndDelete(req.user._id)
		.then(() =>
			res.status(200).json({
				message: 'Account deleted successfully',
			} as ApiResponse)
		)
		.catch(err => {
			res.status(500).json({ message: 'There was an error deleting your Account' } as ApiResponse)
			console.error(err)
		})
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.body.email || !req.body.password) {
		res.status(400).json({ message: 'Both fields must be filled' } as ApiResponse)
		return
	}

	passport.authenticate('local', (err: any, user: UserDocument, info: IVerifyOptions) => {
		if (err) {
			res.status(500).json({ message: 'There was an error authenticating your account' } as ApiResponse)
			console.error(err)
			return
		}
		if (!user) {
			res.status(500).json(info as ApiResponse)
			console.error(err)
			return
		}
		req.logIn(user, err => {
			if (err) {
				res.status(500).json({ message: 'There was an error logging in' } as ApiResponse)
				console.error(err)
				return
			}
			return res.status(200).json({ message: 'Login successful' } as ApiResponse)
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
	res.status(200).json({ message: 'Logout successful' } as ApiResponse)
}
