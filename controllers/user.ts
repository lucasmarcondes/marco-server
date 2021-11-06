import passport from 'passport'
import { User, UserDocument } from '../models/User'
import { Request, Response, NextFunction } from 'express'
import { IVerifyOptions } from 'passport-local'
import { check, validationResult } from 'express-validator'

import '../config/passport'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const userDto = {
		_id: req.user._id,
		firstName: req.user.firstName,
		lastName: req.user.lastName,
		email: req.user.email,
		mobile: req.user.mobile,
		createdDate: req.user.createdDate,
	}
	if (req.user) res.json(userDto)
	else res.sendStatus(401)
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	await check('email', 'Email is not valid').isEmail().run(req)
	await check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }).run(req)
	await check('confirmPassword', 'Passwords do not match').equals(req.body.password).run(req)

	await check('email', 'E-mail already in use')
		.custom(async email => {
			const response = await User.findOne({ email })
			return response !== null && Promise.reject()
		})
		.run(req)

	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		res.status(400).send(errors.array().map(error => ({ msg: error.msg })))
		return
	}

	const { firstName, lastName, email, password } = req.body

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
			res.status(201).send({ msg: 'Account created successfully' })
		})
		.catch((err: any) => console.log(err))
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (req.user) {
		//update
	} else {
		res.sendStatus(401)
	}
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (req.user) {
		//delete
	} else {
		res.sendStatus(401)
	}
}

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	await check('email', 'Email is not valid').isEmail().run(req)
	await check('password', 'Password cannot be blank').isLength({ min: 1 }).run(req)

	const errors = validationResult(req)

	if (!errors.isEmpty()) {
		res.status(400).send(errors.array().map(error => ({ msg: error.msg })))
		return
	}

	passport.authenticate('local', (err: any, user: UserDocument, info: IVerifyOptions) => {
		if (err) {
			return next(err)
		}
		if (!user) {
			return res.status(403).send(info)
		}
		req.logIn(user, err => {
			if (err) {
				return next(err)
			}
			return res.json({ msg: 'Welcome, ' + user.firstName })
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
}
