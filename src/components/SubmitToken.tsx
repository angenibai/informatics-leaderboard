import { ChangeEvent, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Input,
  Text,
  Button,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { getAuth } from "@firebase/auth";
import {
  arrayUnion,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  increment,
  updateDoc,
} from "@firebase/firestore";
import { sha256 } from "js-sha256";
import AlertBox from "./AlertBox";

interface SubmitTokenProps {
  db: Firestore;
  updateCallback: (newStudentData: DocumentData) => void;
  successCallback: () => void;
}

const SubmitToken = (props: SubmitTokenProps) => {
  const { db, updateCallback } = props;

  const [inputToken, setInputToken] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Please check that your problem number and token are correct"
  );
  const [tokenSuccess, setTokenSuccess] = useState(false);
  const handleTokenChange = (e: ChangeEvent<HTMLInputElement>) => setInputToken(e.target.value);

  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async () => {
    setTokenSuccess(false);

    if (!inputToken) {
      // invalid input
      setTokenError(true);
      setErrorMessage("Please enter a token");
      return;
    }

    const splitToken = inputToken.split("-");
    if (splitToken.length !== 2) {
      // not correct format
      setTokenError(true);
      setErrorMessage("Token is invalid");
      return;
    }

    const problem = splitToken[0];
    const problemHash = splitToken[1];

    let hash = sha256.create();
    hash.update(problem);
    if (hash.hex() !== problemHash) {
      // token isn't valid
      setTokenError(true);
      setErrorMessage("Token is invalid");
      return;
    }

    if (!user) {
      setTokenError(true);
      setErrorMessage("User error");
      return;
    }

    const studentRef = doc(db, "students", user.uid);
    const userDoc = await getDoc(studentRef);
    if (!userDoc.exists()) {
      // doc doesn't exist in firebase
      setTokenError(true);
      setErrorMessage("User doesn't exist in database");
      return;
    }
    const studentData = userDoc.data();
    if (studentData.solves.includes(problem)) {
      // question has already been answered
      setTokenError(true);
      setErrorMessage("You have already solved this problem");
      return;
    }

    updateDoc(studentRef, {
      ...studentData,
      solves: arrayUnion(problem),
      score: increment(10),
    })
      .then(() => {
        // success
        setTokenError(false);
        setTokenSuccess(true);
        setInputToken("");
        updateCallback({
          ...studentData,
          solves: studentData.solves.push(problem),
          score: studentData.score + 10,
        });
      })
      .catch((err) => {
        console.error(err);
        setTokenError(true);
      });
  };

  return (
    <Box
      className="SubmitToken"
      padding={6}
      textAlign="center"
    >
      {tokenError && (
        <AlertBox
          type="error"
          title="Error!"
          description={errorMessage}
          onClose={() => setTokenError(false)}
        />
      )}
      {tokenSuccess && (
        <AlertBox
          type="success"
          title="Yay!"
          description="You have earned 10 points"
          onClose={() => setTokenSuccess(false)}
        />
      )}
      <Heading as="h1" size="xl" mb={4}>
        Submit token
      </Heading>
      
      <VStack className="submitTokenForm">
        <Grid
          templateColumns="repeat(8, 1fr)"
          autoRows="auto"
          gap={2}
          textAlign="left"
          mb={3}
        >
          <GridItem colStart={2}>
            <Text>Token</Text>
          </GridItem>
          <>
            <GridItem colStart={2} colSpan={6}>
              <Input
                aria-label="Token input"
                placeholder="101-275976081ce1abx67709eb3c388b5e14531022e5q137502e264776e1a6a11595"
                isRequired
                value={inputToken}
                onChange={handleTokenChange}
              />
            </GridItem>
          </>
        </Grid>
        
        <Button colorScheme="teal" onClick={handleSubmit}>
          Submit
        </Button>
      </VStack>
    </Box>
  );
};

export default SubmitToken;
