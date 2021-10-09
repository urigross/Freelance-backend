const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const reviewService = require('../review/review.service')

module.exports = {
    query,
    getById,
    remove,
    update,
    add,
    // addReview
}

async function query(filterBy = {}) {
    filterBy = JSON.parse(JSON.stringify((filterBy)));
    const criteria = _buildCriteria(filterBy);
    try {
        const collection = await dbService.getCollection('gig')
            // console.log(collection)
        const gigs = await collection.find(criteria).toArray()
        return gigs;
    } catch (err) {
        console.log('ERROR: cannot find gigs')
        throw err
    }
}

async function getById(gigId) {
    try {
        console.log("in service")
        console.log(gigId)
        const collection = await dbService.getCollection('gig')
        const prmGig = collection.findOne({ _id: ObjectId(gigId) })

        //   const prmReviews = reviewService.query({ toyId: gigId })
        //   const [toy, reviews] = await Promise.all([prmGig, prmReviews])
        //   toy.reviews = reviews

        const gig = await prmGig
        return gig
    } catch (err) {
        console.log(`ERROR: cannot find gig ${gigId}`)
        throw err
    }
}

async function remove(gig) {
    try {
        console.log('in backend remove')
        const collection = await dbService.getCollection('gig')
        return await collection.deleteOne({ _id: ObjectId(gig) })
    } catch (err) {
        console.log(`ERROR: cannot remove gig ${gig}`)
        throw err
    }
}

async function update(gig) {
    try {
        gig._id = ObjectId(gig._id)
        const collection = await dbService.getCollection('gig')
        await collection.updateOne({ _id: gig._id }, { $set: {...gig } })
        return gig
    } catch (err) {
        console.log(`ERROR: cannot update gig ${gig._id}`)
        throw err
    }
}

async function add(gig) {
    try {
        const collection = await dbService.getCollection('gig')
        gig.price = +gig.price;
        await collection.insertOne(gig)
        return gig
    } catch (err) {
        console.log(`ERROR: cannot insert gig`)
        throw err
    }
}
// async function addReview(toy, review) {
//    try {
//       const collection = await dbService.getCollection('toy')
//       const toyId = ObjectId(toy._id)
//       await collection.updateOne({ '_id': toyId }, { $push: { reviews: review } })
//       const toyAfterAdding = await collection.findOne({ '_id': toyId })
//       return toyAfterAdding
//    } catch (err) {
//       console.log(`ERROR: cannot insert review`)
//       throw err
//    }
// }

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.name) {
        const txtCriteria = { $regex: filterBy.name, $options: 'i' }
        criteria.name = txtCriteria
    }
    if (filterBy.type && filterBy.type !== 'All') {
        criteria.type = filterBy.type
    }
    if (filterBy.price) {
        criteria.price = { $gte: +filterBy.price }
    }
    return criteria
}