import { createRequire } from "module";
const require = createRequire(import.meta.url);

import * as dotenv from "dotenv";
dotenv.config();

import {OpenAI} from "openai";

const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const crypto = require('crypto');
const Iyzipay = require('iyzipay');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const fs = require('fs');
import path from 'path';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


import { redirectHTML } from "./middlewareConfig.js";
import { getEndingDate } from "./subscriptionEndingDate.js";
import { getTodayStartTime } from "./startTime.js";
import { getRandom6DigitNumber } from "./randomSixDigitNumber.js";

const app = express();
redirectHTML(app);
app.use(express.static(path.join(process.cwd())));

const mysql = require('mysql2');

const dbPassword = process.env.DB_PASSWORD;

// Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});
// Mailgun

const myWebsiteUrl = 'https://hukukasistani.com';
const myWebsiteUrlCallback = 'https://hukukasistani.com/callback';
const myWebsiteUrlProfile = 'https://hukukasistani.com/profile';

(function (){
    const connection = mysql.createConnection({
        host: 'yapayzekahukuk.c1uamu4wez4l.eu-central-1.rds.amazonaws.com',
        user: 'root',
        password: dbPassword,
        database: 'hukukasistani',
    });
    
    connection.connect((err) => {
        if (err) {
          console.error('Bağlanırken hata çıktı:', err);
          return;
        }
    });
    
    app.use(bodyParser.json());
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Session'ın yaratılacağı yer
    app.use(session({
        secret: 'null',
        resave: false,
        saveUninitialized: true
    }));

    const rootDir = path.join(process.cwd());

    const iyzipay = new Iyzipay({
        apiKey: process.env.IYZIPAY_API_KEY,
        secretKey: process.env.IYZIPAY_SECRET_KEY,
        uri: 'https://sandbox-api.iyzipay.com'
    });

    let failCounter = 0;

    app.get('/', (req, res) => {
        const userid = req.session.userid;
        if (userid == undefined){
            req.session.destroy; // Destroy the session if user tries to connect the page and not logged in order to keep verification page safe
            const filePath = path.join(rootDir, 'mainpage.html');
            res.sendFile(filePath);
        }
        else{
            const filePath = path.join(rootDir, 'mainpage.html');
            res.sendFile(filePath);
        }
    });

    app.post('/', (req, res) => {
        const userid = req.session.userid;
        if (userid != undefined){
            const isLogedIn = true;
            return res.json({isLogedIn})
        }
        else{
            const fonksiyonelCookies = req.body.cookieCheckboxValue;
            const pazarlamaCookies = req.body.cookieCheckboxValueTwo;
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            if (fonksiyonelCookies !== undefined && pazarlamaCookies !== undefined){
                connection.promise().query('SELECT ip FROM cookie_records WHERE ip = ?', [ip])
                .then(([rows]) => {
                    const rowsLength = rows.length;
                    if(rowsLength > 0){
                        connection.promise().query('UPDATE cookie_records SET fonksiyonel_cookies = ?, pazarlama_cookies = ?', [fonksiyonelCookies, pazarlamaCookies])
                        .then(results => {
                            console.log("Successfully updated cookies.", results);
                        })
                        .catch(error => {
                            console.log("Error while updating cookies:", error);
                        });
                    }
                })
                .catch(error => {
                    console.log("Error while selecting ip adress:", error);
                });

                connection.promise().query('INSERT INTO cookie_records (fonksiyonel_cookies, pazarlama_cookies, ip) VALUES (?, ?, ?)', [fonksiyonelCookies, pazarlamaCookies, ip])
                .then(results => {
                    console.log("cookie_records insertion successfull:", results);
                })
                .catch(error => {
                    console.log("cookie_records error while inserting:", error);
                });
            }
            else{
                connection.promise().query('SELECT ip FROM cookie_records WHERE ip = ?', [ip])
                .then(([rows]) => {
                    const rowsLength = rows.length;
                    if(rowsLength > 0){
                        const ipExists = true;
                        return res.json({ipExists})
                    }
                    else{
                        const ipExists = false;
                        return res.json({ipExists})
                    }
                })
                .catch((error) => {
                    console.log("An error happened while selecting ip from cookie records:", error)
                });
            }
        }
    });

    app.get('/hakkinda', (req, res) => {
        const filePath = path.join(rootDir, 'about.html');
        res.sendFile(filePath);
    });

    app.post('/hakkinda', (req, res) => {
        connection.promise().query("SELECT users.name, users.surname FROM subscriptions INNER JOIN users ON subscriptions.userid = users.id WHERE subscriptions.subscriptionType = '6 Aylık'")
        .then(([sixMonthUsers]) => {
            connection.promise().query("SELECT users.name, users.surname FROM subscriptions INNER JOIN users ON subscriptions.userid = users.id WHERE subscriptions.subscriptionType = '1 Yıllık'")
            .then(([oneYearUsers]) => {
                return res.json({sixMonthUsers, oneYearUsers});
            })
            .catch((error) => {
                console.log(error);
            });
        })
        .catch((error) => {
            console.log(error);
        });
    });

    app.get('/forgotPassword', (req, res) => {
        const filePath = path.join(rootDir, 'forgotPassword.html');
        res.sendFile(filePath);
    });

    let forgotPasswordrequestCounter = 0;
    app.post('/forgotPassword', (req, res) => {
        const email = req.body.email;
        forgotPasswordrequestCounter++;

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const stringIp = ip.toString();

        let today = new Date();
        today = Math.floor(today.getTime() / 1000); // Convert to Unix timestamp

        connection.promise().query('SELECT ip FROM forgot_password_logs WHERE ip = ?', [stringIp])
        .then(([ip]) => {
            const ipLength = ip.length;
            if (ipLength > 0){
                connection.promise().query('SELECT created_at FROM forgot_password_logs WHERE ip = ?', [stringIp])
                .then(([createdAt]) => {
                    const created_at_database_value = createdAt[0].created_at;
                    const checkTenMinute = created_at_database_value+600;

                    if (today > checkTenMinute){
                        connection.promise().query('DELETE FROM forgot_password_logs WHERE ip = ?', [stringIp])
                        .then(results => {                            
                            forgotPasswordrequestCounter = 0;

                            const requestLimitBreached = false;
                            return res.json({requestLimitBreached});
                        })
                        .catch(error => {
                            console.log("Error while deleting forgot_password_logs column:", error);
                        });
                    }
                    else{
                        const requestLimitBreached = true;
                        return res.json({requestLimitBreached});
                    }
                })
                .catch(error => {
                    console.log("Error while selecting ip:", error);
                });
            }
        })
        .catch(error => {
            console.log("Error while selecting created_at:", error);
        });

        if (forgotPasswordrequestCounter > 3){
            connection.promise().query('INSERT INTO forgot_password_logs (ip, created_at) VALUES (?, ?)', [stringIp, today])
            .then(results => {
                console.log("Succes inserting forgot_password_logs:", results);
            })
            .catch(error => {
                console.log("Error inserting forgot_password_logs:", error);
            });

            const requestLimitBreached = true;
            return res.json({requestLimitBreached});
        }
        else{
            connection.promise().query('SELECT ip FROM forgot_password_logs WHERE ip = ?', [stringIp])
            .then(([ip]) => {
                const ipLength = ip.length;
                if (ipLength < 1){
                    connection.promise().query('SELECT password FROM users WHERE mail = ?', [email])
                    .then(([password]) => {
                        const passwordLength = password.length;
                        if (passwordLength > 0){
                            const userPassword = password[0].password;
                            mg.messages.create('mg.hukukasistani.com', {
                                from: "Hukuk Asistani <hukukasistani@info.com>",
                                to: [`${email}`],
                                subject: "Doğrulama Kodu",
                                text: `www.hukukasistani.com şifreniz: ${userPassword}`,
                                html: `www.hukukasistani.com şifreniz: ${userPassword}`
                            })
                            .then(msg => {
                                const emailSended = true;
                                return res.json({emailSended});
                            })
                            .catch(error => {
                                console.log("Mail yollanırken bir hata meydana geldi.", error);
                            });
                        }
                        else{
                            const wrongMail = true;
                            return res.json({wrongMail});
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
                }
                else{
                    const requestLimitBreached = true;
                    return res.json({requestLimitBreached});
                }
            })
        }
    });

    app.get('/gizlilik-ve-cerez', (req, res) => {
        const filePath = path.join(rootDir, 'gizlilikvecerez.html');
        res.sendFile(filePath);
    });

    app.get('/verification', (req, res) => {
        const emailCheck = req.session.emailCheck;
        const phoneCheck = req.session.phoneCheck;
        const userid = req.session.userid;
        // Redirect page to, mainpage if user didnt come here from register page
        if (emailCheck == 'failed' || emailCheck == undefined || phoneCheck == 'failed'|| phoneCheck == undefined){
            if (userid == undefined){
                req.session.destroy; // Destroy the session if user tries to connect the page and not logged in order to keep verification page safe
                res.redirect('/');
            }
            else{
                res.redirect('/');
            }
        }
        else{
            const filePath = path.join(rootDir, 'emailVerification.html');
            res.sendFile(filePath);
        }
    });

    app.post('/verification', (req, res) => {
        const verificationInput = req.body.verificationInput;
        const phoneVerificationInput = req.body.phoneVerificationInput;

        const verificiationCodeFromServer = req.session.verificationCode;
        const phoneVerificationCodeFromServer = req.session.phoneVerificationCode;

        const name = req.session.name;
        const surname = req.session.surname;
        const email = req.session.email;
        const phoneNumber = req.session.phoneNumber;
        const password = req.session.password;
        const dateofbirth = req.session.dateofbirth;
        const gender = req.session.gender;

        connection.promise().query('SELECT COUNT(*) AS count FROM users WHERE mail = ?', [email])
        .then(([rows]) => {
            const emailExists = rows[0].count > 0;

            // Telefon numarasının sorgusu buradan yapılacak
            connection.promise().query('SELECT COUNT(*) AS count FROM users WHERE phoneNumber = ?', [phoneNumber])
            .then(([rowsforPhone]) => {
                const phoneNumberExists = rowsforPhone[0].count > 0;

                // Use emailExists here or continue with your logic
                if (emailExists == false && email != undefined && phoneNumberExists == false && phoneNumberExists != undefined){
                    if ((verificationInput == verificiationCodeFromServer) && (phoneVerificationInput == phoneVerificationCodeFromServer)){
                        connection.promise().query('INSERT INTO users (name, surname, mail, password, dateofbirth, gender, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, surname, email, password, dateofbirth, gender, phoneNumber])
                        .then(results => {
                            const verification = "success";
                            const emailVerification = "success";
                            const phoneVerification = "success";

                            req.session.destroy();
                            return res.json({
                                verification,
                                emailVerification,
                                phoneVerification
                            })
                        })
                        .catch(err => {
                            console.error('Error inserting data:', err);
                            const verification = "failed";

                            req.session.destroy();
                            return res.json({
                                verification
                            })
                            // Handle the error gracefully, you may choose to log it, send a response, etc.
                        });
                    }
                    else{
                        if (verificationInput != verificiationCodeFromServer && phoneVerificationInput != phoneVerificationCodeFromServer){
                            const verification = "failed";
                            const phoneVerification = "failed";
                            const mailVerification = "failed";

                            failCounter++;
                            if (failCounter == 3){
                                req.session.destroy();  
                                return res.json({
                                    failCounter,
                                    verification,
                                    phoneVerification,
                                    mailVerification
                                })
                            }
                            else{
                                return res.json({
                                failCounter,
                                verification,
                                phoneVerification,
                                mailVerification
                                })
                            }
                        }
                        else if (verificationInput != verificiationCodeFromServer){
                            const verification = "failed";
                            const mailVerification = "failed";
                            failCounter++;
                            if (failCounter == 3){
                                req.session.destroy();    
                                return res.json({
                                    failCounter,
                                    verification,
                                    mailVerification
                                })
                            }
                            else{
                                return res.json({
                                failCounter,
                                verification,
                                mailVerification
                                })
                            }
                        }
                        else if (phoneVerificationInput != phoneVerificationCodeFromServer){
                            const verification = "failed";
                            const phoneVerification = "failed";
                            failCounter++;
                            if (failCounter == 3){
                                req.session.destroy();  
                                return res.json({
                                    failCounter,
                                    verification,
                                    phoneVerification
                                })
                            }
                            else{
                                return res.json({
                                failCounter,
                                verification,
                                phoneVerification
                                })
                            }
                        }
                    }
                }

            })
            .catch(error => {
                // Handle errors here
                console.error('Error Happened:', error);
            });
        })
        .catch(error => {
          // Handle errors here
          console.error('Error:', error);
        });
    });
    
    app.get('/register', (req, res) => {
        const userid = req.session.userid;
        if (userid == undefined){
            req.session.destroy; // Destroy the session if user tries to connect the page and not logged in order to keep verification page safe
            const filePath = path.join(rootDir, 'register.html');
            res.sendFile(filePath);
        }
        else{
            res.redirect('/profile');
        }
    });

    app.post('/register', async(req, res) => {
        try {
            const name = req.body.name;
            const surname = req.body.surname;
            const email = req.body.email;
            const phoneNumber = req.body.phoneNumber;
            const password = req.body.password;
            const dateofbirth = req.body.dateofbirth;
            const gender = req.body.gender;

            req.session.name = name;
            req.session.surname = surname;
            req.session.email = email;
            req.session.phoneNumber = phoneNumber;
            req.session.password = password;
            req.session.dateofbirth = dateofbirth;
            req.session.gender = gender;
            
            // Kullanıcı tarafından yazılan E-Mail, veritabanında var mı yok mu kontrol et
            const [rows] = await connection.promise().query('SELECT COUNT(*) AS count FROM users WHERE mail = ?', [email]);
            const emailExists = rows[0].count > 0;

            const [phoneRows] = await connection.promise().query('SELECT COUNT(*) AS count FROM users WHERE phoneNumber = ?', [phoneNumber]);
            const phoneExists = phoneRows[0].count > 0;

            const phoneNumberLength = phoneNumber.length;
            const dateofbirthLength = dateofbirth.length;

            if (emailExists && phoneExists && phoneNumberLength != 10 && dateofbirthLength != 10){
                const emailCheck = "failed";
                const phoneCheck = "failed";
                const phoneNumberLengthCheck = "failed";
                const dateofbirthLengthCheck = "failed";
                req.session.emailCheck = emailCheck;
                req.session.phoneCheck = phoneCheck;
                return res.json({
                    emailCheck,
                    phoneCheck,
                    phoneNumberLengthCheck,
                    dateofbirthLengthCheck
                });
            }
            else if (emailExists && phoneExists && phoneNumberLength != 10){
                const emailCheck = "failed";
                const phoneCheck = "failed";
                const phoneNumberLengthCheck = "failed";
                req.session.emailCheck = emailCheck;
                req.session.phoneCheck = phoneCheck;
                return res.json({
                    emailCheck,
                    phoneCheck,
                    phoneNumberLengthCheck
                });
            }
            else if (emailExists && phoneExists && dateofbirthLength != 10){
                const emailCheck = "failed";
                const phoneCheck = "failed";
                const dateofbirthLengthCheck = "failed";
                req.session.emailCheck = emailCheck;
                req.session.phoneCheck = phoneCheck;
                return res.json({
                    emailCheck,
                    phoneCheck,
                    dateofbirthLengthCheck
                });
            }
            else if (emailExists && phoneNumberLength != 10 && dateofbirthLength != 10){
                const emailCheck = "failed";
                const phoneNumberLengthCheck = "failed";
                const dateofbirthLengthCheck = "failed";
                req.session.emailCheck = emailCheck;
                return res.json({
                    emailCheck,
                    phoneNumberLengthCheck,
                    dateofbirthLengthCheck
                });
            }
            else if (phoneExists && phoneNumberLength != 10 && dateofbirthLength != 10){
                const phoneCheck = "failed";
                const phoneNumberLengthCheck = "failed";
                const dateofbirthLengthCheck = "failed";
                req.session.phoneCheck = phoneCheck;
                return res.json({
                    phoneCheck,
                    phoneNumberLengthCheck,
                    dateofbirthLengthCheck
                });
            }
            else if (emailExists && phoneExists){
                const emailCheck = "failed";
                const phoneCheck = "failed";
                req.session.emailCheck = emailCheck;
                req.session.phoneCheck = phoneCheck;
                return res.json({
                    emailCheck,
                    phoneCheck
                });
            }
            else if (emailExists && phoneNumberLength != 10){
                const emailCheck = "failed";
                const phoneNumberLengthCheck = "failed";
                req.session.emailCheck = emailCheck;
                return res.json({
                    emailCheck,
                    phoneNumberLengthCheck
                });
            }
            else if (emailExists && dateofbirthLength != 10){
                const emailCheck = "failed";
                const dateofbirthLengthCheck = "failed";
                req.session.emailCheck = emailCheck;
                return res.json({
                    emailCheck,
                    dateofbirthLengthCheck
                });
            }
            else if (phoneNumberLength != 10 && dateofbirthLength != 10){
                const phoneNumberLengthCheck = "failed";
                const dateofbirthLengthCheck = "failed";
                return res.json({
                    phoneNumberLengthCheck,
                    dateofbirthLengthCheck
                });
            }
            else if (phoneExists && phoneNumberLength != 10){
                const phoneCheck = "failed";
                const phoneNumberLengthCheck = "failed";
                req.session.phoneCheck = phoneCheck;
                return res.json({
                    phoneCheck,
                    phoneNumberLengthCheck,
                });
            }
            else if (phoneExists && dateofbirthLength != 10){
                const phoneCheck = "failed";
                const dateofbirthLengthCheck = "failed";
                req.session.phoneCheck = phoneCheck;
                return res.json({
                    phoneCheck,
                    dateofbirthLengthCheck
                });
            }
            else if(emailExists){
                const emailCheck = "failed";
                req.session.emailCheck = emailCheck;
                return res.json({
                    emailCheck,
                });
            }
            else if(phoneExists){
                const phoneCheck = "failed";
                req.session.phoneCheck = phoneCheck;
                return res.json({
                    phoneCheck,
                });
            }
            else if(name == ""){
                const emptyNameCheck = "failed";
                return res.json({
                    emptyNameCheck
                })
                // Javascript kodunu değiştirmeye çalışanlara karşı güvenlik korumasıdır.
            }
            else if(surname == ""){
                const emptySurnameCheck = "failed";
                return res.json({
                    emptySurnameCheck
                })
                // Javascript kodunu değiştirmeye çalışanlara karşı güvenlik korumasıdır.
            }
            else if(surname == ""){
                const emptyEmailCheck = "failed";
                return res.json({
                    emptyEmailCheck
                })
                // Javascript kodunu değiştirmeye çalışanlara karşı güvenlik korumasıdır.
            }
            else if(phoneNumber == ""){
                const emptyPhoneNumberCheck = "failed";
                return res.json({
                    emptyPhoneNumberCheck
                })
                // Javascript kodunu değiştirmeye çalışanlara karşı güvenlik korumasıdır.
            }
            else if (phoneNumberLength != 10){
                const phoneNumberLengthCheck = "failed";
                return res.json ({
                    phoneNumberLengthCheck
                })
            } // Telefon numarasını fazla yada eksik girenlere karşı önlem
            else if(password == ""){
                const emptyPasswordCheck = "failed";
                return res.json({
                    emptyPasswordCheck
                })
                // Javascript kodunu değiştirmeye çalışanlara karşı güvenlik korumasıdır.
            }
            else if(dateofbirth == ""){
                const emptyDateofbirthCheck = "failed";
                return res.json({
                    emptyDateofbirthCheck
                })
                // Javascript kodunu değiştirmeye çalışanlara karşı güvenlik korumasıdır.
            }
            else if (dateofbirthLength != 10){
                const dateofbirthLengthCheck = "failed";
                return res.json({
                    dateofbirthLengthCheck
                })
            }
            else if(gender == undefined){
                const emptyGenderCheck = "failed";
                return res.json({
                    emptyGenderCheck
                })
                // Javascript kodunu değiştirmeye çalışanlara karşı güvenlik korumasıdır.
            }
            else{
                const emailCheck = "success";
                const phoneCheck = "success";
                req.session.emailCheck = emailCheck;
                req.session.phoneCheck = phoneCheck;

                // Generate two random 6-digit numbers
                const verificationCode = getRandom6DigitNumber();
                req.session.verificationCode = verificationCode;

                const phoneVerificationCode = getRandom6DigitNumber();
                req.session.phoneVerificationCode = phoneVerificationCode;
                // Rastgele bir sayı oluştur
            
                // E-Mail'e doğrulama kodu yolla
            
                mg.messages.create('mg.hukukasistani.com', {
                	from: "Hukuk Asistani <hukukasistani@info.com>",
                	to: [`${email}`],
                	subject: "Doğrulama Kodu",
                	text: `Hukuk Asistanınızdan size bir kucak dolusu merhaba! Doğrulama kodunuz: ${verificationCode}`,
                	html: `<h1>Hukuk Asistanınızdan size bir kucak dolusu merhaba!</h1> <br> <b>Doğrulama kodunuz: ${verificationCode}</b>`
                })
                .then(msg => {
                    // Telefon'a doğrulama kodu yolla
                    client.messages
                    .create({
                        body: `Hukuk Asistanınızdan size bir kucak dolusu merhaba! Onaylama kodunuz: ${phoneVerificationCode}`,
                        from: '+19376321037',
                        to: `${phoneNumber}`
                    })
                    .then(message => console.log(message.sid));
                    // Telefon'a doğrulama kodu yolla

                    return res.json({
                        emailCheck,
                        phoneCheck
                    })
                }) // logs response data
                .catch(err => console.log(err)); // logs any error
            
                // E-Mail'e doğrulama kodu yolla
            }
        }
        catch (error)
        {
            console.error("Bir hata ile karşılaşıldı: " + error);
        }
    });

    app.get('/login', (req, res) => {
        const userid = req.session.userid;
        if (userid == undefined){
            req.session.destroy; // Destroy the session if user tries to connect the page and not logged in order to keep verification page safe
            const filePath = path.join(rootDir, 'login.html');
            res.sendFile(filePath);
        }
        else{
            res.redirect('/profile');
        }
    });

    app.post('/login', (req, res) => {
            const email = req.body.email;
            const password = req.body.password;
            
            connection.promise().query('SELECT id FROM users WHERE mail = ? AND password = ?', [email, password])
            .then(([result]) => {
                if (result.length == 1) {
                    const authentication = "success";
                    const userid = result[0].id;
                    
                    // Satın alımın veya aboneliğin süresi doldu mu dolmadı mı kontrol et
                    connection.promise().query('SELECT activity FROM subscriptions WHERE userid = ?', [userid])
                    .then(activity => {
                        const activityLength = activity[0].length;
                        if (activityLength > 0){
                            // Abonelik mi yoksa tek seferlik satın alım mı bunu belirle subscriptionEndingDate varsa tek seferlik satın alma, yoksa abonelik
                            connection.promise().query('SELECT subscriptionEndingDate FROM subscriptions WHERE userid = ?', [userid])
                            .then(subscriptionEndingDate => {
                                const endingDate = subscriptionEndingDate[0][0].subscriptionEndingDate;
                                if (endingDate === null){
                                    // Aboneliğin apiden bilgisini al ve üyeliği bitmiş mi kontrol et
                                    connection.promise().query('SELECT subscriptionReferenceCode FROM subscriptions WHERE userid = ?', [userid])
                                    .then(subscriptionReferenceCode => {
                                        subscriptionReferenceCode = subscriptionReferenceCode[0][0].subscriptionReferenceCode;
        
                                        const subscriptionInformations = {
                                            subscriptionReferenceCode: subscriptionReferenceCode
                                        };
                                    
                                        iyzipay.subscription.retrieve(subscriptionInformations, function (err, subResult) {
                                            const activity = subResult.data.subscriptionStatus;
                                            // Eğer apiden gelen abonelik bilgisi aktif değilse veritabanından kullanıcının verilerini sil(yani üyeliğini bitir)
                                            if (activity !== "ACTIVE"){
                                                connection.promise().query('DELETE FROM subscriptions WHERE userid = ?', [userid])
                                                .then(results => {
                                                    console.log('Row deleted successfully:', results);
                                                })
                                                .catch(error => {
                                                    console.log("Error while deleting row:", error);
                                                });
                                            
                                                req.session.userid = userid;
                                                req.session.activity = activity;
                                            
                                                return res.json({
                                                    authentication
                                                });
                                            }
                                            else{
                                                req.session.userid = userid;
                                                req.session.activity = activity;
                                            
                                                return res.json({
                                                    authentication
                                                });
                                            }
                                        });
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                                }
                                else if (endingDate !== null){
                                    // Üyeliğin bitiş tarihini veritabanından al ve bugünle karşılaştır eğer bitiş tarihi geçmise rowu veritabanından sil
                                    
                                    // Current date formatting
                                    const currentDate = new Date();
                                    // Extract year, month, and day
                                    const year = currentDate.getFullYear();
                                    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
                                    const day = String(currentDate.getDate()).padStart(2, '0');
                                    // Combine into desired format (e.g., YYYY-MM-DD)
                                    const formattedCurrentDate = `${year}-${month}-${day}`;
                                    
                                    // Ending date formatting
                                    const year2 = endingDate.getFullYear();
                                    const month2 = String(endingDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
                                    const day2 = String(endingDate.getDate()).padStart(2, '0');

                                    const formattedEndingDate = `${year2}-${month2}-${day2}`;
                                    
                                    if (formattedCurrentDate === formattedEndingDate){
                                        connection.promise().query('DELETE FROM subscriptions WHERE userid = ?', [userid])
                                        .then(results => {
                                            console.log('Row deleted successfully:', results);
                                        })
                                        .catch(error => {
                                            console.log("Error while deleting row:", error);
                                        });
    
                                        req.session.userid = userid;
                                        const activity = "ACTIVE";
                                        req.session.activity = activity;
    
                                        return res.json({
                                            authentication
                                        });
                                    }
                                    else{
                                        req.session.userid = userid;
                                        const activity = "ACTIVE";
                                        req.session.activity = activity;
                                    
                                        return res.json({
                                            authentication
                                        });
                                    }
                                }
                                else{
                                    console.log("Beklenmeyen bir durumla karşılaşıldı.");
                                }
                            })
                            .catch(error => {
                                console.log(error);
                            });
                        }
                        else{
                            req.session.userid = userid;
                            const activity = "NOT";
                            req.session.activity = activity;

                            return res.json({
                                authentication
                            });
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
                }
                else
                {   
                    req.session.destroy;
                    const authentication = "failed";
                    return res.json({
                        authentication
                    });
                }
            })
            .catch(error => {
                console.log("Error while selecting:", error);
            });
    
    })

    app.get('/profile', async(req, res) => {
        const userid = req.session.userid;
        if (userid != undefined){
            const filePath = path.join(rootDir, 'profile.html');
            res.sendFile(filePath);
        }
        else{
            req.session.destroy; // Destroy the session if user tries to connect the page and not logged in order to keep verification page safe
            res.redirect('/login');
        }
    });

    app.post('/profile', async (req, res) => {
        try {
            const userid = req.session.userid;
            
            // Şifre değiştirme
            const changePasswordButtonClick = req.body.changePasswordButtonClick;
            const newPassword = req.body.newPassword;
            if (changePasswordButtonClick === true){
                await connection.promise().query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userid])
                .then(results => {
                    const passwordChangeSucces = true;
                    return res.json({passwordChangeSucces});
                })
                .catch(error => {
                    const passwordChangeSucces = false;
                    return res.json({passwordChangeSucces});
                });
            }
            // Şifre değiştirme
            
            const activity = await connection.promise().query('SELECT activity FROM subscriptions WHERE userid = ?', [userid]);
            // Kullanıcının aboneliği aktifse bunlar yapılacak: (0'dan büyükse aktiftir)
            const activityLength = activity[0].length;
            if (activityLength > 0){
                // fetchHistory foknsiyonuna veritabanından veri gönderme işlemi
                const fetchHistorySuccessCheck = req.body.info;
                if(fetchHistorySuccessCheck === 'success')
                {
                    // Mesajları threadlere göre ve oturum açan kullanıcıya göre ayırmak için gereken işlemler
                    const [rowsFromMessagesTable] = await connection.promise().query('SELECT idoftheactualThread, message FROM messages INNER JOIN threads on messages.threadid = threads.id WHERE userid = ?', [userid]); // oturum açan kullanıcının idoftheactualThread değerlerini seç
                    const rowsByThreadId = {};

                    rowsFromMessagesTable.forEach((row) => {
                        const idoftheactualThread = row.idoftheactualThread;
                        if (!rowsByThreadId[idoftheactualThread]) {
                            rowsByThreadId[idoftheactualThread] = [row];
                        } else {
                            rowsByThreadId[idoftheactualThread].push(row);
                        }
                    });

                    // Mesajları threadlere ve oturum açan kullanıcıya göre ayırmak için gereken işlemler

                    // AI Mesajları threadlere ve oturum açan kullanıcıya göre ayırmak için gereken işlemler

                    const [AIrowsFromMessagesTable] = await connection.promise().query('SELECT idoftheactualThread, aiMessage FROM messages INNER JOIN threads on messages.threadid = threads.id WHERE userid = ?', [userid]); // oturum açan kullanıcının idoftheactualThread değerlerini seç
                    const AIrowsByThreadId = {};

                    AIrowsFromMessagesTable.forEach((row) => {
                        const idoftheactualThread = row.idoftheactualThread;
                        if (!AIrowsByThreadId[idoftheactualThread]) {
                            AIrowsByThreadId[idoftheactualThread] = [row];
                        } else {
                            AIrowsByThreadId[idoftheactualThread].push(row);
                        }
                    });

                    // AI Mesajları threadlere ve oturum açan kullanıcıya göre ayırmak için gereken işlemler

                    const [rows, fields] = await connection.promise().query('SELECT name, surname FROM users WHERE id = ?', [userid]);
                    const {name, surname} = rows[0];

                    // subscriptionEndingDate veya subscriptionStartingDate al ve aboneliğin bitime kaç gün olduğunu hesaplayıp front-end'e gönder
                    const [rowsofSubscriptions] = await connection.promise().query('SELECT subscriptionStartingDate FROM subscriptions WHERE userid = ?', [userid]);
                    const rowsofSubscriptionsData = rowsofSubscriptions[0].subscriptionStartingDate;
                    if (rowsofSubscriptionsData !== null){
                        const startingDate = new Date(rowsofSubscriptions[0].subscriptionStartingDate);
                        const today = new Date();
                        // Create a new Date object for endingDate based on startingDate
                        const endingDate = new Date(startingDate);
                        endingDate.setDate(endingDate.getDate() + 31);
                        // Calculate the difference in days between startingDate and endingDate
                        const differenceInTime = endingDate.getTime() - today.getTime();
                        const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convert milliseconds to days
                        const differenceInDaysString = differenceInDays.toString().split('.')[0];

                        const subscriptionType = "Aylık";
                        const activityCheck = "ACTIVE";

                        // Eğer kullanıcı bir gün içersinde 110'dan fazla request yaparsa kullanıcıyı durdur.
                        const todayStartTime = getTodayStartTime();
                        // Get daily requests
                        const [requestsData] = await connection.promise().query('SELECT user_id, created_at FROM request_log WHERE user_id = ? AND created_at >= ?',[userid, todayStartTime]);

                        let dailyRequests = 0;
                        for (const request of requestsData) {
                            if (request.created_at >= todayStartTime) {
                                dailyRequests++;
                            }
                        }

                        if (dailyRequests >= 50) {
                            // User exceeded daily limit
                            const isRateLimitFull = true;
                            return res.json({
                                rowsByThreadId,
                                AIrowsByThreadId,
                                name,
                                surname,
                                differenceInDaysString,
                                subscriptionType,
                                activityCheck,
                                isRateLimitFull
                            });
                        }
                        else{
                            return res.json({
                                rowsByThreadId,
                                AIrowsByThreadId,
                                name,
                                surname,
                                differenceInDaysString,
                                subscriptionType,
                                activityCheck
                            });
                        }
                    }
                    else{
                        const [rowsofSubscriptions] = await connection.promise().query('SELECT subscriptionEndingDate FROM subscriptions WHERE userid = ?', [userid]);
                        const subscriptionEndingDate = rowsofSubscriptions[0].subscriptionEndingDate;

                        // Get current date
                        const currentDate = new Date();
                        // Calculate the difference in milliseconds between the two dates
                        const differenceMs = subscriptionEndingDate - currentDate;
                        // Convert milliseconds to days
                        const differenceDays = differenceMs / (1000 * 60 * 60 * 24);
                        const differenceInDaysString = differenceDays.toString().split('.')[0];
                        
                        // Abonelik tipini veritabanından alıp front-end'e gönder
                        const [rowsforSubcriptionType] = await connection.promise().query('SELECT subscriptionType FROM subscriptions WHERE userid = ?', [userid]);
                        const subscriptionType = rowsforSubcriptionType[0].subscriptionType;

                        const activityCheck = "ACTIVE";

                        // Eğer kullanıcı bir gün içersinde 110'dan fazla request yaparsa kullanıcıyı durdur.
                        const todayStartTime = getTodayStartTime();
                        // Get daily requests
                        const [requestsData] = await connection.promise().query('SELECT user_id, created_at FROM request_log WHERE user_id = ? AND created_at >= ?',[userid, todayStartTime]);

                        let dailyRequests = 0;
                        for (const request of requestsData) {
                            if (request.created_at >= todayStartTime) {
                                dailyRequests++;
                            }
                        }

                        if (dailyRequests >= 50) {
                            // User exceeded daily limit
                            const isRateLimitFull = true;
                            return res.json({
                                rowsByThreadId,
                                AIrowsByThreadId,
                                name,
                                surname,
                                differenceInDaysString,
                                subscriptionType,
                                activityCheck,
                                isRateLimitFull
                            });
                        }
                        else{
                            return res.json({
                                rowsByThreadId,
                                AIrowsByThreadId,
                                name,
                                surname,
                                differenceInDaysString,
                                subscriptionType,
                                activityCheck
                            });
                        }
                    }
                }
                
                // fetchHistory foknsiyonuna veritabanından veri gönderme işlemi

                // Eğer kullanıcı bir gün içersinde 110'dan fazla request yaparsa kullanıcıyı durdur.

                const todayStartTime = getTodayStartTime();
                const yesterdayStartTime = todayStartTime - 86400; // Yesterday's start time (seconds)
                // Get daily requests
                const [requestsData] = await connection.promise().query('SELECT user_id, created_at FROM request_log WHERE user_id = ? AND created_at >= ?',[userid, todayStartTime]);

                let dailyRequests = 0;
                for (const request of requestsData) {
                    if (request.created_at >= todayStartTime) {
                        dailyRequests++;
                    }
                }

                if (dailyRequests >= 50) {
                    // User exceeded daily limit
                    return res.json({ isRateLimitFull: true });
                }
            
                // Log the request
                await connection.promise().query('INSERT INTO request_log (user_id, created_at) VALUES (?, ?)', [userid, Math.floor(Date.now() / 1000)]);
                // Automaticly delete logs older than 24 hours
                await connection.promise().query('DELETE FROM request_log WHERE created_at < ?', [yesterdayStartTime]);

                // Eğer kullanıcı bir gün içersinde 110'dan fazla request yaparsa kullanıcıyı durdur.

                const [rowsofSubscriptions] = await connection.promise().query('SELECT subscriptionStartingDate FROM subscriptions WHERE userid = ?', [userid]);
                const rowsofSubscriptionsData = rowsofSubscriptions[0].subscriptionStartingDate;
                if (rowsofSubscriptionsData !== null){
                    const buttonClick = req.body.buttonClick;
                    if (buttonClick === true){
                        let [subscriptionReferenceCode] = await connection.promise().query('SELECT subscriptionReferenceCode FROM subscriptions WHERE userid = ?', [userid]);
                        subscriptionReferenceCode = subscriptionReferenceCode[0].subscriptionReferenceCode
                        const cancelSubscription = {
                            subscriptionReferenceCode: subscriptionReferenceCode
                        };
                    
                        iyzipay.subscription.cancel(cancelSubscription, function (err, result) {
                            console.log(err, result);
                        });

                        connection.promise().query('DELETE FROM subscriptions WHERE userid = ?', [userid])
                        .then(results => {
                            console.log('Row deleted successfully:', results);
                        })
                        .catch(error => {
                            console.log("Error while deleting row:", error);
                        });

                        const subscriptionCancelled = true;
                        return res.json({subscriptionCancelled});
                    }
                }

                const inputinside = req.body.inputinside;

                // Eğer kullanıcı girdisi 3000 karakterden fazlaysa saldırı olarak algıla
                if (inputinside.length > 3000){
                    const characterLengthAttack = true;
                    return res.json({characterLengthAttack});
                }

                const assistant = await openai.beta.assistants.retrieve(
                    "asst_CvARenAHTEvt89PmCCoe5pAV"
                );

                let refreshCounter = req.body.refreshCounter;
                
                let threadidofThreadsBeforeUpdate;
                try {
                    const [threadResultsBeforeUpdate] = await connection.promise().query('SELECT threadid FROM threads WHERE userid = ?', [userid]);
                    threadidofThreadsBeforeUpdate = threadResultsBeforeUpdate[threadResultsBeforeUpdate.length - 1].threadid;
                } catch (error) {
                    console.log(error);
                }

                if(refreshCounter == 1){
                    const threadid = await openai.beta.threads.create();

                    if (threadidofThreadsBeforeUpdate == undefined){
                        // Eğer mevcut userid için bir threadid yoksa insert yap
                        connection.promise().query('INSERT INTO threads (threadid, userid) VALUES (?, ?)', [threadid.id, userid])
                        .then(results => {
                            console.log('Data inserted successfully:', results);
                        })
                        .catch(error => {
                            console.log('Error while inserting:', error);
                        });

                        refreshCounter+=1;
                    }
                    else{
                        // Eğer mevcut userid için bir threadid varsa updatele
                        connection.promise().query('UPDATE threads SET threadid = ?, userid = ? WHERE threadid = ?', [threadid.id, userid, threadidofThreadsBeforeUpdate])
                        .then(results => {
                            console.log('Data updated successfully:', results);
                        })
                        .catch(error => {
                            console.log('Error while updating:', error);
                        });

                        refreshCounter+=1;
                    }
                }

                if(refreshCounter > 1){
                    const [threadResults] = await connection.promise().query('SELECT threadid FROM threads WHERE userid = ?', [userid]);

                    async function getLastThreadidValue(){
                        const threadidofThreads = threadResults[threadResults.length - 1].threadid;
                        return threadidofThreads;
                    }
                    const threadidofThreads = await getLastThreadidValue();

                    openai.beta.threads.retrieve(threadidofThreads);
                
                    // Use keepAsking as state for keep asking questions
                    const keepAsking = true;
                    if (keepAsking) {
                    
                        // Pass in the user question into the existing thread
                        await openai.beta.threads.messages.create(threadidofThreads, {
                            role: "user",
                            content: inputinside,
                        });

                        let runid = '';
                        // Use steaming for getting the answer from the openai
                        const run = openai.beta.threads.runs.createAndStream(threadidofThreads, {
                            assistant_id: assistant.id,
                            stream: true
                        })
                        .on('messageDelta', (delta, snapshot) => {
                            runid = snapshot.run_id; // run_id verisini snapshot objesinden çıkart ve runid değişkenine kaydet
                        });
                        await run.finalRun(); //  Streaming işleminin beklenmesi ve sonuçlandırılması için çağırılan fonksiyon

                        // threads table'ı için tüm insertionların yapıldığı yer
                        connection.promise().query('UPDATE threads SET runid = ? WHERE threadid = ?', [runid, threadidofThreads])
                        .then(results => {
                            console.log('Data updated successfully:', results);
                        })
                        .catch(error => {
                            console.log('Error while updating:', error);
                        });
                        // threads table'ı için tüm insertionların yapıldığı yer

                        // En sonuncu id değerini, threads tablosundan al ve kaydet
                        const [threadQuery] = await connection.promise().query('SELECT id FROM threads WHERE userid = ?', [userid]);
                        const idofThread = threadQuery[threadQuery.length - 1].id;
                        // En sonuncu id değerini, threads tablosundan al ve kaydet

                        // Get the last assistant message from the messages array
                        const messages = await openai.beta.threads.messages.list(threadidofThreads);
                    
                        // Find the last message for the current run
                        const lastMessageForRun = messages.data[0];

                        // If an assistant message is found, return it
                        if (lastMessageForRun) {
                            let aiText = lastMessageForRun.content[0].text.value;

                            // messages table'ı için tüm insertionların yapıldığı yer
                            aiText = aiText.replace(/\n/g, "\\n").replace(/\*/g, ""); // Veritabanına aiText yollanırken "\n" işareti mysql'de newline olarak algılanıyor. Bunu "\\n" haline getirip veritabanına yolluyoruz.
                            connection.promise().query('INSERT INTO messages (message, threadid, aiMessage, idoftheactualThread) VALUES (?, ?, ?, ?)', [inputinside, idofThread, aiText, threadidofThreads])
                            .then(results => {
                                console.log('Data inserted successfully:', results);
                            })
                            .catch(error => {
                                console.log('Error while inserting:', error);
                            });
                            // messages table'ı için tüm insertionların yapıldığı yer

                            return res.json({
                                aiText,
                                refreshCounter
                            });
                        }
                        else
                        {
                            console.error("Assistant message coldn't found.");
                        }
                    }

                }
            }
            // Kullanıcının aboneliği aktif değilse bunları yap:
            else {
                let [freeTrialCounter] = await connection.promise().query('SELECT freeTrialCounter FROM users WHERE id = ?', [userid]);
                freeTrialCounter = freeTrialCounter[0].freeTrialCounter;
                if (freeTrialCounter >= 1){
                    // fetchHistory foknsiyonuna veritabanından veri gönderme işlemi
                    const fetchHistorySuccessCheck = req.body.info;
                    if(fetchHistorySuccessCheck === 'success')
                    {
                        // Mesajları threadlere göre ve oturum açan kullanıcıya göre ayırmak için gereken işlemler
                        const [rowsFromMessagesTable] = await connection.promise().query('SELECT idoftheactualThread, message FROM messages INNER JOIN threads on messages.threadid = threads.id WHERE userid = ?', [userid]); // oturum açan kullanıcının idoftheactualThread değerlerini seç
                        const rowsByThreadId = {};
                    
                        rowsFromMessagesTable.forEach((row) => {
                            const idoftheactualThread = row.idoftheactualThread;
                            if (!rowsByThreadId[idoftheactualThread]) {
                                rowsByThreadId[idoftheactualThread] = [row];
                            } else {
                                rowsByThreadId[idoftheactualThread].push(row);
                            }
                        });
                    
                        // Mesajları threadlere ve oturum açan kullanıcıya göre ayırmak için gereken işlemler
                    
                        // AI Mesajları threadlere ve oturum açan kullanıcıya göre ayırmak için gereken işlemler
                    
                        const [AIrowsFromMessagesTable] = await connection.promise().query('SELECT idoftheactualThread, aiMessage FROM messages INNER JOIN threads on messages.threadid = threads.id WHERE userid = ?', [userid]); // oturum açan kullanıcının idoftheactualThread değerlerini seç
                        const AIrowsByThreadId = {};
                    
                        AIrowsFromMessagesTable.forEach((row) => {
                            const idoftheactualThread = row.idoftheactualThread;
                            if (!AIrowsByThreadId[idoftheactualThread]) {
                                AIrowsByThreadId[idoftheactualThread] = [row];
                            } else {
                                AIrowsByThreadId[idoftheactualThread].push(row);
                            }
                        });
                    
                        // AI Mesajları threadlere ve oturum açan kullanıcıya göre ayırmak için gereken işlemler

                        const freeTrialEnded = true; // Bedava kullanım hakkı bittiyse buradan front-end'e bilgi gidecek.
                        
                        const [rows, fields] = await connection.promise().query('SELECT name, surname FROM users WHERE id = ?', [userid]);
                        const {name, surname} = rows[0];

                        return res.json({
                            rowsByThreadId,
                            AIrowsByThreadId,
                            freeTrialEnded,
                            name,
                            surname
                        });
                    }
                
                    // fetchHistory foknsiyonuna veritabanından veri gönderme işlemi
                }
                else if (freeTrialCounter === 0){
                    // fetchHistory foknsiyonuna veritabanından veri gönderme işlemi
                    const fetchHistorySuccessCheck = req.body.info;
                    if(fetchHistorySuccessCheck === 'success')
                    {
                        // Mesajları threadlere göre ve oturum açan kullanıcıya göre ayırmak için gereken işlemler
                        const [rowsFromMessagesTable] = await connection.promise().query('SELECT idoftheactualThread, message FROM messages INNER JOIN threads on messages.threadid = threads.id WHERE userid = ?', [userid]); // oturum açan kullanıcının idoftheactualThread değerlerini seç
                        const rowsByThreadId = {};
                    
                        rowsFromMessagesTable.forEach((row) => {
                            const idoftheactualThread = row.idoftheactualThread;
                            if (!rowsByThreadId[idoftheactualThread]) {
                                rowsByThreadId[idoftheactualThread] = [row];
                            } else {
                                rowsByThreadId[idoftheactualThread].push(row);
                            }
                        });
                    
                        // Mesajları threadlere ve oturum açan kullanıcıya göre ayırmak için gereken işlemler
                    
                        // AI Mesajları threadlere ve oturum açan kullanıcıya göre ayırmak için gereken işlemler
                    
                        const [AIrowsFromMessagesTable] = await connection.promise().query('SELECT idoftheactualThread, aiMessage FROM messages INNER JOIN threads on messages.threadid = threads.id WHERE userid = ?', [userid]); // oturum açan kullanıcının idoftheactualThread değerlerini seç
                        const AIrowsByThreadId = {};
                    
                        AIrowsFromMessagesTable.forEach((row) => {
                            const idoftheactualThread = row.idoftheactualThread;
                            if (!AIrowsByThreadId[idoftheactualThread]) {
                                AIrowsByThreadId[idoftheactualThread] = [row];
                            } else {
                                AIrowsByThreadId[idoftheactualThread].push(row);
                            }
                        });
                    
                        // AI Mesajları threadlere ve oturum açan kullanıcıya göre ayırmak için gereken işlemler
                        
                        const [rows, fields] = await connection.promise().query('SELECT name, surname FROM users WHERE id = ?', [userid]);
                        const {name, surname} = rows[0];

                        return res.json({
                            rowsByThreadId,
                            AIrowsByThreadId,
                            name,
                            surname
                        });
                    }
                
                    // fetchHistory foknsiyonuna veritabanından veri gönderme işlemi
                    
                    const inputinside = req.body.inputinside;
                    
                    if (inputinside.length > 3000){
                        const characterLengthAttack = true;
                        return res.json({characterLengthAttack});
                    }

                    if (inputinside == undefined || inputinside == null || inputinside == '' || inputinside == '  ' || inputinside == '   '){
                        console.log("Pass");
                    }
                    else{
                        freeTrialCounter++;
                        connection.promise().query('UPDATE users SET freeTrialCounter = ? WHERE id = ?', [freeTrialCounter, userid])
                        .then(results => {
                            console.log('freeTrialCounter data updated successfully:', results);
                        })
                        .catch(error => {
                            console.log('Error while updating:', error);
                        });

                        const assistant = await openai.beta.assistants.retrieve(
                            "asst_CvARenAHTEvt89PmCCoe5pAV"
                        );
                        
                        let refreshCounter = req.body.refreshCounter;
                        
                        let threadidofThreadsBeforeUpdate;
                        try {
                            const [threadResultsBeforeUpdate] = await connection.promise().query('SELECT threadid FROM threads WHERE userid = ?', [userid]);
                            threadidofThreadsBeforeUpdate = threadResultsBeforeUpdate[threadResultsBeforeUpdate.length - 1].threadid;
                        } catch (error) {
                            console.log(error);
                        }
                        
                        if(refreshCounter == 1){
                            const threadid = await openai.beta.threads.create();
                        
                            if (threadidofThreadsBeforeUpdate == undefined){
                                // Eğer mevcut userid için bir threadid yoksa insert yap
                                connection.promise().query('INSERT INTO threads (threadid, userid) VALUES (?, ?)', [threadid.id, userid])
                                .then(results => {
                                    console.log('Data inserted successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while inserting:', error);
                                });
                            
                                refreshCounter+=1;
                            }
                            else{
                                // Eğer mevcut userid için bir threadid varsa updatele
                                connection.promise().query('UPDATE threads SET threadid = ?, userid = ? WHERE threadid = ?', [threadid.id, userid, threadidofThreadsBeforeUpdate])
                                .then(results => {
                                    console.log('Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating:', error);
                                });
                            
                                refreshCounter+=1;
                            }
                        }
                    
                        if(refreshCounter > 1){
                            const [threadResults] = await connection.promise().query('SELECT threadid FROM threads WHERE userid = ?', [userid]);
                        
                            async function getLastThreadidValue(){
                                const threadidofThreads = threadResults[threadResults.length - 1].threadid;
                                return threadidofThreads;
                            }
                            const threadidofThreads = await getLastThreadidValue();
                        
                            openai.beta.threads.retrieve(threadidofThreads);
                        
                            // Use keepAsking as state for keep asking questions
                            let keepAsking = true;
                            if (keepAsking) {
                            
                                // Pass in the user question into the existing thread
                                await openai.beta.threads.messages.create(threadidofThreads, {
                                    role: "user",
                                    content: inputinside,
                                });
                            
                                let runid = '';
                                // Use steaming for getting the answer from the openai
                                const run = openai.beta.threads.runs.createAndStream(threadidofThreads, {
                                    assistant_id: assistant.id,
                                    stream: true
                                })
                                .on('messageDelta', (delta, snapshot) => {
                                    runid = snapshot.run_id; // run_id verisini snapshot objesinden çıkart ve runid değişkenine kaydet
                                });
                                await run.finalRun(); //  Streaming işleminin beklenmesi ve sonuçlandırılması için çağırılan fonksiyon
                            
                                // threads table'ı için tüm insertionların yapıldığı yer
                                connection.promise().query('UPDATE threads SET runid = ? WHERE threadid = ?', [runid, threadidofThreads])
                                .then(results => {
                                    console.log('Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating:', error);
                                });
                                // threads table'ı için tüm insertionların yapıldığı yer
                            
                                // En sonuncu id değerini, threads tablosundan al ve kaydet
                                const [threadQuery] = await connection.promise().query('SELECT id FROM threads WHERE userid = ?', [userid]);
                                const idofThread = threadQuery[threadQuery.length - 1].id;
                                // En sonuncu id değerini, threads tablosundan al ve kaydet
                            
                                // Get the last assistant message from the messages array
                                const messages = await openai.beta.threads.messages.list(threadidofThreads);
                            
                                // Find the last message for the current run
                                const lastMessageForRun = messages.data[0];
                            
                                // If an assistant message is found, return it
                                if (lastMessageForRun) {
                                    let aiText = lastMessageForRun.content[0].text.value;
                                
                                    // messages table'ı için tüm insertionların yapıldığı yer
                                    aiText = aiText.replace(/\n/g, "\\n"); // Veritabanına aiText yollanırken "\n" işareti mysql'de newline olarak algılanıyor. Bunu "\\n" haline getirip veritabanına yolluyoruz.
                                    connection.promise().query('INSERT INTO messages (message, threadid, aiMessage, idoftheactualThread) VALUES (?, ?, ?, ?)', [inputinside, idofThread, aiText, threadidofThreads])
                                    .then(results => {
                                        console.log('Data inserted successfully:', results);
                                    })
                                    .catch(error => {
                                        console.log('Error while inserting:', error);
                                    });
                                    // messages table'ı için tüm insertionların yapıldığı yer
                                
                                    return res.json({
                                        aiText,
                                        refreshCounter
                                    });
                                }
                                else
                                {
                                    console.error("Assistant message coldn't found.");
                                }
                            }
                        
                        }
                    }
                }
                
            }
            
        }
        catch (error)
        {
            console.error(error);
        }
    
    });

    app.get('/pricing', (req, res) => {
        const userid = req.session.userid;
        if (userid === undefined){
            req.session.destroy; // Destroy the session if user tries to connect the page and not logged in order to keep verification page safe
            const filePath = path.join(rootDir, 'pricing.html');
            res.sendFile(filePath);
        }
        else{
            const filePath = path.join(rootDir, 'pricing.html');
            res.sendFile(filePath);
        }
    })

    app.post('/pricing', (req, res) => {
        const cardChoice = req.body.choice; // Kredi kartı - banka kartı seçimini tutacak
        req.session.cardChoice = cardChoice;

        const sixMonthPayment = req.body.sixMonthPayment; // Altı aylık ödeme seçimine bastıysa onun değerini tutacak
        req.session.sixMonthPayment = sixMonthPayment;

        const oneYearPayment = req.body.oneYearPayment; // Bir yıllık ödeme seçimine bastıysa onun değerini tutacak
        req.session.oneYearPayment = oneYearPayment;

        const activity = req.session.activity;

        const dummy = 'dummy';
        const userid = req.session.userid;
        if (userid !== undefined){
            const loggedIn = true;
            return res.json({
                loggedIn,
                activity
            })
        }
        else{
            return res.json({dummy})
        } 
    })

    app.get('/payment', (req, res) => {
        const userid = req.session.userid;
        const activity = req.session.activity;
        const cardChoice = req.session.cardChoice;
        const sixMonthPayment = req.session.sixMonthPayment;
        const oneYearPayment = req.session.oneYearPayment;

        if ((userid !== undefined && activity !== "ACTIVE") && (cardChoice !== undefined || sixMonthPayment !== undefined || oneYearPayment !== undefined)){
            const filePath = path.join(rootDir, 'payment.html');
            res.sendFile(filePath);
        }
        else{
            req.session.destroy; // Destroy the session if user tries to connect the page and not logged in order to keep verification page safe
            res.redirect('/login');
        }
    })

    const identityNumber = [];
    app.post('/payment', (req, res) => {
        try {
            const sixMonthPayment = req.session.sixMonthPayment;
            const cardChoice = req.session.cardChoice;
            const oneYearPayment = req.session.oneYearPayment;

            const flagforgettinPaymentDetails = req.body.flagforgettinPaymentDetails;
            const flagforDownloadButton = req.body.flagforDownloadButton;
            const sozlesmeveForm = req.body.sozlesmeveForm;
            req.session.sozlesmeveForm = sozlesmeveForm;

            identityNumber.push(req.body.identityNumber);

            if (flagforgettinPaymentDetails === true){
                return res.json({sixMonthPayment, cardChoice, oneYearPayment})
            }
            else if (flagforDownloadButton === true){
                const doc = new PDFDocument();

                const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                doc.registerFont('ahbayalibre', fontBuffer);

                // Add content to the PDF
                doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                    align: 'justify'
                });
    
                // Set content type to PDF
                res.setHeader('Content-Type', 'application/pdf');

                // Set the Content-Disposition header to force the browser to download the PDF
                res.setHeader('Content-Disposition', 'attachment; filename="sozlesme.pdf"');

                // Pipe the PDF content to the response
                doc.pipe(res);

                // Finalize the PDF
                doc.end();
            }
            else{
                const { customerName, surname, identityNumber, email, phoneNumber, city, district, country, address, sozlesmeveFormOnay } = req.body;
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

                if (sozlesmeveFormOnay !== true){
                    const sozlesveFormOnaylandi = false;
                    return res.json({sozlesveFormOnaylandi})
                    // Javascripti değiştirip formu boş yollamaya çalışanlara karşı önlem
                }
                else if(sozlesmeveFormOnay === true){
                    if (cardChoice){
                        if (cardChoice === "credit"){
                            // Abonelik oluşturma
                            const subscriptionRequest = {
                                locale: Iyzipay.LOCALE.TR,
                                conversationId: '123456789',
                                callbackUrl: myWebsiteUrlCallback,
                                pricingPlanReferenceCode: 'b2727664-e55f-41aa-9142-d93fa3930ce0', //Aylık abonelik referans kodu
                                subscriptionInitialStatus: Iyzipay.SUBSCRIPTION_INITIAL_STATUS.ACTIVE,
                                customer: {
                                    name: customerName,
                                    surname: surname,
                                    identityNumber: identityNumber,
                                    email: email,
                                    gsmNumber: `+90${phoneNumber}`,
                                    billingAddress: {
                                        contactName: customerName,
                                        city: city,
                                        district: district,
                                        country: country,
                                        address: address,
                                    },
                                }
                            };
                        
                            iyzipay.subscriptionCheckoutForm.initialize(subscriptionRequest, function (err, result) {
                                const token = result.token;
                                req.session.token = token;
                            
                                const checkoutFormContent = result.checkoutFormContent;
                                if (result.status === 'failure'){
                                    const status = result.status;
                                    return res.json ({
                                        status
                                    });
                                }
                                else if (result.status === 'success'){
                                    const status = result.status;
                                    req.session.sozlesmeveFormOnay = sozlesmeveFormOnay;
                                    return res.json({
                                        status,
                                        checkoutFormContent
                                    });
                                }
                            });
                        }
                        else if (cardChoice === "bank"){
                            // Tek seferlik ödeme
                            const paymentRequest = {
                                locale: Iyzipay.LOCALE.TR,
                                conversationId: '123456789',
                                price: '200',
                                paidPrice: '200',
                                currency: Iyzipay.CURRENCY.TRY,
                                basketId: 'B67832',
                                paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
                                callbackUrl: myWebsiteUrlCallback,
                                enabledInstallments: [1],
                                buyer: {
                                    id: 'BY789',
                                    name: customerName,
                                    surname: surname,
                                    gsmNumber: `+90${phoneNumber}`,
                                    email: email,
                                    identityNumber: identityNumber,
                                    registrationAddress: address,
                                    ip: ip,
                                    city: city,
                                    country: country,
                                },
                                billingAddress: {
                                    contactName: customerName,
                                    city: city,
                                    country: country,
                                    address: address,
                                },
                                basketItems: [
                                    {
                                        id: 'BI102',
                                        name: 'Artifical Intelligence Service',
                                        category1: 'Technology',
                                        category2: 'Artifical Intelligence',
                                        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                                        price: '200'
                                    },
                                ]
                            };
                        
                            iyzipay.checkoutFormInitialize.create(paymentRequest, function (err, result) {
                                const token = result.token;
                                req.session.token = token;
                                const checkoutFormContent = result.checkoutFormContent;
                                req.session.checkoutFormContent = checkoutFormContent;
                            
                                if (result.status === 'failure'){
                                    const status = result.status;
                                    return res.json ({
                                        status
                                    });
                                }
                                else if (result.status === 'success'){
                                    const status = result.status;
                                    req.session.sozlesmeveFormOnay = sozlesmeveFormOnay;
                                    return res.json({
                                        status,
                                        checkoutFormContent
                                    });
                                }
                            });
                        }
                        else{
                            console.log("Bilinmeyen bir hata meydana geldi.");
                        }
                    }
                    else if (sixMonthPayment){
                        // 6 Aylık Tek seferlik ödeme
                        const paymentRequest = {
                            locale: Iyzipay.LOCALE.TR,
                            conversationId: '123456789',
                            price: '1000',
                            paidPrice: '1000',
                            currency: Iyzipay.CURRENCY.TRY,
                            basketId: 'B67832',
                            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
                            callbackUrl: myWebsiteUrlCallback,
                            enabledInstallments: [1],
                            buyer: {
                                id: 'BY789',
                                name: customerName,
                                surname: surname,
                                gsmNumber: `+90${phoneNumber}`,
                                email: email,
                                identityNumber: identityNumber,
                                registrationAddress: address,
                                ip: ip,
                                city: city,
                                country: country,
                            },
                            billingAddress: {
                                contactName: customerName,
                                city: city,
                                country: country,
                                address: address,
                            },
                            basketItems: [
                                {
                                    id: 'BI102',
                                    name: 'Artifical Intelligence Service',
                                    category1: 'Technology',
                                    category2: 'Artifical Intelligence',
                                    itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                                    price: '1000'
                                },
                            ]
                        };
                    
                        iyzipay.checkoutFormInitialize.create(paymentRequest, function (err, result) {
                            const token = result.token;
                            req.session.token = token;
                            const checkoutFormContent = result.checkoutFormContent;
                            req.session.checkoutFormContent = checkoutFormContent;
                        
                            if (result.status === 'failure'){
                                const status = result.status;
                                return res.json ({
                                    status
                                });
                            }
                            else if (result.status === 'success'){
                                const status = result.status;
                                req.session.sozlesmeveFormOnay = sozlesmeveFormOnay;
                                return res.json({
                                    status,
                                    checkoutFormContent
                                });
                            }
                        });
                    }
                    else if (oneYearPayment){
                        // 1 Senelik tek seferlik ödeme
                        const paymentRequest = {
                            locale: Iyzipay.LOCALE.TR,
                            conversationId: '123456789',
                            price: '2000',
                            paidPrice: '2000',
                            currency: Iyzipay.CURRENCY.TRY,
                            basketId: 'B67832',
                            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
                            callbackUrl: myWebsiteUrlCallback,
                            enabledInstallments: [1],
                            buyer: {
                                id: 'BY789',
                                name: customerName,
                                surname: surname,
                                gsmNumber: `+90${phoneNumber}`,
                                email: email,
                                identityNumber: identityNumber,
                                registrationAddress: address,
                                ip: ip,
                                city: city,
                                country: country,
                            },
                            billingAddress: {
                                contactName: customerName,
                                city: city,
                                country: country,
                                address: address,
                            },
                            basketItems: [
                                {
                                    id: 'BI102',
                                    name: 'Artifical Intelligence Service',
                                    category1: 'Technology',
                                    category2: 'Artifical Intelligence',
                                    itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                                    price: '2000'
                                },
                            ]
                        };
                    
                        iyzipay.checkoutFormInitialize.create(paymentRequest, function (err, result) {
                            const token = result.token;
                            req.session.token = token;
                            const checkoutFormContent = result.checkoutFormContent;
                            req.session.checkoutFormContent = checkoutFormContent;
                        
                            if (result.status === 'failure'){
                                const status = result.status;
                                return res.json ({
                                    status
                                });
                            }
                            else if (result.status === 'success'){
                                const status = result.status;
                                req.session.sozlesmeveFormOnay = sozlesmeveFormOnay;
                                return res.json({
                                    status,
                                    checkoutFormContent
                                });
                            }
                        });
                    }
                }
                else{
                    const sozlesveFormOnaylandi = false;
                    return res.json({sozlesveFormOnaylandi})
                }
            }
        }
        catch (error) {
            console.log("Error in Payment Route:", error);
        }
    })

    app.get('/callback', (req, res) => {
        const userid = req.session.userid;
        const token = req.session.token;
        if (userid != undefined && token != undefined){
            const filePath = path.join(rootDir, 'callback.html');
            res.sendFile(filePath);
        }
        else if(userid == undefined){
            // Destroy the session if user tries to connect the page and not logged in order to keep verification page safe
            res.redirect('/login');
        }
        else{
            res.redirect('/profile');
        }
    })
    
    app.post('/callback', (req, res) => {
        try {
            const token = req.session.token;
            const cardChoice = req.session.cardChoice;
            const userid = req.session.userid;
            const sixMonthPayment = req.session.sixMonthPayment;
            const oneYearPayment = req.session.oneYearPayment;
            const sozlesmeveFormOnay = req.session.sozlesmeveFormOnay;

            if (cardChoice === "credit"){ //Kullanıcı seçimi olan kredi ve banka kartı kısmı
                const request = {
                    checkoutFormToken: `${token}`
                };

                iyzipay.subscriptionCheckoutForm.retrieve(request, function (err, result) {
                    const subscriptionReferenceCode = result.data.referenceCode;
                    const status = result.status;

                    if (status === 'success'){
                        connection.promise().query('UPDATE users SET mesafeliSatisveAydinlatma = ? WHERE id = ?', [sozlesmeveFormOnay, userid])
                        .then(results => {
                            console.log('mesafeliSatisveAydinlatma Data updated successfully:', results);
                        })
                        .catch(error => {
                            console.log('Error while updating mesafeliSatisveAydinlatma:', error);
                        });

                        const sozlesmeveForm = req.session.sozlesmeveForm;

                        const doc = new PDFDocument();

                        const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                        doc.registerFont('ahbayalibre', fontBuffer);

                        // Add content to the PDF
                        doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                            align: 'justify'
                        });
                    
                        // Generate a unique filename for the PDF
                        const fileName = `${identityNumber[0]}_${Date.now()}.pdf`;
                    
                        // Save the PDF to the server's file system
                        const filePath = `sozlesmeler/${fileName}`;
                        doc.pipe(fs.createWriteStream(filePath));
                    
                        // Finalize the PDF
                        doc.end();

                        res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callback.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><svg class="checkmark" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 52 52" id="checkmark"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg><p id="successfulPayment">Ödemeniz onaylanmıştır!</p><p>Hukuk Asistanınız sizi bekliyor!</p><a href=${myWebsiteUrlProfile}>Ona merhaba demek için bu bağlantıya tıklayabilirsiniz, yada yukarıdan "Profil" sekmesine basabilirsiniz.</a></body></html>`);

                        // Abone referans numarasına göre, abonelerin abonelik bilgilerinin alındığı bölüm
                        const subscriptionInformations = {
                            subscriptionReferenceCode: subscriptionReferenceCode
                        };

                        iyzipay.subscription.retrieve(subscriptionInformations, function (err, subResult) {
                            const activity = subResult.data.subscriptionStatus;
                            req.session.activity = activity;

                            // Get current date
                            const currentDate = new Date();

                            // Extract year, month, and day
                            const year = currentDate.getFullYear();
                            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
                            const day = String(currentDate.getDate()).padStart(2, '0');

                            // Combine into desired format (e.g., YYYY-MM-DD)
                            const formattedStartingDate = `${year}-${month}-${day}`;

                            const subscriptionType = "Aylık";

                            // subscriptionEndingDate ve paymentID verisinin girilmesine kredi kartlarında gerek yok çünkü zaten otomatik kontrol edilebiliyor iyzipay apisi ile
                            connection.promise().query('INSERT INTO subscriptions (activity, cardType, userid, subscriptionReferenceCode, subscriptionStartingDate, subscriptionType) VALUES (?, ?, ?, ?, ?, ?)', [activity, cardChoice, userid, subscriptionReferenceCode, formattedStartingDate, subscriptionType])
                            .then(results => {
                                console.log('Data inserted successfully:', results);
                            })
                            .catch(error => {
                                console.log("Error while inserting:", error);
                            });
                        });
                    }
                    else if (status === 'failure'){
                        res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Ödemeniz onaylanamadı lütfen tekrar deneyiniz.</p></body></html>`);
                    }
                    else{
                        res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Bilinmeyen bir sorunla karşılaşıldı. Yeniden deneyiniz, eğer sorun çözülmezse bizimle E-Posta aracalığıyla iletişime geçiniz.</p></body></html>`);
                    }
                });
            }
            else if (cardChoice === "bank"){
                iyzipay.checkoutForm.retrieve({
                    token: token
                }, function (err, result) {
                    const paymentID = result.paymentId;
                    const paymentStatus = result.paymentStatus;
                    const fraudStatus = result.fraudStatus;

                    if ((paymentStatus === 'success' || paymentStatus === 'SUCCESS') && fraudStatus === 1){
                        iyzipay.payment.retrieve({
                            paymentId: paymentID
                        }, function (err, result) {
                            const cardType = result.cardType;
                            if (cardType === 'CREDIT_CARD'){

                                connection.promise().query('UPDATE users SET mesafeliSatisveAydinlatma = ? WHERE id = ?', [sozlesmeveFormOnay, userid])
                                .then(results => {
                                    console.log('mesafeliSatisveAydinlatma Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating mesafeliSatisveAydinlatma:', error);
                                });

                                const sozlesmeveForm = req.session.sozlesmeveForm;

                                const doc = new PDFDocument();

                                const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                                doc.registerFont('ahbayalibre', fontBuffer);

                                // Add content to the PDF
                                doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                                    align: 'justify'
                                });
                            
                                // Generate a unique filename for the PDF
                                const fileName = `${identityNumber[0]}_${Date.now()}.pdf`;
                            
                                // Save the PDF to the server's file system
                                const filePath = `sozlesmeler/${fileName}`;
                                doc.pipe(fs.createWriteStream(filePath));
                            
                                // Finalize the PDF
                                doc.end();

                                const choosenCardType = 'credit';
                                res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callback.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><svg class="checkmark" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 52 52" id="checkmark"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg><p id="successfulPayment">Ödemeniz onaylanmıştır!</p><p>Hukuk Asistanınız sizi bekliyor!</p><a href=${myWebsiteUrlProfile}>Ona merhaba demek için bu bağlantıya tıklayabilirsiniz, yada yukarıdan "Profil" sekmesine basabilirsiniz.</a></body></html>`);

                                const activity = "ACTIVE";
                                req.session.activity = activity;

                                const subscriptionEndingDate = getEndingDate(31);

                                const subscriptionType = "1 Aylık";

                                connection.promise().query('INSERT INTO subscriptions (activity, subscriptionEndingDate, cardType, userid, paymentID, subscriptionType) VALUES (?, ?, ?, ?, ?, ?)', [activity, subscriptionEndingDate, choosenCardType, userid, paymentID, subscriptionType])
                                .then(results => {
                                    console.log('Data inserted successfully:', results);
                                })
                                .catch(error => {
                                    console.log("Error while inserting:", error);
                                });
                            }
                            else if (cardType === 'DEBIT_CARD'){

                                connection.promise().query('UPDATE users SET mesafeliSatisveAydinlatma = ? WHERE id = ?', [sozlesmeveFormOnay, userid])
                                .then(results => {
                                    console.log('mesafeliSatisveAydinlatma Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating mesafeliSatisveAydinlatma:', error);
                                });

                                const sozlesmeveForm = req.session.sozlesmeveForm;

                                const doc = new PDFDocument();

                                const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                                doc.registerFont('ahbayalibre', fontBuffer);

                                // Add content to the PDF
                                doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                                    align: 'justify'
                                });
                            
                                // Generate a unique filename for the PDF
                                const fileName = `${identityNumber[0]}_${Date.now()}.pdf`;
                            
                                // Save the PDF to the server's file system
                                const filePath = `sozlesmeler/${fileName}`;
                                doc.pipe(fs.createWriteStream(filePath));
                            
                                // Finalize the PDF
                                doc.end();

                                const choosenCardType = 'bank';
                                res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callback.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><svg class="checkmark" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 52 52" id="checkmark"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg><p id="successfulPayment">Ödemeniz onaylanmıştır!</p><p>Hukuk Asistanınız sizi bekliyor!</p><a href=${myWebsiteUrlProfile}>Ona merhaba demek için bu bağlantıya tıklayabilirsiniz, yada yukarıdan "Profil" sekmesine basabilirsiniz.</a></body></html>`);

                                const activity = "ACTIVE";
                                req.session.activity = "ACTIVE";

                                const subscriptionEndingDate = getEndingDate(31);

                                const subscriptionType = "1 Aylık";

                                connection.promise().query('INSERT INTO subscriptions (activity, subscriptionEndingDate, cardType, userid, paymentID, subscriptionType) VALUES (?, ?, ?, ?, ?, ?)', [activity, subscriptionEndingDate, choosenCardType, userid, paymentID, subscriptionType])
                                .then(results => {
                                    console.log('Data inserted successfully:', results);
                                })
                                .catch(error => {
                                    console.log("Error while inserting:", error);
                                });
                            }
                            else if (cardType === 'PREPAID_CARD'){
                                connection.promise().query('UPDATE users SET mesafeliSatisveAydinlatma = ? WHERE id = ?', [sozlesmeveFormOnay, userid])
                                .then(results => {
                                    console.log('mesafeliSatisveAydinlatma Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating mesafeliSatisveAydinlatma:', error);
                                });

                                const sozlesmeveForm = req.session.sozlesmeveForm;

                                const doc = new PDFDocument();
                                    
                                const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                                doc.registerFont('ahbayalibre', fontBuffer);
                                    
                                // Add content to the PDF
                                doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                                    align: 'justify'
                                });
                            
                                // Generate a unique filename for the PDF
                                const fileName = `${identityNumber[0]}_${Date.now()}.pdf`;
                            
                                // Save the PDF to the server's file system
                                const filePath = `sozlesmeler/${fileName}`;
                                doc.pipe(fs.createWriteStream(filePath));
                            
                                // Finalize the PDF
                                doc.end();

                                const choosenCardType = 'prepaid';
                                res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callback.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><svg class="checkmark" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 52 52" id="checkmark"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg><p id="successfulPayment">Ödemeniz onaylanmıştır!</p><p>Hukuk Asistanınız sizi bekliyor!</p><a href=${myWebsiteUrlProfile}>Ona merhaba demek için bu bağlantıya tıklayabilirsiniz, yada yukarıdan "Profil" sekmesine basabilirsiniz.</a></body></html>`);

                                const activity = "ACTIVE";
                                req.session.activity = "ACTIVE";

                                const subscriptionEndingDate = getEndingDate(31);

                                const subscriptionType = "1 Aylık";

                                connection.promise().query('INSERT INTO subscriptions (activity, subscriptionEndingDate, cardType, userid, paymentID, subscriptionType) VALUES (?, ?, ?, ?, ?, ?)', [activity, subscriptionEndingDate, choosenCardType, userid, paymentID, subscriptionType])
                                .then(results => {
                                    console.log('Data inserted successfully:', results);
                                })
                                .catch(error => {
                                    console.log("Error while inserting:", error);
                                });
                            }
                        });
                    }
                    else if (paymentStatus === 'failure' || paymentStatus === 'FAILURE'){
                        res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Ödemeniz onaylanamadı lütfen tekrar deneyiniz.</p></body></html>`);
                    }
                    else if (result.fraudStatus === -1){
                        res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Ödemeniz alınamadı. Yeniden deneyiniz ve sorun devam ederse lütfen bizimle E-Posta üzerinden iletişime geçiniz.</p></body></html>`);
                    }
                    else if (result.fraudStatus === 0){
                        res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Bankayla ilgili bir sorun oluştu. Eğer ödeme alındıysa ve üyeliğiniz aktive edilmediyse lütfen bizimle E-Posta aracılığıyla problemin detayları yazarak iletişime geçiniz.</p></body></html>`);
                    }
                    else{
                        res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Bilinmeyen bir hata meydana geldi. Eğer hata dolayısıyla bir problem oluştuysa, lütfen problemin detayıyla birlikte E-Posta ile bizle iletişimi geçiniz.</p></body></html>`);
                    }
                });
            }
            else if(sixMonthPayment !== undefined){
                iyzipay.checkoutForm.retrieve({
                    token: token
                }, function (err, result) {
                    const paymentID = result.paymentId;
                    const paymentStatus = result.paymentStatus;
                    const fraudStatus = result.fraudStatus;

                    if ((paymentStatus === 'success' || paymentStatus === 'SUCCESS') && paymentStatus === 1){
                        iyzipay.payment.retrieve({
                            paymentId: paymentID
                        }, function (err, result) {
                            const cardType = result.cardType;
                            if (cardType === 'CREDIT_CARD'){
                                connection.promise().query('UPDATE users SET mesafeliSatisveAydinlatma = ? WHERE id = ?', [sozlesmeveFormOnay, userid])
                                .then(results => {
                                    console.log('mesafeliSatisveAydinlatma Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating mesafeliSatisveAydinlatma:', error);
                                });

                                const sozlesmeveForm = req.session.sozlesmeveForm;

                                const doc = new PDFDocument();
                                    
                                const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                                doc.registerFont('ahbayalibre', fontBuffer);
                                    
                                // Add content to the PDF
                                doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                                    align: 'justify'
                                });
                            
                                // Generate a unique filename for the PDF
                                const fileName = `${identityNumber[0]}_${Date.now()}.pdf`;
                            
                                // Save the PDF to the server's file system
                                const filePath = `sozlesmeler/${fileName}`;
                                doc.pipe(fs.createWriteStream(filePath));
                            
                                // Finalize the PDF
                                doc.end();
                                
                                const choosenCardType = 'credit';
                                res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callback.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><svg class="checkmark" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 52 52" id="checkmark"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg><p id="successfulPayment">Ödemeniz onaylanmıştır!</p><p>Hukuk Asistanınız sizi bekliyor!</p><a href=${myWebsiteUrlProfile}>Ona merhaba demek için bu bağlantıya tıklayabilirsiniz, yada yukarıdan "Profil" sekmesine basabilirsiniz.</a></body></html>`);

                                const activity = "ACTIVE";
                                req.session.activity = activity;

                                const subscriptionEndingDate = getEndingDate(181);

                                const subscriptionType = "6 Aylık"

                                connection.promise().query('INSERT INTO subscriptions (activity, subscriptionEndingDate, cardType, userid, paymentID, subscriptionType) VALUES (?, ?, ?, ?, ?, ?)', [activity, subscriptionEndingDate, choosenCardType, userid, paymentID, subscriptionType])
                                .then(results => {
                                    console.log('Data inserted successfully:', results);
                                })
                                .catch(error => {
                                    console.log("Error while inserting:", error);
                                });
                            }
                            else if (cardType === 'DEBIT_CARD'){
                                connection.promise().query('UPDATE users SET mesafeliSatisveAydinlatma = ? WHERE id = ?', [sozlesmeveFormOnay, userid])
                                .then(results => {
                                    console.log('mesafeliSatisveAydinlatma Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating mesafeliSatisveAydinlatma:', error);
                                });

                                const sozlesmeveForm = req.session.sozlesmeveForm;

                                const doc = new PDFDocument();
                                    
                                const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                                doc.registerFont('ahbayalibre', fontBuffer);
                                    
                                // Add content to the PDF
                                doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                                    align: 'justify'
                                });
                            
                                // Generate a unique filename for the PDF
                                const fileName = `${identityNumber[0]}_${Date.now()}.pdf`;
                            
                                // Save the PDF to the server's file system
                                const filePath = `sozlesmeler/${fileName}`;
                                doc.pipe(fs.createWriteStream(filePath));
                            
                                // Finalize the PDF
                                doc.end();

                                const choosenCardType = 'bank';
                                res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callback.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><svg class="checkmark" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 52 52" id="checkmark"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg><p id="successfulPayment">Ödemeniz onaylanmıştır!</p><p>Hukuk Asistanınız sizi bekliyor!</p><a href=${myWebsiteUrlProfile}>Ona merhaba demek için bu bağlantıya tıklayabilirsiniz, yada yukarıdan "Profil" sekmesine basabilirsiniz.</a></body></html>`);

                                const activity = "ACTIVE";
                                req.session.activity = "ACTIVE";

                                const subscriptionEndingDate = getEndingDate(181);

                                const subscriptionType = "6 Aylık";

                                connection.promise().query('INSERT INTO subscriptions (activity, subscriptionEndingDate, cardType, userid, paymentID, subscriptionType) VALUES (?, ?, ?, ?, ?, ?)', [activity, subscriptionEndingDate, choosenCardType, userid, paymentID, subscriptionType])
                                .then(results => {
                                    console.log('Data inserted successfully:', results);
                                })
                                .catch(error => {
                                    console.log("Error while inserting:", error);
                                });
                            }
                            else if (cardType === 'PREPAID_CARD'){
                                connection.promise().query('UPDATE users SET mesafeliSatisveAydinlatma = ? WHERE id = ?', [sozlesmeveFormOnay, userid])
                                .then(results => {
                                    console.log('mesafeliSatisveAydinlatma Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating mesafeliSatisveAydinlatma:', error);
                                });

                                const sozlesmeveForm = req.session.sozlesmeveForm;

                                const doc = new PDFDocument();
                                    
                                const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                                doc.registerFont('ahbayalibre', fontBuffer);
                                    
                                // Add content to the PDF
                                doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                                    align: 'justify'
                                });
                            
                                // Generate a unique filename for the PDF
                                const fileName = `${identityNumber[0]}_${Date.now()}.pdf`;
                            
                                // Save the PDF to the server's file system
                                const filePath = `sozlesmeler/${fileName}`;
                                doc.pipe(fs.createWriteStream(filePath));
                            
                                // Finalize the PDF
                                doc.end();

                                const choosenCardType = 'prepaid';
                                res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callback.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><svg class="checkmark" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 52 52" id="checkmark"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg><p id="successfulPayment">Ödemeniz onaylanmıştır!</p><p>Hukuk Asistanınız sizi bekliyor!</p><a href=${myWebsiteUrlProfile}>Ona merhaba demek için bu bağlantıya tıklayabilirsiniz, yada yukarıdan "Profil" sekmesine basabilirsiniz.</a></body></html>`);

                                const activity = "ACTIVE";
                                req.session.activity = "ACTIVE";

                                const subscriptionEndingDate = getEndingDate(180);

                                const subscriptionType = "6 Aylık";

                                connection.promise().query('INSERT INTO subscriptions (activity, subscriptionEndingDate, cardType, userid, paymentID, subscriptionType) VALUES (?, ?, ?, ?, ?, ?)', [activity, subscriptionEndingDate, choosenCardType, userid, paymentID, subscriptionType])
                                .then(results => {
                                    console.log('Data inserted successfully:', results);
                                })
                                .catch(error => {
                                    console.log("Error while inserting:", error);
                                });
                            }
                        });
                    }
                    else if (paymentStatus === 'failure' || paymentStatus === 'FAILURE'){
                        res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Ödemeniz onaylanamadı lütfen tekrar deneyiniz.</p></body></html>`);
                    }
                    else if (fraudStatus === -1){
                        res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Ödemeniz alınamadı. Yeniden deneyiniz ve sorun devam ederse lütfen bizimle E-Posta üzerinden iletişime geçiniz.</p></body></html>`);
                    }
                    else if (fraudStatus === 0){
                        res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Bankayla ilgili bir sorun oluştu. Eğer ödeme alındıysa ve üyeliğiniz aktive edilmediyse lütfen bizimle E-Posta aracılığıyla problemin detayları yazarak iletişime geçiniz.</p></body></html>`);
                    }
                    else{
                        res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Bilinmeyen bir hata meydana geldi. Eğer hata dolayısıyla bir problem oluştuysa, lütfen problemin detayıyla birlikte E-Posta ile bizle iletişimi geçiniz.</p></body></html>`);
                    }
                })
            }
            else if(oneYearPayment !== undefined){
                iyzipay.checkoutForm.retrieve({
                    token: token
                }, function (err, result) {
                    const paymentID = result.paymentId;
                    const paymentStatus = result.paymentStatus;
                    const fraudStatus = result.fraudStatus;

                    if ((paymentStatus === 'success' || paymentStatus === 'SUCCESS') && paymentStatus === 1){
                        iyzipay.payment.retrieve({
                            paymentId: paymentID
                        }, function (err, result) {
                            const cardType = result.cardType;
                            if (cardType === 'CREDIT_CARD'){
                                connection.promise().query('UPDATE users SET mesafeliSatisveAydinlatma = ? WHERE id = ?', [sozlesmeveFormOnay, userid])
                                .then(results => {
                                    console.log('mesafeliSatisveAydinlatma Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating mesafeliSatisveAydinlatma:', error);
                                });

                                const sozlesmeveForm = req.session.sozlesmeveForm;

                                const doc = new PDFDocument();
                                    
                                const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                                doc.registerFont('ahbayalibre', fontBuffer);
                                    
                                // Add content to the PDF
                                doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                                    align: 'justify'
                                });
                            
                                // Generate a unique filename for the PDF
                                const fileName = `${identityNumber[0]}_${Date.now()}.pdf`;
                            
                                // Save the PDF to the server's file system
                                const filePath = `sozlesmeler/${fileName}`;
                                doc.pipe(fs.createWriteStream(filePath));
                            
                                // Finalize the PDF
                                doc.end();

                                const choosenCardType = 'credit';
                                res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callback.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><svg class="checkmark" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 52 52" id="checkmark"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg><p id="successfulPayment">Ödemeniz onaylanmıştır!</p><p>Hukuk Asistanınız sizi bekliyor!</p><a href=${myWebsiteUrlProfile}>Ona merhaba demek için bu bağlantıya tıklayabilirsiniz, yada yukarıdan "Profil" sekmesine basabilirsiniz.</a></body></html>`);

                                const activity = "ACTIVE";
                                req.session.activity = activity;

                                const subscriptionEndingDate = getEndingDate(366);

                                const subscriptionType = "1 Yıllık";

                                connection.promise().query('INSERT INTO subscriptions (activity, subscriptionEndingDate, cardType, userid, paymentID, subscriptionType) VALUES (?, ?, ?, ?, ?, ?)', [activity, subscriptionEndingDate, choosenCardType, userid, paymentID, subscriptionType])
                                .then(results => {
                                    console.log('Data inserted successfully:', results);
                                })
                                .catch(error => {
                                    console.log("Error while inserting:", error);
                                });
                            }
                            else if (cardType === 'DEBIT_CARD'){
                                connection.promise().query('UPDATE users SET mesafeliSatisveAydinlatma = ? WHERE id = ?', [sozlesmeveFormOnay, userid])
                                .then(results => {
                                    console.log('mesafeliSatisveAydinlatma Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating mesafeliSatisveAydinlatma:', error);
                                });

                                const sozlesmeveForm = req.session.sozlesmeveForm;

                                const doc = new PDFDocument();
                                    
                                const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                                doc.registerFont('ahbayalibre', fontBuffer);
                                    
                                // Add content to the PDF
                                doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                                    align: 'justify'
                                });
                            
                                // Generate a unique filename for the PDF
                                const fileName = `${identityNumber[0]}_${Date.now()}.pdf`;
                            
                                // Save the PDF to the server's file system
                                const filePath = `sozlesmeler/${fileName}`;
                                doc.pipe(fs.createWriteStream(filePath));
                            
                                // Finalize the PDF
                                doc.end();

                                const choosenCardType = 'bank';
                                res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callback.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><svg class="checkmark" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 52 52" id="checkmark"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg><p id="successfulPayment">Ödemeniz onaylanmıştır!</p><p>Hukuk Asistanınız sizi bekliyor!</p><a href=${myWebsiteUrlProfile}>Ona merhaba demek için bu bağlantıya tıklayabilirsiniz, yada yukarıdan "Profil" sekmesine basabilirsiniz.</a></body></html>`);

                                const activity = "ACTIVE";
                                req.session.activity = "ACTIVE";

                                const subscriptionEndingDate = getEndingDate(366);

                                const subscriptionType = "1 Yıllık";

                                connection.promise().query('INSERT INTO subscriptions (activity, subscriptionEndingDate, cardType, userid, paymentID, subscriptionType) VALUES (?, ?, ?, ?, ?, ?)', [activity, subscriptionEndingDate, choosenCardType, userid, paymentID, subscriptionType])
                                .then(results => {
                                    console.log('Data inserted successfully:', results);
                                })
                                .catch(error => {
                                    console.log("Error while inserting:", error);
                                });
                            }
                            else if (cardType === 'PREPAID_CARD'){
                                connection.promise().query('UPDATE users SET mesafeliSatisveAydinlatma = ? WHERE id = ?', [sozlesmeveFormOnay, userid])
                                .then(results => {
                                    console.log('mesafeliSatisveAydinlatma Data updated successfully:', results);
                                })
                                .catch(error => {
                                    console.log('Error while updating mesafeliSatisveAydinlatma:', error);
                                });

                                const sozlesmeveForm = req.session.sozlesmeveForm;

                                const doc = new PDFDocument();
                                    
                                const fontBuffer = fs.readFileSync('assets/ahbayalibrefont/AbhayaLibre-Regular.ttf');
                                doc.registerFont('ahbayalibre', fontBuffer);
                                    
                                // Add content to the PDF
                                doc.font('ahbayalibre').fontSize(12).text(`${sozlesmeveForm}`, {
                                    align: 'justify'
                                });
                            
                                // Generate a unique filename for the PDF
                                const fileName = `${identityNumber[0]}_${Date.now()}.pdf`;
                            
                                // Save the PDF to the server's file system
                                const filePath = `sozlesmeler/${fileName}`;
                                doc.pipe(fs.createWriteStream(filePath));
                            
                                // Finalize the PDF
                                doc.end();

                                const choosenCardType = 'prepaid';
                                res.status(200).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callback.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><svg class="checkmark" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 52 52" id="checkmark"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg><p id="successfulPayment">Ödemeniz onaylanmıştır!</p><p>Hukuk Asistanınız sizi bekliyor!</p><a href=${myWebsiteUrlProfile}>Ona merhaba demek için bu bağlantıya tıklayabilirsiniz, yada yukarıdan "Profil" sekmesine basabilirsiniz.</a></body></html>`);

                                const activity = "ACTIVE";
                                req.session.activity = "ACTIVE";

                                const subscriptionEndingDate = getEndingDate(366);

                                const subscriptionType = "1 Yıllık";

                                connection.promise().query('INSERT INTO subscriptions (activity, subscriptionEndingDate, cardType, userid, paymentID, subscriptionType) VALUES (?, ?, ?, ?, ?, ?)', [activity, subscriptionEndingDate, choosenCardType, userid, paymentID, subscriptionType])
                                .then(results => {
                                    console.log('Data inserted successfully:', results);
                                })
                                .catch(error => {
                                    console.log("Error while inserting:", error);
                                });
                            }
                        });
                    }
                    else if (paymentStatus === 'failure' || paymentStatus === 'FAILURE'){
                        res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Ödemeniz onaylanamadı lütfen tekrar deneyiniz.</p></body></html>`);
                    }
                    else if (fraudStatus === -1){
                        res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Ödemeniz alınamadı. Yeniden deneyiniz ve sorun devam ederse lütfen bizimle E-Posta üzerinden iletişime geçiniz.</p></body></html>`);
                    }
                    else if (fraudStatus === 0){
                        res.status(404).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Bankayla ilgili bir sorun oluştu. Eğer ödeme alındıysa ve üyeliğiniz aktive edilmediyse lütfen bizimle E-Posta aracılığıyla problemin detayları yazarak iletişime geçiniz.</p></body></html>`);
                    }
                    else{
                        res.status(400).send(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ödeme Onaylama</title><link rel="stylesheet" href="callbackfailure.css"></head><body><header class="headerdes"><a id="mainpage" href="${myWebsiteUrl}">Ana Sayfa</a><a id="profile" href=${myWebsiteUrlProfile}>Profil</a></header><div id="circlude"> X </div><p>Bilinmeyen bir hata meydana geldi. Eğer hata dolayısıyla bir problem oluştuysa, lütfen problemin detayıyla birlikte E-Posta ile bizle iletişimi geçiniz.</p></body></html>`);
                    }
                });
            }
        }
        catch (error) {
            console.log("Callback Route Error:", error)
        }
    })

})();

const port = 3000;
app.listen(port, () => {
    console.log(`Server is listening at https://localhost:${port}`);
});