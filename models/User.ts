import { Schema, model } from 'mongoose'
import { randomBytes, scrypt, scryptSync, createHash } from 'crypto'
import { IUserDocument } from 'types'

const userSchema = new Schema<IUserDocument>(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		isEmailConfirmed: { type: Boolean },
		googleId: String,
		password: String,
		mobile: String,
		preferences: Object,
		notifications: Object,
		createdDate: { type: Date, required: true },
		lastModifiedDate: { type: Date, required: true },
	},
	{ collection: 'users' }
)

userSchema.pre('save', function save(next) {
	const user: IUserDocument = this
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

userSchema.method('comparePassword', function (candidatePassword) {
	if (this.password) {
		const [salt, key] = this.password.split(':')
		return key === scryptSync(candidatePassword, salt, 64).toString('hex')
	}
	return false
})

userSchema.method('gravatar', function (size: number = 200) {
	if (this.email) {
		return `https://gravatar.com/avatar/?s=${size}&d=retro`
	}
	const md5 = createHash('md5').update(this.email).digest('hex')
	return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`
})

export const User = model<IUserDocument>('user', userSchema)
