
const users = require('../controllers/users.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/:userId')
        .get(users.read)                       //get id---done
        .patch(users.modify);                  //patch---done

    app.route(app.rootUrl + '/users')          //post/users---done
        .post(users.register);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);                    //post/users/login

    app.route(app.rootUrl + '/users/logout')
        .post(users.logout);                   //post/users/logout

    app.route(app.rootUrl + '/users/:id/photo')
        .put(users.put_photo)
        .get(users.get_photo)
        .delete(users.delete_photo);
};
