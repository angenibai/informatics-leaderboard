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
  VStack,
  Text,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { db } from "./firebase";
import Leaderboard from "./Leaderboard";
import SubmitToken from "./SubmitToken";

function App() {
  const [admin, setAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [data, setData] = useState([]);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  const getFirestoreData = async () => {
    const querySnapshot = await getDocs(collection(db, "students"));
    let receivedData = [];
    console.log(querySnapshot);
    querySnapshot.forEach((doc) => {
      const studentData = doc.data();
      receivedData = [...receivedData, studentData];
    });
    setData(receivedData);
  };

  const createUser = async (user) => {
    const userDoc = await getDoc(doc(db, "students", user.uid));
    if (!userDoc.exists()) {
      setDoc(doc(db, "students", user.uid), {
        id: user.uid,
        name: user.displayName,
        photoURL: user.photoURL,
        score: 0,
        solves: [],
      })
        .then(() => {
          console.log("set doc success");
          getFirestoreData();
        })
        .catch((err) => console.error(err));
    }
  };

  auth.onAuthStateChanged((user) => {
    if (user) {
      setLoggedIn(true);
      auth.currentUser.getIdTokenResult().then((idTokenResult) => {
        setAdmin(idTokenResult.claims.admin);
      });
      createUser(user);
      setLoggedInUsername(user.displayName);
    } else {
      setLoggedIn(false);
      setAdmin(false);
      setLoggedInUsername("");
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

  const updateLocalStudentData = (newStudentData) => {
    const newData = [];
    data.forEach((studentData) => {
      if (studentData.id === newStudentData.id) {
        newData.push(newStudentData);
      } else {
        newData.push(studentData);
      }
    });
    setData(newData);
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
        <Flex mr="1rem" alignItems="center">
          {loggedIn && <Text>Hello, {loggedInUsername}</Text>}
        </Flex>
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
      <VStack
        className="appBody"
        margin="auto"
        maxW="700px"
        width="90%"
        textAlign="center"
        alignItems="stretch"
        spacing={8}
      >
        {admin && (
          <>
            <Heading as="h1" size="l">
              You are an admin
            </Heading>
          </>
        )}
        {loggedIn && (
          <SubmitToken db={db} updateCallback={updateLocalStudentData} />
        )}
        <Flex justifyContent="center">
          <Heading as="h1" size="xl" mb="1rem" maxWidth="500px">
            Who is the informatics supreme leader at PLC?
          </Heading>
        </Flex>
        <Leaderboard data={data} />
      </VStack>
    </div>
  );
}

export default App;
