const express = require("express"),
	  app = express(),
	  bodyParser = require("body-parser"),
	  mongoose  = require("mongoose"),
	  passport = require("passport"),
	  flash = require("connect-flash"),
	  LocalStrategy = require("passport-local"),
	  methodOverride = require("method-override"),
	  passportLocalMongoose = require("passport-local-mongoose"),
	  Campground = require("./models/campgrounds"),
	  Comment = require("./models/comment"),
	  User = require("./models/user"),
	  seedDB = require("./seeds");

// requiring routes
const commentRoutes = require("./routes/comments"), 
	  campgroundRoutes = require("./routes/campgrounds"),
	  indexRoutes = require("./routes/index");

mongoose.connect('mongodb://localhost:27017/yelp_camp', { // portnumber mongod running on
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(flash());
// seedDB(); // seed the DB

//PASSPORT CONFIG
app.use(require("express-session")({
	secret: "Once Again Rusty wins cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){ // <-- this function is called on every single route (app.use)
	res.locals.currentUser = req.user; // <-- whatever in locals is available in local templates 
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes); //<-- appends /campgrounds to all our campground routes in beginning

app.listen(3000, function() { 
  console.log('YelpCamp Server has started on port 3000'); 
});