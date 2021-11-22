import { AppError } from '../helpers/response'
export const validateTemplateFields = (description: string, properties: string) => {
	if (!description) throw new AppError(400, 'A template description is required')
	if (!properties) throw new AppError(400, 'Properties are required')
}
