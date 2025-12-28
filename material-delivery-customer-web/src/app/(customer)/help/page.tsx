"use client";

import Link from "next/link";
import {Button, Paper, Stack, Typography} from "@mui/material";

export default function HelpPage() {
  return (
    <Paper sx={{p: 3}}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Help & support
      </Typography>
      <Typography color="text.secondary" sx={{mb: 3}}>
        Find quick answers or review our policies.
      </Typography>

      <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
        <Button component={Link} href="/help/faq" variant="contained">
          View FAQs
        </Button>
        <Button component={Link} href="/help/terms" variant="outlined">
          Terms & policies
        </Button>
      </Stack>
    </Paper>
  );
}
