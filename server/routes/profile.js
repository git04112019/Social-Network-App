const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Profile = require("../models/profileModel");
const { validationResult, check } = require("express-validator");
const User = require("../models/userModel");

//Get User Profile
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

//Create User Profile
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
//Get all profiles
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//Get Profile by User id
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

//updating user experience field
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("company", "Company is required")
        .not()
        .isEmpty(),
      check("from", "From Date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors:errors.array()})
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body
    
    const newExp ={
      title,
      company,
      location,
      from,
      to,
      current,
      description
    }
    try {
      const profile = await Profile.findOne({user:req.user.id})
      profile.experience.unshift(newExp);
      await profile.save()

      res.json(profile)
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error")
    }
  }
);

//Delete profile user and posts
router.delete("/", auth, async (req, res) => {
  try {
    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //remove user
    await User.findByIdAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//Delete experience
router.delete('/experience/:exp_id',auth,async(req,res)=>{
try {
  const profile = await Profile.findOne({user:req.user.id})

  //Get remove index
  const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
  profile.experience.splice(removeIndex,1);

  await profile.save()
  res.json(profile)

} catch (err) {
  console.error(err.message);
  res.status(500).send("Server Error")
}
})

//Educactional Experience
//updating user education field
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required")
        .not()
        .isEmpty(),
      check("degree", "degree required")
        .not()
        .isEmpty(),
        check("fieldofstudy", "Field of study required")
        .not()
        .isEmpty(),
      check("from", "From Date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors:errors.array()})
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body
    
    const newEdu ={
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    }
    try {
      const profile = await Profile.findOne({user:req.user.id})
      profile.education.unshift(newEdu);
      await profile.save()

      res.json(profile)
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error")
    }
  }
);

//Delete education
router.delete('/education/:edu_id',auth,async(req,res)=>{
  try {
    const profile = await Profile.findOne({user:req.user.id})
  
    //Get remove index
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)
    profile.education.splice(removeIndex,1);
  
    await profile.save()
    res.json(profile)
  
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
  })
  

module.exports = router;
