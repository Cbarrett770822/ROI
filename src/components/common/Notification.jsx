import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { selectNotification, hideNotification } from '../../redux/slices/uiSlice';

/**
 * Global notification component that displays messages from the Redux store
 * Can show success, error, warning, or info notifications
 */
const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideNotification());
  };

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={notification.duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={notification.type} 
        variant="filled"
        elevation={6}
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
