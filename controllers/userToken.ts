import { Request, Response, NextFunction } from 'express'
import { findTokenAndDelete } from '../DAL/userToken'
import { getUserById } from '../DAL/user'
import { decrypt } from '../services/userToken'
import { AppError, AppResponse } from '../helpers/response'
import { USER_TOKEN_404_MSG, EMAIL_CONFIRMED_MSG } from '../constants'

export const verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = decrypt(req.params.token)
		const resp = await findTokenAndDelete(userId)
		if (resp) {
			const user = await getUserById(userId)
			user.isEmailConfirmed = true
			user.save()
			res.status(200).json(new AppResponse(200, EMAIL_CONFIRMED_MSG))
		} else {
			next(new AppError(404, USER_TOKEN_404_MSG))
		}
	} catch (err) {
		next(err)
	}
}
