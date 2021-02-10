const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");
const User = require("../models/User");
const isAuthenticated = require("../middleware/isAuthenticated");
const cloudinary = require("cloudinary").v2;

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  console.log(req.fields);
  try {
    if (req.fields.title.length < 50) {
      if (req.fields.description.length < 500) {
        if (req.fields.price < 100000) {
          const newOffer = new Offer({
            product_name: req.fields.title,
            product_description: req.fields.description,
            product_price: req.fields.price,
            product_details: [
              { MARQUE: req.fields.brand },
              { TAILLE: req.fields.size },
              { ETAT: req.fields.condition },
              { COULEUR: req.fields.color },
              { VILLE: req.fields.location },
            ],
            owner: req.user,
          });
          if (req.files.picture) {
            const result = await cloudinary.uploader.upload(req.files.picture.path, {
              folder: `/vinted/offer/${newOffer._id}`,
            });
            newOffer.product_image = result;
          }
          await newOffer.save();
          res.status(200).json(newOffer);
        } else {
          res.status(400).json({ message: "Price must be lower than 100000" });
        }
      } else {
        res.status(400).json({ message: "Description must be lower than 500 characters" });
      }
    } else {
      res.status(400).json({ message: "Name must be lower than 50 characters" });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.put("/offer/modify", isAuthenticated, async (req, res) => {
  try {
    const offerToModify = await Offer.findById(req.query.id);
    if (offerToModify) {
      if (req.fields.title.length < 50) {
        if (req.fields.description.length < 500) {
          if (req.fields.price < 100000) {
            if (req.fields.title) {
              offerToModify.product_name = req.fields.title;
            }
            if (req.fields.description) {
              offerToModify.product_description = req.fields.description;
            }
            if (req.fields.price) {
              offerToModify.product_price = req.fields.price;
            }

            const details = offerToModify.product_details;
            for (i = 0; i < details.length; i++) {
              if (details[i].MARQUE) {
                if (req.fields.brand) {
                  details[i].MARQUE = req.fields.brand;
                }
              }
              if (details[i].TAILLE) {
                if (req.fields.size) {
                  details[i].TAILLE = req.fields.size;
                }
              }
              if (details[i].ÉTAT) {
                if (req.fields.condition) {
                  details[i].ÉTAT = req.fields.condition;
                }
              }
              if (details[i].COULEUR) {
                if (req.fields.color) {
                  details[i].COULEUR = req.fields.color;
                }
              }
              if (details[i].EMPLACEMENT) {
                if (req.fields.location) {
                  details[i].EMPLACEMENT = req.fields.location;
                }
              }
            }
            if (req.files.picture) {
              const result = await cloudinary.uploader.upload(req.files.picture.path, {
                folder: `/vinted/offer/${offerToModify._id}`,
              });
              offerToModify.product_image = result;
            }
            await offerToModify.save();
            res.status(200).json(await offerToModify.populate("owner", "account").execPopulate());
          } else {
            res.status(400).json({ message: "Price must be lower than 100000" });
          }
        } else {
          res.status(400).json({ message: "Description must be lower than 500 characters" });
        }
      } else {
        res.status(400).json({ message: "Name must be lower than 50 characters" });
      }
    } else {
      res.status(400).json({ message: "Invalid ID" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const temp = await Offer.findById(req.fields.id);
    await Offer.findByIdAndDelete(req.fields.id);
    if (temp) {
      await cloudinary.uploader.destroy(temp.product_image.public_id); // Must be improved to delete the empty folder in cloudinary
      res.status(200).json({ message: "This offer has been deleted" });
    } else {
      res.status(400).json({ message: "Invalid ID" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    let title = "";
    if (req.query.title) {
      title = new RegExp(req.query.title, "i");
    } else {
      title = /[a-zA-Z]/;
    }

    let priceMin = 0; // Might be improved with lowest product_price
    if (req.query.priceMin) {
      priceMin = req.query.priceMin;
    }

    let priceMax = 100000; // Might be improved with highest product_price
    if (req.query.priceMax) {
      priceMax = req.query.priceMax;
    }

    let sort = "";
    if (req.query.sort) {
      // Just keeping "asc" or "desc"
      sort = req.query.sort.substring(6);
    }

    let skip = 0;
    let limit = 5;
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }
    if (req.query.page) {
      skip = limit * Number(req.query.page) - limit;
    }

    const count = await Offer.countDocuments({ product_name: title, product_price: { $gte: priceMin, $lte: priceMax } });

    const offers = await Offer.find({ product_name: title, product_price: { $gte: priceMin, $lte: priceMax } })
      .sort({ product_price: sort })
      .skip(skip)
      .limit(limit);
    res.status(200).json({ number: count, offers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (offer) {
      res.status(200).json(offer);
    } else {
      res.status(400).json({ message: "Invalid ID" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
