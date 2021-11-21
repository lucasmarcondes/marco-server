import { IAPIReponse } from 'types'
export const success = (statusCode: number, result?: any): IAPIReponse => {
	return {
		error: false,
		code: statusCode,
		result: result,
	}
}

export const error = (statusCode: number, result?: any): IAPIReponse => {
	return {
		error: true,
		code: statusCode,
		result: result,
	}
}
