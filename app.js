var express = require('express');

var port = 8999;

var app = express.createServer();


function checkAuth (req, res, next) {
	console.log('checkAuth ' + req.url);


	if (req.url === '/personal_area' && (!req.session || !req.session.authenticated)) {
		res.render('unauthorised', { status: 403 });
		return;
	}
	if (req.url === '/change_pass' && (!req.session || !req.session.authenticated)) {
		res.render('unauthorised', { status: 403 });
		return;
	}
	if (req.url === '/welcome' && (!req.session || !req.session.authenticated)) {
		res.render('unauthorised', { status: 403 });
		return;
	}
	if (req.url === '/change_personal_data' && (!req.session || !req.session.authenticated)) {
		res.render('unauthorised', { status: 403 });
		return;
	}

	next();
}

app.configure(function () {

	app.use(express.cookieParser());
	app.use(express.session({ secret: 'example' }));
	app.use(express.bodyParser());
	app.use(checkAuth);
	app.use(app.router);
	app.set('view engine', 'jade');
	app.set('view options', { layout: false });

});

require('./lib/routes.js')(app);

app.listen(port);
console.log('Node listening on port %s', port);
