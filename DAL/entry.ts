import { IEntryDocument } from '../types'
import { Error as MongooseError } from 'mongoose'
import { AppError, AppResponse } from '../helpers/response'
import { Entry } from '../models/Entry'

export const getEntries = async (id: string): Promise<AppResponse> => {
	return Entry.find({ createdById: id })
		.sort({ createdDate: 'desc' })
		.then(entries => {
			return new AppResponse(200, null, entries)
		})
		.catch(err => {
			throw new AppError(500, err.message)
		})
}

export const createEntry = async (newEntry: IEntryDocument): Promise<AppResponse> => {
	return newEntry
		.save()
		.then(() => new AppResponse(201, 'Entry created successfully'))
		.catch((err: MongooseError) => {
			throw new AppError(500, err.message)
		})
}

export const getEntryById = async (entryId: string, userId: string): Promise<IEntryDocument> => {
	return Entry.findOne({ _id: entryId, createdById: userId })
		.then(entry => entry)
		.catch(err => {
			throw new AppError(500, err.message)
		})
}

export const deleteEntry = async (entryId: string, userId: string): Promise<AppResponse> => {
	return Entry.deleteOne({ _id: entryId, createdById: userId })
		.then(response => {
			if (response.deletedCount !== 0) {
				return new AppResponse(201, 'Entry deleted successfully')
			} else {
				throw new AppError(500, 'Entry not found')
			}
		})
		.catch(err => {
			throw new AppError(500, err.message)
		})
}
