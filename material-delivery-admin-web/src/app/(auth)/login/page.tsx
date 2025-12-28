"use client";

import {useRouter} from 'next/navigation';
import {FormEvent} from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push('/admin/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{p: 4, borderRadius: 3}}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Admin login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to manage suppliers, orders and payouts.
              </Typography>
            </Box>

            <Stack spacing={2}>
              <TextField label="Email" type="email" required fullWidth />
              <TextField label="Password" type="password" required fullWidth />
            </Stack>

            <Button type="submit" variant="contained" size="large">
              Sign in
            </Button>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              Demo only – no real authentication yet.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
