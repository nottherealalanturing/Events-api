const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const logger = require("../utils/logger");
usersRouter.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: `Welcome to our event management system! ${user.name}`,
      text: "Thank you for registering. We hope you enjoy using our platform.",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error(error);
      } else {
        logger.info("Email sent: " + info.response);
      }
    });

    res.status(201).send({ user });
  } catch (error) {
    res.status(400).send(error);
  }
});

usersRouter.post("/login", async (req, res) => {
  const user = await User.findByUser(req.body.email, req.body.password);
  const token = await user.generateAuthToken();
  res.send({ user, token });
});

usersRouter.post("/logout", async (req, res) => {
  req.user.tokens = req.user.tokens.filter((token) => {
    return token.token !== req.token;
  });
  await req.user.save();
  res.send();
});
