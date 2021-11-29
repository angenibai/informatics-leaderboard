import { Flex, Box, Heading, Button } from "@chakra-ui/react";
import AlertBox from "../components/AlertBox";

interface HomeProps {
  loginCallback: () => void;
  loginError: string;
  clearLoginError: () => void;
}

const Home = (props: HomeProps) => {
  const { loginCallback, loginError, clearLoginError } = props;
 
  return (
    <Flex
      className="Home"
      flexDirection="column"
      justifyContent="center"
      height="60vh"
      minHeight="300px"
    >
      {loginError !== "" && (
        <AlertBox type="error" title="Error!" description={loginError} onClose={clearLoginError} />
      )}
      <Box>
        <Heading as="h1" size="3xl" mb={10}>
          Join the informatics leaderboard
        </Heading>
      </Box>
      <Box>
        <Button colorScheme="teal" size="lg" onClick={loginCallback}>
          Log in
        </Button>
      </Box>
    </Flex>
  );
};

export default Home;
