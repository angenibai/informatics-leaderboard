# informatics-leaderboard admin instructions

## Set up

### Firebase credentials

1. Go to [Firebase Console](https://console.firebase.google.com/project/informatics-leaderboard)
2. Download a new private key from Project Settings > Service Accounts
3. Move the private key to the `data/` directory inside `admin/` (create directory if necessary)
4. Create a new file `setup.sh` with the following code

```
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/admin/data/service-account-key.json"
```

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

Two functions:

- `loadExercises()` - run to register exercises in `data/exercises.txt` in the database
- `createTodaysToken()` - run to create today's attendance token

TODO: implement CLI or command line arguments to run either function
