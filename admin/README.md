# informatics-leaderboard admin instructions

## Set up

### Dependencies

In `informatics-leaderboard/` run `yarn` to install all dependencies.

If yarn isn't installed, install it using `npm i -g yarn`.

### Firebase credentials

1. Go to [Firebase Console](https://console.firebase.google.com/project/informatics-leaderboard)
2. Download a new private key from Project Settings > Service Accounts
3. Move the private key to the `data/` directory inside `admin/` (create directory if necessary)
4. Create a new file `setup.sh` in `data/` with the following code

```
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/admin/data/service-account-key.json"
```

Replace the path string with the actual path to the service account key that you just downloaded.

### Install ts-node

```
npm i -g ts-node
```

Installs ts-node globally

### Before running .ts files

```
source data/setup.sh
```

## `admin.ts`

Given a list of emails in `data/admin-emails.txt`, registers the emails as admin accounts for the leaderboard.

## `updateExercises.ts`

Usage: `ts-node updateExercises.ts <t|e>`

- t - create today's attendance token
- e - register exercises in data/exercises.txt to the database
