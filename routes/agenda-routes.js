const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const agenda = require("../models/agenda");

// POST route => to create a new template
router.post("/agenda/:userId", (req, res, next) => {
   
    Agenda.create({
        year: req.body.year,
        month: req.body.month,
        habits: [],
        skills: [],
        appointments: [],
        peopleToMeet: [],
        placesToVisit: [],
        finance: [[]],
        reward: req.body.reward,
        insights: req.body.insights
    })
        .then(response => {
        res.json(response);
        })
        .catch(err => {
        res.json(err);
        });
    });

//// PUT route => to update a specific dashboard

 router.put('/agenda/:year/:month', (req, res, next)=>{
    Agenda.findOne({year: req.params.year}, {month: req.params.month}, (err, Dashboard) => {
      console.log(Agenda.year.month)
      if (err) { return next(err); }
      res.render('agenda');
    });
  });


  router.put('/agendamodify/:id', (req, res, next)=>{

    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: 'Specified id is not valid' });
      return;
    }
  
    Project.findByIdAndUpdate(req.params.id, req.body)
      .then(() => {
        res.json({ message: `Project with ${req.params.id} is updated successfully.` });
      })
      .catch(err => {
        res.json(err);
      })
  })

    module.exports = router;