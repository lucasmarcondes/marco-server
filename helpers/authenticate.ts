import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

import { User } from '../models/user'
import { getUserByEmail, validatePassword } from '../DAL/user'
import { IUserDocument } from 'types'
import { Request, Response, NextFunction } from 'express'
import { NativeError } from 'mongoose'

import env from 'dotenv'
import { AppError, AppResponse } from './response'
import { USER_AUTH_401_MSG, USER_EMAIL_404_MSG } from '../constants'

env.config()

passport.serializeUser<any, any>((req, user, done) => {
	done(undefined, user)
})

passport.deserializeUser((id, done) => {
	User.findById(id, (err: NativeError, user: IUserDocument) => done(err, user))
})

passport.use(
	new GoogleStrategy(
		{
			// options for the google strategy
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL: '/api/user/login/google/redirect',
		},
		(profile: any, done: any) => {
			// check if user exists
			User.findOne({ email: profile.emails[0].value }).then(currentUser => {
				if (currentUser) {
					return done(null, currentUser)
				} else {
					// create a new user
					new User({
						firstName: profile.name.givenName,
						lastName: profile.name.familyName,
						email: profile.emails[0].value,
						googleId: profile.id,
						createdDate: new Date(),
					})
						.save()
						.then((newUser: IUserDocument) => done(null, newUser))
				}
			})
		}
	)
)

passport.use(
	new LocalStrategy({ usernameField: 'email' }, (email, password, next) => {
		getUserByEmail(email)
			.then(user => {
				if (user) {
					validatePassword(user, password)
					next(null, user)
				} else {
					throw new AppError(400, USER_EMAIL_404_MSG)
				}
			})
			.catch(err => {
				next(err)
			})
	})
)

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
	req.isAuthenticated() ? next() : next(new AppError(401, USER_AUTH_401_MSG))
}
