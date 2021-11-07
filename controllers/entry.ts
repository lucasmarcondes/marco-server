import { Request, Response, NextFunction } from 'express'
import { Error as MongooseError } from 'mongoose'
import { Entry, EntryDocument } from '../models/Entry'
import { ApiResponse } from 'routes'

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'User not logged in' } as ApiResponse)
		return
	}
	Entry.find({
		/*createdById: req.user._id*/
	})
		.sort({ createdDate: 'desc' })
		.then((entries: Array<EntryDocument>) => {
			res.status(200).json({ message: 'Success', result: entries } as ApiResponse)
		})
		.catch(err => {
			res.status(500).json({ message: 'There was an error returning entries' } as ApiResponse)
			console.error(err)
		})
}

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'User not logged in' } as ApiResponse)
		return
	}
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
		.then((entry: EntryDocument) =>
			res.status(200).json({
				message: 'Template created successfully',
				result: entry,
			} as ApiResponse)
		)
		.catch(err => {
			res.status(500).json({ message: 'There was an error creating this entry' } as ApiResponse)
			console.error(err)
		})
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'User not logged in' } as ApiResponse)
		return
	}

	Entry.findOne({ _id: req.params.id, createdById: req.user._id }, (err: MongooseError, entry: EntryDocument) => {
		if (err) {
			res.status(500).json({ message: 'There was an error updating this entry' } as ApiResponse)
			console.error(err)
		}

		if (entry) {
			if (req.body.text) entry.text = req.body.text
			if (req.body.title) entry.title = req.body.title
			if (req.body.properties) entry.properties = req.body.properties

			entry.lastModifiedDate = new Date()
			entry.save()

			res.status(200).json({ message: 'Entry updated successfully', result: entry } as ApiResponse)
		} else {
			res.status(404).json({ message: 'Entry not found' } as ApiResponse)
		}
	})
}

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ message: 'User not logged in' } as ApiResponse)
		return
	}

	Entry.deleteOne({ _id: req.params.id, createdById: req.user._id })
		.then(response => {
			if (response.deletedCount !== 0) {
				res.status(200).json({ message: 'Entry deleted successfully' } as ApiResponse)
			} else {
				res.status(404).json({ message: 'Entry not found' } as ApiResponse)
			}
		})
		.catch(err => {
			res.status(500).json({ message: 'There was an error deleting this entry' } as ApiResponse)
			console.error(err)
		})
}
