import { IEntryDocument } from '../types'
import { Error as MongooseError } from 'mongoose'
import { AppError, AppResponse } from '../helpers/response'
import { Entry } from '../models/Entry'
import { ENTRY_404_MSG, ENTRY_CREATED_MSG, ENTRY_DELETED_MSG } from '../constants'

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
		.then(() => new AppResponse(201, ENTRY_CREATED_MSG))
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
				return new AppResponse(201, ENTRY_DELETED_MSG)
			} else {
				throw new AppError(404, ENTRY_404_MSG)
			}
		})
		.catch(err => {
			throw new AppError(500, err.message)
		})
}
