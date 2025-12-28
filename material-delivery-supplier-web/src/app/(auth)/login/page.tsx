"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {useSupplierAuth} from '@/context/SupplierAuthContext';

export default function LoginPage() {
  const router = useRouter();
  const {login} = useSupplierAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
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
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Card sx={{width: 400, maxWidth: '100%'}} elevation={6}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Supplier Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to manage deliveries, drivers, vehicles, and products.
              </Typography>
            </Box>

            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
              {error ? (
                <Typography variant="body2" color="error" textAlign="center">
                  {error}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
