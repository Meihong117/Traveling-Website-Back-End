
const Review = require('../controllers/reviews.controller');

module.exports = function (app) {

    app.route(app.rootUrl + '/venues/:id/reviews')
        .get(Review.get_review)
        .post(Review.post_review);

    app.route(app.rootUrl + '/users/:id/reviews')
        .get(Review.get_users_reviews);
};