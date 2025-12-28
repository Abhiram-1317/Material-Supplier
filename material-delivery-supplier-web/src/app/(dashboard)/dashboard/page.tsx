import React from 'react';
import {Box, Paper, Typography} from '@mui/material';
import Grid from '@mui/material/Grid';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled';
import GroupIcon from '@mui/icons-material/Group';

const stats = [
  {label: 'Today’s orders', value: 24, icon: <ShoppingBagIcon />},
  {label: 'Pending dispatch', value: 12, icon: <LocalShippingIcon />},
  {label: 'Vehicles in transit', value: 8, icon: <DirectionsBusFilledIcon />},
  {label: 'Drivers on duty', value: 15, icon: <GroupIcon />},
];

function StatCard({label, value, icon}: {label: string; value: number; icon: React.ReactNode}) {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        border: '1px solid rgba(15,23,42,0.06)',
      }}
    >
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{mt: 1}}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: '50%',
          bgcolor: 'primary.light',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
}

export default function DashboardPage() {
  return (
    <Grid container spacing={3}>
      {stats.map((item) => (
        <Grid key={item.label} size={{xs: 12, sm: 6, md: 3}}>
          <StatCard label={item.label} value={item.value} icon={item.icon} />
        </Grid>
      ))}
    </Grid>
  );
}
