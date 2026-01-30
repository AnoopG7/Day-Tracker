import { type FC } from 'react';
import { MealTable, type MealRow } from './MealTable';

interface MealsSectionProps {
  mealRows: MealRow[];
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onUpdateRow: (id: string, field: keyof MealRow, value: string) => void;
}

/**
 * Meals section - unified table with meal type dropdown in each row
 */
export const MealsSection: FC<MealsSectionProps> = ({
  mealRows,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
}) => {
  return (
    <MealTable
      rows={mealRows}
      onAddRow={onAddRow}
      onRemoveRow={onRemoveRow}
      onUpdateRow={onUpdateRow}
    />
  );
};

export default MealsSection;
