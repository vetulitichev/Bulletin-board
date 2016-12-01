var util = require('util');
var session = require('express-session');
var sess ;
var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'mydb'
});
connection.connect(function (error) {
	if(!!error){
		console.log(' DB Error');
	} else {
		console.log('Connected');
	}
});
/////////////////////////////////////////////

module.exports = function (app) {

	app.get('/', function (req, res, next) {
		res.render('index');
	});
	app.get('/welcome', function (req, res, next) {
		res.render('welcome');
	});
    app.get('/user_search', function (req, res, next) {
        res.render('user_search');
    });
    app.get('/personal_area', function (req, res, next) {
        console.log("User Email: " + sess.email);
        connection.query("SELECT * FROM userInformationTable",function (error,rows,feilds) {
            if (!!error){
                console.log(error);
            }
            if(sess.email )
            {
                rows.forEach(function (item,i,rows) {
                    if (item.ID==sess.ID){
                        sess.name = item.Name;
                        sess.phone = item.Phone;
                    }
                });


            }
            console.log("User Name: " + sess.name);
			console.log("User Phone: " + sess.phone);
        });
        res.render('personal_area');
    });
	app.get('/change_personal_data', function (req, res, next) {

		res.render('change_personal_data');
	});
    app.get('/change_pass', function (req, res, next) {
        res.render('change_pass');
    });
	app.get('/login', function (req, res, next) {
		delete req.session.authenticated;
		res.render('login', { flash: req.flash() } );
	});
	app.get('/registration', function (req, res, next) {
		res.render('registration');
	});

	app.post('/login', function (req, res, next) {
		var flag_email = 0;
		var flag_pass = 0;
		sess = req.session;
		connection.query("SELECT * FROM userInformationTable ", function (error,rows,feilds) {
			if(!!error) {
				console.log(error);
			}

			if(req.body.email && req.body.password )
			{
				rows.forEach(function (item,i,rows) {
					if (item.Email==req.body.email){
						flag_email = 1;
						sess.ID = item.ID;
					}
					if (item.Password==req.body.password){
						flag_pass = 1;
					}
				});
			}
			if (flag_email && flag_pass === 1) {
				req.session.authenticated = true;
				sess.email = req.body.email;
				res.redirect('/personal_area');
			} else {
				req.flash('error', 'Username or password are incorrect');
				res.redirect('/login');
			}
		});
	});
	app.post('/registration',function (req,res,next) {

		if(req.body.name && req.body.password && req.body.email && req.body.phone) {
			connection.query("INSERT INTO userInformationTable(`Email`, `Password`, `Name`, `Phone`) VALUES (?,?,?,?)",[req.body.name,req.body.password,req.body.name,req.body.phone], function (error, rows, feilds) {
				if (!!error) {
					console.log('Error in the query Login');
				}
			});

			res.redirect('/login');
		} else {
			res.redirect('/registration');
		}

	});
	app.post('/change_personal_data',function (req,res,next) {
				if (req.body.new_email) {
					connection.query("UPDATE userInformationTable SET Email= ?, Name = ?,Phone = ? WHERE ID =?", [req.body.new_email,req.body.name,req.body.phone,sess.ID], function (error, row, feilds) {
						if (!!error) {
							console.log(error);
						}
					});
				}
			res.redirect('/personal_area');
	});
    app.post('/change_pass',function (req,res,next) {
		connection.query("SELECT * FROM userInformationTable ", function (error, rows, feilds) {
			if (!!error) {
				console.log(error);
			}
			if (req.body.email == sess.email) {
				if (req.body.old_pass && req.body.new_pass) {
					rows.forEach(function (item, i, rows) {
						if (!(item.Password == req.body.old_pass)) {
							res.statusCode = 422;
							res.end("Wrong current password");
						}else {
							connection.query("UPDATE userInformationTable SET Password =? WHERE ID =?",[req.body.new_pass,sess.ID],function (error, row, feilds) {
								if (!!error) {
									console.log(error);
								}
								res.statusCode = 200;
								res.redirect('personal_area');
							});
						}
					});
				}else {
					res.redirect('change_pass');
				}
			}else{
				res.redirect('change_pass');
			}

		});
	});
    app.post('/user_search',function (req,res,next) {
    	connection.query("SELECT* FROM userInformationTable",function (error ,rows,feilds) {
			if (error){
				console.log(error);
			}
			rows.forEach(function (item,i,rows) {
				if (req.body.search_email) {
					if (req.body.search_email == item.Email) {
						console.log("ID: "+ item.ID);
						console.log("Email: "+ item.Email);
						console.log("Name: "+ item.Name);
						console.log("Phone: "+ item.Phone);
						res.statusCode = 200;
					}
				}
				if (req.body.search_name) {
					if (req.body.search_email == item.Email) {
						console.log("ID: "+ item.ID);
						console.log("Email: "+ item.Email);
						console.log("Name: "+ item.Name);
						console.log("Phone: "+ item.Phone);
						res.statusCode = 200;
					}
				}
			});
		});
    });
	app.get('/logout', function (req, res, next) {
		delete req.session.authenticated;
		res.redirect('/');
	});

};
