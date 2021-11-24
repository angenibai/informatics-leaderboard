import "./App.css";
import { useState, useEffect } from "react";
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalContent,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { db } from "./firebase";
import Leaderboard from "./components/Leaderboard";
import SubmitToken from "./components/SubmitToken";

function App() {
  const [admin, setAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState<string | null>("");
  const [studentsData, setStudentsData] = useState<DocumentData[]>([]);
  const [problemsData, setProblemsData] = useState<DocumentData[]>([]);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  const queryDbCollection = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return Array.from(querySnapshot.docs.map((el) => el.data()));
  };

  const getDbStudentData = async () => {
    const receivedData = await queryDbCollection("students");
    setStudentsData(receivedData);
  };

  const getDbProblemData = async () => {
    const receivedData = await queryDbCollection("problems");
    setProblemsData(receivedData);
  };

  const createUser = async (user: User) => {
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
          getDbStudentData();
        })
        .catch((err) => console.error(err));
    }
  };

  auth.onAuthStateChanged((user) => {
    if (user) {
      setLoggedIn(true);
      if (auth.currentUser) {
        auth.currentUser.getIdTokenResult().then((idTokenResult) => {
          setAdmin(idTokenResult.claims.admin as unknown as boolean);
        });
      }
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

  const updateLocalStudentData = (newStudentData: DocumentData) => {
    const newData: DocumentData[] = [];
    studentsData.forEach((studentData) => {
      if (studentData.id === newStudentData.id) {
        newData.push(newStudentData);
      } else {
        newData.push(studentData);
      }
    });
    setStudentsData(newData);
  };

  useEffect(() => {
    getDbStudentData();
    getDbProblemData();
    // eslint-disable-next-line
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div className="App">
      <Flex className="navbar" p={4}>
        <Box p="2">
          <Heading size="md">Informatics Leaderboard</Heading>
        </Box>
        <Spacer />
        <Flex mr={5} alignItems="center">
          {loggedIn && <Text>Hello, {loggedInUsername}</Text>}
        </Flex>
        {loggedIn && (
          <Box mr={1}>
            <Button colorScheme="teal" onClick={onOpen}>
              Submit token
            </Button>
          </Box>
        )}
        <Box mr={1}>
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
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <SubmitToken
              db={db}
              problemsData={problemsData}
              updateCallback={updateLocalStudentData}
              successCallback={onClose}
            />
          </ModalContent>
        </Modal>
        <Flex justifyContent="center">
          <Heading as="h1" size="xl" mb={4} maxWidth="500px">
            Who is the informatics supreme leader at PLC?
          </Heading>
        </Flex>
        <Leaderboard data={studentsData} />
      </VStack>
    </div>
  );
}

export default App;
