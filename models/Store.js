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
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: "You have to pass an author",
    ref: "User",
  },
})

schema.index({
  title: "text",
  description: "text",
})

schema.pre("save", async function(next) {
  if (!this.isModified("name")) return next()

  this.slug = slug(this.name)

  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*)?)$`, "i")
  const sameSlug = await this.constructor.find({slug: slugRegex})
  if (sameSlug.length) this.slug = `${this.slug}-${sameSlug.length + 1}`

  next()
})

schema.statics.getTagsGroup = function() {
  return this.aggregate([
    {$unwind: "$tags"},
    {$group: {_id: "$tags", count: {$sum: 1}}},
    {$sort: {count: -1}},
  ])
}

module.exports = mongoose.model("Store", schema)
