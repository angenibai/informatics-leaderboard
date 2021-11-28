import { Flex, Box, Heading, Button } from "@chakra-ui/react";

const Home = () => {
 
  return (
    <Flex
      className="Home"
      flexDirection="column"
      justifyContent="center"
      height="60vh"
      minHeight="300px"
    >
      <Box>
        <Heading as="h1" size="3xl" mb={10}>
          Join the informatics leaderboard
        </Heading>
      </Box>
      <Box>
        <Button colorScheme="teal" size="lg">
          Log in
        </Button>
      </Box>
    </Flex>
  );
};

export default Home;
