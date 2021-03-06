import { ITemplateDocument } from '../types'
import { Error as MongooseError } from 'mongoose'
import { AppError, AppResponse } from '../helpers/response'
import { Template } from '../models/Template'
import { TEMPLATE_CREATED_MSG, TEMPLATE_DELETED_MSG, TEMPLATE_404_MSG } from '../constants'

export const getTemplates = async (id: string): Promise<AppResponse> => {
	return Template.find({ createdById: id })
		.then(templates => {
			return new AppResponse(200, null, templates)
		})
		.catch(err => {
			throw new AppError(500, err.message)
		})
}

export const createTemplate = async (newEntry: ITemplateDocument): Promise<AppResponse> => {
	return newEntry
		.save()
		.then(() => new AppResponse(201, TEMPLATE_CREATED_MSG))
		.catch((err: MongooseError) => {
			throw new AppError(500, err.message)
		})
}

export const getTemplateById = async (entryId: string, userId: string): Promise<ITemplateDocument> => {
	return Template.findOne({ _id: entryId, createdById: userId })
		.then(template => template)
		.catch(err => {
			throw new AppError(500, err.message)
		})
}

export const deleteTemplate = async (entryId: string, userId: string): Promise<AppResponse> => {
	return Template.deleteOne({ _id: entryId, createdById: userId })
		.then(response => {
			if (response.deletedCount !== 0) {
				return new AppResponse(201, TEMPLATE_DELETED_MSG)
			} else {
				throw new AppError(404, TEMPLATE_404_MSG)
			}
		})
		.catch(err => {
			throw new AppError(500, err.message)
		})
}
