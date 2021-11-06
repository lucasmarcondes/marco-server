import { Request, Response, NextFunction } from 'express'
import { UserDocument } from '../models/User'

import { Entry, EntryDocument } from '../models/Entry'

declare global {
	namespace Express {
		interface User extends UserDocument {}
	}
}

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (req.user) {
		Entry.find({
			/*createdById: req.user.id*/
		})
			.sort({ createdDate: 'desc' })
			.then(entries => res.json(entries))
			.catch((err: any) => console.log(err))
	}
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (req.user) {
		const newEntry = new Entry({
			text: req.body.text,
			title: req.body.title,
			properties: req.body.properties,
			createdDate: new Date(),
			createdById: req.user.id,
			lastModifiedDate: new Date(),
			templateId: req.body.templateId,
		})
		newEntry
			.save()
			.then((entry: EntryDocument) => res.json(entry))
			.catch((err: any) => console.log(err))
	}
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Entry.findByIdAndUpdate(
		req.params.id,
		{
			text: req.body.text,
			title: req.body.title,
			templateId: req.body.templateId,
			properties: req.body.properties,
			lastModifiedDate: new Date(),
		},
		{ new: true }
	)
		.then(entry => res.json(entry))
		.catch((err: any) => console.log(err))
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Entry.findByIdAndDelete(req.params.id)
		.then(() => {
			res.json({ msg: 'Entry has been deleted' })
		})
		.catch((err: any) => console.log(err))
}
