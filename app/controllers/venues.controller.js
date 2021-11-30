const User=require('../models/venues.model'),
    users=require('../models/users.model'),
    config = require('../../config/config.js'),
    fs=require("fs"),
    distance=require('euclidean-distance');
const multer=require('multer');
const path = require("path");

const load = multer.diskStorage({
    destination: './venuePhotos/',
    filename:function(req,file,done){
        done(null, Date.now() + path.extname(file.originalname));
    }
});
const save = multer({
    storage:load,
}).single('photo');


//--------------------------------------------------------1. GET/venues-------------------------------------------------
exports.get_venues= function (req,res) {
    let count = req.query["count"];
    let startIndex = req.query["startIndex"];
    let categoryId = req.query["categoryId"];
    let maxCostRating = req.query["maxCostRating"];
    let adminId = req.query["adminId"];
    let q = req.query["q"];
    let minStarRating = req.query["minStarRating"];
    let sortBy = req.query["sortBy"];
    let reverseSort = req.query["reverseSort"];
    let myLatitude = req.query["myLatitude"];
    let myLongitude = req.query["myLongitude"];
    let city = req.query["city"];

    let startIndex_insert;
    let count_insert;
    let categoryId_insert;
    let rating_insert;
    let adminId_insert;
    let q_insert;
    let reverseSort_insert;
    let city_insert;
    let sortBy_insert;
    let keys=req.query;

    let values = [count, startIndex, categoryId, maxCostRating, adminId, q, minStarRating, sortBy, reverseSort, myLatitude, myLongitude];
    //console.log(values)

    if(Object.keys(keys).length>0){
        if (sortBy === undefined || sortBy.length < 1) {               //sortBy
            sortBy_insert = "order by meanStarRating";
        } else if (sortBy === "modeCostRating") {
            sortBy_insert = "order by modeCostRating"
        }
        if (startIndex === undefined || startIndex.length < 1) {       //startIndex
            startIndex_insert = '';
        } else {
            startIndex_insert = "OFFSET "+startIndex+'';
        }
        if (count === undefined) {                                     //count
            count_insert = "LIMIT 99999"
        } else {
            count_insert = "LIMIT " +count+'';
        }
        if (categoryId === undefined || categoryId.length < 1) {       //categoryId
            categoryId_insert = '';
        } else {
            categoryId_insert = 'and category_id =' +categoryId+'';
        }
        if (adminId === undefined || adminId.length < 1) {            //adminId
            adminId_insert = '';
        } else {
            adminId_insert = "and admin_id=" +adminId+'';
        }
        if (q === undefined || q.length < 1) {                        //q
            q_insert = '';
        } else {
            q_insert = "and venue_name like \"%"+q+"%\"";
        }
        if (reverseSort === undefined || reverseSort.length < 1) {     //reverseSort
            reverseSort_insert = "DESC"
        } else if (reverseSort === 'true') {
            reverseSort_insert = 'ASC'
        } else {
            reverseSort_insert = ""
        }
        if (city === undefined || city.length < 1) {                   //city
            city_insert = ""
        } else {
            categoryId_insert = "and city = \""+city+"\"";
        }
        if (maxCostRating === undefined || maxCostRating.length < 1) {      //maxCostRating
            if (minStarRating === undefined || minStarRating.length < 1) {   //minStarRating
                rating_insert = '';
                let sql = "SELECT Venue.venue_id AS venueId, venue_name AS venueName, category_id AS categoryId, city AS city, short_description AS shortDescription, latitude AS latitude,longitude AS longitude, AVG(Review.star_rating) AS meanStarRating, MAX(Review.cost_rating) AS modeCostRating,photo_filename AS primaryPhoto FROM Venue LEFT OUTER JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id and is_primary = 1 LEFT JOIN Review ON Venue.venue_id = Review.reviewed_venue_id WHERE Venue.venue_id>0  " + categoryId_insert + " " + adminId_insert + " " + q_insert + "GROUP BY Venue.venue_id  " + rating_insert + " " + sortBy_insert + "  " + reverseSort_insert + "  " + count_insert + "  " + startIndex_insert + "";

                User.customize_query(sql, function (result) {
                    //console.log(result);
                    return res.status(200).json(result);
                });
            } else if (minStarRating < 1 || minStarRating > 5) {
                return res.status(400).send("dddd")
            } else {
                rating_insert = "having meanStarRating >= "+minStarRating+"";
                let sql = "SELECT Venue.venue_id AS venueId, venue_name AS venueName, category_id AS categoryId, city AS city, short_description AS shortDescription, latitude AS latitude,longitude AS longitude, AVG(Review.star_rating) AS meanStarRating, MAX(Review.cost_rating) AS modeCostRating,photo_filename AS primaryPhoto FROM Venue LEFT OUTER JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id and is_primary = 1 LEFT JOIN Review ON Venue.venue_id = Review.reviewed_venue_id WHERE Venue.venue_id>0  " + categoryId_insert + " " + adminId_insert + " " + q_insert + "GROUP BY Venue.venue_id  " + rating_insert + " " + sortBy_insert + "  " + reverseSort_insert + "  " + count_insert + "  " + startIndex_insert + "";
                User.customize_query(sql, function (result) {
                    return res.status(200).json(result);
                });
            }
        } else if (maxCostRating < 0 || maxCostRating > 4) {
                    return  res.status(400).send("dddddddd");
        } else {
            if (minStarRating == undefined || minStarRating.length < 1) {
                rating_insert = "having modeCostRating <= "+maxCostRating+"";
                let sql = "SELECT Venue.venue_id AS venueId, venue_name AS venueName, category_id AS categoryId, city AS city, short_description AS shortDescription, latitude AS latitude,longitude AS longitude, AVG(Review.star_rating) AS meanStarRating, MAX(Review.cost_rating) AS modeCostRating,photo_filename AS primaryPhoto FROM Venue LEFT OUTER JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id and is_primary = 1 LEFT JOIN Review ON Venue.venue_id = Review.reviewed_venue_id WHERE Venue.venue_id>0  " + categoryId_insert + " " + adminId_insert + " " + q_insert + "GROUP BY Venue.venue_id  " + rating_insert + " " + sortBy_insert + "  " + reverseSort_insert + "  " + count_insert + "  " + startIndex_insert + "";
                User.customize_query(sql, function (result) {
                    return res.status(200).json(result);
                });
            } else if (minStarRating < 1 || minStarRating > 5) {
                return res.status(400).send("ddd");
            } else {
                rating_insert = "having meanStarRating >="+minStarRating+" and modeCostRating <= "+maxCostRating+"";

                let sql = "SELECT Venue.venue_id AS venueId, venue_name AS venueName, category_id AS categoryId, city AS city, short_description AS shortDescription, latitude AS latitude,longitude AS longitude, AVG(Review.star_rating) AS meanStarRating, MAX(Review.cost_rating) AS modeCostRating,photo_filename AS primaryPhoto FROM Venue LEFT OUTER JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id and is_primary = 1 LEFT JOIN Review ON Venue.venue_id = Review.reviewed_venue_id WHERE Venue.venue_id>0  " + categoryId_insert + " " + adminId_insert + " " + q_insert + "GROUP BY Venue.venue_id  " + rating_insert + " " + sortBy_insert + "  " + reverseSort_insert + "  " + count_insert + "  " + startIndex_insert + "";

                User.customize_query(sql, function (result) {
                    return res.status(200).json(result);
                });
            }
        }
    }else{
        User.get_all_venues(values, function (result) {
            // console.log(result)
           for(let i of result){
               
               i['modeCostRating']=parseInt(i["modeCostRating"]);
               i['meanStarRating']=Number(i["meanStarRating"]);
           }
            res.status(200).json(result);
        })
    }
};

