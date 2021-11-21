import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
	code: number
	message: string
	constructor(code: number, message: string) {
		super(message)
		this.code = code
		this.message = message
	}
}

export class AppResponse {
	success: boolean
	code: number
	message?: string
	data?: JSON
	constructor(code: number, message?: string, data?: JSON) {
		this.success = (code + '').startsWith('2')
		this.code = code
		this.message = message
		this.data = data
	}
}

export const errorHandling = (err: AppError, req: Request, res: Response, next: NextFunction) => {
	if (err.code >= 500) {
		console.error(err.stack)
	}
	res.status(err.code).json(new AppResponse(err.code, err.message))
}
