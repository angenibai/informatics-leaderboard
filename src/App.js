import "./App.css";
import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Flex,
  Box,
  Heading,
  Spacer,
  Button,
  Select,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { collection, doc, getDocs, increment, updateDoc } from 'firebase/firestore';
import { GithubAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { db } from './firebase';
import Leaderboard from "./Leaderboard";

function App() {
  const [admin, setAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [inputStudent, setInputStudent] = useState("");
  const [inputScore, setInputScore] = useState(10);
  const handleStudentChange = (e) => setInputStudent(e.target.value);
  const handleScoreChange = (e) => setInputScore(e);
  const [data, setData] = useState({});
  const provider = new GithubAuthProvider();
  const auth = getAuth();

  const getFirestoreData = async () => {
    const querySnapshot = await getDocs(collection(db, "students"));
    let receivedData = {};
    querySnapshot.forEach(doc => {
      const studentData = doc.data();
      receivedData = {
        ...receivedData,
        [studentData.name]: studentData.score,
      };
    });
    setData(receivedData);
  };

  auth.onAuthStateChanged(user => {
    if (user) {
      setLoggedIn(true);
      auth.currentUser.getIdTokenResult()
        .then(idTokenResult => {
          setAdmin(idTokenResult.claims.admin);
        });
    } else {
      setLoggedIn(false);
      setAdmin(false);
    }
  });

  const openAuth = () => {
    signInWithPopup(auth, provider)
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`);
      });
  }

  const logout = () => {
    auth.signOut()
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`);
      });
  }

  const submitUpdate = () => {
    if (inputStudent && inputScore) {
      setData({
        ...data,
        [inputStudent]: data[inputStudent] + parseInt(inputScore),
      });
      setInputStudent("");
      setInputScore(10);
      updateFirestore(inputStudent, inputScore);
    }
  };

  const updateFirestore = async (studentName, studentInc) => {
    const studentRef = doc(db, "students", studentName.toLowerCase());
    updateDoc(studentRef, {
      score: increment(studentInc)
    })
    .catch(err => console.error(err));
  };

  useEffect(() => {
    getFirestoreData();
  }, []);

  return (
    <ChakraProvider>
      <div className="App">
        <Flex className="navbar" p="1rem">
          <Box p="2">
            <Heading size="md">Informatics Leaderboard</Heading>
          </Box>
          <Spacer />
          <Box>
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
              <Heading as="h2" size="xl" mb="1rem">
                Update scores
              </Heading>
              <VStack className="updateScores" mb="3rem">
                <HStack spacing="10px">
                  <Select
                    placeholder="Select student"
                    value={inputStudent}
                    onChange={handleStudentChange}
                  >
                    {Object.keys(data)
                      .sort((a, b) => a > b)
                      .map((name, idx) => (
                        <option key={idx} value={name}>
                          {name}
                        </option>
                      ))}
                  </Select>
                  <Spacer />
                  <NumberInput
                    defaultValue={10}
                    value={inputScore}
                    onChange={handleScoreChange}
                  >
                    <NumberInputField />
                  </NumberInput>
                </HStack>
                <Button colorScheme="teal" onClick={submitUpdate}>
                  Update
                </Button>
              </VStack>
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
    </ChakraProvider>
  );
}

export default App;
