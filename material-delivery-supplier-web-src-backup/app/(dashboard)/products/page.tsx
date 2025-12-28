import {Card, CardContent, Stack, Typography} from '@mui/material';

export default function ProductsPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Products</Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Products catalog placeholder. Add filters and product table here.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
