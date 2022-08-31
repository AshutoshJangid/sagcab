var express = require("express");
var app = express();
var bodyParser = require('body-parser');
const request = require("request");
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');
const validation = require('./middlewares/validation');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let secret = 'restapisecret';

app.use(function (req, res, next) {
  
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();

});
//create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'sagcab'
});

app.post('/register',validation.validateRegistrationBody(),async (req,res,next) => {
    let emailRes='';
    const errors = validationResult(req);
     if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }

    let {first_name,last_name,username,password,email,mobile,device_id} = req.body;
    
    connection.execute("SELECT * FROM `users` WHERE `email` ='"+email+"'", async function(err, results, fields) {
        if (err) throw err;
        if(results.length>0) {
            return res.status(203).json({
                "errors" : [{
                    "msg" : "Email already exists"
                }]                    
            });
            
        }        
        connection.execute("SELECT * FROM `users` WHERE `username` ='"+username+"'", async function(err, results, fields) {
            if (err) throw err;
            if(results.length>0) {
                return res.status(203).json({
                    "errors" : [{
                        "msg" : "Username already exists"
                    }]                    
                });
                
            }
            connection.execute("SELECT * FROM `users` WHERE `mobile` ='"+mobile+"'", async function(err, results, fields) {
                if (err) throw err;

                if(results.length>0) {
                    return res.status(203).json({
                        "errors" : [{
                            "msg" : "Mobile already exists"
                        }]                    
                    });
                    
                }else{
                    
                    password = await bcrypt.hash(password, 8);    
                                  
                    await connection.execute(
                    'INSERT INTO users (first_name,last_name,username,password,email,mobile,device_id) VALUES("'+first_name+'","'+last_name+'","'+username+'","'+password+'","'+email+'","'+mobile+'","'+device_id+'")',
                    
                    function(err, results) {                 
                        if(err){
                            return res.status(203).json({ 
                                "errors" : [{
                                    "msg": "Something went wrong"   
                                }]
                            });
                        }        
                        return res.status(200).json({
                            "success" : {
                                "msg" : "User registered successfully"
                                
                            }
                        });
                       
                    });     
                }           
            });    
        });
    });   

});


app.post('/login',validation.validateLoginBody(),async (req,res,next) => {

    const errors = validationResult(req);
    //console.log(req.headers);
    if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }

    let {email,password,device_id,latitude,longitude} = req.body
   
    try{
        
        await connection.execute(
        'SELECT * FROM `users` WHERE `email` = ?',
        [email],
          async function(err, results, fields) {
            
            var isUserExists = results[0];
            var dbPassword = "";
            if(isUserExists){
                dbPassword = isUserExists.password;
                console.log(dbPassword);
                dbPassword = dbPassword.replace('/^\$2y(.+)$/i', '$2a$1');
            }        
            console.log(dbPassword);
        
            let isPasswordValid = await bcrypt.compare(password,dbPassword);
            console.log(isPasswordValid); // results contains rows returned by server
            if(!isUserExists || !isPasswordValid){
                return res.status(202).json({
                    "errors" : [{
                        "msg" : "Email/password is wrong"
                    }]
                })
            }

            let token = jwt.sign({ id: isUserExists.id },'restapisecret', { expiresIn: 86400 });
            let deviceIdss = await connection.execute(
            'UPDATE `users` SET `device_id`= ? ,`latitude`= ? ,`longitude`= ? WHERE `id` = ?',
            [device_id,latitude,longitude,isUserExists.id],
              function(err, results, fields) {            
               
              }
            );        

            res.status(200).json({
                "success" : {
                    "msg" : "User login successfully",
                    "token" : token,
                    "user_id":isUserExists.id
                }
            });


      });
       
        /*if(isUserExists.emailConfirm==false){
            return res.status(203).json({
                "errors" : [{
                    "msg" : "Please confirm your email first",
                    emailOtp:isUserExists.emailOtp,
                    email:isUserExists.email
                }]
            })
        }*/

     
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Email or password is wrong"   
                }]
            }
        );
    }
    
});


app.get('/profile',validation.authClientToken,async (req,res,next) => {
    const errors = validationResult(req);   
    let {user_id} = req.query;
    console.log(user_id);

    if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }
    
    try{        
        await connection.execute(
        'SELECT * FROM `users` WHERE `id`= ?',
        [user_id],
          async function(err, results, fields) {
            res.status(200).json({
                "success" : {
                    "msg" : "User profile data",
                    "users" : results
                }
            });
      });             
    
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Something went wrong"   
                }]
            }
        );
    }
    
});

