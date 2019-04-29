const nodemailer = require("nodemailer")
const pug = require("pug")
const promisify = require("es6-promisify")
const htmltotext = require("html-to-text")

var transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

const renderPug = (filename, options) => {
  return pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options)
}

exports.send = async opts => {
  const html = renderPug(opts.templateName, opts)
  const text = htmltotext.fromString(html)

  const mailOptions = {
    from: "Ruhul Amin <noreply@ruhulamin.com",
    to: opts.user.email,
    subject: opts.subject,
    html,
    text,
  }

  const sendMail = promisify(transport.sendMail, transport)
  return sendMail(mailOptions)
}
