import express from 'express'
const router = express.Router()
import { Request, Response } from 'express'
import { isAuthenticated } from './config/passport'
import * as userController from './controllers/user'
import * as templateController from './controllers/template'
import * as entryController from './controllers/entry'

// default
router.get('/', (req: Request, res: Response) => res.send('Welcome'))

// user
router.post('/user', userController.create)
router.get('/user', isAuthenticated, userController.list)
router.put('/user', isAuthenticated, userController.update)
router.delete('/user', isAuthenticated, userController.remove)
router.post('/users/login', userController.login)
router.get('/user/logout', isAuthenticated, userController.logout)
router.get('/user/login/google', userController.googleLogin)
router.get('/user/login/google/redirect', userController.googleRedirect)

// template
router.post('/templates', isAuthenticated, templateController.create)
router.get('/templates', isAuthenticated, templateController.list)
router.put('/templates/:id', isAuthenticated, templateController.update)
router.delete('/templates/:id', isAuthenticated, templateController.remove)

// entry
router.post('/entries', isAuthenticated, entryController.create)
router.get('/entries', isAuthenticated, entryController.list)
router.put('/enties/:id', isAuthenticated, entryController.update)
router.delete('/entries/:id', isAuthenticated, entryController.remove)

export default router
