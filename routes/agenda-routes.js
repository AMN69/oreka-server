const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const User = require("../models/user");
const Agenda = require("../models/agenda");
const mongoose = require("mongoose");

// include CLOUDINARY:
const uploader = require("../configs/cloudinary-setup");

// HELPER FUNCTIONS
const {
    isLoggedIn,
    isNotLoggedIn,
    validationLoggin,
} = require("../helpers/middlewares");

//  GET '/agenda?year=YYYY&month=MM' (at url level it's /auth/signup because in app.js we've defined the route starting by /auth)

router.get("/agenda", isLoggedIn(), async (req, res, next) => {
    const userId = req.session.currentUser._id;
    const year = req.query.year;
    const month = req.query.month;

    try {
        let agendaYYYYMM = await Agenda.findOne(
            {userId: userId, 
            year: year, 
            month: month});
        res.status(200).json(agendaYYYYMM);
    } catch (error) {
        res.json(error);
    }
});

//  PUT '/usermodify (at url level it's /auth/usermodify because in app.js we've defined the route starting by /auth)

// I think is /usermodify w/o passing params (:id) because we pass values by body.
// Once the user has been modified the session user must be updated (check it).
router.put("/usermodify/:userId", isLoggedIn(), async (req, res, next) => {
    const userId = req.params.userId;
    const { username, usersurname, age, userImgUrl } = req.body;

    if (userId === req.session.currentUser._id) {
        try {
            let userUpdated = await User.findByIdAndUpdate(userId, { username, usersurname, age, userImgUrl })  
            req.session.currentUser = userUpdated;
            res.json({ message: `User with ${userId} has been updated successfully.` });
        } catch (error) {
            res.json(error);
        }
        return;
    } else {
        res.json({ message: `User with ${userId} NOT EQUAL session user logged ${req.session.currentUser._id}.` });
        return;
    }
});

// POST route => to create a new template

// When the user pushes the + icon an empty template appears with only month and year
// But we don't come here yet. We wait till the user puts all the info and/or decides
// to leave the screen and then we come here in create mode. So it's pending to 
// take from body ALL the fields.
router.post("/agendacreate/:userId", (req, res, next) => {
    Agenda.create({
        userId: req.params.userId,
        year: req.body.year,
        month: req.body.month,
        habits: [],
        skills: [],
        appointments: [],
        peopleToMeet: [],
        placesToVisit: [],
        finance: [[]],
        reward: "",
        insights: ""
    })
        .then(response => {
        res.json(response);
        })
        .catch(err => {
        res.json(err);
        });
        return;
    });

//// PUT route => to update a specific dashboard
router.patch('/agendamodify/:id/:field', (req, res, next)=>{

    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }
   console.log(req.body.agenda[1])
    Agenda.findByIdAndUpdate(req.params.id, {[req.params.field]: req.body.agenda}, {new: true})
      .then((response) => {
        console.log(response.finance[1])
        res.json({ message: `Dashboard ${req.params.id} has been updated successfully.` });
      })
      .catch(err => {
        res.json(err);
      });
    return;
});

// Uploads user photo to cloudinary.
router.post("/upload", uploader.single("userImgUrl"), (req, res, next) => {
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }
    // get secure_url from the file object and save it in the
    // variable 'secure_url', but this can be any name, just make sure you remember to use the same in frontend
    res.json({ secure_url: req.file.secure_url });
    return;
});
module.exports = router;
