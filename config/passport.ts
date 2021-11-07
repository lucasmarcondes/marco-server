import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

import { UserDocument, User } from '../models/User'
import { ApiResponse } from 'routes'
import { Request, Response, NextFunction } from 'express'
import { NativeError } from 'mongoose'

import env from 'dotenv'
env.config()

passport.serializeUser<any, any>((req, user, done) => {
	done(undefined, user)
})

passport.deserializeUser((id, done) => {
	User.findById(id, (err: NativeError, user: UserDocument) => done(err, user))
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
						.then((newUser: UserDocument) => done(null, newUser))
				}
			})
		}
	)
)

passport.use(
	new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
		User.findOne({ email: email.toLowerCase() }, (err: NativeError, user: UserDocument) => {
			if (err) return done(err)
			if (!user) return done(undefined, false, { message: `Email '${email}'' not found.` })

			user.comparePassword(password, (err: Error, isMatch: boolean) => {
				if (err) return done(err)
				if (isMatch) return done(undefined, user)
				return done(undefined, false, { message: 'Invalid email or password.' })
			})
		})
	})
)

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
	req.isAuthenticated() ? next() : res.status(401).json({ message: 'User not logged in' } as ApiResponse)
}
