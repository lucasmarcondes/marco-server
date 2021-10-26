import express from 'express'
const router = express.Router()
import { isAuthenticated } from './config/passport'
import * as userController from './controllers/user'
import * as templateController from './controllers/template'
import * as entryController from './controllers/entry'

// user
router.post('/user', userController.create)
router.get('/user', isAuthenticated, userController.list)
router.put('/user', isAuthenticated, userController.update)
router.delete('/user', isAuthenticated, userController.remove)
router.post('/user/login', userController.login)
router.get('/user/logout', userController.logout)
router.get('/user/login/google', userController.googleLogin)
router.get('/user/login/google/redirect', userController.googleRedirect)

// template
router.post('/template', isAuthenticated, templateController.create)
router.get('/template', isAuthenticated, templateController.list)
router.put('/template/:id', isAuthenticated, templateController.update)
router.delete('/template/:id', isAuthenticated, templateController.remove)

// entry
router.post('/entry', isAuthenticated, entryController.create)
router.get('/entry', isAuthenticated, entryController.list)
router.put('/entry/:id', isAuthenticated, entryController.update)
router.delete('/entry/:id', isAuthenticated, entryController.remove)

export default router
