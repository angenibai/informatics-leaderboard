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
    // data comes in as dictionary in format name: score
    const sortedData = [];
    for (const [name, score] of Object.entries(data)) {
      sortedData.push({ name, score });
    }
    sortedData.sort((a, b) => b.score - a.score);
    console.log(sortedData);
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
            <Avatar size="sm" name={info.name} />
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