//-------------------------------------------------------3. POST/venues-------------------------------------------------just can work at 4122
exports.post_venues=  function (req,res) {
    let user_data=Object.assign({}, req.body);
    let token = req.get(config.get('authToken'));
    //console.log(user_data['categoryId']);

    if(!user_data['city'] || user_data['latitude'] >90 || user_data['longitude']<-180 ) return res.status(400).send('ddddddddddddddddddddd');

    users.getIdFromToken(token, function(err, user_id){
        if (err) return res.status(401).send("err");      // when no X-Authorization is given
        if (!user_id) return res.status(401).send("you need to log in"); //when x-auth

        User.post_venue(user_data, user_id, function(err, id){
            if (err){
                return res.status(400).send("Bad Request2"); // duplicate record
            }
            return res.status(201).json({venueId:id});
        });
    });
};

//-------------------------------------------------------4. GET/venues/:id----------------------------------------------need to print multiple photo
exports.get_venues_id= function (req,res) {
    let venue_id=parseInt(req.params.id);

    User.get_all_VenuePhoto(venue_id, function (rows) {
       // console.log(rows);
    //if(rows.length==0 || rows===undefined) return res.status(404).send("ggggggg");
        User.get_venue_id(venue_id, function (result) {
            if(result.length==0 || result===undefined)return res.status(404).send("ggggggg");
            for(let i of result){
                let userId=i["user_id"];
                let userName=i["username"];
                let categoryId=i["category_id"];
                let categoryName=i["category_name"];
                let categoryDescription=i["category_description"];

                i["admin"]={
                    "userId":userId,
                    "username":userName
                };
                i["category"]={
                    "categoryId": categoryId,
                    "categoryName": categoryName,
                    "categoryDescription": categoryDescription
                };
                delete i["user_id"];
                delete i["username"];
                delete i["category_id"];
                delete i["category_name"];
                delete i["category_description"];

                if(rows.length>1) {
                    i["photos"] = [];
                    for (let j of rows) {
                        let ip;
                        let photoName=j["photo_filename"];
                        let photoDescription=j["photo_description"];
                        ip = j["is_primary"] === 1;
                        let data = {
                            "photoFilename": photoName,
                            "photoDescription": photoDescription,
                            "isPrimary": ip
                        };
                        i["photos"].push(data);
                    }
                }else{
                    i["photos"]=[];
                    for(let j of rows){
                        let photoName=j["photo_filename"];
                        let photoDescription=j["photo_description"];

                        let data={
                            "photoFilename":photoName,
                            "photoDescription":photoDescription,
                            "isPrimary":true
                        };
                        i["photos"].push(data);
                    }
                }
            }
            res.status(200).json(result[0]);
        })
    })
};

