const express = require("express");
const router = express.Router();
const Campground = require("../models/campgrounds");
const middleware = require("../middleware") // if require directory automatically includes items of index.js

// INDEX - show all campgrounds
router.get("/", function(req, res){
	
	//get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds){
		if (err){
			console.log(err);
		}
		else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
});
 
// CREATE - add new campground to database
router.post("/", middleware.isLoggedIn, function(req, res) {
	//get data from form & add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var price = req.body.price;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {
		name: name,
		image: image,
		price: price,
		author: author,
		description: description
	};
	// create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if (err) {
			console.log(err);
		} else {
			//redirect to campgrounds page
			console.log(newlyCreated);
			res.redirect("/campgrounds");
		}
	});
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new.ejs");
});


// SHOW - shows more info about one campground
// needs to go after new bc anything can be put in place of id

router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found.");
			return res.redirect("back");
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// edit campground router
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
		// shouldnt get error up to this point bc middleware uses findById
	});
});

// update campground router
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	//find and update correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if (err) {
			req.flash("error", "Campground not updated.");
			res.redirect("/campgrounds");
		}
		else {
			req.flash("success", "Successfully updated campground.");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
	//redirect somewhere (show page)
});

// delete route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err, foundCampground){
		if (err){
			req.flash("error", "Campground not removed.");
			res.redirect("/campgrounds");
		}
		else {
			req.flash("success", "Successfully deleted campground.");
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;