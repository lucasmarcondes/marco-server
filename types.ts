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

export interface INotification {
	id: string
	title?: string
	message: string
}

export interface IUserDocument extends Document {
	_id?: string
	firstName: string
	lastName: string
	email: string
	isEmailConfirmed?: boolean
	googleId?: string
	password?: string
	mobile?: string
	createdDate: Date
	lastModifiedDate?: Date
	preferences?: IUserPreferences
	notifications?: INotification[]
	comparePassword: (candidatePassword: string) => boolean
	gravatar?: (size: number) => string
}

export interface IUserToken extends Document {
	_id?: string
	token: string
	userId: string
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
