const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  instagramUrl: {
    type: String,
    required: true
  },

  username: {
    type: String,
    required: true
  },

  bio: {
    type: String
  },

  website: {
    type: String
  },

  hasWebsite: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    default: "New"
  },

  lastContacted: {
    type: Date
  },

  nextFollowUp: {
    type: Date
  },

  notes: {
    type: String
  },
  websiteStatus: {
  type: String
},

websiteProblems: {
  type: [String],
  default: []
},
lastContacted: {
  type: Date
},

followUp1: {
  type: Date
},

followUp2: {
  type: Date
}
}
,{
  timestamps:true
});

module.exports = mongoose.model("Lead", leadSchema);