//------------------------------------------------------5. PATCH/venues/:id---------------------------------------------why cannot pass 400 auto test
exports.patch_venues_id= function (req,res) {
    let uid=req.params.id;
    let values=req.body;
    let token = req.get(config.get('authToken'));

    User.get_all_Venue(uid,function (result) {

        if(result.length==0)return res.status(404).send('no database found');

        if(values['venueName']===undefined
            && values['categoryId']===undefined
            && values['city']===undefined
            && values['shortDescription']===undefined
            && values['longDescription']===undefined
            && values['address']===undefined
            && values['latitude']===undefined
            && values['longitude']===undefined
        ){

            return res.status(400).send('the same data');

        }

        users.getIdFromToken(token, function(err, user_id) {
            if (err) return res.status(401).send("err");      // when no X-Authorization is given
            if (!user_id) return res.status(401).send("log in"); //when x-auth
            if(user_id!=uid) return res.status(403).send("Forbidden");

            User.patch_venues(values,uid, user_id,function (results) {

             if(values['venueName']!==result[0]['venue_name']
                 || values['categoryId']!==result[0]['category_id']
                 || values['city']!==result[0]['city']
                 || values['shortDescription']!==result[0]['short_description']
                 || values['longDescription']!==result[0]['long_description']
                 || values['address']!==result[0]['address']
                 || values['latitude']!==result[0]['latitude']
                 || values['longitude']!==result[0]['longitude']) {

                    return res.status(200).send("ok");
                }
            })
        })
    })
};

//------------------------------------------------------6. GET/categories-----------------------------------------------
exports.get_categories= function (req,res) {
    User.get_all_categories(function (result) {
        res.status(200).json(result);
    })
};

