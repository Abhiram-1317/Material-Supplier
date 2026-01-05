"use client";

import {useRouter} from 'next/navigation';
import {FormEvent, useState} from 'react';
import {
  Box,
  Button,
  Container,
  Alert,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {api, setAuthToken} from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {email, password});
      const token: string | undefined = res.data?.accessToken;

      if (!token) {
        throw new Error('Missing token');
      }

      // Persist token and set default auth header for subsequent requests.
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('admin_token', token);
      }
      setAuthToken(token);
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Login failed', err);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
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

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Stack>

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
