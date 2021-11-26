import { Flex, Heading, Box } from "@chakra-ui/react";
import { DocumentData } from "@firebase/firestore";
import Leaderboard from "./Leaderboard";

interface LeaderboardPageProps {
  studentsData: DocumentData[];
}

const LeaderboardPage = (props: LeaderboardPageProps) => {
  const { studentsData } = props;
  return (
    <Box className="LeaderboardPage">
      <Flex justifyContent="center">
        <Heading as="h1" size="xl" mb={4} maxWidth="500px">
          Who is the informatics supreme leader at PLC?
        </Heading>
      </Flex>
      <Leaderboard data={studentsData} />
    </Box>
  );
};

export default LeaderboardPage;
