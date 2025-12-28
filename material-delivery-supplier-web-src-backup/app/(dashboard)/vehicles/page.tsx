import {Card, CardContent, Stack, Typography} from '@mui/material';

export default function VehiclesPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Vehicles</Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Vehicles list placeholder. Add status badges and assignment info here.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
