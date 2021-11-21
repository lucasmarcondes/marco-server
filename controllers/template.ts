import { Request, Response, NextFunction } from 'express'
import { Error as MongooseError } from 'mongoose'
import { Template } from '../models/template'
import { ITemplateDocument, IUserDocument } from 'types'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Template.find({ createdById: (req.user as IUserDocument)._id })
		.then((templates: Array<ITemplateDocument>) => {
			res.status(200).json(templates)
		})
		.catch(err => {
			res.status(500).send('There was an error returning templates')
			console.error(err)
		})
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.body.description || !req.body.properties) {
		res.status(401).send('Templates require a description and properties')
		return
	}

	const newTemplate: ITemplateDocument = new Template({
		description: req.body.description,
		createdDate: new Date(),
		createdById: (req.user as IUserDocument)._id,
		properties: req.body.properties,
		lastModifiedDate: new Date(),
	})
	newTemplate
		.save()
		.then((template: ITemplateDocument) => res.status(200).json(template))
		.catch(err => {
			res.status(500).send('There was an error creating this template')
			console.error(err)
		})
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Template.findOne({ _id: req.params.id, createdById: (req.user as IUserDocument)._id }, (err: MongooseError, template: ITemplateDocument) => {
		if (err) {
			res.status(500).send('There was an error updating this template')
			console.error(err)
		}
		if (template) {
			if (req.body.description) template.description = req.body.description
			if (req.body.properties) template.properties = req.body.properties

			template.lastModifiedDate = new Date()
			template.save()

			res.status(200).json(template)
		} else {
			res.status(404).send('Template not found')
		}
	})
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Template.deleteOne({ _id: req.params.id, createdById: (req.user as IUserDocument)._id })
		.then(response => {
			if (response.deletedCount !== 0) {
				res.sendStatus(200)
			} else {
				res.status(404).send('Template not found')
			}
		})
		.catch(err => {
			res.status(500).send('There was an error deleting this template')
			console.error(err)
		})
}
