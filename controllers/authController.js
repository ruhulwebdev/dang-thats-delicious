const passport = require("passport")
const mongoose = require("mongoose")
const crypto = require("crypto")
const promis = require("es6-promisify")
const mail = require("../handlers/mail")

const User = mongoose.model("User")

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  successFlash: "Successfully logged in",
  successRedirect: "/",
  failureFlash: "Failed Login",
})

exports.logout = (req, res) => {
  req.logout()
  req.flash("success", "You are now logged out!")
  res.redirect("/")
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash("error", "You must be logged in to access this page")
  res.redirect("/login")
}

// validate the token
exports.validateToken = async (req, res, next) => {
  const user = await User.findOne({
    resetToken: req.params.token,
    expireDate: {$gt: Date.now()},
  })

  if (!user) {
    req.flash("error", "Invalid or expired token")
    return res.redirect("/login")
  }

  // pass the user to the next middleware
  req.resetUser = user

  next()
}

exports.reset = (req, res) => res.render("reset", {title: "Update password"})

exports.update = async (req, res) => {
  req
    .checkBody("password-confirm", "Confirmed password cannot be blank")
    .notEmpty()
  req
    .checkBody("password-confirm", "Passwords do not match")
    .equals(req.body.password)

  const errors = req.validationErrors()

  if (errors) {
    req.flash("error", "Passwords do not match")
    res.redirect("back")
  }

  const user = req.resetUser

  const setPassword = promis(user.setPassword, user)
  await setPassword(req.body.password)

  user.resetToken = undefined
  user.expireDate = undefined
  const updatedUser = await user.save()
  req.login(updatedUser)

  req.flash("success", "Successfully updated your password")
  res.redirect("/")
}

// reset password workflow
exports.forgot = async (req, res) => {
  // does email exist
  const user = await User.findOne({email: req.body.email})
  if (!user) {
    req.flash("error", "There's no account associated with that email")
    return res.redirect("back")
  }
  // if so then create a token and expire date and save it to the user db
  user.resetToken = crypto.randomBytes(20).toString("hex")
  user.expireDate = Date.now() + 36000000
  await user.save()

  const resetURL = `http://${req.headers.host}/account/reset/${user.resetToken}`
  await mail.send({
    user,
    subject: "Reset your password",
    templateName: "password-reset",
    resetURL,
  })

  req.flash("success", `Please check your inbox for the password reset url!`)
  res.redirect("back")
}
