const express = require('express')
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync')
const PicnicSpot = require('../models/picnicspot.js')
const Review = require('../models/review.js')
const review = require('../controllers/reviews')

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

router.post('/', validateReview, isLoggedIn, catchAsync(review.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(review.deleteReview))

module.exports = router
