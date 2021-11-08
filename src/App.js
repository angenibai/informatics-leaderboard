import './App.css';
import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import Leaderboard from './Leaderboard';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [loginValid, setLoginValid] = useState(true);
  const handleLoginChange = e => setLoginInput(e.target.value);
  const [inputStudent, setInputStudent] = useState("");
  const [inputScore, setInputScore] = useState(10);
  const handleStudentChange = e => setInputStudent(e.target.value);
  const handleScoreChange = e => setInputScore(e.target.value);

  const [data, setData] = useState({
    "Fu": 120,
    "Noa": 100,
    "Steph": 100
  });
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
  }

  const logout = () => setLoggedIn(false);

  const submitUpdate = () => {
    setData({
      ...data,
      [inputStudent]: data[inputStudent] + parseInt(inputScore)
    });
    setInputStudent("");
    setInputScore(10);
  }

  return (
    <ChakraProvider>
      <div className="App">
        <Flex className="navbar">
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
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" onClick={submitLogin}>
                Log in
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {loggedIn && (
          <>
          <Heading as="h2" size="xl" mb="1rem">
            Update scores
          </Heading>
          <VStack
            className="updateScores"
            margin="auto"
            maxW="700px"
            width="90%"
            mb="2rem"            
          >
            <HStack spacing="10px">
              <Select
                placeholder="Select student"
                value={inputStudent}
                onChange={handleStudentChange}
              >
                {Object.keys(data).sort((a, b) => a > b).map((name,idx) => (
                  <option key={idx} value={name}>{name}</option>
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
            <Button
              colorScheme="teal"
              onClick={submitUpdate}
            >
              Update
            </Button>
          </VStack>
          </>
        )}
        <Heading as="h1" size="xl" mb="1rem">
          Leaderboard
        </Heading>
        <Leaderboard data={data} />
      </div>
    </ChakraProvider>
 );
}

export default App;
