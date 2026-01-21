import type { ReactElement } from 'react';
import { Box, Container, Typography, Link, Stack, Divider } from '@mui/material';

export interface FooterProps {
  showDivider?: boolean;
}

/** Application footer */
export function Footer({ showDivider = true }: FooterProps): ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ mt: 'auto' }}>
      {showDivider && <Divider />}
      <Container maxWidth="lg">
        <Box
          sx={{
            py: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Day Tracker. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={3}>
            <Link href="/privacy" color="text.secondary" underline="hover" variant="body2">
              Privacy
            </Link>
            <Link href="/terms" color="text.secondary" underline="hover" variant="body2">
              Terms
            </Link>
            <Link href="/help" color="text.secondary" underline="hover" variant="body2">
              Help
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
