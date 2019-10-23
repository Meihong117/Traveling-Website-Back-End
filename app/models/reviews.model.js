const db=require('../../config/db');
const crypto = require("crypto");
const dateFormat = require('dateformat');
//getVenueTokenbyId
exports.getVenueTokenbyId= function(id, done){
    // console.log(id)
    db.getPool().query('SELECT * FROM User INNER JOIN Venue ON Venue.admin_id = User.user_id WHERE Venue.venue_id = ?', [id], function(err,result){
             console.log(result)
            if (err)  console.log(err);
            // console.log("result " + result);
            return done(err, result[0]["auth_token"]);

        }
    )
}

exports.getAllReview= function(id, done){
    // console.log(id)
    db.getPool().query('SELECT * FROM Review WHERE reviewed_venue_id = ?', [id], function(err,result){
            //console.log(result)
            if (err)  console.log(err);
            // console.log("result " + result);
            return done(result);

        }
    )
}



exports.get_all_Review=function (id, done) {
    db.getPool().query('SELECT reviewed_venue_id FROM Review WHERE reviewed_venue_id=?',id, function (err, rows) {
        //console.log(rows);//keyi
        if(err) return done({"ERROR": "Error selecting"});
        return done(rows);
    })
};

//--------------------------------------------------GET/venues/:id/reviews----------------------------------------------
exports.getReview=function (id, done) {
    let sql=`SELECT  User.user_id, User.username,review_body,star_rating,cost_rating,time_posted
             FROM Review JOIN User ON Review.review_id =User.user_id
             WHERE reviewed_venue_id=?
             GROUP BY Review.review_id         
           `;
    db.getPool().query(sql,[id],  function (err, result) {
       // console.log(result);
        if(err) {
            return done({"ERROR": "Error selecting"});
        }
        return done(result);
    })
};
//--------------------------------------------------POST/venues/:id/reviews---------------------------------------------
exports.postReview=function (user_data,id,user_id,  done) {
    let now = new Date();
    let date=dateFormat(now, "yyyy-mm-dd hh:mm:ss");

    let values=[user_data.reviewBody, user_data.starRating, user_data.costRating, id, user_id, date];

    db.getPool().query('INSERT INTO Review (review_body, star_rating, cost_rating, reviewed_venue_id, review_author_id, time_posted) VALUES (?,?,?,?,?,?)', values, function(err, rows){
        //console.log(rows);
        if(err) return done(err);
        return done(rows);
    });

};
/*exports.get_all_token=function ( done) {

    db.getPool().query('select user_id, auth_token from User ', function(err, rows){
        //console.log(rows);
        if(err) return done(err);
        return done(rows);
    });

};
exports.venue_by_id=function (id, done) {

    db.getPool().query('select * from Venue where venue_id=? ',id, function(err, rows){
        //console.log(rows);
        if(err) return done(err);
        return done(rows);
    });

};*/
exports.review_author_id=function (id,  done) {

    db.getPool().query('SELECT reviewed_venue_id, review_author_id FROM Review WHERE reviewed_venue_id=?', id, function(err, rows){
        //console.log(rows);
        if(err) return done(err);
        return done(rows);
    });

};




//--------------------------------------------------GET/users/:id/reviews-----------------------------------------------
exports.getUsersId=function (id, done) {
    let sql=`SELECT  User.user_id, User.username,review_body,star_rating,cost_rating,time_posted,
             Venue.venue_id,Venue.venue_name,category_name,Venue.city,Venue.short_description            
    
             FROM Review JOIN User ON Review.review_id =User.user_id
             LEFT OUTER JOIN Venue ON Review.review_id = Venue.venue_id 
             LEFT OUTER JOIN VenueCategory ON Review.review_id = VenueCategory.category_id
                          
             WHERE review_id=?
             
             GROUP BY Review.review_id         
           `;
    db.getPool().query(sql,[id],  function (err, result) {
        //console.log(result);
        if(err) {
            return done({"ERROR": "Error selecting"});
        }
        return done(result);
    })

};



