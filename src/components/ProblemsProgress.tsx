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
} from "@chakra-ui/react";
import { DocumentData } from "@firebase/firestore";
import { useEffect, useState } from "react";

interface ProblemsProgressProps {
  student: DocumentData;
  problemsData: DocumentData[];
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
  const { student, problemsData } = props;
  const onlyProblems = problemsData.filter((el) => el.type === "problem");
  const [accordionData, setAccordionData] = useState<levelSolveInfo[]>([]);

  const correctColor = useColorModeValue("teal.100", "teal.400");

  const createDataForAccordion = (
    student: DocumentData,
    onlyProblems: DocumentData[]
  ) => {
    onlyProblems.sort((a, b) => Number(a.problem) - Number(b.problem));
    const highestLevel = Math.floor(
      Number(onlyProblems[onlyProblems.length - 1].problem) / 100
    );
    const lowestLevel = Math.floor(Number(onlyProblems[0].problem) / 100);
    const accordionData: levelSolveInfo[] = [];
    for (let level = lowestLevel; level <= highestLevel; level++) {
      accordionData.push({
        level: `Level ${level}`,
        problems: [],
        solved: 0,
        solvedPercentage: 0,
      });
    }

    onlyProblems.forEach((problem) => {
      const level = Math.floor(Number(problem.problem) / 100);
      const solvesFiltered = student.solves.filter(
        (el: { id: string }) => el.id === problem.id
      );
      const solveStatus = solvesFiltered.length === 1;
      if (!accordionData[level - 1]) {
        return;
      }
      accordionData[level - 1]?.problems?.push({
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

  useEffect(() => {
    if (student.solves) {
      console.log(student.solves);
      setAccordionData(createDataForAccordion(student, onlyProblems));
    }
  }, [student]);

  return (
    <Box className="ProblemsProgress">
      <Accordion allowMultiple>
        {accordionData.map((levelData, levelIdx) => (
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
        ))}
      </Accordion>
    </Box>
  );
};

export default ProblemsProgress;
