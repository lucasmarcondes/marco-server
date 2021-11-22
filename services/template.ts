import { ITemplateDocument } from '../types'
import { AppError } from '../helpers/response'
export const validateTemplateFields = (template: ITemplateDocument) => {
	if (!template.description) throw new AppError(400, 'A template description is required')
	if (!template.properties) throw new AppError(400, 'Properties are required')
}
