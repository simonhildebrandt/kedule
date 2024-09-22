/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from 'firebase-admin/storage';

import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

import build from './build.js';

initializeApp();


async function buildCalendar() {
  const bucket = getStorage().bucket();
  const file = bucket.file('calendars-calendar.ical');
  const content = await build();
  await file.save(content);
  await file.makePublic();
  return file;
}

const updateCalendar = onRequest(async (req, res) => {
  const file = await buildCalendar();
  const isPublic = await file.isPublic();
  res.json({
    success: true,
    isPublic,
    url: file.publicUrl()
  });
});

const scheduleCalendar = onSchedule("every day 00:00", async (event) => {
  await buildCalendar();
});

export {
  updateCalendar,
  scheduleCalendar
};
