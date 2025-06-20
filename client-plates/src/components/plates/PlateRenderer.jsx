import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import QRCode from 'react-qr-code';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Import background images properly for production
import bg1 from '../../assets/kenya_bg_1.jpg';
import bg2 from '../../assets/kenya_bg_2.jpg';
import bg3 from '../../assets/kenya_bg_3.jpg';

// Helper function to get the correct background image
const getBgImage = (bgIndex) => {
  // If a specific index is provided, use it
  if (bgIndex !== null && bgIndex !== undefined) {
    if (bgIndex === 0 || bgIndex === '0') return bg1;
    if (bgIndex === 1 || bgIndex === '1') return bg2;
    if (bgIndex === 2 || bgIndex === '2') return bg3;
    // Handle 1-based indexing
    if (bgIndex === 3 || bgIndex === '3') return bg3;
    if (bgIndex === 2 || bgIndex === '2') return bg2;
    if (bgIndex === 1 || bgIndex === '1') return bg1;
  }
  
  // Otherwise, pick a random one
  const random = Math.floor(Math.random() * 3);
  if (random === 0) return bg1;
  if (random === 1) return bg2;
  return bg3;
};

const PlateContainer = styled(Paper)(({ theme, plateType, bgIndex = null }) => ({
  width: '350px',
  maxWidth: '100%',
  height: '125px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  margin: '0 auto',
  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  backgroundColor: plateType === 'prestige' ? '#E5E5E5' :
    plateType === 'special' ? '#FFFFFF' : '#F2F2F2',
  border: `8px solid ${plateType === 'special' ? theme.palette.primary.main :
    plateType === 'prestige' ? '#003B5C' : '#000000'}`,
  backgroundImage: plateType === 'prestige' 
    ? `url(${getBgImage(bgIndex)})`
    : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundBlendMode: 'soft-light',
  overflow: 'hidden'
}));

const LeftSideElements = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginRight: theme.spacing(1.5),
}));

const KenyaFlag = styled(Box)(({ theme }) => ({
  width: '40px',
  height: '40px',
  display: 'flex',
  flexDirection: 'column',
  marginBottom: theme.spacing(0.5),
}));

const FlagStripe = styled(Box)(({ color }) => ({
  flex: 1,
  backgroundColor: color,
}));

const QRCodeContainer = styled(Box)(({ theme, small }) => ({
  width: small ? '30px' : '40px',
  height: small ? '30px' : '40px',
  backgroundColor: '#fff',
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
}));

const PlateText = styled(Typography)(({ theme, plateType }) => ({
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 700,
  fontSize: plateType === 'prestige' ? '2.5rem' : '2.2rem',
  letterSpacing: '0.05em',
  textAlign: 'center',
  flex: 1,
  color: '#000',
  textTransform: 'uppercase',
}));

const NtsaLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1.5),
  bottom: theme.spacing(0.5),
  fontSize: '0.65rem',
  color: '#666',
}));

/**
 * Component to render a Kenyan license plate
 * 
 * @param {Object} props
 * @param {string} props.text - Text to display on the plate
 * @param {string} props.plateType - Type of plate (special, standard_custom, prestige)
 * @param {boolean} props.small - If true, renders a smaller version of the plate
 * @param {number} props.bgIndex - For prestige plates, specifies which background to use (1, 2, or 3)
 * @returns {JSX.Element}
 */
const PlateRenderer = ({ text = 'KAA000A', plateType = 'standard_custom', small = false, bgIndex = null }) => {
  // Process the text based on plate type
  let displayText = '';
  
  // Heart emoji replacement for star plate
  const replaceWithHeartEmoji = (txt) => {
    return txt.split('').map(char => 
      char === '❤' || char === '<3' ? <FavoriteIcon key={Math.random()} fontSize="small" color="error" /> : char
    );
  };

  if (plateType === 'special') {
    // Special plates - must have two or more zeros (max 7 characters)
    displayText = text.toUpperCase().slice(0, 7);
  } else if (plateType === 'prestige') {
    // Prestige plates (4-7 characters)
    displayText = text.toUpperCase().slice(0, 7);
  } else {
    // Standard/star plates (4-7 characters, can include heart emoji)
    const processedText = text.toUpperCase().slice(0, 7);
    displayText = replaceWithHeartEmoji(processedText);
  }
  
  return (
    <PlateContainer 
      plateType={plateType}
      bgIndex={bgIndex}
      sx={small ? { width: '200px', height: '75px' } : {}}
    >
      <LeftSideElements>
        <KenyaFlag sx={small ? { width: '24px', height: '24px' } : {}}>
          <FlagStripe color="#000000" />
          <FlagStripe color="#FF0000" />
          <FlagStripe color="#FFFFFF" />
          <FlagStripe color="#009900" />
        </KenyaFlag>
        
        <QRCodeContainer small={small}>
          <QRCode
            size={small ? 28 : 38}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value="https://ntsa.go.ke/verify"
            viewBox={`0 0 256 256`}
          />
        </QRCodeContainer>
      </LeftSideElements>
      
      <PlateText 
        plateType={plateType}
        sx={small ? { fontSize: plateType === 'prestige' ? '1.5rem' : '1.3rem' } : {}}
      >
        {displayText}
      </PlateText>
      
      <NtsaLabel sx={small ? { fontSize: '0.5rem' } : {}}>
        NTSA KENYA
      </NtsaLabel>
    </PlateContainer>
  );
};

export default PlateRenderer;