const express = require("express");
const router = express.Router({mergeParams: true}); // merge params from campground and comments together
const Campground = require("../models/campgrounds"),
	  Comment = require("../models/comment");
const middleware = require("../middleware") // if require directory automatically includes items of index.js


//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
	// find campground by id
	Campground.findById(req.params.id, function(err, campground){
		if (err){
			console.log(err);
		}
		else {
			res.render("comments/new", {campground: campground});
		}
	});
});

// Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
		   req.flash("error", "Campground not found.");
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
			   req.flash("error", "Something went wrong.");
               console.log(err);
           } else {
			   //add username and id to comment
			   comment.author.id = req.user._id;
			   comment.author.username = req.user.username;
			   //save comment
			   comment.save();
			    //create new comment
   				//connect new comment to campground
   				//redirect campground show page
               campground.comments.push(comment);
               campground.save();
			   req.flash("success", "Successfully added comment.");
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

//edit comment route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if (err || !foundCampground){
			req.flash("error", "Campground not found.");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if (err) {
				res.redirect("back");
			}
			else { 
				res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
			}
		});
	});	
});

//update comment route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if (err) {
			req.flash("error", "Comment not updated.");
			res.redirect("back");
		}
		else {
			req.flash("success", "Successfully updated comment.");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//destroy comment route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err, foundComment){
		if (err) {
			req.flash("error", "Comment not deleted.");
			res.redirect("back");
		}
		else {
			req.flash("error", "Successfully deleted comment.");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;