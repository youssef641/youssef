const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const UserSchema = new Schema({
  sass: {
    type: String,
    required: true
  },
  cin: {
    type: String,
    required: true
  },
  prenom :{
    type: String,
    required: true
  },
  nom :{
    type: String,
    required: true
  },
  departement :{
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  datedebut: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model("users", UserSchema);
