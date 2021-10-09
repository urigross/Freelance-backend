const gigService = require('./gig.service')
const socketService = require('../../services/socket.service')
const logger = require('../../services/logger.service')

async function getGig(req, res) {
    try {
        console.log(req.params.id)
        const gig = await gigService.getById(req.params.id)
        res.send(gig)
    } catch (err) {
        logger.error('Failed to get gig', err)
        res.status(500).send({ err: 'Failed to get gig' })
    }
}

async function getGigs(req, res) {
    try {console.log('in get gigs')
        const filterBy = {}
        const gigs = await gigService.query(filterBy)
        res.send(gigs)
    } catch (err) {
        logger.error('Failed to get gigs', err)
        res.status(500).send({ err: 'Failed to get gigs' })
    }
}

async function deleteGig(req, res) {
    try {console.log('in controller delete')
        await gigService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete gig', err)
        res.status(500).send({ err: 'Failed to delete user' })
    }
}

async function updateGig(req, res) {
    try {
        const gig = req.body
        console.log('gig in controller')
        console.log(gig)
        const savedGig = await gigService.update(gig)
        res.send(savedGig)
    } catch (err) {
        logger.error('Failed to update gig', err)
        res.status(500).send({ err: 'Failed to update gig' })
    }
}

async function addGig(req, res) {
    try {
        console.log('in add')
        const gig = req.body
        const gigToSend = await gigService.add(gig)
        res.send(gigToSend)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(500).send({ err: 'Failed to update user' })
    }
}

module.exports = {
    getGig,
    getGigs,
    deleteGig,
    updateGig,
    addGig,
}