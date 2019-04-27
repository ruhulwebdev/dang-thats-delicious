const mongoose = require("mongoose")
mongoose.Promise = global.Promise
const slug = require("slugs")

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: "You have to put a name!",
    trim: true,
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: [
      {
        type: Number,
        required: "You must supply coordinates!",
      },
    ],
    address: {
      type: String,
      required: "You must provide an address!",
    },
  },
  photo: {
    type: String,
    required: "Please provide an image for your store",
  },
})

schema.pre("save", function(next) {
  if (!this.isModified("name")) {
    return next()
  }

  this.slug = slug(this.name)
  next()
  // TODO: make more resiliant so slugs are more unique
})

module.exports = mongoose.model("Store", schema)
