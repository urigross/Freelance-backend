const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {addGig, updateGig, getGigs, deleteGig, getGig} = require('./gig.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getGigs)
router.get('/:id',log, getGig)
router.put('/',updateGig)
// router.post('/',  requireAuth, addGig)
router.post('/', addGig)
// router.delete('/:id',  requireAuth, deleteGig)
router.delete('/:id',   deleteGig)

module.exports = router