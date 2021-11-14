import "./App.css";
import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Flex,
  Box,
  Heading,
  Spacer,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { collection, doc, getDocs, increment, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import Leaderboard from "./Leaderboard";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [loginValid, setLoginValid] = useState(true);
  const handleLoginChange = (e) => setLoginInput(e.target.value);
  const [inputStudent, setInputStudent] = useState("");
  const [inputScore, setInputScore] = useState(10);
  const handleStudentChange = (e) => setInputStudent(e.target.value);
  const handleScoreChange = (e) => setInputScore(e);
  const [data, setData] = useState({});

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

  const { isOpen, onOpen, onClose } = useDisclosure();

  const submitLogin = () => {
    if (loginInput === "yeet") {
      setLoginValid(true);
      setLoggedIn(true);
      setLoginInput("");
      onClose();
    } else {
      setLoginValid(false);
    }
  };

  const logout = () => setLoggedIn(false);

  const submitUpdate = () => {
    if (inputStudent) {
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
              <Button colorScheme="teal" variant="ghost" onClick={onOpen}>
                Log in
              </Button>
            )}
          </Box>
        </Flex>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Admin access</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                value={loginInput}
                onChange={handleLoginChange}
                placeholder="Admin code"
                errorBorderColor="red.300"
                isRequired
                isInvalid={!loginValid}
                type="password"
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" onClick={submitLogin}>
                Log in
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Flex
          className="appBody"
          margin="auto"
          maxW="700px"
          width="90%"
          textAlign="center"
          direction="column"
          alignItems="stretch"
        >
          {loggedIn && (
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
