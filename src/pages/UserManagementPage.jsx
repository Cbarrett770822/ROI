import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  MenuItem, 
  Alert, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import authFetch from '../api/authFetch';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function UserManagementPage() {
  // State for user list
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for user form
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // State for notifications
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const auth = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Only allow admins
  useEffect(() => {
    if (!auth.user || auth.user.role !== 'admin') {
      navigate('/home');
    } else {
      fetchUsers();
    }
  }, [auth.user, navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching users with auth token...');
      // Check if token exists before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Make the API request with relative path for unified deployment
      const data = await authFetch('/.netlify/functions/users');
      console.log('Users API response data:', data);
      
      // Validate response structure
      if (!data || !data.users) {
        throw new Error('Invalid response format from API');
      }
      
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setNotification({
        open: true,
        message: `Failed to load users: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (create or update user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || (!isEditing && !password) || !role) {
      showNotification('All fields are required', 'error');
      return;
    }
    
    try {
      if (isEditing) {
        // Update existing user - authFetch now returns parsed JSON
        const data = await authFetch('/.netlify/functions/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId, 
            username, 
            ...(password ? { password } : {}), // Only include password if provided
            role 
          })
        });
        
        // Check for error message in the response
        if (data && data.error) {
          throw new Error(data.error || 'Failed to update user');
        }
        
        showNotification('User updated successfully', 'success');
      } else {
        // Create new user - authFetch now returns parsed JSON
        const data = await authFetch('/.netlify/functions/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role })
        });
        
        // Check for error message in the response
        if (data && data.error) {
          throw new Error(data.error || 'Failed to create user');
        }
        
        showNotification('User created successfully', 'success');
      }
      
      // Reset form and refresh user list
      resetForm();
      fetchUsers();
      
    } catch (err) {
      console.error('User operation failed:', err);
      showNotification(err.message || 'Operation failed', 'error');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const data = await authFetch('/.netlify/functions/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToDelete._id })
      });
      
      // Check for error message in the response
      if (data && data.error) {
        throw new Error(data.error || 'Failed to delete user');
      }
      
      showNotification('User deleted successfully', 'success');
      fetchUsers();
    } catch (err) {
      console.error('Delete failed:', err);
      showNotification(err.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Open edit form for a user
  const handleEditUser = (user) => {
    setIsEditing(true);
    setUserId(user._id);
    setUsername(user?.username || '');
    setPassword(''); // Don't populate password for security
    setRole(user?.role || 'user');
    setFormOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Reset form state
  const resetForm = () => {
    setIsEditing(false);
    setUserId('');
    setUsername('');
    setPassword('');
    setRole('user');
    setFormOpen(false);
  };

  // Show notification
  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3, px: 2 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">User Management</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Add New User
          </Button>
        </Box>
        
        {/* User List */}
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">Loading users...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No users found</TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user?.username || 'Unknown'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user?.role || 'user'} 
                        color={user?.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditUser(user)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteDialog(user)}
                        size="small"
                        disabled={auth?.user?.id && user?._id === auth.user.id} // Prevent deleting current user
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* User Form Dialog */}
      <Dialog open={formOpen} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit User' : 'Create New User'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label={isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              required={!isEditing}
              margin="normal"
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={e => setRole(e.target.value)}
              fullWidth
              required
              margin="normal"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={resetForm}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{userToDelete?.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
