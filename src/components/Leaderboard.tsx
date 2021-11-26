import { useEffect, useState } from "react";
import {
  VStack,
  StackDivider,
  Spacer,
  Flex,
  Box,
  Avatar,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { DocumentData } from "@firebase/firestore";
import { Link } from "react-router-dom";

interface LeaderboardProps {
  data: DocumentData[];
}

const Leaderboard = (props: LeaderboardProps) => {
  const { data } = props;
  const [sortedData, setSortedData] = useState<DocumentData[]>([]);

  const createSortedData = (data: DocumentData[]) => {
    // data comes in as list of student objects
    const sortedData: DocumentData[] = [];
    data.forEach((x) => sortedData.push(x));
    sortedData.sort((a, b) => b.score - a.score);
    return sortedData;
  };

  useEffect(() => {
    setSortedData(createSortedData(data));
    console.log(sortedData);
  }, [data]);

  return (
    <VStack divider={<StackDivider borderColor="gray.200" />} align="stretch">
      {sortedData.map((info, idx) => (
        <LinkBox key={idx}>
          <Flex alignItems="center">
            <Box>
              <Avatar size="sm" name={info.name} src={info.photoURL} />
            </Box>
            <LinkOverlay as={Link} to={`/profile/${info.id}`}>
              <Box p="2">{info.name}</Box>
            </LinkOverlay>
            <Spacer />
            <Box>{info.score}</Box>
          </Flex>
        </LinkBox>
      ))}
    </VStack>
  );
};

export default Leaderboard;
