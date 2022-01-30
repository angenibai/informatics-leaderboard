import { Box, Heading, Avatar } from "@chakra-ui/react";
import {
  query,
  collection,
  where,
  limit,
  Firestore,
} from "@firebase/firestore";
import { useFirestoreQuery } from "@react-query-firebase/firestore";
import { useParams } from "react-router";
import ProblemsProgress from "../components/ProblemsProgress";
import ProgressChart from "../components/ProgressChart";

interface ProfilePageProps {
  db: Firestore;
}

const ProfilePage = (props: ProfilePageProps) => {
  const { db } = props;
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

  if (studentQuery.isError) {
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
        name={studentQuery?.data?.name}
        src={studentQuery?.data?.photoURL}
      />
      <Heading mb={4}>{studentQuery?.data?.name}</Heading>
      <ProgressChart studentId={studentId} db={db} />
      <ProblemsProgress studentId={studentId} db={db} />
    </Box>
  );
};

export default ProfilePage;
