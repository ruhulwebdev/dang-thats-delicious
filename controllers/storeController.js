const mongoose = require("mongoose")
const Store = mongoose.model("Store")
const multer = require("multer")
const jimp = require("jimp")
const uuid = require("uuid")

exports.homepage = (req, res) => {
  res.render("index")
}

exports.createStore = (req, res) => {
  res.render("edit", {title: "Add store"})
}

// upload logic
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/")
    if (isPhoto) return next(null, true)
    return next({message: `That file type isn't supported`}, false)
  },
}

exports.upload = multer(multerOptions).single("photo")

exports.resize = async (req, res, next) => {
  if (!req.file) return next()

  const extension = req.file.mimetype.split("/")[1]
  req.body.photo = `${uuid.v4()}.${extension}`

  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./public/uploads/${req.body.photo}`)

  next()
}

exports.addStore = async (req, res) => {
  req.body.author = req.user._id
  const store = await new Store(req.body).save()
  req.flash(
    "success",
    `Successfully created ${store.name}. Care to leave a review?`,
  )
  res.redirect(`/store/${store.slug}`)
}

exports.getStores = async (req, res) => {
  const stores = await Store.find()
  res.render("stores", {title: "Stores", stores})
}

const isOwner = (author, user) => {
  if (!author.equals(user._id)) throw new Error("You are not the owner!")
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({_id: req.params.id}).populate("author")
  isOwner(store.author._id, req.user)
  res.render("edit", {title: `Edit ${store.name}`, store})
}

exports.updateStore = async (req, res) => {
  // set the location type to point so that findoneandupdate doesn't replace that
  req.body.location.type = "Point"
  // find and update the store
  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true,
    runValidators: true,
  }).exec()
  // show a really good flash message
  req.flash(
    "success",
    `${store.name} updated succesfully! <a href="/stores/${
      store.slug
    }">See store</a>`,
  )
  // redirect to the same route
  res.redirect(`/store/${store._id}/edit`)
}

// get a single store
exports.getStore = async (req, res) => {
  const store = await Store.findOne({slug: req.params.slug})
  res.render("singleStore", {store, title: store.name})
}

exports.getTags = async (req, res) => {
  const tag = req.params.tag
  const tagsQuery = Store.getTagsGroup()
  const storesQuery = Store.find({tags: tag || {$exists: true}})
  const [tags, stores] = await Promise.all([tagsQuery, storesQuery])
  res.render("tag", {title: "Tags", tags, tag, stores})
}

//////////////////////////////////////////////////
// API
/////////////////////////////////////////////////
exports.searchStores = async (req, res) => {
  // find the stores
  const stores = await Store.find(
    {
      $text: {
        $search: req.query.q,
      },
    },
    {
      score: {$meta: "textScore"},
    },
  )
    .sort({
      score: {$meta: "textScore"},
    })
    .limit(5)

  res.json(stores)
}
