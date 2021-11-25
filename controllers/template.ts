import { Request, Response, NextFunction } from 'express'
import { AppError, AppResponse } from '../helpers/response'
import { Template } from '../models/Template'
import { ITemplateDocument, IUserDocument } from '../types'
import { getTemplates, createTemplate, getTemplateById, deleteTemplate } from '../DAL/template'
import { validateTemplateFields } from '../services/template'
import { TEMPLATE_404_MSG, TEMPLATE_UPDATED_MSG } from '../constants'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const resp = await getTemplates((req.user as IUserDocument)._id)
		res.status(resp.code).send(resp)
	} catch (err) {
		next(err)
	}
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const newTemplate: ITemplateDocument = new Template({
		description: req.body.description,
		createdDate: new Date(),
		createdById: (req.user as IUserDocument)._id,
		properties: req.body.properties,
		lastModifiedDate: new Date(),
	})
	try {
		validateTemplateFields(newTemplate)
		const resp = await createTemplate(newTemplate)
		res.status(resp.code).json(resp)
	} catch (err) {
		next(err)
	}
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const template = await getTemplateById(req.params.id, (req.user as IUserDocument)._id)
		if (template) {
			template.description = req.body.description
			template.properties = req.body.properties
			template.lastModifiedDate = new Date()
			validateTemplateFields(template)

			template.save()

			res.status(200).json(new AppResponse(200, TEMPLATE_UPDATED_MSG))
		} else {
			throw new AppError(404, TEMPLATE_404_MSG)
		}
	} catch (err) {
		next(err)
	}
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const resp = await deleteTemplate(req.params.id, (req.user as IUserDocument)._id)
		res.status(resp.code).json(resp)
	} catch (err) {
		next(err)
	}
}
