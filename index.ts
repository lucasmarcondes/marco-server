import express from 'express'
import session from 'express-session'
import cors from 'cors'
import passport from 'passport'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
import env from 'dotenv'
import './config/passport'

const app = express()

// keys
env.config()

// establish connection to MongoDB
const cp = mongoose.connect(process.env.MONGO_URI!).then(m => m.connection.getClient())

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
		store: MongoStore.create({ clientPromise: cp }),
	})
)

app.use(passport.initialize())
app.use(passport.session())

// import routes
import routes from './routes'
app.use('/api', routes)

const db = mongoose.connection
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

export default (req: any, res: any) => app
