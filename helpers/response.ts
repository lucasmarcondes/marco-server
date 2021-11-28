import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
	code: number
	message: string
	constructor(code: number, message: any) {
		super(message)
		this.code = code
		this.message = message
	}
}

export class AppResponse {
	success: boolean
	code: number
	message?: string
	data?: any
	constructor(code: number, message?: any, data?: any) {
		this.success = (code + '').startsWith('2')
		this.code = code
		message && (this.message = message)
		this.data = data
	}
}

export const errorHandling = (err: AppError | Error, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof AppError) {
		if (err.code >= 500) {
			console.error(err.stack)
		}
		res.status(err.code).json(new AppResponse(err.code, err.message))
	} else {
		console.error(err.stack)
		res.status(500).json(new AppResponse(500, err.message))
	}
}
