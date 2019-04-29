const mongoose = require("mongoose")
const User = mongoose.model("User")
const promis = require("es6-promisify")

exports.loginForm = (req, res) => {
  res.render("login.pug", {title: "Login"})
}

exports.registerForm = (req, res) => {
  res.render("register.pug", {title: "Register"})
}

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name")
  req.checkBody("name", "You must enter a name!").notEmpty()

  req.checkBody("email", "Please enter a valid email").isEmail()
  req.sanitizeBody("email").normalizeEmail({
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    remove_extension: false,
  })

  req.checkBody("password", "Password cannot be blank").notEmpty()
  req
    .checkBody("password-confirm", "Confirmed password cannot be blank")
    .notEmpty()
  req
    .checkBody("password-confirm", "Passwords do not match")
    .equals(req.body.password)

  const errors = req.validationErrors()

  if (errors) {
    req.flash("error", errors.map(err => err.msg))
    return res.render("register", {
      title: "Register",
      flashes: req.flash(),
      body: req.body,
    })
  }

  return next()
}

exports.register = async (req, res, next) => {
  const user = new User({name: req.body.name, email: req.body.email})
  const register = promis(User.register, User)
  await register(user, req.body.password)
  next()
}

exports.account = (req, res) => {
  res.render("account", {title: "Edit your account"})
}

exports.postAccount = async (req, res) => {
  const updatedInfo = {
    name: req.body.name,
    email: req.body.email,
  }

  const user = await User.findOneAndUpdate(
    {_id: req.user._id},
    {$set: updatedInfo},
    {new: true, runValidators: true, context: "query"},
  )

  req.flash("success", "Account updated!")
  res.redirect("back")
}
