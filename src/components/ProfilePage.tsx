import { Box, Heading } from "@chakra-ui/react";
import { query, collection, where, limit } from "@firebase/firestore";
import { useFirestoreQuery } from "@react-query-firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../firebase";
import ProblemsProgress from "./ProblemsProgress";

const ProfilePage = () => {
  // just checks if student exists
  const [errorMessage, setErrorMessage] = useState("");
  const { studentId = "" } = useParams();
  if (!studentId) {
    setErrorMessage("Invalid id");
  }

  const studentRef = query(
    collection(db, "students"),
    where("id", "==", studentId),
    limit(1)
  );

  const nameQuery = useFirestoreQuery(
    ["students", studentId],
    studentRef,
    { subscribe: true },
    {
      select(snapshot) {
        if (snapshot.empty) {
          return null;
        }
        return snapshot.docs[0].data().name;
      },
    }
  );

  useEffect(() => {
    if (nameQuery.isError) {
      setErrorMessage("Invalid link");
    }
  }, [nameQuery]);

  return (
    <Box className="ProfilePage">
      {errorMessage !== "" ? (
        <Heading>{errorMessage}</Heading>
      ) : (
        <>
          <Heading mb={4}>{nameQuery.data}</Heading>
          <ProblemsProgress studentId={studentId} />
        </>
      )}
    </Box>
  );
};

export default ProfilePage;
