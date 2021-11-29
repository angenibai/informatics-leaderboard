import React, { ChangeEvent, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Input,
  Text,
  Button,
  Grid,
  GridItem,
  Spinner,
} from "@chakra-ui/react";
import { getAuth } from "@firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  Firestore,
  getDoc,
  increment,
  Timestamp,
  updateDoc,
} from "@firebase/firestore";
import AlertBox from "./AlertBox";
import { useFirestoreQueryData } from "@react-query-firebase/firestore";

interface SubmitTokenProps {
  db: Firestore;
  successCallback: () => void;
}

const SubmitToken = (props: SubmitTokenProps) => {
  const { db } = props;

  const [inputToken, setInputToken] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Please check that your problem number and token are correct"
  );
  const [tokenSuccess, setTokenSuccess] = useState(false);
  const handleTokenChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInputToken(e.target.value);
  const [pointsEarned, setPointsEarned] = useState(10);

  const auth = getAuth();
  const user = auth.currentUser;

  const problemsRef = collection(db, "problems");
  const problemsQuery = useFirestoreQueryData(["allProblems"], problemsRef);
  if (problemsQuery.isLoading) {
    return (
      <Box className="SubmitToken" padding={6} textAlign="center">
        <Spinner colorScheme="teal" />
      </Box>
    );
  }

  if (problemsQuery.error) {
    return (
      <Box className="SubmitToken" padding={6} textAlign="center">
        <Text>Error loading problems</Text>
      </Box>
    );
  }

  const validateToken = async () => {
    let returnVals = {
      studentRef: null,
      studentDoc: null,
      problemDoc: null,
    };

    if (!problemsQuery.data) {
      setTokenError(true);
      setErrorMessage("Problem data still loading");
      return returnVals;
    }

    if (!inputToken) {
      // invalid input
      setTokenError(true);
      setErrorMessage("Please enter a token");
      return returnVals;
    }

    const splitToken = inputToken.split("-");
    if (splitToken.length !== 2) {
      // not correct format
      setTokenError(true);
      setErrorMessage("Token is invalid");
      return returnVals;
    }

    const problem = splitToken[0];

    if (!user) {
      setTokenError(true);
      setErrorMessage("User error");
      return returnVals;
    }

    const studentRef = doc(db, "students", user.uid);
    const userDoc = await getDoc(studentRef);
    if (!userDoc.exists()) {
      // doc doesn't exist in firebase
      setTokenError(true);
      setErrorMessage("User doesn't exist in database");
      return returnVals;
    }

    // get problem id
    const problemDocs = problemsQuery.data.filter(
      (el) => el.problem === problem
    );
    if (problemDocs.length !== 1) {
      // either no or more than one matching problem
      setTokenError(true);
      setErrorMessage("Problem doesn't exist in database");
      return returnVals;
    }
    const problemDoc = problemDocs[0];

    // validate token
    if (problemDoc.token !== inputToken) {
      setTokenError(true);
      setErrorMessage("Token is invalid");
      return returnVals;
    }

    const studentDoc = userDoc.data();
    if (
      studentDoc.solves.filter((el: { id: any }) => el.id === problemDoc.id)
        .length > 0
    ) {
      // question has already been answered
      setTokenError(true);
      setErrorMessage("You have already solved this problem");
      return returnVals;
    }

    return { studentRef, studentDoc, problemDoc };
  };

  const handleSubmit = async () => {
    setTokenSuccess(false);

    const { studentRef, studentDoc, problemDoc } = await validateToken();

    if (studentRef && studentDoc && problemDoc) {
      const newSolve = {
        id: problemDoc.id,
        submittedTime: Timestamp.now(),
      };
      updateDoc(studentRef, {
        ...studentDoc,
        solves: arrayUnion(newSolve),
        score: increment(problemDoc.value),
      })
        .then(() => {
          // success
          setPointsEarned(problemDoc.value);
          setTokenError(false);
          setTokenSuccess(true);
          setInputToken("");
        })
        .catch((err) => {
          console.error(err);
          setTokenError(true);
        });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      handleSubmit();
    }
  };

  return (
    <Box className="SubmitToken" padding={6} textAlign="center">
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
          description={`You have earned ${pointsEarned} points`}
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
                placeholder="101-2a75e9"
                isRequired
                value={inputToken}
                onChange={handleTokenChange}
                onKeyDown={handleKeyDown}
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
