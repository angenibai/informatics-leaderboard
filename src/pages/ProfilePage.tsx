import { Box, Heading, Avatar } from "@chakra-ui/react";
import { query, collection, where, limit } from "@firebase/firestore";
import { useFirestoreQuery } from "@react-query-firebase/firestore";
import { useParams } from "react-router";
import { db } from "../firebase";
import ProblemsProgress from "../components/ProblemsProgress";

const ProfilePage = () => {
  // just checks if student exists
  const { studentId = "notastudent" } = useParams();
  const studentRef = query(
    collection(db, "students"),
    where("id", "==", studentId),
    limit(1)
  );

  const studentQuery = useFirestoreQuery(
    ["students", studentId],
    studentRef,
    { subscribe: true },
    {
      select(snapshot) {
        if (snapshot.empty) {
          return null;
        }
        return snapshot.docs[0].data();
      },
    }
  );

  if (studentQuery.isError || !studentQuery.data) {
    return (
      <Box className="ProfilePage">
        <Heading as="h1" size="md">
          Student not found
        </Heading>
      </Box>
    );
  }

  return (
    <Box className="ProfilePage">
      <Avatar
        size="xl"
        mb={4}
        name={studentQuery.data.name}
        src={studentQuery.data.photoURL}
      />
      <Heading mb={4}>{studentQuery.data.name}</Heading>
      <ProblemsProgress studentId={studentId} />
    </Box>
  );
};

export default ProfilePage;