//**********************************************************************************************************************
//------------------------------------------------------------------POST/venues/:id/photos-----------------------------cannot pass 400 dont need to write the photo in
exports.post_photo= function (req,res)  {

    save(req, res,function (err) {
        if(err) console.log(err);
        let venueid = req.params.id;// venue id
        let description = req.body.description;
        let make_primary = req.body.makePrimary;
        let uri = req.file.filename;
        let token = req.get("X-Authorization");

        if (make_primary === "false" || make_primary === "true") {
            if (description == undefined) {
                return res.sendStatus(400);
            } else {
                    User.getVenueTokenbyId(venueid, function (result) {
                        if (result[0] == undefined) {                            //no database match
                            return res.status(404).send("vvvvvvvvvvvvvvvvvv");
                        }
                        if (token == undefined ) {                        //
                            return res.status(401).send("wwwwwwwwwww");
                        }else if(result[0]["auth_token"] !== token){
                            users.getIdFromToken2(function (rows) {
                                let chk;
                                for (let i of rows) {
                                    console.log(i['auth_token']); //all token from database
                                    if (i['auth_token'] === token) {
                                        chk = i["auth_token"];
                                        break;
                                    }
                                }
                                if (chk === token) {
                                    return res.status(403).send("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
                                } else {
                                    return res.status(401).send("f");
                                }
                            })
                        } else if (result[0]["auth_token"] == token ) {
                            if (make_primary === "false") {
                                User.get_All_VenuePhotos(function (result) {
                                    //console.log(result);
                                    if (result[0] === undefined) {
                                        User.postphoto(uri, description, make_primary, venueid,function (result) {
                                            res.sendStatus(201);
                                        });
                                    } else {
                                        User.is_primary();
                                        User.postphoto(uri, description, make_primary, venueid, function (result) {
                                            res.sendStatus(201);
                                        });
                                    }
                                })
                            } else {
                                User.postphoto(uri, description, make_primary, venueid, function (result) {
                                    res.sendStatus(201);
                                })
                            }
                        }

                    })
            }
        }else{
            res.status(400).send("33333");
        }
    });
};

//------------------------------------------------------------------get/venues/:id/photos/:photoFilename----------------
exports.get_photo_filename= function (req,res) {
    let id=req.params.id;   //1
    let filename=req.params.photoFilename;  //Ylk2WTTl1rHCp3SxKbEGcSLSQuqwNvkO.jpeg

    User.getPhotoFilename(id,function (result) {
        //console.log(result)
        if(result[0] === undefined){
            res.status(404).send("ccccc");
        }else{
            let chk = false;
            for (let i of result){
                if (i["photo_filename"] === filename){
                    chk = true;
                }
            }
            let imagetype = filename.split(".");
            let geshi = imagetype[1];
            if (geshi === "jpg"){
                geshi = "jpeg";
            }
            let img = fs.readFileSync('./venuePhotos/'+filename);
            res.setHeader('Content-Type','image/' + geshi);
            res.status(200).send(img);
        }
    })
};

//------------------------------------------------------------------DELETE/venues/:id/photos/:photoFilename-------------
exports.delete_photo_filename= function (req,res) {
    let id=req.params.id;
    let filename=req.params.photoFilename;
    let token = req.get(config.get('authToken'));
    let if_exist = false;//check_exist
    let if_primary = false;

    User.getVenueTokenbyId(id, function (result1) {

        if (result1[0] === undefined) {
            res.status(404).send("11121111");

        } else if (token == undefined) {
            res.sendStatus(401);

        } else if (result1[0]["auth_token"] !== token) {

            res.status(403).send("ffff");

        } else if (result1[0]["auth_token"] == token) {

            User.get_all_VenuePhoto(id,function(rows){

                for (let i of rows) {
                    if (i["photo_filename"] === filename) {
                        if_exist = true;
                        if (i["is_primary"] === 1) {
                            if_primary = true;
                        }
                    }
                }
                if(if_exist){
                    if (if_primary) {
                        User.deletePhotoFilename(filename, function (result4) {
                            User.get_all_VenuePhoto(id,function(rows){
                                //console.log(rows)
                               // console.log(rows[0][0]["is_primary"]);
                                rows[0]["is_primary"]=1;

                                res.status(200).send("ok1");
                            })

                        })
                    } else {
                        User.deletePhotoFilename(filename, function (result6) {
                            res.status(200).send("ok2");
                        })
                    }

                    }else{
                    res.status(404).send("ss")
                }
            })
        }
    })
};











