import { Request, Response, NextFunction } from 'express'
import { Error as MongooseError } from 'mongoose'
import { Template, TemplateDocument } from '../models/Template'
import { ApiResponse } from '../types'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'User not logged in' } as ApiResponse)
		return
	}
	Template.find({ createdById: req.user._id })
		.then((templates: Array<TemplateDocument>) => {
			res.status(200).json({ message: 'Success', result: templates } as ApiResponse)
		})
		.catch(err => {
			res.status(500).json({ message: 'There was an error returning templates' } as ApiResponse)
			console.error(err)
		})
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'User not logged in' } as ApiResponse)
		return
	}

	if (!req.body.description || !req.body.properties) {
		res.status(401).json({ message: 'Templates require a description and properties' } as ApiResponse)
		return
	}

	const newTemplate: TemplateDocument = new Template({
		description: req.body.description,
		createdDate: new Date(),
		createdById: req.user._id,
		properties: req.body.properties,
		lastModifiedDate: new Date(),
	})
	newTemplate
		.save()
		.then((template: TemplateDocument) =>
			res.status(200).json({
				message: 'Template created successfully',
				result: template,
			} as ApiResponse)
		)
		.catch(err => {
			res.status(500).json({ message: 'There was an error creating this template' } as ApiResponse)
			console.error(err)
		})
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'User not logged in' } as ApiResponse)
		return
	}

	Template.findOne({ _id: req.params.id, createdById: req.user._id }, (err: MongooseError, template: TemplateDocument) => {
		if (err) {
			res.status(500).json({ message: 'There was an error updating this template' } as ApiResponse)
			console.error(err)
		}
		if (template) {
			if (req.body.description) template.description = req.body.description
			if (req.body.properties) template.properties = req.body.properties

			template.lastModifiedDate = new Date()
			template.save()

			res.status(200).json({ message: 'Template updated successfully', result: template } as ApiResponse)
		} else {
			res.status(404).json({ message: 'Template not found' } as ApiResponse)
		}
	})
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'User not logged in' } as ApiResponse)
		return
	}

	Template.deleteOne({ _id: req.params.id, createdById: req.user._id })
		.then(response => {
			if (response.deletedCount !== 0) {
				res.status(200).json({ message: 'Template deleted successfully' } as ApiResponse)
			} else {
				res.status(404).json({ message: 'Template not found' } as ApiResponse)
			}
		})
		.catch(err => {
			res.status(500).json({ message: 'There was an error deleting this template' } as ApiResponse)
			console.error(err)
		})
}
