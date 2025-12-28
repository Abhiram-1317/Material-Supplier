"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Box, Button, Card, CardContent, Stack, TextField, Typography, Alert} from "@mui/material";
import {useAuth} from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const {requestOtp, requestingOtp} = useAuth();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    const trimmed = phone.replace(/\D/g, "");
    if (trimmed.length !== 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    const fullPhone = `+91${trimmed}`;
    try {
      await requestOtp(fullPhone);
      setSuccess("OTP sent to your phone");
      router.push("/otp");
    } catch (err) {
      console.error("requestOtp error", err);
      setError("Failed to send OTP. Please try again.");
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" padding={2}>
      <Card sx={{maxWidth: 420, width: "100%"}}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={700}>
              Login to order materials
            </Typography>
            <TextField
              label="Phone number"
              placeholder="Enter 10-digit phone"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={requestingOtp}
            />
            <Button variant="contained" onClick={handleSubmit} disabled={requestingOtp}>
              {requestingOtp ? "Sending..." : "Send OTP"}
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
