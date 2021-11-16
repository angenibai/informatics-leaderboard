import React from "react";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spacer,
  CloseButton,
} from "@chakra-ui/react";

const AlertBox = (props) => {
  const { type, title, description, onClose } = props;

  return (
    <Alert status={type} mb={4}>
      <AlertIcon />
      <AlertTitle mr={2}>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <Spacer />
      <CloseButton onClick={onClose} />
    </Alert>
  );
};

export default AlertBox;
