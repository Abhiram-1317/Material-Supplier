import {Card, CardContent, Stack, Typography} from '@mui/material';

export default function OrdersPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Orders</Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Orders list placeholder. Integrate data grid or table here.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
