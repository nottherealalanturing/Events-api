const eventsRouter = require("express").Router();
const Event = require("../models/event");
const logger = require("../utils/logger");

("/events");

eventsRouter.post("/", async (req, res) => {
  const event = new Event(req.body);
  await event.save();

  const attendees = event.attendees.map((attendee) => attendee.email);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: attendees,
    subject: "New event created!",
    text: `A new event called "${event.name}" has been created.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  res.status(201).send({ event });
});

eventsRouter.get("/", async (req, res) => {
  const events = await Event.find({});
  res.send(events);
});

eventsRouter.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).send();
  }
  res.send(event);
});

eventsRouter.patch("/:id", async (req, res) => {
  const eventId = req.params.id;
  const updates = req.body;
  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $set: updates },
    { new: true }
  );
  res.send(updatedEvent);
});

eventsRouter.delete("/:id", async (req, res) => {
  const eventId = req.params.id;
  const deletedEvent = await Event.findByIdAndDelete(eventId);
  res.json(deletedEvent);
});

eventsRouter.post("/:id/attendees", async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).send();
  }

  const { name, email } = req.body;

  event.attendees.push({ name, email, attendeeId: event.attendees.length + 1 });

  await event.save();
  await attendee.sendEmail(
    `Dear ${name}, you have been added to this event ${event.name} taking place on ${event.date}`
  );

  res.status(201).send(attendee);
});

eventsRouter.put("/:eventId/attendees/:attendeeId", async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return res.status(404).send();
  }
  const { name, email } = req.params.body;

  const eventId = req.params.eventId;
  const attendeeId = req.params.attendeeId;

  await Event.updateOne(
    { _id: eventId, "attendees.attendeeId": attendeeId },
    { $set: { "attendees.$.name": name, "attendees.$.email": email } }
  );

  const attendee = event.attendees.filter(
    (attendee) => attendee.id === req.params.attendeeId
  );
  await attendee.sendEmail("updated", event.name);

  res.send({ attendeeId, name, email });
});

eventsRouter.delete("/:eventId/attendees/:attendeeId", async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return res.status(404).send();
  }

  const eventId = req.params.eventId;
  const attendeeId = req.params.attendeeId;

  await Event.updateOne(
    { _id: eventId },
    { $pull: { attendees: { attendeeId: attendeeId } } }
  );

  res.send();
});

eventsRouter.get("/:id/report", async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).send();
  }

  const attendeeCount = event.attendees.length;

  const report = `${event.name} event, scheduled for ${event.date} at ${event.location} will be attended by ${attendeeCount}`;

  res.send(report);
});
