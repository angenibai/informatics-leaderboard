import "./App.css";
import { useState } from "react";
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
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { db } from "./firebase";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import SubmitToken from "./components/SubmitToken";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotFound from "./components/NotFound";
import Home from "./pages/Home";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const queryClient = new QueryClient();

  const createUser = async (user: User) => {
    getDoc(doc(db, "students", user.uid))
      .then((userDoc) => {
        setLoginError("");
        if (!userDoc.exists()) {
          setDoc(doc(db, "students", user.uid), {
            id: user.uid,
            name: user.displayName,
            photoURL: user.photoURL,
            score: 0,
            solves: [],
          }).catch((err) => {
            console.error(err);
          });
        }
      })
      .catch((err) => {
        auth.signOut();
        setLoginError("Please use your PLC email");
      });
  };

  const clearLoginError = () => {
    setLoginError("");
  };

  const navigate = useNavigate();

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
    auth
      .signOut()
      .then((res) => navigate("/"))
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`);
      });
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
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
            <SubmitToken db={db} successCallback={onClose} />
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
            <Route
              path="/"
              element={
                auth.currentUser ? (
                  <LeaderboardPage db={db} />
                ) : (
                  <Home
                    loginCallback={openAuth}
                    loginError={loginError}
                    clearLoginError={clearLoginError}
                  />
                )
              }
            />
            <Route
              path="/leaderboard"
              element={
                auth.currentUser ? (
                  <LeaderboardPage db={db} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/profile/:studentId"
              element={
                auth.currentUser ? <ProfilePage db={db} /> : <Navigate to="/" />
              }
            />
          </Routes>
        </VStack>
      </div>
    </QueryClientProvider>
  );
}

export default App;
