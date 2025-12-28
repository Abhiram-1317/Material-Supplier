"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Box, Button, Card, CardContent, Stack, TextField, Typography, Alert} from "@mui/material";
import {useAuth, LAST_PHONE_KEY} from "@/context/AuthContext";

export default function OtpPage() {
  const router = useRouter();
  const {verifyOtpAndLogin, verifyingOtp} = useAuth();

  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastPhone = sessionStorage.getItem(LAST_PHONE_KEY);
    if (!lastPhone) {
      router.replace("/login");
      return;
    }
    setPhone(lastPhone);
  }, [router]);

  const handleSubmit = async () => {
    setError(null);
    if (!phone) {
      setError("Missing phone number. Please request a new OTP.");
      return;
    }
    if (!otp.trim()) {
      setError("Enter the OTP sent to your phone.");
      return;
    }
    try {
      await verifyOtpAndLogin(phone, otp.trim());
      router.push("/browse");
    } catch (err) {
      console.error("verifyOtp error", err);
      setError("Invalid OTP or verification failed.");
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" padding={2}>
      <Card sx={{maxWidth: 420, width: "100%"}}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={700}>
              Enter OTP
            </Typography>
            {phone && (
              <Typography variant="body2" color="text.secondary">
                Verifying for {phone}
              </Typography>
            )}
            <TextField
              label="OTP"
              placeholder="123456"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={verifyingOtp}
            />
            <Button variant="contained" onClick={handleSubmit} disabled={verifyingOtp}>
              {verifyingOtp ? "Verifying..." : "Verify & Continue"}
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
