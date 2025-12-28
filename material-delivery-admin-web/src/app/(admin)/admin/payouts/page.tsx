"use client";

import {Box, Card, CardContent, Stack, Typography} from '@mui/material';

export default function PayoutsPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Payouts & commissions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Approve payouts to suppliers and track platform commissions.
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Current cycle
          </Typography>
          <Stack spacing={1.2}>
            <Typography variant="body2">Payouts pending: 3</Typography>
            <Typography variant="body2">Total commission this month: ₹2.4L</Typography>
            <Typography variant="body2">Next disbursal window: Friday, 4 PM</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
