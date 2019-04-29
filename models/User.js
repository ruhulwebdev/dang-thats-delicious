const mongoose = require("mongoose")
const passportLocal = require("passport-local-mongoose")
const errorHandler = require("mongoose-mongodb-errors")
const validator = require("validator")
const md5 = require("md5")

const UserScema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: "You have to enter a valid email",
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address"],
  },
  resetToken: String,
  expireDate: Date,
})

UserScema.virtual("gravatar").get(function() {
  const hash = md5(this.email)
  return `https://gravatar.com/avatar/${hash}?s=200`
})

UserScema.plugin(passportLocal, {usernameField: "email"})
UserScema.plugin(errorHandler)

module.exports = mongoose.model("User", UserScema)