app.post('/profile-update',[validation.authClientToken,validation.validateProfileUpdateBody()],async (req,res,next) => {

    const errors = validationResult(req);
    let {user_id} = req.query;
     if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }

    let {first_name,last_name,username,email,mobile,device_id} = req.body;

    connection.execute("SELECT * FROM `users` WHERE `email` ='"+email+"' and `id` !='"+user_id+"'", async function(err, results, fields) {
        if (err) throw err;
        if(results.length>0) {
            return res.status(203).json({
                "errors" : [{
                    "msg" : "Email already exists"
                }]                    
            });
            
        }
        connection.execute("SELECT * FROM `users` WHERE `username` ='"+username+"' and `id` !='"+user_id+"'", async function(err, results, fields) {

            if (err) throw err;
            if(results.length>0) {
                return res.status(203).json({
                    "errors" : [{
                        "msg" : "Username already exists"
                    }]                    
                });
                
            }
            connection.execute("SELECT * FROM `users` WHERE `mobile` ='"+mobile+"' and `id` !='"+user_id+"'", async function(err, results, fields) {
                if (err) throw err;

                if(results.length>0) {
                    return res.status(203).json({
                        "errors" : [{
                            "msg" : "Mobile already exists"
                        }]                    
                    });
                    
                }else{
                    
                    try{
                        await connection.execute(
                        'UPDATE users SET first_name="'+first_name+'",last_name="'+last_name+'",username="'+username+'",email="'+email+'",mobile="'+mobile+'",device_id="'+device_id+'" WHERE id = ?',
                        [user_id],
                        async function(err, results) {                       
                            if(results){           
                                if(err){
                                    console.log(err);
                                }        
                                return res.status(200).json({
                                    "success" : {
                                        "msg" : "User profile updated successfully"
                                        
                                    }
                                });
                            }else{
                                return res.status(203).json(
                                    { 
                                        "errors" : [{
                                            "msg": "there was a problem to update a user."   
                                        }]
                                    }
                                );
                            }
                        });
                        
                    }catch(error){
                        console.log(error);
                        return res.status(203).json(
                            { 
                                "errors" : [{
                                    "msg": "there was a problem registering a user."   
                                }]
                            }
                        );
                    }     
                }           
            });
        });
    });       

});

app.get('/dashboard',[validation.authClientToken,validation.validateFindCabBody()],async (req,res,next) => {

    const errors = validationResult(req);
    //console.log(req.headers);
    if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }
    
    try{
        
        await connection.execute(
        'SELECT * FROM `users`',
          async function(err, results, fields) {
            res.status(200).json({
                "success" : {
                    "msg" : "success",
                    "users" : results
                }
            });
      });             
    
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Email or password is wrong"   
                }]
            }
        );
    }
    
});

app.post('/findcab',[validation.authClientToken,validation.validateFindCabBody()],async (req,res,next) => {

   const errors = validationResult(req);
    let token = req.headers['x-access-token'];
    var decoded = jwt.verify(token, secret);
    var user_id = decoded.id;
    if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }

    let {latitude,longitude} = req.body;

    let startlat = latitude;
    let startlng = longitude;
    //distance(startlat,startlng,30.68829917907715,76.40950012207031);
    try{
        
        await connection.execute(
        'SELECT *, SQRT(POW(69.1 * (latitude - '+startlat+'), 2) +POW(69.1 * ('+startlng+' - longitude) * COS(latitude / 57.3), 2)) AS distance FROM drivers where latitude IS NOT NULL AND longitude IS NOT NULL  HAVING distance < 500  ORDER BY distance',
            async function(err, results, fields) {
            res.status(200).json({
                "success" : {
                    "msg" : "success",
                    "users" : results
                }
            });
        });             
    
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Email or password is wrong"   
                }]
            }
        );
    }
    
});

app.post('/requestcab',[validation.authClientToken,validation.validateRequestCabBody()],async (req,res,next) => {

   const errors = validationResult(req);
    let token = req.headers['x-access-token'];
    var decoded = jwt.verify(token, secret);
    var user_id = decoded.id;
     if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }

    let {driver_id,ulatitude,ulongitude,dlatitude,dlongitude} = req.body;

    let startlat = ulatitude;
    let startlng = ulongitude;
    let destlat = dlatitude;
    let destlng = dlongitude;
    
    try{
        
        await connection.execute(
        'SELECT * FROM drivers where id='+driver_id,
            async function(err, results, fields) {
            res.status(200).json({
                "success" : {
                    "msg" : "success",
                    "driver" : results
                }
            });
        });             
    
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Invalid driver"   
                }]
            }
        );
    }
    
});

