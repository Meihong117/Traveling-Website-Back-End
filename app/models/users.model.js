
const db=require('../../config/db');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

const getHash = function(password, salt){
    return crypto.pbkdf2Sync(password,salt, 100000, 256, 'sha256').toString('hex');
};


///////////////////////////////////////GET/users/:id---////////////////////////////////////////////////////////////////////////
exports.getId=function (userId, done) {
    db.getPool().query('SELECT username AS username, email AS email, given_name AS givenName, family_name AS familyName, user_id, profile_photo_filename, password FROM User WHERE user_id = ?', [userId], function (err, rows) {
        //console.log(err);
        if(err) return done(err, null);
        return done(rows);
    })

};

///////////////////////////////////////////POST/users //////////////////////////////////////////////////////////////////
exports.insert=function (value, done) {
    const salt = crypto.randomBytes(64);
    const hash = getHash(value.password, salt);

    let values=[value.username, value.email,value.givenName,value.familyName,hash];//
//select user_id from User where username=?, username, fun(err, rows){
//
// if (err){  postman de username he database li de mingzi buyizhi: so zhege mingzi buzai database
//
// insert into ...........
// }else{   chulejieguo
// return bad request
// }
//
//
// }

    db.getPool().query('INSERT INTO User (username, email, given_name, family_name, password) VALUES (?,?,?,?,?)', values, function(err, rows){
        if(err) return done(err);
        return done(err,rows.insertId );
    });
};

/*
exports.get_username=function (value, done) {
    db.getPool().query('SELECT username FROM User WHERE email = ?', value, function (err, rows) {  //email must match database email
        console.log(rows);
        if (err) return done(err, null);
        return done(rows);
    })
}*/

/////////////////////////////////////////////////PATCH/users/:id-////////////////////////////////////////////////////////////////
exports.change=function (value,id, done) {
    let values=[value.givenName, value.familyName, value.password,id];

    db.getPool().query('UPDATE User SET given_name=?,family_name=?,password=? WHERE user_id=?', values, function (err, rows) {
       // console.log(rows): rows is OkPacket, not detail data
        //console.log(err)// null
        if(err) return done(err);
        return done(rows);
    })

};

////////////////////////////////////////////POST/users/login////////////////////////////////////////////////////////////
exports.logIn=function(user_data,done){
    let user_info=[user_data.username, user_data.email, user_data.password];

    let token=crypto.randomBytes(16).toString('hex');

    //console.log(user_data.password);//kryptonite
   // console.log(token);//e3807236dead1019cb246882a4bfe1cd

    if (user_data.username !== undefined) { //already have name
        db.getPool().query('SELECT * FROM User WHERE username = ?', user_info, function (err, rows) {    //get from postman username, if match go down
            if(rows[0]['password']!==user_data.password) return done(true, null);
            // console.log(rows);
            //{
            //     user_id: 3,
            //     username: 'superman',
            //     email: 'superman@super.heroes',
            //     given_name: 'Clark',
            //     family_name: 'Kent',
            //     password: 'kryptonite',
            //     auth_token: '529aa1d71e5997a401b9b68b7ea4c2ae',
            //     profile_photo_filename: null }
            if (err) {
                return done(err, null);
            } else {
                if (rows.length !== 0) {
                        db.getPool().query('UPDATE User SET auth_token=? WHERE username =?', [token, user_data.username], function (err,rows) {  //add token
                            //console.log(rows);//buxuyao
                            if (err) {
                                return done(err, null);
                            } else {
                                db.getPool().query('SELECT user_id, auth_token FROM User WHERE username = ?', user_info, function (err, rows) {  //authenticate //get user_id and token
                                   // console.log(rows);//{ user_id: 3, auth_token: 'd63af74c4a2c136ceb19738fbe8d3da8' }
                                    return done(null, rows);
                                });
                            }
                        });
                    } else {
                        return done(new Error(), rows);
                    }
                }
        });
    }
    if(user_data.username === undefined){
        db.getPool().query('SELECT * FROM User where email = ?', user_data.email, function (err, rows) {  //check emial exsit
            if (err) {
                return done(err, null);
            } else {
                if (rows.length !== 0) {
                        db.getPool().query('UPDATE User SET auth_token = ? WHERE email = ?', [token, user_data.email], function (err) {
                            if (err) {
                                return done(err, null);
                            } else {
                                db.getPool().query('SELECT user_id, auth_token FROM User WHERE email = ?', user_data.email, function (err, rows) {   //authenticate
                                    return done(null, rows);
                                });
                            }
                        });
                    } else {
                        return done(new Error(), rows);
                    }
                }
        });
    }
};

