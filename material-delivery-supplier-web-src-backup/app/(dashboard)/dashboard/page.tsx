import {Card, CardContent, Grid, Typography} from '@mui/material';

const stats = [
  {label: 'Active Orders', value: 24},
  {label: 'Pending Deliveries', value: 12},
  {label: 'Vehicles In Transit', value: 8},
  {label: 'Drivers On Duty', value: 15},
];

export default function DashboardPage() {
  return (
    <Grid container spacing={3}>
      {stats.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item.label}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h4">{item.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