app.post('/bookcab',validation.authClientToken,async (req,res,next) => {

   const errors = validationResult(req);
    let token = req.headers['x-access-token'];
    var decoded = jwt.verify(token, secret);
    var user_id = decoded.id;
     if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }

    let {latitude,longitude} = req.body;
    
    let startlat = latitude;
    let startlng = longitude;
    
    try{
        
        await connection.execute(
        'SELECT *, SQRT(POW(69.1 * (latitude - '+startlat+'), 2) +POW(69.1 * ('+startlng+' - longitude) * COS(latitude / 57.3), 2)) AS distance FROM drivers where latitude IS NOT NULL AND longitude IS NOT NULL  HAVING distance < 500  ORDER BY distance',
            async function(err, results, fields) {
            res.status(200).json({
                "success" : {
                    "msg" : "success",
                    "users" : results
                }
            });
        });             
    
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Email or password is wrong"   
                }]
            }
        );
    }
    
});

////////////START Driver API Code//////////////////////


app.post('/register-driver',validation.validateRegistrationBody(),async (req,res,next) => {
    let emailRes='';
    const errors = validationResult(req);
     if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }

    let {first_name,last_name,username,password,email,mobile,driving_licence,taxi_no,device_id} = req.body;
    
    connection.execute("SELECT * FROM `drivers` WHERE `email` ='"+email+"'", async function(err, results, fields) {
        if (err) throw err;
        if(results.length>0) {
            return res.status(203).json({
                "errors" : [{
                    "msg" : "Email already exists"
                }]                    
            });
            
        }
        connection.execute("SELECT * FROM `drivers` WHERE `username` ='"+username+"'", async function(err, results, fields) {
            if (err) throw err;
            if(results.length>0) {
                return res.status(203).json({
                    "errors" : [{
                        "msg" : "Username already exists"
                    }]                    
                });
                
            }
            connection.execute("SELECT * FROM `drivers` WHERE `mobile` ='"+mobile+"'", async function(err, results, fields) {
                if (err) throw err;

                if(results.length>0) {
                    return res.status(203).json({
                        "errors" : [{
                            "msg" : "Mobile already exists"
                        }]                    
                    });
                    
                }
                connection.execute("SELECT * FROM `drivers` WHERE `taxi_no` ='"+taxi_no+"'", async function(err, results, fields) {
                    if (err) throw err;

                    if(results.length>0) {
                        return res.status(203).json({
                            "errors" : [{
                                "msg" : "Texi number already exists"
                            }]                    
                        });
                        
                         
                    }else{
                    
                        password = await bcrypt.hash(password, 8);    
                                      
                        await connection.execute(
                    'INSERT INTO drivers (first_name,last_name,username,password,email,mobile,device_id,driving_licence,taxi_no) VALUES("'+first_name+'","'+last_name+'","'+username+'","'+password+'","'+email+'","'+mobile+'","'+device_id+'","'+driving_licence+'","'+taxi_no+'")',
                    
                    function(err, results) {                 
                            if(err){
                                return res.status(203).json({ 
                                    "errors" : [{
                                        "msg": "Something went wrong"   
                                    }]
                                });
                            }        
                            return res.status(200).json({
                                "success" : {
                                    "msg" : "User registered successfully"
                                    
                                }
                            });
                           
                        });
                    }     
                });           
            });    
        });
    });
   
});


app.post('/login-driver',validation.validateLoginBody(),async (req,res,next) => {

    const errors = validationResult(req);
    //console.log(req.headers);
    if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }

    let {email,password,device_id,latitude,longitude} = req.body
   
    try{
        
        await connection.execute(
        'SELECT * FROM `drivers` WHERE `email` = ?',
        [email],
          async function(err, results, fields) {
            
            var isUserExists = results[0];
            var dbPassword = "";
            if(isUserExists){
                dbPassword = isUserExists.password;
                console.log(dbPassword);
                dbPassword = dbPassword.replace('/^\$2y(.+)$/i', '$2a$1');
            }        
            console.log(dbPassword);
        
            let isPasswordValid = await bcrypt.compare(password,dbPassword);
            console.log(isPasswordValid); // results contains rows returned by server
            if(!isUserExists || !isPasswordValid){
                return res.status(202).json({
                    "errors" : [{
                        "msg" : "Email/password is wrong"
                    }]
                })
            }

            let token = jwt.sign({ id: isUserExists.id },'restapisecret', { expiresIn: 86400 });
            let deviceIdss = await connection.execute(
            'UPDATE `drivers` SET `device_id`= ?,`latitude`=?,`longitude`=? WHERE `id` = ?',
            [device_id,latitude,longitude,isUserExists.id],
              function(err, results, fields) {            
               
              }
            );        

            res.status(200).json({
                "success" : {
                    "msg" : "User login successfully",
                    "token" : token,
                    "user_id":isUserExists.id
                }
            });

        });    
            
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Email or password is wrong"   
                }]
            }
        );
    }
    
});


