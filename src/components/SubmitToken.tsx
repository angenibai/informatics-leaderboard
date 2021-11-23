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
}

const SubmitToken = (props: SubmitTokenProps) => {
  const { db, updateCallback } = props;

  const [inputProblem, setInputProblem] = useState("");
  const [inputToken, setInputToken] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Please check that your problem number and token are correct"
  );
  const [tokenSuccess, setTokenSuccess] = useState(false);
  const handleProblemChange = (e: ChangeEvent<HTMLInputElement>) => setInputProblem(e.target.value);
  const handleTokenChange = (e: ChangeEvent<HTMLInputElement>) => setInputToken(e.target.value);

  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async () => {
    setTokenSuccess(false);

    if (!inputProblem || !inputToken) {
      // invalid input
      setTokenError(true);
      setErrorMessage("Inputs have not been filled");
      return;
    }

    let hash = sha256.create();
    hash.update(inputProblem);
    if (hash.hex() !== inputToken) {
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
    if (studentData.solves.includes(inputProblem)) {
      // question has already been answered
      setTokenError(true);
      setErrorMessage("You have already solved this problem");
      return;
    }

    updateDoc(studentRef, {
      ...studentData,
      solves: arrayUnion(inputProblem),
      score: increment(10),
    })
      .then(() => {
        // success
        setTokenError(false);
        setTokenSuccess(true);
        setInputProblem("");
        setInputToken("");
        updateCallback({
          ...studentData,
          solves: studentData.solves.push(inputProblem),
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
      borderRadius="base"
      borderWidth={1.5}
      borderColor="teal"
      padding={6}
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
      <Heading as="h1" size="xl" mb="1rem">
        Submit token
      </Heading>
      <VStack className="submitTokenForm">
        <Grid
          templateColumns="repeat(8, 1fr)"
          autoRows="auto"
          gap={4}
          textAlign="left"
          mb={2}
        >
          <GridItem colSpan={2} colStart={2}>
            <Text>Problem number</Text>
          </GridItem>
          <GridItem colSpan={4}>
            <Text>Token</Text>
          </GridItem>
          <>
            <GridItem colSpan={2} colStart={2}>
              <Input
                aria-label="Problem number input"
                placeholder="100"
                isRequired
                value={inputProblem}
                onChange={handleProblemChange}
              />
            </GridItem>
            <GridItem colSpan={4}>
              <Input
                aria-label="Token input"
                placeholder="275976081ce1abx67709eb3c388b5e14531022e5q137502e264776e1a6a11595"
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
