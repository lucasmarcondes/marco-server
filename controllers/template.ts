import { Request, Response, NextFunction } from 'express'
import { AppError, AppResponse } from '../helpers/response'
import { Template } from '../models/Template'
import { ITemplateDocument } from 'types'
import { getTemplates, createTemplate, getTemplateById, deleteTemplate } from '../DAL/template'
import { validateTemplateFields } from '../services/template'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const resp = await getTemplates(req.user._id)
		res.status(resp.code).send(resp)
	} catch (err) {
		next(err)
	}
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const newTemplate: ITemplateDocument = new Template({
		description: req.body.description,
		createdDate: new Date(),
		createdById: req.user._id,
		properties: req.body.properties,
		lastModifiedDate: new Date(),
	})
	try {
		validateTemplateFields(req.body.description, req.body.properties)
		const resp = await createTemplate(newTemplate)
		res.status(resp.code).json(resp)
	} catch (err) {
		next(err)
	}
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const template = await getTemplateById(req.params.id, req.user._id)
		if (template) {
			if (req.body.description) template.description = req.body.description
			if (req.body.properties) template.properties = req.body.properties

			template.lastModifiedDate = new Date()
			template.save()

			res.status(200).json(new AppResponse(200, 'Template updated successfully'))
		} else {
			throw new AppError(404, 'Template not found')
		}
	} catch (err) {
		next(err)
	}
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const resp = await deleteTemplate(req.params.id, req.user._id)
		res.status(resp.code).json(resp)
	} catch (err) {
		next(err)
	}
}