app.get('/profile-driver',validation.authClientToken,async (req,res,next) => {
    const errors = validationResult(req);   
    let {user_id} = req.query;
    console.log(user_id);

    if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }
    
    try{        
        await connection.execute(
        'SELECT * FROM `drivers` WHERE `id`= ?',
        [user_id],
          async function(err, results, fields) {
            res.status(200).json({
                "success" : {
                    "msg" : "User profile data",
                    "users" : results
                }
            });
      });             
    
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Something went wrong"   
                }]
            }
        );
    }
    
});

app.post('/profile-update-driver',[validation.authClientToken,validation.validateProfileUpdateBody()],async (req,res,next) => {

    const errors = validationResult(req);
    let {user_id} = req.query;
     if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }

    let {first_name,last_name,username,email,mobile,device_id} = req.body;

    connection.execute("SELECT * FROM `drivers` WHERE `email` ='"+email+"' and `id` !='"+user_id+"'", async function(err, results, fields) {
        if (err) throw err;
        if(results.length>0) {
            return res.status(203).json({
                "errors" : [{
                    "msg" : "Email already exists"
                }]                    
            });
            
        }
        connection.execute("SELECT * FROM `drivers` WHERE `username` ='"+username+"' and `id` !='"+user_id+"'", async function(err, results, fields) {

            if (err) throw err;
            if(results.length>0) {
                return res.status(203).json({
                    "errors" : [{
                        "msg" : "Username already exists"
                    }]                    
                });
                
            }
            connection.execute("SELECT * FROM `drivers` WHERE `mobile` ='"+mobile+"' and `id` !='"+user_id+"'", async function(err, results, fields) {
                if (err) throw err;

                if(results.length>0) {
                    return res.status(203).json({
                        "errors" : [{
                            "msg" : "Mobile already exists"
                        }]                    
                    });
                    
                }else{
                    
                    try{
                        await connection.execute(
                        'UPDATE drivers SET first_name="'+first_name+'",last_name="'+last_name+'",username="'+username+'",email="'+email+'",mobile="'+mobile+'",device_id="'+device_id+'" WHERE id = ?',
                        [user_id],
                        async function(err, results) {                       
                            if(results){           
                                if(err){
                                    console.log(err);
                                }        
                                return res.status(200).json({
                                    "success" : {
                                        "msg" : "User profile updated successfully"
                                        
                                    }
                                });
                            }else{
                                return res.status(203).json(
                                    { 
                                        "errors" : [{
                                            "msg": "there was a problem to update a user."   
                                        }]
                                    }
                                );
                            }
                        });
                        
                    }catch(error){
                        console.log(error);
                        return res.status(203).json(
                            { 
                                "errors" : [{
                                    "msg": "there was a problem registering a user."   
                                }]
                            }
                        );
                    }     
                }           
            });
        });
    });      

});

app.get('/dashboard-driver',validation.authClientToken,async (req,res,next) => {

    const errors = validationResult(req);
    //console.log(req.headers);
    if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }
    
    try{
        
        await connection.execute(
        'SELECT * FROM `drivers`',
          async function(err, results, fields) {
            res.status(200).json({
                "success" : {
                    "msg" : "success",
                    "drivers" : results
                }
            });
      });             
    
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Email or password is wrong"   
                }]
            }
        );
    }
    
});

app.get('/accept-cab',validation.authClientToken,async (req,res,next) => {

    const errors = validationResult(req);
    //console.log(req.headers);
    if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }
    
    try{
        
        await connection.execute(
        'SELECT * FROM `drivers`',
          async function(err, results, fields) {
            res.status(200).json({
                "success" : {
                    "msg" : "success",
                    "drivers" : results
                }
            });
      });             
    
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Email or password is wrong"   
                }]
            }
        );
    }
    
});

app.get('/decliend-cab',validation.authClientToken,async (req,res,next) => {

    const errors = validationResult(req);
    //console.log(req.headers);
    if(!errors.isEmpty()){
        return res.status(201).json({ errors: errors.array() });
    }
    
    try{
        
        await connection.execute(
        'SELECT * FROM `drivers`',
          async function(err, results, fields) {
            res.status(200).json({
                "success" : {
                    "msg" : "success",
                    "drivers" : results
                }
            });
      });             
    
    }catch(error){
        console.log(error);
        return res.status(203).json(
            { 
                "errors" : [{
                    "msg": "Email or password is wrong"   
                }]
            }
        );
    }
    
});

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    console.log(lat1)
    console.log(lon1)
    console.log(lat2)
    console.log(lon2)
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    console.log(dist)
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
        console.log(dist)
    return dist
}


///////////END Driver API Code/////////////////////////

// execute will internally call prepare and query


app.listen("30009",function(){
  console.log("LISTENING ON PORT 30009");
});