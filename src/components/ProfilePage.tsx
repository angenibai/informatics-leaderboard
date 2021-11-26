import { Box, Heading } from "@chakra-ui/react";
import { DocumentData } from "@firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ProblemsProgress from "./ProblemsProgress";

interface ProfilePageProps {
  studentsData: DocumentData[];
  problemsData: DocumentData[];
}

const ProfilePage = (props: ProfilePageProps) => {
  const { studentId } = useParams();
  const { studentsData, problemsData } = props;
  const [thisStudent, setThisStudent] = useState<DocumentData>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const studentsFiltered = studentsData.filter(
      (student) => student.id === studentId
    );
    if (studentsFiltered.length !== 1) {
      setErrorMessage("Invalid link");
      return;
    }
    setThisStudent(studentsFiltered[0]);
  }, []);

  useEffect(() => {
    console.log("student has been set");
  }, [thisStudent])

  return (
    <Box className="ProfilePage">
      {errorMessage !== "" ? (
        <Heading>{errorMessage}</Heading>
      ) : (
        <>
          <Heading mb={4}>{thisStudent.name}</Heading>
          <ProblemsProgress
            student={thisStudent}
            problemsData={problemsData}
          />
        </>
      )}
    </Box>
  );
};

export default ProfilePage;
