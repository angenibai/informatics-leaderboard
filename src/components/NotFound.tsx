import { Box, Link, Heading } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const NotFound = () => {
  return (
    <Box className="NotFound">
      <Heading as="h1" size="4xl" mb={4} mt={4}>
        404
      </Heading>
      <Heading as="h3" size="md">
        {"Go "}
        <Link as={RouterLink} to="/" color="teal">
          home
        </Link>
      </Heading>
    </Box>
  );
};

export default NotFound;
