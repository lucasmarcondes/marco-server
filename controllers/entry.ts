import { Request, Response, NextFunction } from 'express'
import { Error as MongooseError } from 'mongoose'
import { Entry, EntryDocument } from '../models/Entry'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Entry.find({ createdById: req.user._id })
		.sort({ createdDate: 'desc' })
		.then((entries: Array<EntryDocument>) => {
			res.status(200).json(entries)
		})
		.catch(err => {
			res.status(500).send('There was an error returning entries')
			console.error(err)
		})
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
	newEntry
		.save()
		.then((entry: EntryDocument) => res.status(200).json(entry))
		.catch(err => {
			res.status(500).send('There was an error creating this entry')
			console.error(err)
		})
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Entry.findOne({ _id: req.params.id, createdById: req.user._id }, (err: MongooseError, entry: EntryDocument) => {
		if (err) {
			res.status(500).send('There was an error updating this entry')
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
			res.status(404).send('Entry not found')
		}
	})
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	Entry.deleteOne({ _id: req.params.id, createdById: req.user._id })
		.then(response => {
			if (response.deletedCount !== 0) {
				res.sendStatus(200)
			} else {
				res.status(404).send('Entry not found')
			}
		})
		.catch(err => {
			res.status(500).send('There was an error deleting this entry')
			console.error(err)
		})
}
