const db=require('../../config/db');
const dateFormat = require('dateformat');
//------------------------------------------------------GET/venues------------------------------------------------------need to add photo and distance
exports.get_all_venues=function (value, done) {
    //console.log(value)
    let sql=`SELECT Venue.venue_id AS venueId, 
    venue_name AS venueName,  
    category_id AS categoryId, 
    city AS city,
    short_description AS shortDescription, 
    latitude , 
    longitude , 
    AVG(star_rating) AS meanStarRating, 
    MAX(cost_rating) AS modeCostRating,             
                      photo_filename AS primaryPhoto
                                                                                              
    FROM Venue LEFT JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id and is_primary = 1
    LEFT OUTER JOIN Review ON Venue.venue_id = Review.reviewed_venue_id

    GROUP BY Venue.venue_id order by meanStarRating DESC`;
    db.getPool().query(sql, value,  function (err, rows) {
       // console.log(rows);
        if(err) return done({"ERROR": "Error selecting"});
        return done(rows);
    })
};
exports.customize_query=function(sql, done){
    db.getPool().query(sql, function (err,result) {
        if(err) console.log(err);
        return done(result);
    })
};

//------------------------------------------------------POST/venues-----------------------------------------------------
exports.post_venue=function (user_data,user_id, done) {
    let now = new Date();
    let date=dateFormat(now, "yyyy-mm-dd");
    //console.log(date);

    let values_data=[user_data.venueName, user_data.categoryId, user_data.city, user_data.shortDescription,user_data.longDescription,user_data.address, user_data.latitude,user_data.longitude, user_id, date];
    db.getPool().query('INSERT INTO Venue (venue_name, category_id, city, short_description, long_description, address,latitude,longitude, admin_id, date_added) VALUES (?,?,?,?,?,?,?,?,?,?)', values_data, function(err, result){
        if(err) return done(err);
        return done(err, result.insertId)
    });
};

//------------------------------------------------------GET/venues:id --------------------------------------------------isPrimary have to false not 0
exports.get_venue_id=function (venue_id, done) {
    let values = [venue_id];
    let sql=`SELECT 
    Venue.venue_name AS venueName, null AS admin,null AS category,
                User.user_id, 
                User.username, 
    VenueCategory.category_id,
    VenueCategory.category_name,
    VenueCategory.category_description,
             Venue.city,
             Venue.short_description AS shortDescription,
             Venue.long_description AS longDescription,
             Venue.date_added AS dateAdded,
             Venue.address, 
             Venue.latitude,
             Venue.longitude,   null AS photos
         
             FROM Venue JOIN User ON Venue.admin_id = User.user_id             
             LEFT OUTER JOIN VenueCategory ON Venue.category_id = VenueCategory.category_id
                        
             WHERE venue_id=?                  
           `;
    let sql2=`SELECT photo_filename,photo_description,is_primary FROM VenuePhoto WHERE venue_id=?`;

    db.getPool().query(sql,values,  function (err, result) {
        if(err) return done({"ERROR": "Error selecting"});
        return done(result);
    })
};
//--get all VenuePhoto
exports.get_all_VenuePhoto=function (id, done) {
    db.getPool().query('SELECT * FROM VenuePhoto WHERE venue_id=?',id, function (err, rows) {
        //console.log(rows);//keyi
        if(err) return done({"ERROR": "Error selecting"});
        return done(rows);
    })
};

//------------------------------------------------------PATCH/venues/:id -----------------------------------------------
exports.patch_venues=function (value,uid,user_id, done) {
    let values=[value.venueName, value.categoryId,value.city,value.shortDescription,value.longDescription,value.address,value.latitude,value.longitude,user_id];
    db.getPool().query('UPDATE Venue SET venue_name=?,category_id=?,city=?,short_description=?,long_description=?,address=?,latitude=?,longitude=? WHERE venue_id=?', values, function (err, rows) {
        if(err) return done(err);
        return done(rows);
    })
};

//get all venue with id
exports.get_all_Venue=function (uid, done) {
    db.getPool().query('SELECT * FROM Venue WHERE venue_id=?',uid, function (err, rows) {
        //console.log(rows);//keyi
        if(err) return done({"ERROR": "Error selecting"});
        return done(rows);
    })
};

//------------------------------------------------------GET/categories--------------------------------------------------
exports.get_all_categories=function (done) {
    db.getPool().query('SELECT category_id AS categoryId,  category_name AS categoryName, category_description AS categoryDescription FROM VenueCategory', function (err, rows) {
        if(err) return done({"ERROR": "Error selecting"});
        return done(rows);
    })
};

//****************************************************--Photos------****************************************************
//-------------------------------------------------------------------POST/venues/:id/photo------------------------------
exports.postphoto=function (dd,description,make_primary,user_id, done) {
        let data= [ dd,description, make_primary, user_id];
        //console.log(data)
        db.getPool().query('INSERT INTO VenuePhoto (photo_filename,photo_description,is_primary, venue_id) VALUES (?,?,?,?) ', data, function (err, rows) {
        if(err) return done(err);
        return done(rows);
    })
};
exports.get_All_VenuePhotos=function (done) {
    db.getPool().query('SELECT * FROM VenuePhoto', function (err, rows) {
        //console.log(rows);//keyi
        if(err) return done({"ERROR": "Error selecting"});
        return done(rows);
    })
};
exports.set_primary=function (done) {
    db.getPool().query('UPDATE VenuePhoto SET is_primary=0', function (err, rows) {
        //console.log(rows);//keyi
        if(err) return done({"ERROR": "Error selecting"});
        return done(rows);
    })
};
exports.is_primary = function(){
    db.getPool().query("UPDATE VenuePhoto SET is_primary = 1",function (err) {
        if(err) console.log(err);
    })
};

//-------------------------------------------------------------------get/venues/:id/photos/:photoFilename
exports.getPhotoFilename=function (id,done) {
    db.getPool().query('SELECT * FROM VenuePhoto WHERE venue_id=?', id, function (err, rows) {
        //console.log(rows);
        if(err) return done(err);
        return done(rows);
    })
};

//-------------------------------------------------------------------DELETE/venues/:id/photos/:photoFilename------------
exports.deletePhotoFilename=function (filename,done) {
    db.getPool().query('DELETE FROM VenuePhoto WHERE photo_filename = ?',filename, function (err, result) {
        if (err) {
            return done(err);
        } else {
            return done(result);
        }
    });
};

exports.getVenueTokenbyId= function(id, done){
   // console.log(id)
    db.getPool().query('SELECT * FROM Venue INNER JOIN User ON user_id = admin_id  WHERE venue_id = ?', [id], function(err,result){
        // console.log(result)
        if (err)  console.log(err);
        // console.log("result " + result);
        return done(result);

        }
    )
};







