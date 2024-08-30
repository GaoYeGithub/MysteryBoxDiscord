import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Heading,
  VStack,
  Grid,
  GridItem,
  Spinner,
  Image,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Button,
  useColorModeValue,
  useColorMode,
  Flex,
  Input,
  Select,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import axios from 'axios';

const MysteryBoxComponent = () => {
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const { colorMode, toggleColorMode } = useColorMode();

  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const cardBgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchMysteryBoxes();
  }, []);

  const fetchMysteryBoxes = async () => {
    try {
      const response = await axios.get('http://localhost:8090/api/collections/mystery_boxes/records');
      setMysteryBoxes(response.data.items);
      setLoading(false);
    } catch (error) {
      console.error("There was an error fetching the data!", error);
      setLoading(false);
    }
  };

  const handleBoxClick = (box) => {
    setSelectedBox(box);
    onOpen();
  };

  const filteredBoxes = mysteryBoxes.filter(box => 
    box.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (rarityFilter === '' || box.rarity === rarityFilter)
  );

  const rarityColors = {
    Common: 'gray',
    Uncommon: 'green',
    Rare: 'blue',
    Epic: 'purple',
    Legendary: 'orange',
  };

  return (
    <ChakraProvider>
      <Box minH="100vh" bg={bgColor} py={10} px={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading as="h1" size="xl">
            Mystery Boxes
          </Heading>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </Flex>

        <Flex mb={6} gap={4}>
          <Input
            placeholder="Search boxes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width="300px"
          />
          <Select
            placeholder="Filter by rarity"
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            width="200px"
          >
            <option value="">All Rarities</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
          </Select>
          <Button leftIcon={<SearchIcon />} onClick={() => {}}>
            Search
          </Button>
        </Flex>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
            {filteredBoxes.map(box => (
              <GridItem key={box.id}>
                <Box
                  bg={cardBgColor}
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="md"
                  transition="all 0.3s"
                  _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }}
                  cursor="pointer"
                  onClick={() => handleBoxClick(box)}
                >
                  <Image
                    src={box.image}
                    alt={box.title}
                    h="200px"
                    w="100%"
                    objectFit="cover"
                  />
                  <Box p={4}>
                    <Heading as="h3" size="md" mb={2}>
                      {box.title}
                    </Heading>
                    <Badge colorScheme={rarityColors[box.rarity]} mb={2}>
                      {box.rarity}
                    </Badge>
                    <Text noOfLines={2}>{box.description}</Text>
                  </Box>
                </Box>
              </GridItem>
            ))}
          </Grid>
        )}

        {filteredBoxes.length === 0 && (
          <Text mt={4} fontSize="lg" textAlign="center">No mystery boxes found.</Text>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedBox?.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Image 
                src={selectedBox?.image} 
                alt={selectedBox?.title} 
                maxW="100%" 
                maxH="400px" 
                objectFit="contain"
                mb={4}
              />
              <Badge colorScheme={rarityColors[selectedBox?.rarity]} mb={2}>
                {selectedBox?.rarity}
              </Badge>
              <Text mb={2}><strong>Question:</strong> {selectedBox?.question}</Text>
              <Text mb={2}><strong>Answer:</strong> {selectedBox?.answer}</Text>
              <Text><strong>Description:</strong> {selectedBox?.description}</Text>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
};

export default MysteryBoxComponent;