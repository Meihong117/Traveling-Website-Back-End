const User=require('../models/users.model');
const validator = require("email-validator");
const fs = require("fs");
const config = require('../../config/config.js');
const path = require('path');
const app_dir = path.dirname(require.main.filename);

//--------------------------------------------------------GET/users/:id-------------------------------------------------
exports.read= function (req,res) {
    let id=parseInt(req.params.userId);  //postman

    User.getId(id,function (result) {     ///from database
        //console.log(result);
        result = result[0];
        if (!result) {  // no user found
            return res.status(404).send('dddddddddddd');
        }
        let token = req.get(config.get('authToken'));

        User.getIdFromToken(token, function(err, rows){  //token id
            //console.log(rows);//3  login id
            //console.log(typeof rows);
            //console.log(id);
            //console.log(typeof id);
            //console.log(result);
           let  user = {};
            if (rows ===id) {   //after got auth
                user={
                    "username": result.username,
                    "email": result.email,
                    "givenName": result.givenName,
                    "familyName": result.familyName
                }
            }else{
                user={
                    "username": result.username,
                    "givenName": result.givenName,
                    "familyName": result.familyName
                }
            }
            res.status(200).json(user);
        })
    })
};

//-------------------------------------------------------POST/users----------------------------------------------------
exports.register= async function (req,res) {
    let values=Object.assign({}, req.body); 
    if(!validator.validate(values['email']) || values['password'].length == 0 || !values['username'] || !values['email']){   //check validate email
        res.status(400).send("ffffff")
    }else{
            User.insert(values, function (err, id) {
               // console.log(err);//Duplicate entry 'superman' for key 'username'
                if(err) {
                    console.log("this is error form insert users" +err);
                    return res.status(400).send("got 400 check whether the username is exisit or not");//check whether the username is already exist or not
                }
                //console.log(id);
                res.status(201).send({"userId": id });
            });
       // })

    }
};
//-------------------------------------------------------PATCH/users/:id------------------------------------------------
exports.modify= function (req,res) {
    let id=req.params.userId;   //postman id
    let values=Object.assign({}, req.body);
    //console.log('new password: ' + values['password']);
    //console.log(values);
    //console.log(id);

    //xian ce shi postman de data dui bu dui
    if(!values['familyName'] || values['familyName'].length === 0 || !isNaN(values['password'])){  //check password whether contain any number
        res.status(400).send("ffffff")
    }else{
        User.getId(id,function (result) {   //get data from database
            //console.log('old password: ' + result[0]['password']);
            if(values['familyName']==result[0]["familyName"] && values['givenName']==result[0]["givenName"] && values['password']==result[0]["password"]){
                return res.status(400).send('dddddddddddddddddddddddddddddddddddd');
            }else{
                let token = req.get(config.get('authToken'));

                User.getIdFromToken(token, function(err, user_id){//console.log(user_id); //login id
                    if(err) return res.status(401).send("gggg");
                    if(user_id!=id) return res.status(403).send("ffff");
                    if(values['familyName']==null) return res.status(400);

                    User.change(values,id, function (result) {
                        res.status(200).send('ok');
                    })
                })
            }
        })
    }
};

//------------------------------------------------------POST/users/login------------------------------------------------
exports.login= function (req,res) {
    let user_data=req.body;

    User.logIn(user_data, function (err,rows) {
        //console.log(rows);
        if(err) {
            res.status(400).send("Invalid username/email/password supplied");

        } else {
            res.status(200).json({"userId": rows[0]['user_id'], "token": rows[0]['auth_token']});
        }
    })
};

//----------------------------------- ------------------POST/users/logout-----------------------------------------------
exports.logout= function (req,res) {
    let token = req.get(config.get('authToken'));

    User.getIdFromToken(token, function(err,user_id) {

        if (err) return res.status(401).send("err");      // when no X-Authorization is given
        if (!user_id) return res.status(401).send("err1"); //when an X-Authorization is given, but doesn't match any user

        User.removeToken(user_id, function (err) {
            if (err) {
                return res.status(401).send("Unauthorized");
            } else {
                return res.status(200).send("OK");
            }
        });
        return null;
    })
};

//*****************************************************-------Photo------***********************************************
//--------------------------------------------------GET/users/:id/photo-------------------------------------------------can pass auto test but cannot pass eng-git test?????????????????????????????????
exports.get_photo= function (req,res) {
    let id=req.params.id;

    User.getPhoto(id,function (result) {                       //get from database
        //console.log(result[0]['profile_photo_filename']);  //if I write this line, cannot pass auto test -------------
        if (result.length==0 || result[0]===undefined) {
            return res.status(404).send('dddddddddddddd');
        }else if(result[0]['profile_photo_filename'] === null){
            return res.status(404).send("vvvvvvvvvvvvvvv")

        } else{
            let file_name = result[0]['profile_photo_filename'];  //8.jpeg
            let type = file_name.split(".");
            let extention = type[1];      //png

            let photo = fs.readFileSync('photos/'+file_name, ); //photos/8.jpeg
            res.header("content-type", "image/" + extention);//image/jpeg
            res.write(photo);
            res.status(200).end();

        }
    })
};

///-------------------------------------------------PUT/users/:id/photo (PGN/JPEG) -------------------------------------can pass eng-git
exports.put_photo= function (req,res) {
    let id=parseInt(req.params.id);    //postman id
    let image=req.body;
    let token = req.get(config.get('authToken'));

    User.getId(id, function (results) {   //get from data
        if (results.length == 0) return res.status(404).send("ddddddddddddddddddddddd");

        User.getIdFromToken(token, function (err, token_id) {  //login id
            if (err) return res.status(401).send("err");
            if (!token_id) return res.status(401).send("err");
            if (token_id !== id) return res.status(403).send('wwwwwwwwwwww');


            let type=req.headers['content-type'].split('/');
            let extension=type[1]; //png

            let photo=id+'.'+extension;
            fs.writeFile('photos/'+photo, image, function (err) {
                if(err) console.log(err);
            });
            if(results[0]['profile_photo_filename']===null){
                User.addPhoto(photo, id, function (result) {
                    return res.status(201).send("201");
                })
            }else{
                User.updatePhoto(photo, id, function (result) {
                    return res.status(200).send("200");
                });
            }
        })//token
    })//getId
};

//--------------------------------------------------DELETE/users/:id/photo----------------------------------------------
exports.delete_photo= function (req,res) {                     //delete database profile_photo_filename
    let id=req.params.id;
    let token = req.get(config.get('authToken'));

    User.getId(id, function (result) {   //get all data from database
        if (result.length==0) return res.status(404).send('aaaaaaaaaaaaaaaaa'); //should return 404 when trying to delete the profile photo for a user that doesn't exist
        if (result[0]['profile_photo_filename']==null) return res.status(404).send('aaaaaaaaaaaaaaaaa');//should return 404 when trying to delete the profile photo for a user that doesn't exist

        User.getIdFromToken(token, function (err, token_id) {
            if(err) return res.status(401).send('dddddd');
            if(!token_id) return res.status(401).send('ggggggggg');
            if (token_id != id) return res.status(403).send('fffffffff');

            User.deletePhoto(token_id, function (result) {

                return res.status(200).send("OK")

            })
        })
    })
};
