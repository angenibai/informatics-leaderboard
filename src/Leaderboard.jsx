import React, { useEffect, useState } from "react";
import {
  VStack,
  StackDivider,
  Spacer,
  Flex,
  Box,
  Avatar,
} from "@chakra-ui/react";

const Leaderboard = (props) => {
  const { data } = props;
  const [sortedData, setSortedData] = useState([]);

  const createSortedData = (data) => {
    // data comes in as list of student objects
    const sortedData = [];
    data.forEach((x) => sortedData.push(x));
    sortedData.sort((a, b) => b.score - a.score);
    return sortedData;
  };

  useEffect(() => {
    setSortedData(createSortedData(data));
  }, [data]);

  return (
    <VStack divider={<StackDivider borderColor="gray.200" />} align="stretch">
      {sortedData.map((info, idx) => (
        <Flex key={idx} alignItems="center">
          <Box>
            <Avatar size="sm" name={info.name} src={info.photoURL} />
          </Box>
          <Box p="2">{info.name}</Box>
          <Spacer />
          <Box>{info.score}</Box>
        </Flex>
      ))}
    </VStack>
  );
};

export default Leaderboard;
