import {Card, CardContent, Stack, Typography} from '@mui/material';

export default function DriversPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Drivers</Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Drivers roster placeholder. Add availability and contact details here.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
