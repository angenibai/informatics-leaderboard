import {
  Box,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Spinner,
  Text,
  Heading,
} from "@chakra-ui/react";
import {
  collection,
  DocumentData,
  query,
  where,
  limit,
  Firestore,
} from "@firebase/firestore";
import {
  useFirestoreQuery,
  useFirestoreQueryData,
} from "@react-query-firebase/firestore";

interface ProblemsProgressProps {
  studentId: string;
  db: Firestore;
}

interface problemSolveInfo {
  problem: string;
  name: string;
  status: boolean;
}

interface levelSolveInfo {
  level: string;
  problems: problemSolveInfo[];
  solved: number;
  solvedPercentage: number;
}

const ProblemsProgress = (props: ProblemsProgressProps) => {
  const { studentId, db } = props;
  const correctColor = useColorModeValue("teal.100", "teal.400");

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

  const problemsRef = query(
    collection(db, "problems"),
    where("type", "==", "problem")
  );
  const problemsQuery = useFirestoreQueryData(["problems"], problemsRef, {
    subscribe: true,
  });

  const createDataForAccordion = (
    student: DocumentData | null,
    onlyProblems: DocumentData[] | null
  ) => {
    if (!student || !onlyProblems) {
      return [];
    }
    const sortedProblems = [...onlyProblems];
    sortedProblems.sort((a, b) => Number(a.problem) - Number(b.problem));

    // set up all levels
    const highestLevel = Math.floor(
      Number(sortedProblems[sortedProblems.length - 1].problem) / 100
    );
    const lowestLevel = Math.floor(Number(sortedProblems[0].problem) / 100);
    const accordionData: levelSolveInfo[] = [];
    for (let level = lowestLevel; level <= highestLevel; level++) {
      accordionData.push({
        level: `Level ${level}`,
        problems: [],
        solved: 0,
        solvedPercentage: 0,
      });
    }

    // add details for each problem
    sortedProblems.forEach((problem) => {
      const level = Math.floor(Number(problem.problem) / 100);
      const solvesFiltered = student.solves.filter(
        (el: { id: string }) => el.id === problem.id
      );
      const solveStatus = solvesFiltered.length === 1;
      if (!accordionData[level - 1]) {
        return;
      }
      accordionData[level - 1].problems.push({
        problem: problem.problem,
        name: problem.name,
        status: solveStatus,
      });
      if (solveStatus) {
        accordionData[level - 1].solved += 1;
      }
      accordionData[level - 1].solvedPercentage =
        (accordionData[level - 1].solved /
          accordionData[level - 1].problems.length) *
        100;
    });
    return accordionData;
  };

  if (studentQuery.isError || problemsQuery.isError) {
    return (
      <Box>
        <Text>Error while loading profile</Text>
      </Box>
    );
  }

  return (
    <Box className="ProblemsProgress">
      <Heading textAlign="left" as="h3" size="lg" mb={4}>
        Progress
      </Heading>
      {studentQuery.isLoading ||
      problemsQuery.isLoading ||
      !studentQuery.data ||
      !problemsQuery.data ? (
        <Spinner mt={4} color="teal" />
      ) : (
        <Accordion allowMultiple>
          {createDataForAccordion(studentQuery.data, problemsQuery.data).map(
            (levelData, levelIdx) => (
              <AccordionItem key={`Level${levelIdx + 1}`}>
                <AccordionButton>
                  <Box flex={1} textAlign="left">
                    {levelData.level}
                  </Box>
                  <Box>{Math.round(levelData.solvedPercentage)}%</Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Number</Th>
                        <Th>Name</Th>
                        <Th>Complete?</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {levelData.problems.map((problemInfo, problemIdx) => (
                        <Tr
                          key={`Level${levelIdx}-${problemIdx}`}
                          backgroundColor={
                            problemInfo.status ? correctColor : "default"
                          }
                        >
                          <Td>{problemInfo.problem}</Td>
                          <Td>{problemInfo.name}</Td>
                          <Td>{problemInfo.status ? "Yes" : "No"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </AccordionPanel>
              </AccordionItem>
            )
          )}
        </Accordion>
      )}
    </Box>
  );
};

export default ProblemsProgress;
