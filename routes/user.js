const express = require("express");
const router = express.Router();
const User = require("../models/User");
const OfferCreate = require("../models/Offer");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

router.post("/user/signup", async (req, res) => {
    try {
        const checkEmail = await User.findOne({ email: req.fields.email });
        if (!checkEmail) {
            if (req.fields.username && req.fields.email && req.fields.password) {
                const salt = uid2(64);
                const hash = SHA256(req.fields.password + salt).toString(encBase64);
                const token = uid2(64);
                const newUser = new User({
                    email: req.fields.email,
                    account: {
                        username: req.fields.username,
                        phone: req.fields.phone,
                    },
                    token: token,
                    hash: hash,
                    salt: salt,
                });
                if (req.files.picture) {
                    console.log("ok");
                    const result = await cloudinary.uploader.upload(req.files.picture.path, { folder: `/vinted/user/${newUser._id}` });
                    newUser.account.avatar = result;
                }
                await newUser.save();
                res.status(200).json({
                    _id: newUser._id,
                    token: newUser.token,
                    account: {
                        username: newUser.account.username,
                        phone: newUser.account.phone,
                        avatar: newUser.account.avatar,
                    },
                });
            } else {
                res.status(400).json({ message: "Username missing" });
            }
        } else {
            res.status(400).json({ message: "This email already exists" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/user/login", async (req, res) => {
    try {
        const userToCheck = await User.findOne({ email: req.fields.email });
        const newHash = SHA256(req.fields.password + userToCheck.salt).toString(encBase64);
        if (newHash === userToCheck.hash) {
            res.status(200).json({
                _id: userToCheck._id,
                token: userToCheck.token,
                account: userToCheck.account,
            });
        } else {
            res.status(401).json({ message: "Unhautorized" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
