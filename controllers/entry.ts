import { Request, Response, NextFunction } from 'express'
import { Error as MongooseError } from 'mongoose'
import { Entry } from '../models/entry'
import { IEntryDocument, IUserDocument } from 'types'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Entry.find({ createdById: (req.user as IUserDocument)._id })
		.sort({ createdDate: 'desc' })
		.then((entries: Array<IEntryDocument>) => {
			res.status(200).json(entries)
		})
		.catch(err => {
			res.status(500).json('There was an error returning entries')
			console.error(err)
		})
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const newEntry = new Entry({
		text: req.body.text,
		title: req.body.title,
		properties: req.body.properties,
		createdDate: new Date(),
		createdById: (req.user as IUserDocument)._id,
		lastModifiedDate: new Date(),
		templateId: req.body.templateId,
	})
	newEntry
		.save()
		.then((entry: IEntryDocument) => res.status(200).json(entry))
		.catch(err => {
			res.status(500).json('There was an error creating this entry')
			console.error(err)
		})
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Entry.findOne({ _id: req.params.id, createdById: (req.user as IUserDocument)._id }, (err: MongooseError, entry: IEntryDocument) => {
		if (err) {
			res.status(500).json('There was an error updating this entry')
			console.error(err)
		}

		if (entry) {
			if (req.body.text) entry.text = req.body.text
			if (req.body.title) entry.title = req.body.title
			if (req.body.properties) entry.properties = req.body.properties

			entry.lastModifiedDate = new Date()
			entry.save()

			res.status(200).json(entry)
		} else {
			res.status(404).json('Entry not found')
		}
	})
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Entry.deleteOne({ _id: req.params.id, createdById: (req.user as IUserDocument)._id })
		.then(response => {
			if (response.deletedCount !== 0) {
				res.status(200).json('Entry deleted successfuly')
			} else {
				res.status(404).json('Entry not found')
			}
		})
		.catch(err => {
			res.status(500).json('There was an error deleting this entry')
			console.error(err)
		})
}
