import { AppError } from '../helpers/response'
export const validateEntryFields = (title: string, text: string) => {
	if (!text) throw new AppError(400, 'Entry content is required')
	if (!title) throw new AppError(400, 'A title is required')
}
