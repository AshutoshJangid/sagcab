const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const multer  = require('multer');
const upload = multer();


const {sendOrderCompleteMail}=require('./sendmail.js');

const config = require('./env_config/config');
const userModel = require('../models/user');
const driverModel = require('../models/driver');
const ordersModel = require('../models/orders');
const PushNotificationsModel = require('../models/pushNotifications');
const deviceIdsModel = require('../models/deviceIds');
const walletModel = require('../models/wallet');
const transactionsModel = require('../models/transactions');
const ar = require("lodash");
const randomstring = require("randomstring");
var FCM = require('fcm-node');
var userFCM = new FCM(config.userServerKey);
    var driverFCM = new FCM(config.driverServerKey);
module.exports = function () {
    let server = express(),
        create,
        start;

    create = (config, db) => {
        let routes = require('../routes');
        // set all the server things
        server.set('env', config.env);
        server.set('port', config.port);
        server.set('hostname', config.hostname);
        server.use(function (req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-token');
            res.setHeader('Access-Control-Allow-Credentials', true);
            next();
            });
        // add middleware to parse the json
        //server.use(bodyParser.json());
        server.use(expressValidator());
        server.use(bodyParser.urlencoded({
            extended: false
        }));
        server.use(bodyParser.json({
            extended: false
        }));
        //server.use(upload.array()); 
        server.use(express.static('./public'));
        //connect the database
        mongoose.connect(
            db.database,
            { 
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false,
                useUnifiedTopology: true
            }
        );

        // Set up routes
        routes.init(server);
    };

    
    start = () => {
        let hostname = server.get('hostname'),
            port = server.get('port');

        const myserver=server.listen(port, function () {
            console.log('Express server listening on - http://' + hostname + ':' + port);
        });


            const io = require('socket.io')(myserver, {
              cors: {
                origin: '*',
              }
            });


            io.on('connection', function (socket) {
                console.log("Connected succesfully to the socket ...");
                
                socket.on('isRide', async (data)=> {
                    //data={'user_id':'1','user_type':'user'or'driver'};
                    let user;
                    if(data.user_type!='user'){
                        user= await driverModel.findById(data.user_id).limit(1);
                    }else{
                        user= await userModel.findById(data.user_id).limit(1);
                    }
                    if(user.onRide==true){
                        let myorder = await ordersModel.findById(user.currentOrderID).populate('tankId',['image','price','name','liter']).populate('userId',['firstName','lastName','email','profilePic','mobile'])
                                            .populate('driverId')
                                            .sort([['createdAt', 'desc']]);
                                            
                        io.emit('currentRide_'+data.user_id, {'order':myorder});                
                    }
                });


                socket.on('send_driver_location', async (data)=> {
                    //data={'user_id':'1','lat':'34.324','long':'23.213','user_name':'babulal','driver_id':'3'};
                     let myorder = await ordersModel.findById(data._id)
                                            .populate('tankId',['image','price','name','liter'])
                                            .populate('userId',['firstName','lastName','email','profilePic','mobile'])
                                            .populate('driverId')
                                            .sort([['createdAt', 'desc']]);
                   // console.log('socket data');
                    //console.log({...data,'order':myorder});
                    io.emit('get_driver_location_'+data.user_id, {...data,'order':myorder});
                });
                
                socket.on('find_driver', async (data) =>{
                    //data={'user_id':'1','order_id':'1','count':'0'};
                    console.log('socket find_driver data');
                    //console.log(data.count);
                    let order = await ordersModel.findById(data.order_id).populate('tankId',['image','price','name','liter'])
    .populate('userId',['firstName','lastName','email','profilePic','mobile'])
    .sort([['createdAt', 'desc']]);
                    //console.log(order);
                    if(!order){
                        //console.log("error order not found");
                        io.emit('errorDriverFound_'+data.user_id, {"type":'error',"msg":"No order id found",data})
                    }else if(order.userId._id!=data.user_id){
                        //console.log("error order userid or emit user id not match");
                        io.emit('errorDriverFound_'+data.user_id, {"type":'error',"msg":"Order user id found",data})
                    }else{
                        
                    
                        let findvl = {
                            status:true,
                            onlineStatus:true,
                            location: {
                                $near: {
                                 $maxDistance: 1000000,
                                 $geometry: {
                                  type: "Point",
                                  coordinates: [order.lat,order.long]
                                 }
                                }
                            }
                        }
                        var driverData = await driverModel.find(findvl).skip(5-data.count).limit(1);
                        //console.log(driverData._id);
                    
                        //console.log(driverData.length);
                        if(!driverData||driverData.length<1){
                            console.log("error No driver found near you");
                            io.emit('errorDriverFound_'+data.user_id, {"type":'error',"msg":"No driver found near you",data})
                        }else{
                            let deviceIds = await deviceIdsModel.findOne({userId:driverData[0]._id}).select('deviceId');
                                
                                //console.log('deviceIds',deviceIds);
                                if(deviceIds){
                              
                                    var message = { 
                                        registration_ids: [deviceIds.deviceId],                
                                        
                                        data: {
                                            notiType:"NewOrderFound",
                                            typeId:order._id,
                                            order:{...order._doc,'driver_id':driverData[0]._id},
                                            sound:'default',
                                            badge:'1'   
                                        },
                                        "priority": "high"
                                    
                                        
                                    };
                                    
                                    driverFCM.send(message, function(err, response){
                                        if (err) {
                                            console.log("Something has gone wrong!"+err);
                                        } else {
                                            console.log("Successfully sent with response: ", response);
                                        }
                                    });
                                }
                        io.emit('newOrder_'+driverData[0]._id, {...order._doc,'driver_id':driverData[0]._id})
                        
                        console.log('newOrder_'+driverData[0]._id,{...order._doc,'driver_id':driverData[0]._id}); 
                        }
                        //io.emit('get_driver_location_'+data.user_id, data);
                    }
                });

                socket.on('newOrderAccept', async (data) =>{
                    
                        //console.log('data',data);
                        data=(data.data==undefined)?data:data.data;
                        console.log('newOrderAccept',data);
                    let mdriverId= await ordersModel.findById(data._id).select('driverId').sort([['createdAt', 'desc']]);
                    if(mdriverId && (mdriverId.driverId==''|| mdriverId.driverId==null||mdriverId.driverId==undefined)){
                        ordersModel.findByIdAndUpdate(data._id,{
                            driverId:data.driver_id,
                            status:"accept"
                        }).then(async ()=>{
                            await driverModel.findByIdAndUpdate(data.driver_id,{
                                onRide:true,currentOrderID:data._id
                            });
                            
                            await userModel.findByIdAndUpdate(data.userId._id,{
                                onRide:true,currentOrderID:data._id
                            });
                            
                         var userAmount = await walletModel.findOne({userId:data.userId._id}).select('amount');
                            
                        //console.log('userAmount',userAmount);
                       const serviceCharge=1000;
                            let amount = parseInt(userAmount.amount)-parseInt(data.price+serviceCharge);
                            let updt = await walletModel.findOneAndUpdate({userId:data.userId._id},{
                                amount : amount
                            });
                              //console.log('amount',amount);
                              let transactionId = randomstring.generate({
                                length: 20,
                                charset: 'alphanumeric'
                              });
                            let transactionsdata = await transactionsModel.create({
                                userId : data.userId._id,
                                userType : "user",
                                transactionType: "debit",
                                activityType: "newOrder",
                                paymentType : "paytm",
                                amount : parseInt(data.price+serviceCharge),
                                transactionId:transactionId,
                                status:"completed"
                                   });
                        //console.log('transactionsdata',transactionsdata);
                                let createnoti = await PushNotificationsModel.create({
                                    userId:data.driver_id,
                                    typeId : data._id,
                                    type : "newOrder",
                                    text : "New Order"
                                });
                                let myorder = await ordersModel.findById(data._id)
                                            .populate('tankId',['image','price','name','liter'])
                                            .populate('userId',['firstName','lastName','email','profilePic','mobile'])
                                            .populate('driverId')
                                            .sort([['createdAt', 'desc']]);
                                io.emit('driverFound_'+myorder.userId._id, {"order":myorder});
                                   
                                //console.log('driverFound_',myorder.userId._id); 
                                /* var deviceId = await deviceIdsModel.findOne({userId:myorder.userId._id}).select('deviceId');
                                */
                              let deviceId = await deviceIdsModel.findOne({userId:myorder.userId._id}).select('deviceId');
                                if(deviceId){
                                    
                                    var notification = {title:"Order accept",body:"you order has been accepted"}
                                    var datas = {notiType:"acceptOrder",order:myorder,typeId:myorder._id,sound : 'default',badge:'1'  }
                                    
                                    var message = {
                                    registration_ids: [deviceId.deviceId],
                                    //registration_ids: ["cmpemmQwPU0:APA91bGHWHvIN-0FZ_YBkSh-kLm_8uIALxKzTswtoDukTSPR4jvkUN4MQJHaVBuRU0JjwcgDGvuSCH1WUC4cvPIWBmYZnIWbw76hyCkoirfCJoM9K1tTz0E5gmW_FdVFeCeNRfcfVWPT"],
                                    notification:notification,
                                    data:datas
                                    }
                                    
                                    userFCM.send(message, function(err, response){
                                        if (err) {
                                          //console.log("Something has gone wrong!"+err);
                                        } else {
                                          //console.log("Successfully sent with response: ", response);
                                        }
                                    });
                                }
                              let deviceIds = await deviceIdsModel.findOne({userId:myorder.driverId._id}).select('deviceId');
                                
                                //console.log('deviceIds',deviceIds);
                                if(deviceIds){
                              
                                    var message = { 
                                        registration_ids: [deviceIds.deviceId],                
                                        notification:{
                                            title: 'New order', 
                                            body: 'New order has been placed'},
                                        data: {
                                            notiType:"NewOrder",
                                            typeId:myorder._id,
                                            order:myorder,
                                            sound:'default',
                                            badge:'1'   
                                        }                                    
                                        
                                    };
                                    
                                    driverFCM.send(message, function(err, response){
                                        if (err) {
                                           // console.log("Something has gone wrong!"+err);
                                        } else {
                                            //console.log("Successfully sent with response: ", response);
                                        }
                                    });
                                }
                                
                                            //console.log("Successfully sent with response: ", data);
                        }).catch(function(err){
                            //console.log("Something has gone wrong!====>"+err);
                        })
                    }else{
                       // console.log('mdriverId',mdriverId);
                        io.emit('errorNewOrderAccept_'+data.driver_id, {"type":'error',"msg":"another user accept"});
                    }
                });
                 socket.on('orderComplete', async (data) =>{
                     //data={'driver_id':'1','order_id':'1'};
                     //console.log('orderComplete',data);
                     let order = await ordersModel.findById(data.order_id);
                     if(order&&order.driverId==data.driver_id){
                         ordersModel.findByIdAndUpdate(data.order_id,{
                        status:"completed"
                    }).then(async ()=>{
                        
                            let myorder = await ordersModel.findById(order._id)
                                        .populate('tankId',['image','price','name','liter'])
                                        .populate('userId',['firstName','lastName','email','profilePic','mobile'])
                                        .populate('driverId')
                                        .sort([['createdAt', 'desc']]);
                            await driverModel.findByIdAndUpdate(myorder.driverId._id,{
                                    onRide:false,currentOrderID:null
                            });
                            await userModel.findByIdAndUpdate(myorder.userId._id,{
                                    onRide:false,currentOrderID:null
                            });
                               
                            await sendOrderCompleteMail(myorder);         
                            let createnoti = await PushNotificationsModel.create({
                                userId:myorder.userId._id,
                                typeId : myorder._id,
                                type : "newOrderComplete",
                                text : "New Order Completed"
                            });
                            //console.log('orderComplete_',myorder);
                            io.emit('orderComplete_'+myorder.userId._id, {"order":myorder});
                             
                          let deviceId = await deviceIdsModel.findOne({userId:myorder.userId._id}).select('deviceId');
                            if(deviceId){
                                
                                var notification = {title:"Order Complete",body:"you order has been completed"}
                                var data = {notiType:"orderComplete",order:myorder,typeId:myorder._id,sound : 'default',badge:'1'  }
                                
                                var message = {
                                registration_ids: [deviceId.deviceId],
                                //registration_ids: ["cmpemmQwPU0:APA91bGHWHvIN-0FZ_YBkSh-kLm_8uIALxKzTswtoDukTSPR4jvkUN4MQJHaVBuRU0JjwcgDGvuSCH1WUC4cvPIWBmYZnIWbw76hyCkoirfCJoM9K1tTz0E5gmW_FdVFeCeNRfcfVWPT"],
                                notification:notification,
                                data:data
                                }
                                
                                userFCM.send(message, function(err, response){
                                    if (err) {
                                     // console.log("Something has gone wrong!"+err);
                                    } else {
                                      //console.log("Successfully sent with response: ", response);
                                    }
                                });
                            }
                          let deviceIds = await deviceIdsModel.findOne({userId:myorder.driverId._id}).select('deviceId');
                            
                                // console.log('deviceIds',deviceIds);
                            if(deviceIds){
                          
                                var message = { 
                                    registration_ids: [deviceIds.deviceId],                
                                    notification:{
                                        title: 'New order complete', 
                                        body: 'New order has been completed'},
                                    data: {
                                        notiType:"NewOrderComplete",
                                        typeId:myorder._id,
                                        order:myorder,
                                        sound:'default',
                                        badge:'1'   
                                    }
                                
                                    
                                };
                                
                                driverFCM.send(message, function(err, response){
                                    if (err) {
                                        //console.log("Something has gone wrong!"+err);
                                    } else {
                                        //console.log("Successfully sent with response: ", response);
                                    }
                                });
                            }
                            }).catch(function(err){
                        
                            })
                     }
                 });

            });

    };
    return {
        create: create,
        start: start
    };
};