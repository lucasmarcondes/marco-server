import { Document, Schema, model } from 'mongoose'
import { randomBytes, scrypt, createHash } from 'crypto'

export interface UserDocument extends Document {
	_id: string
	firstName: string
	lastName: string
	email: string
	googleId?: string
	password?: string
	mobile?: string
	createdDate: Date
	lastModifiedDate: Date
	comparePassword: (candidatePassword: string, cb: (err: any, isMatch: any) => void) => void
	gravatar: (size: number) => string
}

const userSchema = new Schema<UserDocument>(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		googleId: String,
		password: String,
		mobile: String,
		createdDate: { type: Date, required: true },
		lastModifiedDate: { type: Date, required: true },
	},
	{ collection: 'users' }
)

userSchema.pre('save', function save(next) {
	const user: UserDocument = this
	if (!user.isModified('password')) {
		return next()
	}
	const salt: string = randomBytes(16).toString('hex')
	scrypt(user.password!, salt, 64, (error, derivedKey) => {
		if (error) next(error)
		user.password = salt + ':' + derivedKey.toString('hex')
		next()
	})
})

userSchema.methods.comparePassword = function (candidatePassword, cb) {
	if (this.password) {
		const [salt, key] = this.password.split(':')
		scrypt(candidatePassword, salt, 64, (err: any, derivedKey: any) => {
			if (err) throw err
			if (key === derivedKey.toString('hex')) {
				cb(err, true)
			} else {
				cb(err, false)
			}
		})
	} else {
		return cb(null, false)
	}
}

userSchema.methods.gravatar = function (size: number = 200) {
	if (this.email) {
		return `https://gravatar.com/avatar/?s=${size}&d=retro`
	}
	const md5 = createHash('md5').update(this.email).digest('hex')
	return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`
}

export const User = model<UserDocument>('user', userSchema)
