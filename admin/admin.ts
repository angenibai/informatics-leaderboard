// @ts-ignore
import admin from "firebase-admin";
import { applicationDefault } from "firebase-admin/app";
import * as fs from "fs";

const app = admin.initializeApp({
  credential: applicationDefault(),
  databaseURL: "https://informatics-leaderboard.firebaseio.com",
});

const checkClaims = () => {
  admin
    .auth()
    .listUsers(100)
    .then((allUsers) => {
      allUsers.users.forEach((userRecord) => {
        if (userRecord.customClaims) {
          console.log(
            `${userRecord.email} => admin: ${userRecord.customClaims.admin}`
          );
        }
      });
    });
};

const getEmails = async (filepath: string) => {
  const data = fs.readFileSync(filepath, "utf8");
  return data.split("\n").map((s) => s.replace(/\s/g, ""));
};

const grantAdminRoles = async (emails: string[]) => {
  Promise.all(emails.map((email) => admin.auth().getUserByEmail(email))).then(
    (userRecords) => {
      userRecords.forEach((userRecord) => {
        if (userRecord.customClaims && userRecord.customClaims.admin) {
          return;
        }
        admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
      });
    }
  );
};

getEmails("data/admin-emails.txt")
  .then((emails) => {
    grantAdminRoles(emails).then(() => checkClaims());
  })
  .catch((err) => console.log("error opening file"));
