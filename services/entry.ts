import { IEntryDocument } from '../types'
import { AppError } from '../helpers/response'

export const validateEntryFields = (entry: IEntryDocument) => {
	if (!entry.text) throw new AppError(400, 'Entry content is required')
	if (!entry.title) throw new AppError(400, 'A title is required')
}
