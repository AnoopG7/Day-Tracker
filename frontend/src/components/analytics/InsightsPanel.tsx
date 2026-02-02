import { type FC } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Lightbulb, Warning, CheckCircle, EmojiEvents } from '@mui/icons-material';

interface Insight {
  type: 'success' | 'info' | 'warning' | 'achievement';
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface InsightsPanelProps {
  insights: Insight[];
}

export const InsightsPanel: FC<InsightsPanelProps> = ({ insights }) => {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'achievement':
        return 'secondary';
      default:
        return 'info';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle />;
      case 'warning':
        return <Warning />;
      case 'achievement':
        return <EmojiEvents />;
      default:
        return <Lightbulb />;
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: { xs: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Lightbulb sx={{ color: 'warning.main', fontSize: { xs: 24, sm: 28 } }} />
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          Insights & Recommendations
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
        {insights.map((insight, index) => (
          <Alert
            key={index}
            severity={getInsightColor(insight.type) as 'success' | 'info' | 'warning' | 'error'}
            icon={getInsightIcon(insight.type)}
            sx={{
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 28,
              },
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {insight.title}
            </Typography>
            <Typography variant="body2">{insight.description}</Typography>
          </Alert>
        ))}
      </Box>
    </Box>
  );
};

export default InsightsPanel;
