// @ts-ignore
import admin from "firebase-admin";
import { applicationDefault } from "firebase-admin/app";
import * as fs from "fs";
import * as crypto from "crypto";

const app = admin.initializeApp({
  credential: applicationDefault(),
  databaseURL: "https://informatics-leaderboard.firebaseio.com",
});

const db = admin.firestore();

interface Problem {
  id: string;
  name: string;
  problem: string;
  token: string;
  type: "problem";
  value: number;
}

interface Attendance {
  id: string;
  problem: string;
  token: string;
  type: "attendance";
  value: number;
  date: admin.firestore.Timestamp;
}

const createProblemToken = (hashData: string, problem: string) => {
  const hashed = crypto.createHash("sha1").update(hashData).digest("hex");
  const problemToken = `${problem}-${hashed.slice(0, 6)}`;
  return problemToken;
};

const loadExercises = (inFile: string) => {
  fs.readFile(inFile, "utf8", (err, data) => {
    if (err) {
      return console.error(err);
    }
    const lines = data.split("\n");
    lines.forEach((line) => {
      const matches = line.match(/(p[0-9]+) :: ([0-9]+) :: (.+)/);
      if (matches?.length !== 4) {
        return console.error(`Invalid line: ${line}`);
      }
      const id = matches[1];
      const problem = matches[2];
      const name = matches[3];

      const docRef = db.collection("problems").doc(id);
      const token = createProblemToken(id, problem);

      const newProblemData: Problem = {
        id,
        name,
        problem,
        token,
        type: "problem",
        value: 10,
      };

      docRef
        .set(newProblemData)
        .then((res) => console.log(`Added "${problem} - ${name}" to firestore`))
        .catch((err) => console.error(err));
    });
  });
};

/*
const insertExercise = (problem, name, value) => {};

const deleteExercise = (problem, name) => {};

const renameExercise = (problem, newName) => {};
*/

const zeroPad = (number: number) => {
  return `0${number}`.slice(-2);
};

const createTodaysToken = () => {
  const today = new Date();
  createAttendanceToken(today);
};

const createAttendanceToken = (date: Date) => {
  const problem = `${zeroPad(date.getDate())}${zeroPad(
    date.getMonth() + 1
  )}${zeroPad(date.getFullYear())}`;
  const id = `a${problem}`;
  const token = createProblemToken(id, problem);
  const newDocRef = db.collection("problems").doc(id);
  const newAttendanceData: Attendance = {
    id,
    problem,
    token,
    type: "attendance",
    value: 5,
    date: admin.firestore.Timestamp.fromDate(date),
  };
  newDocRef
    .set(newAttendanceData)
    .then((res) => {
      console.log(`Successfully created token: ${token}`);
    })
    .catch((err) => console.error(err));
};

// loadExercises("data/exercises.txt");
// createTodaysToken();
const main = () => {
  if (process.argv.length != 3) {
    console.log("Usage: ts-node updateExercises.ts <t|e>");
    console.log("\t t - create today's token");
    console.log("\t e - load exercises from data/exercises.txt");
    return;
  }
  const option = process.argv[2];
  switch (option) {
    case "t":
      createTodaysToken();
      break;
    case "e":
      loadExercises("data/exercises.txt");
      break;
    default:
      console.log("Unknown option");
      break;
  }
};

main();
