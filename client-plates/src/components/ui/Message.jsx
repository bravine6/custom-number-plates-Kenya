import { Alert, AlertTitle } from '@mui/material';

const Message = ({ variant = 'info', title, children }) => {
  return (
    <Alert severity={variant} sx={{ my: 2 }}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </Alert>
  );
};

export default Message;