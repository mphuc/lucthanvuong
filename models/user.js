'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const DEFAULT_USER_PICTURE = "/static/img/user.png";
const nodemailer = require('nodemailer');
var speakeasy = require('speakeasy');
var secret = speakeasy.generateSecret({length: 20});
var authyId = secret.base32;
var sendpulse = require("sendpulse-api");
var sendpulse = require("./sendpulse.js");

var API_USER_ID= "dca1a45bc032fbcb8713853a6b4bc30f"
var API_SECRET= "73e23238199ca94b49b24034a6744727"
var TOKEN_STORAGE="/tmp/"

sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);


const UserSchema = new Schema({
	email: { type: String, unique: true, lowercase: true },
	displayName: String,
	password: { type: String }, /*select false significa que cuando se haga una peticion de el model user no nos traiga password en el json*/
	password_not_hash : { type: String },
    signupDate: { type: Date, default: Date.now() },
	lastLogin: Date,
	picture:  { type: String, default:  DEFAULT_USER_PICTURE},
    active_email : { type: Number, default: 0},
    token_email : { type: String, default: ""},
    personal_info: {
        type: {
            firstname: { type: String, default: ""},
            lastname: { type: String, default: ""},
            birthday: { type: String, default: ""},
            gender: { type: String, default: ""},
            telephone: { type: String, default: ""},
            address: { type: String, default: ""},
            city: { type: String, default: ""},
            country: { type: String, default: ""}
        }
    },

    address: {
        type: {
            addressline1: { type: String, default: ""},
            addressline2: { type: String, default: ""},
            city: { type: String, default: ""},
            state: { type: String, default: ""},
            postcode: { type: String, default: ""},
            country: { type: String, default: ""}
        }
    },
    security: {
        type: {
            login_history: [],
            ip_whitelist: [],
            two_factor_auth: { 
                type: {
                    status: { type: String, default: "0"},
                    code: { type: String, default: authyId}
                }
            }
        }
    },
    balance: {
        type: {
            bitcoin_wallet: {
                type: {
                    history: {
                        type: {
                            date: { type: Date, default: Date.now() },
                            type: { type: String, default: ""},
                            amount: { type: String, default: ""},
                            detail: { type: String, default: ""}
                        }
                    },
                    currency: { type: String , default: ""},
                    image: { type: String, default: 'coin.png' },
                    available: { type: String , default: '0'},
                    pending: { type: String , default: '0'},
                    cryptoaddress: { type: String , default: ""}
                }
            },
            coin_wallet: {
                type: {
                    history: {
                        type: {
                            date: { type: Date, default: Date.now() },
                            type: { type: String, default: ""},
                            amount: { type: String, default: ""},
                            detail: { type: String, default: ""}
                        }
                    },
                    currency: { type: String , default: ""},
                    image: { type: String, default: 'coin.png' },
                    available: { type: String , default: '0'},
                    pending: { type: String , default: '0'},
                    cryptoaddress: { type: String , default: ""},
                    last: { type: String , default: ""},
                    bid: { type: String , default: ""},
                    ask: { type: String , default: ""},
                    high: { type: String , default: ""},
                    volume: { type: String , default: ""}
                }
            },
            lending_wallet: {
                type: {
                    history: {
                        type: {
                            date: { type: Date, default: Date.now() },
                            type: { type: String, default: ""},
                            amount: { type: String, default: ""},
                            detail: { type: String, default: ""}
                        }
                    },
                    currency: { type: String , default: ""},
                    image: { type: String, default: 'coin.png' },
                    available: { type: String , default: '0'},
                    pending: { type: String , default: '0'},
                    cryptoaddress: { type: String , default: ""}
                }
            }
        }
    },
    withdraw: [],
    total_invest: { type: String, default: '0'},
    active_invest: { type: String, default: '0'},
    total_earn: { type: String, default: '0'},
    p_node: { type: String, default: '0'},
    status: { type: String, default: '0'},
    level: { type: Number, default: 0},
    txid_last: { type: String, default: ""}
});


// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

UserSchema
  .path('displayName')
  .validate(function(email) {
    return email.length;
  }, 'Fullname cannot be blank');
// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    return password.length;
  }, 'Password cannot be blank');

UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

UserSchema
  .path('displayName')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({displayName: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified username is already in use.');

UserSchema.post('save', function (doc) {
    sendmail(doc)
});

//send email sing up

UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
	let user = this
    return bcrypt.compareSync(password, user.password);
};


const sendmail = function (user){
    let token_ = "https://lencoin.co/verify-account?token="+user.token_email + "_" + user._id+"";
    
    var content = '<!DOCTYPE html> <html> <head> <title></title> </head> <body style="background: #c1bdba;"> <div class="content" style="background: linear-gradient(135deg, rgba(26, 89, 108, 0.52), rgba(34, 125, 140, 0.93), rgba(45, 205, 253, 0.39)); padding: 40px; max-width: 600px; margin: 40px auto; border-radius: 4px; box-shadow: 0 4px 10px 4px rgba(19, 35, 47, 0.3); "> <div style="text-align: center;"> <img style="margin: 0 auto; width: 150px" src="https://lencoin.co/images/logo.png"> </div> <div style="text-align: left; margin-top: 40px; color: #fff">';
    content += '<p style="color:#fff">Dear <b style="color:#fff">'+user.displayName+'</b>,';
    content += '<p style="color:#fff">Thank you for registering on the <a style="color:#fff" href="https://lencoin.co/" target="_blank">Lencoin</a>.</p>';
    content += '<p style="color:#fff">Username : '+user.displayName+'</p>';
    content += '<p style="color:#fff">Email : '+user.email+'</p>';
    content += '<p style="color:#fff">Password : '+user.password_not_hash+'</p>';
    content += '<p style="color:#fff">Click the Verify Account to activate your account</p>';
    content += '<p style="text-align: center;margin-top:15px;"><a href="'+token_+'" style="border: 2px solid #fff; border-radius: 30px; display: inline-block; padding: 10px 30px; word-spacing: 3px; font-size: 15px; color: #fff; text-decoration: none;" href="">Click to Verify Account</a></p>';
    content += '</div> </div> </body> </html>';
    var email = {
        "html" : content,
        "text" : "Lencoin",
        "subject" : "Please verify your email address",
        "from" : {
            "name" : "lencoin.co",
            "email" : 'no-reply@lencoin.co'
        },
        "to" : [
            {
                "name" : "lencoin.co",
                "email" : user.email
            }
        ]
    };
    
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
            to: user.email, 
            subject: 'Please verify your email address', 
            text: 'Please verify your email address', 
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
    /*var answerGetter = function answerGetter(data){
        console.log(data);
    }
    sendpulse.smtpSendMail(answerGetter,email);*/
}

var User = mongoose.model('User', UserSchema);
module.exports = User;