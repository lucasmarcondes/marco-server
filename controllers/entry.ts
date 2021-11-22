import { Request, Response, NextFunction } from 'express'
import { AppError, AppResponse } from '../helpers/response'
import { validateEntryFields } from '../services/entry'
import { createEntry, deleteEntry, getEntries, getEntryById } from '../DAL/entry'
import { Entry } from '../models/Entry'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const resp = await getEntries(req.user._id)
		res.status(resp.code).send(resp)
	} catch (err) {
		next(err)
	}
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const newEntry = new Entry({
		text: req.body.text,
		title: req.body.title,
		properties: req.body.properties,
		createdDate: new Date(),
		createdById: req.user._id,
		lastModifiedDate: new Date(),
		templateId: req.body.templateId,
	})
	try {
		validateEntryFields(newEntry)
		const resp = await createEntry(newEntry)
		res.status(resp.code).json(resp)
	} catch (err) {
		next(err)
	}
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const entry = await getEntryById(req.params.id, req.user._id)
		if (entry) {
			entry.lastModifiedDate = new Date()
			entry.text = req.body.text
			entry.title = req.body.title
			entry.properties = req.body.properties
			validateEntryFields(entry)

			entry.save()
			res.status(200).json(new AppResponse(200, 'Entry updated successfully'))
		} else {
			throw new AppError(404, 'Entry not found')
		}
	} catch (err) {
		next(err)
	}
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const resp = await deleteEntry(req.params.id, req.user._id)
		res.status(resp.code).json(resp)
	} catch (err) {
		next(err)
	}
}
