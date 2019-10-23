
//123
const Review=require('../models/reviews.model');
const validator = require("email-validator");
const config = require('../../config/config.js');
const users = require('../models/users.model');

//---------------------------------------------------------GET/venues/:id/reviews---------------------------------------
exports.get_review= function (req,res) {
    let id=req.params.id;

    Review.getReview(id,function (result) {
        if(!result){
            return res.status(404).send("Not Found");
        }else{
            let rows=result[0];
            let user_data={
                "reviewAuthor":{
                    "userId": rows['user_id'],
                    "username": rows["username"]
                },
                "reviewBody": rows['review_body'],
                "starRating": rows['star_rating'],
                "costRating": rows['cost_rating'],
                "timePosted": rows['time_posted'],
            };
            return res.status(200).send(user_data);
        }
    })
};

//---------------------------------------------------------POST/venues/:id/reviews--------------------------------------
exports.post_review= function (req,res) {
    let id=req.params.id;                  //postman body: id=reviewed_venue_id
    let user_data=Object.assign({}, req.body);
    let token = req.get(config.get('authToken'));

    if(user_data['starRating'] ===' ' || user_data['starRating'] > 5 || user_data['starRating'] < 0 || user_data['costRating'] < 0
        || user_data['starRating']!==parseInt(user_data['starRating']) || user_data['costRating']!==parseInt(user_data['costRating'])) {
        return res.status(400).send("sssss");

    }
    users.getIdFromToken(token, function(err,user_id){    //user_id= login_id(User=>user_id)=>(review=>review_author_id)
        if (err) return res.status(401).send("err");      // when no X-Authorization is given
        if(!user_id) return res.status(401).send("err1"); //when an X-Authorization is given, but doesn't match any user

        Review.postReview(user_data,id,user_id, function (result) {
            Review.review_author_id(id, function (result) {

                    for(let i of result){
                        console.log(i);
                        if( i['review_author_id']===user_id){
                            return res.status(403).send("sssss")
                        }
                        if(user_id==id) {
                            return res.status(403).send('ddddddddddddddddddddddddddddd');
                        }
                        else{
                            return res.status(201).send("created");
                        }
                    }
            })
        });
    });
};

//---------------------------------------------------------GET/users/:id/reviews----------------------------------------photo
exports.get_users_reviews= function (req,res) {
    let id=req.params.id;

    Review.getUsersId(id,function (result) {
        if(!result){
            return res.status(404).send("Not Found");
        }else{
            let rows=result[0];
            let user_data={
                "reviewAuthor":{
                    "userId": rows['user_id'],
                    "username": rows["username"]
                },
                "reviewBody": rows['review_body'],
                "starRating": rows['star_rating'],
                "costRating": rows['cost_rating'],
                "timePosted": rows['time_posted'],
                "venue":{
                    "venueId": rows['venue_id'],
                    "venueName": rows['venue_name'],
                    "categoryName": rows['category_name'],
                    "city": rows['city'],
                    "shortDescription": rows['short_description'],
                    "primaryPhoto": rows['is_primary']
                }
            };
            return res.status(200).send(user_data);
        }
    })
};
//