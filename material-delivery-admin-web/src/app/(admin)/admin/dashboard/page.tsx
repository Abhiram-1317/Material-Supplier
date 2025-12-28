"use client";

import {
  Box,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

const stats = [
  {label: 'Total suppliers', value: '12'},
  {label: 'Active suppliers', value: '9'},
  {label: 'Orders today', value: '42'},
  {label: 'GMV today', value: '₹8.4L'},
];

const recentOrders = [
  'ORD-1044 • Cement • Warangal • ₹12,800',
  'ORD-1043 • TMT Bars • Hanumakonda • ₹6,450',
  'ORD-1042 • RMC • Warangal • ₹18,200',
  'ORD-1041 • Bricks • Hanumakonda • ₹4,900',
];

const activities = [
  'New supplier pending verification: Shree Materials',
  'Payout initiated for Hanumakonda Supplier #7',
  'Order ORD-1040 flagged for delivery delay',
  'Commission report generated for last week',
];

export default function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of suppliers, orders, and payouts across Warangal & Hanumakonda.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid size={{xs: 12, sm: 6, md: 3}} key={stat.label}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} mt={1}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{xs: 12, md: 7}}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent orders
              </Typography>
              <List dense>
                {recentOrders.map((item) => (
                  <ListItem key={item} disableGutters>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs: 12, md: 5}}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity
              </Typography>
              <List dense>
                {activities.map((item) => (
                  <ListItem key={item} disableGutters>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
