"use client";

import {Box, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography} from '@mui/material';

export default function CustomersPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Customers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track corporate customers, their orders, and engagement across cities.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{p: 2}}>
        <Typography variant="subtitle1" gutterBottom>
          Customer list
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Total orders</TableCell>
              <TableCell>Last order</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5}>
                Placeholder — will show real customers once connected to data.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
