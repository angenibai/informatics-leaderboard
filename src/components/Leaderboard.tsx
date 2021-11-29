import {
  VStack,
  StackDivider,
  Spacer,
  Flex,
  Box,
  Avatar,
  LinkBox,
  LinkOverlay,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { collection, DocumentData, Firestore } from "@firebase/firestore";
import { useFirestoreQueryData } from "@react-query-firebase/firestore";
import { Link } from "react-router-dom";

interface LeaderboardProps {
  db: Firestore;
}

const Leaderboard = (props: LeaderboardProps) => {
  const { db } = props;
  const highlightColor = useColorModeValue("teal.50", "teal.500");

  const studentsRef = collection(db, "students");
  const query = useFirestoreQueryData(["students"], studentsRef, {
    subscribe: true,
  });

  if (query.isLoading) {
    return (
      <Box>
        <Spinner mt={4} color="teal" />
      </Box>
    );
  }

  if (query.error || !query.data) {
    return (
      <Box>
        <Text>Error while loading</Text>
      </Box>
    );
  }

  const createSortedData = (data: DocumentData[]) => {
    const sortedData: DocumentData[] = [];
    data.forEach((x) => sortedData.push(x));
    sortedData.sort((a, b) => b.score - a.score);
    return sortedData;
  };

  return (
    <VStack divider={<StackDivider borderColor="gray.200" />} align="stretch">
      {createSortedData(query.data).map((info, idx) => (
        <LinkBox key={`student-${info.id}`}>
          <Flex
            alignItems="center"
            _hover={{ backgroundColor: highlightColor }}
            p={1}
            pl={4}
            pr={4}
          >
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
