import React, { useState } from "react";
import {
  Heading,
  Spacer,
  Button,
  Select,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
} from "@chakra-ui/react";

const UpdateScoreContainer = (props) => {
  const { students, updateScore } = props;

  const [inputStudent, setInputStudent] = useState("");
  const [inputScore, setInputScore] = useState(10);
  const handleStudentChange = (e) => setInputStudent(e.target.value);
  const handleScoreChange = (e) => setInputScore(e);

  const submitUpdate = () => {
    if (inputStudent && inputScore) {
      updateScore(inputStudent, parseInt(inputScore));
      setInputStudent("");
      setInputScore(10);
    }
  };

  return (
    <>
    <Heading as="h2" size="xl" mb="1rem">
      Update scores
    </Heading>
    <VStack className="updateScores" mb="3rem">
      <HStack spacing="10px">
        <Select
          placeholder="Select student"
          value={inputStudent}
          onChange={handleStudentChange}
        >
          {students
            .sort((a, b) => a > b)
            .map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
        </Select>
        <Spacer />
        <NumberInput
          defaultValue={10}
          value={inputScore}
          onChange={handleScoreChange}
        >
          <NumberInputField />
        </NumberInput>
      </HStack>
      <Button colorScheme="teal" onClick={submitUpdate}>
        Update
      </Button>
    </VStack>
  </>
  )
}

export default UpdateScoreContainer;