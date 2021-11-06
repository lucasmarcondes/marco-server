import { Request, Response, NextFunction } from 'express'
import { Template, TemplateDocument } from '../models/Template'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (req.user) {
		Template.find({ createdById: req.user.id })
			.then((templates: Array<TemplateDocument>) => res.json(templates))
			.catch(err => console.log(err))
	}
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (req.user) {
		const newTemplate = new Template({
			description: req.body.description,
			createdDate: new Date(),
			createdById: req.user.id,
			properties: req.body.properties,
			lastModifiedDate: new Date(),
		})
		newTemplate
			.save()
			.then((template: TemplateDocument) => res.json(template))
			.catch((err: any) => console.log(err))
	}
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Template.findByIdAndUpdate(
		req.params.id,
		{
			description: req.body.description,
			properties: req.body.properties,
			lastModifiedDate: new Date(),
		},
		{
			new: true,
		}
	)
		.then(template => {
			res.status(200).send({ msg: template!.description + ' has been updated' })
		})
		.catch(err => console.log(err))
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Template.findByIdAndDelete(req.params.id)
		.then(template => res.status(200).send({ msg: template!.description + ' has been successfully deleted' }))
		.catch(err => console.log(err))
}
