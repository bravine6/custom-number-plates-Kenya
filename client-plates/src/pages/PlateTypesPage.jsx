import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  Divider,
} from '@mui/material';
import PlateTypeCard from '../components/plates/PlateTypeCard';

const PlateTypesPage = () => {
  // Plate type data
  const plateTypes = [
    {
      id: 'special',
      type: 'special',
      title: 'Special Number',
      description: 'Choose a plate with a special number sequence that includes double zeros, triple numbers, or special sequences. Format: K + two letters + space + number combination + letter.',
      price: 20000,
      sampleTexts: ['KDA 007A', 'KBB 100K', 'KCC 333M'],
    },
    {
      id: 'standard_custom',
      type: 'standard_custom',
      title: 'Star Plate',
      description: 'Create a custom plate with a mix of letters, numbers and heart emoji. Ideal for personalizing your vehicle with a meaningful sequence.',
      price: 40000,
      sampleTexts: ['WANJIKU', 'BILOW5', 'TNK7'],
    },
    {
      id: 'prestige',
      type: 'prestige',
      title: 'Premium Custom',
      description: 'Premium personalized plates with unique letter combinations, featuring beautiful Kenyan landscape backgrounds. Make a statement with a truly exclusive registration.',
      price: 80000,
      sampleTexts: ['KIPSANG', 'MOHA', 'NZISA77'],
    },
  ];
  
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center">
        Choose a Plate Type
      </Typography>
      
      <Divider sx={{ mb: 4, maxWidth: '100px', mx: 'auto', borderWidth: 2 }} />
      
      <Typography variant="body1" color="text.secondary" paragraph textAlign="center" sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
        Select from our three custom plate categories below. Each type offers unique features and styling options to suit your preferences.
      </Typography>
      
      <Grid container spacing={4} justifyContent="center">
        {plateTypes.map((plateType) => (
          <Grid item xs={12} sm={6} md={4} key={plateType.id}>
            <PlateTypeCard
              type={plateType.type}
              title={plateType.title}
              description={plateType.description}
              price={plateType.price}
              sampleTexts={plateType.sampleTexts}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlateTypesPage;