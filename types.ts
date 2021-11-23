import { Document } from 'mongoose'

export interface IAPIResponse {
	success: boolean
	status: number
	message: string
	data?: any
}
export interface IUserPreferences {
	darkMode: boolean
	accentColor: string
	textColor: string
}

export interface IUserDocument extends Document {
	_id: string
	firstName: string
	lastName: string
	email: string
	googleId?: string
	password?: string
	mobile?: string
	createdDate: Date
	lastModifiedDate: Date
	preferences?: IUserPreferences
	comparePassword: (candidatePassword: string) => boolean
	gravatar: (size: number) => string
}

export interface IEntryDocument extends Document {
	_id: string
	text?: string
	title: string
	createdDate: Date
	lastModifiedDate: Date
	createdById: string
	templateId: string
	properties?: IProperty[]
}

export interface IProperty {
	_id: string
	type: 'text' | 'checkbox' | 'number' | 'select'
	subType?: string
	description: string
	default?: string | boolean | number | Array<string>
	multipleValues?: boolean
	showOnCard: boolean
	options?: Array<string>
	value?: string | boolean | number | Array<string>
}

export interface ITemplateDocument extends Document {
	_id: string
	description: string
	properties: Array<IProperty>
	createdDate: Date
	createdById: string
	lastModifiedDate: Date
}
