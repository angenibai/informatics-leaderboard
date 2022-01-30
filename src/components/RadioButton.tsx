import { Box, useRadio, UseRadioProps } from "@chakra-ui/react";

interface CustomUseRadioProps extends UseRadioProps {
  children: React.ReactNode;
}

const RadioButton = (props: CustomUseRadioProps) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        _checked={{
          bg: "teal.500",
          color: "white",
        }}
        borderColor="gray.200"
        borderWidth="1px"
        fontSize="xs"
        fontWeight="semibold"
        minWidth={6}
        height={6}
        paddingInline={3}
        verticalAlign="middle"
        justifyContent="center"
        alignItems="center"
        display="inline-flex"
      >
        {props.children}
      </Box>
    </Box>
  );
};

export default RadioButton;
