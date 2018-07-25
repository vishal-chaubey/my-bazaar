var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var Cart = require('../models/cart');

var Product = require('../models/product');
var Order = require('../models/order');

var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var session = require('express-session');
var csrf = require('csurf');
var passport = require('passport');

var csrfProtection = csrf();
router.use(csrfProtection);
mongoose.connect('mongodb://localhost:27017/shopping');

var userSession;

/* GET home page. */
router.get('/', function(req, res, next) {
	var successMsg = req.flash('success')[0];
	MongoClient.connect('mongodb://localhost:27017/',function(err, db){
		if (err){
			throw err;
		}

		var dbo = db.db("shopping");
		dbo.collection("products").find({}).toArray(function(err, result) {
			if (err) {
				throw err;
			}
			res.render('index', { title: 'Product Management', products: result, successMsg: successMsg, noMessages: !successMsg});	
			db.close();
		}); 
	});
});

/* GET add-to-cart page */
router.get('/add-to-cart/:id', function(req, res, next) {
	var productId = req.params.id;
	//function cart(){}
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	Product.findById(productId, function(err, product) {
		if (err) {
			return res.redirect('/');
		}
		cart.add(product, product.id);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/');
	});
});

router.get('/reduce/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.reduceByOne(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.removeItem(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
	if (!req.session.cart) {
		return res.render('user/shopping-cart', {title: 'shopping-cart', products: null});
	}
	var cart = new Cart(req.session.cart);
	res.render('user/shopping-cart', {title: 'shopping-cart', products: cart.generateArray(), totalPrice: cart.totalPrice, totalQty: cart.totalQty});
});

router.get('/checkout', isLoggedInOrder, function(req, res, next) {
	console.log("hello friend first");
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);
	var errMsg = req.flash('error')[0];
	console.log("hello friend third");
	res.render('user/checkout', {title: 'checkout', csrfToken: req.csrfToken(), total: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg });
});

router.post('/checkout', isLoggedInOrder, function(req, res, next) {
	console.log("hello friend fourth");
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);

		var stripe = require("stripe")(
			"sk_test_gDKfQ2TroREnBpPlH6CrtdLv"
		);
		
		stripe.charges.create({
			amount: cart.totalPrice * 100,
			currency: "usd",
			source: req.body.stripeToken, // obtained with Stripe.js
			description: "Test Charge"
		}, function(err, charge) {
			if (err){
				req.flash('error', err.message);
				return res.redirect('/checkout');
			}
			var order = new Order({
				user: req.user,
				cart: cart,
				address: req.body.address,
				name: req.body.name,
				paymentId: charge.id
			});
			order.save(function(err, result) {
			req.flash('success', 'Successfully bought product!');
			req.session.cart = null;
			res.redirect('/');
		});
  });
});

/* GET Profile page. */
router.get('/user/profile', isLoggedIn, function(req, res, next){
	Order.find({user: req.user}, function(err, orders){
		if (err) {
			return res.write('Error!');
		}
		var cart;
		orders.forEach(function(order){
			cart = new Cart(order.cart);
			order.items = cart.generateArray();
		});
		res.render('user/profile',  { title: 'profile', orders: orders, total: cart.totalPrice });
	});
});

/* GET Logout page. */
router.get('/user/logout',isLoggedIn, function (req, res, next){
	req.logout();
	res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next) {
	next();
});

/* GET Signup page. */
router.get('/user/signup',function(req, res, next){
	userSession = req.session;
	userSession.username = "";
	var messages = req.flash('error');
	res.render('user/signup', { title: 'signup', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});
router.post('/user/signup', passport.authenticate('local.signup', {
	failureRedirect: '/user/signup',
	failureFlash: true
}), function(req, res, next){
	if(req.session.oldUrl){
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
		
	} else {
		res.redirect('/user/profile');
	}
});

/* GET Signin page. */
router.get('/user/signin',function(req, res, next){
	userSession = req.session;
	userSession.username = "";
	var messages = req.flash('error');
	res.render('user/signin', { title: 'signin', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});
router.post('/user/signin', passport.authenticate('local.signin', {
	failureRedirect: '/user/signin',
	failureFlash: true
}), function(req, res, next){
	if(req.session.oldUrl){
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	} else {
		res.redirect('/user/profile');
	}});

/* GET Add_Product Page. */
router.get('/user/addproduct', function(req, res, next) {
	userSession = req.session;
	userSession.username = "";
	res.render('user/addproduct', { title: 'AddProduct to dbs' , username:userSession.username, message: ''});
  });
 
router.get('/addProductToDB', function(req, res, next) {
	userSession = req.session;
    userSession.username = "";
	MongoClient.connect('mongodb://localhost:27017/',function(err, db){
	if(err){
		throw err;
	}
	var dbo = db.db("shopping");

	 var imagePath=req.query.img;
	 var title=req.query.title;
	 var description=req.query.description;
	 var price=req.query.price;
	 var Product = {imagepath : imagePath, title : title, description : description, price : price};
	 dbo.collection("products").insertOne(Product, function(err, result) {
		if (err) {
			   throw err;
		}
		if(result){
	   		console.log("1 document inserted");
	  		res.render('user/addproduct', { title: 'Product Management', username:userSession.username, products:result});
		}
		db.close();
	});
   
	 });
	});

	
module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

function notLoggedIn(req, res, next) {
	if (!req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

function isLoggedInOrder(req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	req.session.oldUrl = req.url;
	res.redirect('/user/signin');
}