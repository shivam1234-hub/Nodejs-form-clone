const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const nodemailer = require('nodemailer');

require('dotenv').config()
const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    database:process.env.DATABASE,
    user:process.env.DB_USER,
    password:process.env.DB_PASS
})
var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "shivamvijay543@gmail.com",
        pass: "Vijay@#2001"
    }
});
var message;



router.get('/register', (req, res) => {
    res.render('register');
   


})
router.get('/login', (req, res) => {
    res.render('login');

})
router.get('/CreatePassword', (req, res) => {
    res.render('CreatePassword');

})
router.get('/create', (req, res) => {
    res.render('create');

})
var userName;
router.post('/register', (req, res) => {

    const {
        name,
        email,
        password,
        password2
    } = req.body;
    let errors = [];
    userName = name;
    //check required fields
    if (!name || !email || !password || !password2) {
        errors.push({
            msg: 'Please fill in all field'
        });
    } else {
        if (password !== '' && password2 !== '') {
            //check passwords matching
            if (password !== password2) {
                errors.push({
                    msg: "passwords do not match"
                });
            }

            //Check pass lengths
            if (password.length < 6) {
                errors.push({
                    msg: "password should be atleast 6 characters"
                });
            }
            
        }
    }


    connection.query('SELECT * FROM registerdata WHERE email=?', [email], (err, res) => {
        if (err) {
            console.log(err);
        }
        if (res.length > 0) {
            errors.push({
                msg: "This email id is already in use"
            });

        }
        else{
            connection.query('SELECT * FROM registerdata WHERE password=?', [password], (err, res) => {
                if (err) {
                    console.log(err);
                }
                if (res.length > 0) {
                    errors.push({
                        msg: "This password is already in use"
                    });
        
                }
            })
        }


    })
    setTimeout(() => {
        if (errors.length > 0) {
            res.render('register', {
                errors,
                name,
                email,
                password,
                password2
            });
        } else {
            const {
                name,
                email,
                password,
                password2
            } = req.body;





            var tabledata = "INSERT INTO registerdata (name,email,password,confirmpassword) VALUES ?";
            var values = [
                [name, email, password, password2]

            ];
            connection.query(tabledata, [values], function(err, result) {
                if (err) throw err;
                console.log("Number of records inserted: " + result.affectedRows);
            });

            req.flash('success_msg','You are now registered and can log in');
            res.redirect('/users/login');

        }
    }, 1000)



})
router.post('/login', (req, res) => {
    const {
        email,
        password
    } = req.body;
    let errors = [];

    if (!email || !password) {
        errors.push({
            msg: 'Please fill in all field'
        });
    } else {
        connection.query('SELECT * FROM registerdata WHERE email=? ', [email], (err, res) => {
            if (err) {
                console.log(err);
            }
            if (res.length === 0) {
                errors.push({
                    msg: "This email id is not registered"
                });

            }
            else
            {
                 connection.query('SELECT * FROM registerdata WHERE email=? AND password=? ', [email,password], (err, res) => {
            if (err) {
                console.log(err);
            }
            if (res.length === 0) {
                errors.push({
                    msg: "password is wrong"
                });

            }
            
            
        })
                
            }
            
            
        })
    }

    setTimeout(() => {
        if (errors.length > 0) {
            res.render('login', {
                errors,
                email,
                password
            });
        } else {
            var user_name;
            connection.query('SELECT name FROM registerdata WHERE email=? AND password=?', [email, password], (err, res) => {
               console.log(res[0].name);
               user_name = res[0].name;
            

            message = {
                from: 'shivamvijay543@gmail.com', // Sender address
                to: `${req.body.email}`, // List of recipients
                subject: 'First FullStact  App', // Subject line
                text: `Hey ${ res[0].name}!This is Shivam Vijay ,Associate member at E-cell,IIT Kharagpur` // Plain text body
            };
            // transport.sendMail(message, function(err, info) {
            //     if (err) {
            //         console.log(err)
            //     } else {
            //         console.log(info);
            //     }
            // });
        });
        setTimeout(() => { 
            console.log(user_name);
            req.flash('name',`${user_name}`);
            res.redirect('/users/dashboard');},1000)
        }
    }, 1000)
})

router.get('/dashboard', (req, res) => {
    res.render('dashboard');

})
router.get('/logout', (req, res) => {
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });


router.post('/CreatePassword', (req, res) => {
    var errors=[];
    const email =req.body.email;

    if (!email) {
        errors.push({
            msg: 'Please write you email'
        });
    }
    else{
        connection.query('SELECT * FROM registerdata WHERE email=?', [email], (err, res) => {
            if (err) {
                console.log(err);
            }
            if (res.length == 0) {
                errors.push({
                    msg: "This email id is not registered"
                });
    
            }
        })
        
    }

    setTimeout(() => { 
    if (errors.length > 0) {
        res.render('CreatePassword', {
            errors  
        });
    }
    else
    {
        message = {
            from: 'shivamvijay543@gmail.com', // Sender address
            to: `${req.body.email}`, // List of recipients
            subject: 'Reset your password',// Subject line
            text: `Hey!Follow this link to reset your password \n\n https://nodejs-form.herokuapp.com/users/create ` // Plain text body
        };
        transport.sendMail(message, function(err, info) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(info);
                    }
                });
        req.flash('success_msg', 'Email sent!Check your email for further instructions');
        res.redirect('/users/CreatePassword');
    }
   

 },1000)
   

})



module.exports = router;
