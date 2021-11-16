import "./App.css";
import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Heading,
  Spacer,
  Button,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  collection,
  doc,
  getDocs,
  increment,
  updateDoc,
} from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { db } from "./firebase";
import Leaderboard from "./Leaderboard";
import UpdateScoreContainer from "./UpdateScoreContainer";

function App() {
  const [admin, setAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [data, setData] = useState({});
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  const getFirestoreData = async () => {
    const querySnapshot = await getDocs(collection(db, "students"));
    let receivedData = {};
    querySnapshot.forEach((doc) => {
      const studentData = doc.data();
      receivedData = {
        ...receivedData,
        [studentData.name]: studentData.score,
      };
    });
    setData(receivedData);
  };

  auth.onAuthStateChanged((user) => {
    if (user) {
      setLoggedIn(true);
      auth.currentUser.getIdTokenResult().then((idTokenResult) => {
        setAdmin(idTokenResult.claims.admin);
      });
    } else {
      setLoggedIn(false);
      setAdmin(false);
    }
  });

  const openAuth = () => {
    signInWithPopup(auth, provider).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`${errorCode}: ${errorMessage}`);
    });
  };

  const logout = () => {
    auth.signOut().catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`${errorCode}: ${errorMessage}`);
    });
  };

  const dbIncrementScore = async (studentName, studentInc) => {
    const studentRef = doc(db, "students", studentName.toLowerCase());
    updateDoc(studentRef, {
      score: increment(studentInc),
    }).catch((err) => console.error(err));
  };

  const updateScore = (student, incScore) => {
    setData({
      ...data,
      [student]: data[student] + incScore,
    });
    dbIncrementScore(student, incScore);
  };

  useEffect(() => {
    getFirestoreData();
  }, []);

  return (
    <div className="App">
      <Flex className="navbar" p="1rem">
        <Box p="2">
          <Heading size="md">Informatics Leaderboard</Heading>
        </Box>
        <Spacer />
        <Box mr="0.2rem">
          {loggedIn ? (
            <Button colorScheme="teal" variant="ghost" onClick={logout}>
              Log out
            </Button>
          ) : (
            <Button colorScheme="teal" variant="ghost" onClick={openAuth}>
              Log in
            </Button>
          )}
        </Box>
        <Box>
          <IconButton
            aria-label="Toggle dark mode"
            variant="ghost"
            icon={colorMode === "light" ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
          />
        </Box>
      </Flex>
      <Flex
        className="appBody"
        margin="auto"
        maxW="700px"
        width="90%"
        textAlign="center"
        direction="column"
        alignItems="stretch"
      >
        {admin && (
          <>
            <UpdateScoreContainer
              data={data}
              updateScore={updateScore}
              students={Object.keys(data)}
            />
          </>
        )}
        <Flex justifyContent="center">
          <Heading as="h1" size="xl" mb="1rem" maxWidth="500px">
            Who is the informatics supreme leader at PLC?
          </Heading>
        </Flex>
        <Leaderboard data={data} />
      </Flex>
    </div>
  );
}

export default App;
