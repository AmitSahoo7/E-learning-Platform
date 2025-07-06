import Webinar from '../models/Webinar.js';
import Announcement from '../models/Announcement.js';
import path from 'path';

// CREATE Webinar
export async function createWebinar(req, res) {
  try {
    const { date, topic, time, instructors, description, objectives, notes } = req.body;
    let document = null;
    if (req.file) {
      document = req.file.filename;
    }
    const webinar = await Webinar.create({
      date,
      topic,
      time,
      instructors: Array.isArray(instructors) ? instructors : [instructors],
      description,
      objectives,
      notes,
      document
    });
    // Create announcement for all users
    if (req.user && req.user._id) {
      await Announcement.create({
        message: `New Webinar: '${topic}' on ${date} at ${time}. Don't miss it!`,
        createdBy: req.user._id
      });
    }
    res.status(201).json({ success: true, webinar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET all webinars
export async function getWebinars(req, res) {
  try {
    const webinars = await Webinar.find().sort({ date: -1 });
    res.json({ success: true, webinars });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// UPDATE Webinar
export async function updateWebinar(req, res) {
  try {
    const { id } = req.params;
    const { date, topic, time, instructors, description, objectives, notes } = req.body;
    let updateData = { date, topic, time, instructors, description, objectives, notes };
    if (req.file) {
      updateData.document = req.file.filename;
    }
    if (instructors && !Array.isArray(instructors)) {
      updateData.instructors = [instructors];
    }
    const webinar = await Webinar.findByIdAndUpdate(id, updateData, { new: true });
    if (!webinar) return res.status(404).json({ success: false, error: 'Webinar not found' });
    // Create announcement for webinar update
    if (req.user && req.user._id) {
      await Announcement.create({
        message: `Webinar Updated: '${topic}' now scheduled for ${date} at ${time}. Check the latest details!`,
        createdBy: req.user._id
      });
    }
    res.json({ success: true, webinar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// DELETE Webinar
export async function deleteWebinar(req, res) {
  try {
    const { id } = req.params;
    const webinar = await Webinar.findByIdAndDelete(id);
    if (!webinar) return res.status(404).json({ success: false, error: 'Webinar not found' });
    res.json({ success: true, message: 'Webinar deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
} 