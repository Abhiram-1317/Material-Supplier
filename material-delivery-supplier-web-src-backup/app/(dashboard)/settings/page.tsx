import {Card, CardContent, Stack, Typography} from '@mui/material';

export default function SettingsPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Settings</Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Settings placeholder. Configure notifications, roles, and preferences here.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
