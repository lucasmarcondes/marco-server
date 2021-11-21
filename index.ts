import express, { Request, Response, NextFunction } from 'express'
import session from 'express-session'
import cors from 'cors'
import passport from 'passport'
import { connect, connection } from 'mongoose'
import MongoStore from 'connect-mongo'
import env from 'dotenv'
import './helpers/authenticate'
import { errorHandling } from './helpers/response'

const app = express()

// keys
env.config()

// establish connection to MongoDB
const clientPromise: any = connect(process.env.MONGO_URI!).then(m => m.connection.getClient())

const db = connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
	console.log('Connected to MongoDB')
})

if (require.main === module) {
	const port = process.env.PORT || 3030
	app.listen(port, () => {
		console.log(`API server listening on port ${port}`)
	})
}

//Middleware
const corsOptions = {
	origin: 'http://localhost:3000',
	credentials: true, //access-control-allow-credentials:true
	optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(
	session({
		secret: process.env.SESSION_SECRET!,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
		},
		saveUninitialized: false,
		resave: false,
		store: MongoStore.create({ clientPromise }),
	})
)

app.use(passport.initialize())
app.use(passport.session())

// import routes
import routes from './routes'
app.use('/api', routes)

app.use(errorHandling)

export default (req: Request, res: Response) => app
