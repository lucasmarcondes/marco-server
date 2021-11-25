import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'
import { AppError } from '../helpers/response'
const algorithm = 'aes-256-ctr'
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'

export const encrypt = (text: string) => {
	try {
		const iv = randomBytes(16)

		const cipher = createCipheriv(algorithm, secretKey, iv)

		const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

		return encrypted.toString('hex') + ':' + iv.toString('hex')
	} catch (err) {
		console.error(err)
		throw new AppError(500, err.message)
	}
}

export const decrypt = (hash: string) => {
	const [salt, iv] = hash.split(':')
	const decipher = createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'))

	const decrpyted = Buffer.concat([decipher.update(Buffer.from(salt, 'hex')), decipher.final()])

	return decrpyted.toString()
}
