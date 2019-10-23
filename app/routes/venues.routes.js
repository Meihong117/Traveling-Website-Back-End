
const Venue = require('../controllers/venues.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/categories')
        .get(Venue.get_categories);

    app.route(app.rootUrl + '/venues')
        .get(Venue.get_venues)
        .post(Venue.post_venues);

    app.route(app.rootUrl + '/venues/:id')
        .get(Venue.get_venues_id)
        .patch(Venue.patch_venues_id);
//---------------------Photos-------------------------------------
    app.route(app.rootUrl + '/venues/:id/photos')
        .post(Venue.post_photo);
        //.get(Venue.get_photo);

    app.route(app.rootUrl + '/venues/:id/photos/:photoFilename')
        .get(Venue.get_photo_filename)
        .delete(Venue.delete_photo_filename);
};