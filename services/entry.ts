import { IEntryDocument } from '../types'
import { AppError } from '../helpers/response'
import { ENTRY_TEXT_REQUIRED_MSG, ENTRY_TITLE_REQUIRED_MSG } from '../constants'

export const validateEntryFields = (entry: IEntryDocument) => {
	if (!entry.text) throw new AppError(400, ENTRY_TEXT_REQUIRED_MSG)
	if (!entry.title) throw new AppError(400, ENTRY_TITLE_REQUIRED_MSG)
}
