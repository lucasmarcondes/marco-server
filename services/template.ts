import { ITemplateDocument } from '../types'
import { AppError } from '../helpers/response'
import { TEMPLATE_PROPS_REQUIRED_MSG, TEMPLATE_TEXT_REQUIRED_MSG } from '../constants'

export const validateTemplateFields = (template: ITemplateDocument) => {
	if (!template.description) throw new AppError(400, TEMPLATE_TEXT_REQUIRED_MSG)
	if (!template.properties) throw new AppError(400, TEMPLATE_PROPS_REQUIRED_MSG)
}
