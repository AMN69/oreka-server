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

    console.log("req.query:", req.query);
    console.log("userId: ", userId);

    try {
        let agendaYYYYMM = await Agenda.findOne(
            {userId: userId, 
            year: year, 
            month: month});
        res.status(200).json(agendaYYYYMM);
        console.log("AGENDA on backend is: ", agendaYYYYMM);
    } catch (error) {
        res.json(error);
    }
});

//  PUT '/usermodify (at url level it's /auth/usermodify because in app.js we've defined the route starting by /auth)

// I think is /usermodify w/o passing params (:id) because we pass values by body.
// Once the user has been modified the session user must be updated (check it).
router.put("/usermodify/:userId", isLoggedIn(), async (req, res, next) => {
    console.log("on /usermodify");
    const userId = req.params.userId;
    const { username, usersurname, age, userImgUrl } = req.body;

    console.log("userId:", userId);

    if (userId === req.session.currentUser._id) {
        try {
            console.log("on try to update user");
            let userUpdated = await User.findByIdAndUpdate(userId, { username, usersurname, age, userImgUrl })  
            console.log("userUpdated:", userUpdated);
            console.log("req.session.currentUser before update:", req.session.currentUser);
            req.session.currentUser = userUpdated;
            console.log("req.session.currentUser after update:", req.session.currentUser);
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
    console.log("Entering on the create route");
    console.log("req.body.appointments:", req.body)
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
    console.log("Agenda on back just before updating: ", req.body);
    console.log("Params.id: ", req.params.id);
    Agenda.findByIdAndUpdate(req.params.id, {[req.params.field]: req.body.agenda}, {new: true})
      .then((response) => {
        console.log("response: ", response);
        res.json({ message: `Dashboard ${req.params.id} has been updated successfully.` });
      })
      .catch(err => {
        res.json(err);
      });
    return;
});

// Uploads user photo to cloudinary.
router.post("/upload", uploader.single("userImgUrl"), (req, res, next) => {

    console.log('file is: ', req.file)
  
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }
    // get secure_url from the file object and save it in the
    // variable 'secure_url', but this can be any name, just make sure you remember to use the same in frontend
    res.json({ secure_url: req.file.secure_url });
    console.log('url: ', req.file.secure_url);
    return;
});
module.exports = router;
