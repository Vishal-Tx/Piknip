const User = require("../models/user");
const passport = require("passport");
const PicnicSpot = require("../models/picnicspot")
const Review = require("../models/review")

const { cloudinary } = require("../cloudinary");
const picnicspot = require("../models/picnicspot");

exports.renderRegister = (req, res) => {
  res.render("users/register");
};

exports.register = async (req, res) => {
  const { email, username, password, firstname, lastname, avatar, } = req.body;

  console.log('req.body', req.body);
  console.log('req.file', req.file)


  const user = new User({ email, username, firstname, lastname, avatar });

  if (!req.file) {
    user.avatar = {
      url: 'https://res.cloudinary.com/dzmbgzot8/image/upload/v1657975309/Piknip/UserAvatar/wjvywrescb3inqwvcmdn.png',
      filename: 'Piknip/UserAvatar/wjvywrescb3inqwvcmdn',
    }
  }
  else {
    const { path, filename } = req.file;
    user.avatar = {
      url: path,
      filename: filename,
    }
  }


  // console.log("user.avatar*/*/*/*", user.avatar)
  const registeredUser = User.register(user, password, (err, user) => {
    if (err) {
      req.flash("error", `${err.message}.`);
      res.redirect("/register");
    } else if (user) {
      passport.authenticate("local")(req, res, () => {
        req.flash("success", "Welcome to Piknip!");
        res.redirect("/picnicspots");
      });
    }
  });
  //   console.log(registeredUser);
};

exports.renderLogin = (req, res) => {
  // console.log("req.session.returnTo{101}", req.session);
  res.render("users/login");
};

exports.login = (req, res) => {
  req.flash("success", "Welcome Back!");
  // console.log("req.session.returnTo{102}", req.session);
  const redirectUrl = req.session.returnTo || "/picnicspots";
  // console.log("redirectUrl", redirectUrl);

  res.redirect(redirectUrl);
  delete req.session.returnTo;
};

exports.logout = (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);
    req.flash("success", "good Bye!!!");
    res.redirect("/picnicspots");
  });
};


exports.renderProfile = async (req, res) => {
  // console.log('req.params', req.params);
  const userProfile = await User.findById(req.params.id);
  if (!userProfile) {
    req.flash("error", "Cannot find the User")
    return res.redirect("/picnicspots")
  }
  // const picnicspots = PicnicSpot.find().where("author").equals(userProfile._id);
  // console.log('picnicspots/*/*/*/', picnicspots)
  PicnicSpot.find().where('author').equals(userProfile._id).exec((err, picnicspots) => {
    if (err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }

    // console.log('user@@@@', userProfile)
    res.render("users/profile", { user: userProfile, picnicspots })

  })

  // for(picnicspot of picnicspots){
  //   console.log('picnicspot/*/*/*/', picnicspot.title);
  // }

}


exports.updateProfile = async (req, res) => {
  // console.log("req.parama", req.params)
  // console.log('req.body', req.body);
  // console.log('req.file', req.file);

  // const {path, filename} = req.file;
  if (req.body.filename) {
    await cloudinary.uploader.destroy(req.body.filename);
    const userProfile = await User.findById(req.params.id);

    // console.log("userProfile/*/*/*", userProfile)

    await userProfile.updateOne({ $unset: { avatar: { filename: { $in: req.body.filename } } } })

    await userProfile.updateOne({
      $set: {
        firstname: req.body.firstname,
        lastname: req.body.lastname
      }
    })

    userProfile.avatar = {
      url: req.file.path,
      filename: req.file.filename,
    }
    await userProfile.save();
    req.flash("success", "Sucessfully updated Avatar!.")
    res.redirect(`/users/${userProfile._id}`);
  }
  else {
    req.flash("error", "Something went wrong.")
    res.redirect(`/users/${userProfile._id}`);
  }
}

exports.deleteProfile = async (req, res) => {
  const { id } = req.params;
  // const user = await User.findByIdAndDelete(id);
  // cloudinary.uploader.destroy(user.avatar.filename);
  const user = await User.findById(id);
  PicnicSpot.find().where('author').equals(user._id).exec((err, picnicspots) => {
    if (err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }

    // console.log("picnicspotsImagePerDelete2334456", picnicspots)
    for (let picnic of picnicspots) {
      console.log("picloop", picnic);
      // for (let image of picnic.images) {
      //   console.log("imagefilename/**", image.filename)
      //   cloudinary.uploader.destroy(image.filename);
      // }
       
      
      
    }

    
  })

  Review.find().where('author').equals(user._id).exec((err, reviews) => {
        if (err) {
          req.flash("error", "Something went wrong.");
          return res.redirect("/");
        }
        
        console.log("ReviewPerDelete2334456", reviews)
        for (review of reviews){
          console.log('review/********//**//* */ */', review)
          PicnicSpot.find().where('_id').equals(review.picnicspot).exec((err, pics)=>{
            
            for(pic of pics){
              console.log('pic43634634', pic)
              pic.updateOne({$pull: { reviews: { _id: review._id  } } })
            }

            
          })
          
          // 

        }
      })
      
  

 




  // PicnicSpot.deleteMany().where('author').equals(user._id).exec((err, picnicspots)=> {
  //   if(err) {
  //     req.flash("error", "Something went wrong.");
  //     return res.redirect("/");
  //   }

  //   console.log('picnicspots$$$$$$$$$$$fordelete', picnicspots)
  // })

  req.flash("success", `Sucessfully deleted the User Profile.`)
  res.redirect("/picnicspots");
}