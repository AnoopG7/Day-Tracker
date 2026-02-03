import { type FC, useState } from 'react';
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
  Tooltip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, AutoAwesome as AIIcon } from '@mui/icons-material';
import { useNutritionAI } from '@hooks/useNutritionAI';

export interface MealRow {
  id: string;
  mealType: string; // Capitalized display value (e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snacks')
  foodName: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  fiber: string;
  notes: string;
}

interface MealTableProps {
  rows: MealRow[];
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onUpdateRow: (id: string, field: keyof MealRow, value: string) => void;
}

/**
 * Unified meal table component - each row has a meal type dropdown
 */
export const MealTable: FC<MealTableProps> = ({ rows, onAddRow, onRemoveRow, onUpdateRow }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { estimateMacros, isLoading: aiLoading } = useNutritionAI();
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);

  // Handle AI auto-fill for a specific row
  const handleAIAutoFill = async (rowId: string, foodName: string) => {
    if (!foodName.trim() || aiLoading) return;

    setLoadingRowId(rowId);
    const result = await estimateMacros(foodName);
    setLoadingRowId(null);

    if (result) {
      onUpdateRow(rowId, 'calories', result.calories.toString());
      onUpdateRow(rowId, 'protein', result.protein.toString());
      onUpdateRow(rowId, 'carbs', result.carbs.toString());
      onUpdateRow(rowId, 'fats', result.fats.toString());
      onUpdateRow(rowId, 'fiber', result.fiber.toString());
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          🍽️ Meals
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddRow}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          Add Meal
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
                  Meal Entry
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
                    options={['Breakfast', 'Lunch', 'Dinner', 'Snacks']}
                    value={row.mealType}
                    onChange={(_, newValue) => onUpdateRow(row.id, 'mealType', newValue || '')}
                    onInputChange={(_, newInputValue) =>
                      onUpdateRow(row.id, 'mealType', newInputValue)
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
                      <TextField {...params} label="Meal Type" size="small" />
                    )}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Food Name"
                    value={row.foodName}
                    onChange={(e) => onUpdateRow(row.id, 'foodName', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip
                            title={
                              row.foodName ? 'Auto-fill macros with AI' : 'Enter food name first'
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleAIAutoFill(row.id, row.foodName)}
                                disabled={!row.foodName.trim() || loadingRowId === row.id}
                                color="primary"
                                sx={{ p: 0.5 }}
                              >
                                {loadingRowId === row.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <AIIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Calories"
                    type="number"
                    value={row.calories}
                    onChange={(e) => onUpdateRow(row.id, 'calories', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Protein (g)"
                    type="number"
                    value={row.protein}
                    onChange={(e) => onUpdateRow(row.id, 'protein', e.target.value)}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Carbs (g)"
                    type="number"
                    value={row.carbs}
                    onChange={(e) => onUpdateRow(row.id, 'carbs', e.target.value)}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Fats (g)"
                    type="number"
                    value={row.fats}
                    onChange={(e) => onUpdateRow(row.id, 'fats', e.target.value)}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Fiber (g)"
                    type="number"
                    value={row.fiber}
                    onChange={(e) => onUpdateRow(row.id, 'fiber', e.target.value)}
                    inputProps={{ min: 0, step: 0.1 }}
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
              <TableRow sx={{ bgcolor: 'info.50' }}>
                <TableCell width="12%">
                  <strong>Meal Type</strong>
                </TableCell>
                <TableCell width="18%">
                  <strong>Food Name</strong>
                </TableCell>
                <TableCell width="10%">
                  <strong>Calories</strong>
                </TableCell>
                <TableCell width="10%">
                  <strong>Protein (g)</strong>
                </TableCell>
                <TableCell width="10%">
                  <strong>Carbs (g)</strong>
                </TableCell>
                <TableCell width="10%">
                  <strong>Fats (g)</strong>
                </TableCell>
                <TableCell width="10%">
                  <strong>Fiber (g)</strong>
                </TableCell>
                <TableCell width="15%">
                  <strong>Notes</strong>
                </TableCell>
                <TableCell width="5%"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Autocomplete
                      freeSolo
                      options={['Breakfast', 'Lunch', 'Dinner', 'Snacks']}
                      value={row.mealType}
                      onChange={(_, newValue) => onUpdateRow(row.id, 'mealType', newValue || '')}
                      onInputChange={(_, newInputValue) => {
                        onUpdateRow(row.id, 'mealType', newInputValue);
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
                      value={row.foodName}
                      onChange={(e) => onUpdateRow(row.id, 'foodName', e.target.value)}
                      placeholder="Food name"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title={
                                row.foodName
                                  ? 'Auto-fill macros with AI ✨'
                                  : 'Enter food name first'
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleAIAutoFill(row.id, row.foodName)}
                                  disabled={!row.foodName.trim() || loadingRowId === row.id}
                                  color="primary"
                                  sx={{ p: 0.5 }}
                                >
                                  {loadingRowId === row.id ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <AIIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={row.calories}
                      onChange={(e) => onUpdateRow(row.id, 'calories', e.target.value)}
                      placeholder="kcal"
                      inputProps={{ min: 0 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={row.protein}
                      onChange={(e) => onUpdateRow(row.id, 'protein', e.target.value)}
                      placeholder="g"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={row.carbs}
                      onChange={(e) => onUpdateRow(row.id, 'carbs', e.target.value)}
                      placeholder="g"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={row.fats}
                      onChange={(e) => onUpdateRow(row.id, 'fats', e.target.value)}
                      placeholder="g"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={row.fiber}
                      onChange={(e) => onUpdateRow(row.id, 'fiber', e.target.value)}
                      placeholder="g"
                      inputProps={{ min: 0, step: 0.1 }}
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

export default MealTable;
