import { type FC } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Autocomplete,
  Grid,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

export interface ExpenseRow {
  id: string;
  category: string;
  amount: string;
  description: string;
  paymentMethod: string;
  merchant: string;
  notes: string;
}

interface ExpenseTableProps {
  rows: ExpenseRow[];
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onUpdateRow: (id: string, field: keyof ExpenseRow, value: string) => void;
}

/**
 * Expense tracking table component
 */
export const ExpenseTable: FC<ExpenseTableProps> = ({
  rows,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          color="error.main"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          💰 Expenses
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddRow}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          Add Row
        </Button>
      </Box>

      {isMobile ? (
        // Mobile Card Layout
        <Stack spacing={2}>
          {rows.map((row) => (
            <Paper
              key={row.id}
              elevation={0}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Expense Entry
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onRemoveRow(row.id)}
                  disabled={rows.length === 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Grid container spacing={1.5}>
                <Grid size={12}>
                  <Autocomplete
                    freeSolo
                    options={[
                      'Food',
                      'Transport',
                      'Shopping',
                      'Bills',
                      'Entertainment',
                      'Health',
                      'Other',
                    ]}
                    value={row.category}
                    onChange={(_, newValue) => onUpdateRow(row.id, 'category', newValue || '')}
                    onInputChange={(_, newInputValue) =>
                      onUpdateRow(row.id, 'category', newInputValue)
                    }
                    slotProps={{
                      paper: {
                        sx: {
                          backdropFilter: 'blur(20px)',
                          backgroundColor: 'background.paper',
                          backgroundImage: 'none',
                        },
                      },
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Category" size="small" />
                    )}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Amount (₹)"
                    type="number"
                    value={row.amount}
                    onChange={(e) => onUpdateRow(row.id, 'amount', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid size={6}>
                  <Autocomplete
                    freeSolo
                    options={['Cash', 'Card', 'UPI', 'Net Banking']}
                    value={row.paymentMethod}
                    onChange={(_, newValue) => onUpdateRow(row.id, 'paymentMethod', newValue || '')}
                    onInputChange={(_, newInputValue) =>
                      onUpdateRow(row.id, 'paymentMethod', newInputValue)
                    }
                    slotProps={{
                      paper: {
                        sx: {
                          backdropFilter: 'blur(20px)',
                          backgroundColor: 'background.paper',
                          backgroundImage: 'none',
                        },
                      },
                    }}
                    renderInput={(params) => <TextField {...params} label="Payment" size="small" />}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    value={row.description}
                    onChange={(e) => onUpdateRow(row.id, 'description', e.target.value)}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Merchant"
                    value={row.merchant}
                    onChange={(e) => onUpdateRow(row.id, 'merchant', e.target.value)}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Notes"
                    value={row.notes}
                    onChange={(e) => onUpdateRow(row.id, 'notes', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            '& .MuiTableCell-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '4px', sm: '8px 16px' },
              whiteSpace: 'nowrap',
            },
            '& .MuiTextField-root, & .MuiAutocomplete-root': {
              minWidth: { xs: '80px', sm: 'auto' },
            },
          }}
        >
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'error.50' }}>
                <TableCell width="12%">
                  <strong>Category</strong>
                </TableCell>
                <TableCell width="12%">
                  <strong>Amount (₹)</strong>
                </TableCell>
                <TableCell width="18%">
                  <strong>Description</strong>
                </TableCell>
                <TableCell width="12%">
                  <strong>Payment</strong>
                </TableCell>
                <TableCell width="15%">
                  <strong>Merchant</strong>
                </TableCell>
                <TableCell width="25%">
                  <strong>Notes</strong>
                </TableCell>
                <TableCell width="6%"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Autocomplete
                      freeSolo
                      options={[
                        'Food',
                        'Transport',
                        'Shopping',
                        'Bills',
                        'Entertainment',
                        'Health',
                        'Other',
                      ]}
                      value={row.category}
                      onChange={(_, newValue) => onUpdateRow(row.id, 'category', newValue || '')}
                      onInputChange={(_, newInputValue) => {
                        onUpdateRow(row.id, 'category', newInputValue);
                      }}
                      slotProps={{
                        paper: {
                          sx: {
                            backdropFilter: 'blur(20px)',
                            backgroundColor: 'background.paper',
                            backgroundImage: 'none',
                          },
                        },
                      }}
                      renderInput={(params) => (
                        <TextField {...params} size="small" placeholder="Select or type" />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={row.amount}
                      onChange={(e) => onUpdateRow(row.id, 'amount', e.target.value)}
                      placeholder="0.00"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.description}
                      onChange={(e) => onUpdateRow(row.id, 'description', e.target.value)}
                      placeholder="What?"
                    />
                  </TableCell>
                  <TableCell>
                    <Autocomplete
                      freeSolo
                      options={['Cash', 'Card', 'UPI', 'Net Banking']}
                      value={row.paymentMethod}
                      onChange={(_, newValue) =>
                        onUpdateRow(row.id, 'paymentMethod', newValue || '')
                      }
                      onInputChange={(_, newInputValue) => {
                        onUpdateRow(row.id, 'paymentMethod', newInputValue);
                      }}
                      slotProps={{
                        paper: {
                          sx: {
                            backdropFilter: 'blur(20px)',
                            backgroundColor: 'background.paper',
                            backgroundImage: 'none',
                          },
                        },
                      }}
                      renderInput={(params) => (
                        <TextField {...params} size="small" placeholder="Select or type" />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.merchant}
                      onChange={(e) => onUpdateRow(row.id, 'merchant', e.target.value)}
                      placeholder="Store name"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.notes}
                      onChange={(e) => onUpdateRow(row.id, 'notes', e.target.value)}
                      placeholder="Notes"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => onRemoveRow(row.id)}
                      disabled={rows.length === 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ExpenseTable;