////////////////////////////////////////////////////------logout--------------------------------------------------
exports.removeToken = function(user_id, done){

    db.getPool().query('UPDATE User SET auth_token = null WHERE auth_token=?', [user_id], function(err){
        return done(err)
    })
};


/**
 * get the user id associated with a given token, return null if not found
 */
exports. getIdFromToken = function(token, done){
    //console.log(token);//77628532f307cf6d53f4df1e9eb0a370
    if (token === undefined || token === null ){
        return done(true, null);
    } else {
        db.getPool().query('SELECT user_id FROM User WHERE auth_token=?', [token], function(err, rows){ // find user_id  where token is same
            //console.log(rows);//{ user_id: 1 }
            if (rows.length === 1){
                return done(null, rows[0].user_id);
            }
            else{
                return done(err, null);}
            }

        )
    }
};

////////////////////////////////////////////////////////////////////1
exports. getIdFromToken1 = function(adminid, done){
   // console.log(venueid);//77628532f307cf6d53f4df1e9eb0a370
    if (adminid === undefined || adminid === null ){
        return done(true, null);
    } else {
        db.getPool().query('SELECT auth_token FROM User WHERE user_id=?', [adminid], function(err, rows){ // find user_id  where token is same
                //console.log(rows);//{ user_id: 1 }
                if (rows.length === 1){
                    return done(null, rows);
                }
                else{
                    return done(err, null);}
            }

        )
    }
};

exports. getIdFromToken2 = function( done){

    db.getPool().query('SELECT auth_token FROM User',  function(err, rows){ // find user_id  where token is same
        // console.log(rows);//{ user_id: 1 }
        return done(rows);
    })
};



//*********************************************************************************************************************************Photo*******************************************

//-------------------------------------------GET/users/:id/photo-------------------------------------------------------
exports.getPhoto=function (userId, done) {
    db.getPool().query('SELECT profile_photo_filename FROM User WHERE user_id = ?', userId, function (err, rows) {
        //console.log(rows);//{ profile_photo_filename: './photos/3.png' }
        if(err) return done(err);
        return done(rows);
        //console.log(rows[0]['profile_photo_filename']);//./photos/5.png
    })

};


//-------------------------------------------PUT/users/:id/photo--------------------------------------------------------

exports.addPhoto = function(file_ext,user_id, done){
    db.getPool().query('UPDATE User SET profile_photo_filename = ? WHERE user_id =?', [file_ext,user_id], function (err, result) {
        if (err) return done(err, null);
        return done(result);

    });
};

exports.updatePhoto = function(file_ext,user_id, done){
    db.getPool().query('UPDATE User SET profile_photo_filename = ? WHERE user_id =?', [file_ext,user_id], function (err, result) {
        if (err) return done(err, null);
        return done(result);

    });
};



//-------------------------------------------DELETE/users/:id/photo-------------------------------------------------------
exports.deletePhoto=function (id, done) {
    //console.log(id);
    //db.getPool().query('SELECT user_id FROM User WHERE user_id = ?', id, function (err, result) {
        //if(id == result[0]['user_id']) {
    db.getPool().query('UPDATE User SET profile_photo_filename = null WHERE user_id = ?',id, function (err, result) {
        if (err) {
            return done(err);
        } else {
            return done(result);
        }
    });
       // }
   // });
};

