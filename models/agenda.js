const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agendaSchema = new Schema({
    userId:{type: Schema.Types.ObjectId, ref:'user'},
    year: Number,
    month: Number,
    habits: [
        {
        habitToDoDesc: String,
        habitDoneTick: {type: Boolean, default: false}
         }
    ],
    skills: [{
        skillToDoDesc: String,
        skillDoneTick: Boolean
    }],
    appointments: [{
        appointmentDesc: String,
        appointmentTick: Boolean
    }],
    peopleToMeet: [{
        personToMeetDesc: String,
        personToMeetTick: Boolean
    }],
    placesToVisit: [{
        placeToVisitDesc: String,
        placeToVisitTick: Boolean
    }],
    finance: [
        [
              {
              incomeDesc: String,
              incomeAmount: Number
              }   
        ],
        [
        {
              expenseDesc: String,
              expenseAmount: Number
              }  
        ]
    ],
    reward: String,
    insights: String
});

const Agenda = mongoose.model('Agenda', agendaSchema);
module.exports = Agenda;