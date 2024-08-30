import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';

const AdminView = () => {
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    answer: '',
    description: '',
    rarity: '',
    image: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8090/api/collections/mystery_boxes/records', formData);
      toast({
        title: 'Mystery Box Added',
        description: "The new mystery box has been successfully added.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setFormData({
        title: '',
        question: '',
        answer: '',
        description: '',
        rarity: '',
        image: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: "There was an error adding the mystery box. Please try again.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error("Error adding mystery box:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChakraProvider>
      <Box maxWidth="500px" margin="auto" mt={8} p={4}>
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          Add New Mystery Box
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input name="title" value={formData.title} onChange={handleInputChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Question</FormLabel>
              <Input name="question" value={formData.question} onChange={handleInputChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Answer</FormLabel>
              <Input name="answer" value={formData.answer} onChange={handleInputChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea name="description" value={formData.description} onChange={handleInputChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Rarity</FormLabel>
              <Select name="rarity" value={formData.rarity} onChange={handleInputChange} placeholder="Select rarity">
                <option value="Common">Common</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Image URL</FormLabel>
              <Input name="image" value={formData.image} onChange={handleInputChange} />
            </FormControl>
            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
              Add Mystery Box
            </Button>
          </VStack>
        </form>
      </Box>
    </ChakraProvider>
  );
};

export default AdminView;