import { Flex, Heading, Box } from "@chakra-ui/react";
import { DocumentData } from "@firebase/firestore";
import Leaderboard from "./Leaderboard";

interface LeaderboardPageProps {
  studentsData: DocumentData[];
}

const LeaderboardPage = () => {
  return (
    <Box className="LeaderboardPage">
      <Flex justifyContent="center">
        <Heading as="h1" size="xl" mb={4} maxWidth="500px">
          Who is the informatics master at PLC?
        </Heading>
      </Flex>
      <Leaderboard />
    </Box>
  );
};

export default LeaderboardPage;
