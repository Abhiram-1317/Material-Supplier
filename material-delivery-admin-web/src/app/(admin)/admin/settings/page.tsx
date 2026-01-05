"use client";

import {Box, Card, CardContent, Chip, Stack, Typography} from '@mui/material';

export default function AdminSettingsPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Platform settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure rules and coverage for the marketplace.
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Commission rules
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define slabs, payment terms, and penalties for each supplier and city.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Service areas
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label="Warangal" color="primary" variant="outlined" />
            <Chip label="Hanumakonda" color="primary" variant="outlined" />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Support contacts
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">Email: support@materialsupply.example</Typography>
            <Typography variant="body2">Phone: +91 98765 43210</Typography>
            <Typography variant="body2" color="text.secondary">
              Editable settings will be added later.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
