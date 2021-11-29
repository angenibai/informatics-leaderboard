import { Flex, Heading, Box } from "@chakra-ui/react";
import { Firestore } from "@firebase/firestore";
import Leaderboard from "../components/Leaderboard";

interface LeaderboardPageProps {
  db: Firestore;
}

const LeaderboardPage = (props: LeaderboardPageProps) => {
  const { db } = props;

  return (
    <Box className="LeaderboardPage" mb={8}>
      <Flex justifyContent="center">
        <Heading as="h1" size="xl" mb={4} maxWidth="500px">
          Who is the informatics master at PLC?
        </Heading>
      </Flex>
      <Leaderboard db={db} />
    </Box>
  );
};

export default LeaderboardPage;
