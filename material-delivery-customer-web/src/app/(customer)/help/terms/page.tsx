"use client";

import {Box, Paper, Stack, Typography} from "@mui/material";

export default function HelpTermsPage() {
  return (
    <Box sx={{maxWidth: 720, mx: "auto"}}>
      <Paper sx={{p: 3, mb: 2}}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Terms & Policies
        </Typography>
        <Typography color="text.secondary">
          Please review the guidelines that govern your use of our services.
        </Typography>
      </Paper>

      <Paper sx={{p: 3}}>
        <Stack spacing={3}>
          <section>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              User Agreement
            </Typography>
            <Typography color="text.secondary">
              By using our platform you agree to provide accurate information, keep your account secure,
              and comply with applicable laws. Misuse or fraudulent activity may result in account
              suspension.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Privacy Policy
            </Typography>
            <Typography color="text.secondary">
              We collect data to improve your experience, including order details and device information.
              We never sell your data and only share with trusted partners necessary to fulfill your
              order. You can request data deletion at any time.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Refund Policy
            </Typography>
            <Typography color="text.secondary">
              Refunds are processed to your original payment method after inspection of returned items.
              Processing times vary by bank or provider. For issues, contact support with your order ID.
            </Typography>
          </section>
        </Stack>
      </Paper>
    </Box>
  );
}
