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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalContent,
  Avatar,
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
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import SubmitToken from "./components/SubmitToken";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotFound from "./components/NotFound";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [studentsData, setStudentsData] = useState<DocumentData[]>([]);
  const [problemsData, setProblemsData] = useState<DocumentData[]>([]);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const queryClient = new QueryClient();

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
      createUser(user);
    } else {
      setLoggedIn(false);
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
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Router>
          <Flex className="navbar" p={4}>
            <Box p="2">
              <RouterLink to="/">
                <Heading size="md">Informatics Leaderboard</Heading>
              </RouterLink>
            </Box>
            <Spacer />
            {loggedIn && (
              <>
                <Flex mr={4} flexDirection="column" justifyContent="center">
                  <RouterLink to={`/profile/${auth.currentUser?.uid}`}>
                    <Avatar
                      size="sm"
                      name={auth.currentUser?.displayName || ""}
                      src={auth.currentUser?.photoURL || ""}
                    />
                  </RouterLink>
                </Flex>
                <Box mr={1}>
                  <Button colorScheme="teal" onClick={onOpen}>
                    Submit token
                  </Button>
                </Box>
              </>
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
          <VStack
            className="appBody"
            margin="auto"
            maxW="700px"
            width="90%"
            textAlign="center"
            alignItems="stretch"
            spacing={8}
          >
            <Routes>
              <Route path="*" element={<NotFound />} />
              <Route path="/" element={<LeaderboardPage />} />
              <Route path="/profile/:studentId" element={<ProfilePage />} />
            </Routes>
          </VStack>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
