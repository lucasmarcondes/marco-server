import { AppError } from '../helpers/response'
export const validateTemplateFields = (description: string, properties: string) => {
	if (!description || !properties) throw new AppError(401, 'Templates require a description and properties')
}
