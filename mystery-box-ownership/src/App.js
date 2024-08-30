import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Image,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';

const MysteryBoxComponent = () => {
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8090/api/collections/mystery_boxes/records')
      .then(response => {
        setMysteryBoxes(response.data.items);
        setLoading(false);
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
        setLoading(false);
      });
  }, []);

  return (
    <ChakraProvider>
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h1" size="xl" mb={6}>
          Mystery Boxes
        </Heading>
        {loading ? (
          <Spinner size="xl" />
        ) : (
          <VStack spacing={8}>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Question</Th>
                    <Th>Answer</Th>
                    <Th>Rarity</Th>
                    <Th>Image</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mysteryBoxes.map(box => (
                    <Tr key={box.id}>
                      <Td>{box.title}</Td>
                      <Td>{box.question}</Td>
                      <Td>{box.answer}</Td>
                      <Td>{box.rarity}</Td>
                      <Td>
                        <Image src={box.image} alt={box.title} boxSize="50px" />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            {mysteryBoxes.length === 0 && (
              <Text>No mystery boxes found.</Text>
            )}
          </VStack>
        )}
      </Box>
    </ChakraProvider>
  );
};

export default MysteryBoxComponent;
