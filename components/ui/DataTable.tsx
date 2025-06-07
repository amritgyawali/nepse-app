import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface DataTableProps {
  children: React.ReactNode;
}

interface DataTableRowProps {
  children: React.ReactNode;
}

interface DataTableCellProps {
  children: React.ReactNode;
  numeric?: boolean;
}

export function DataTable({ children }: DataTableProps) {
  const { theme } = useTheme();
  
  return (
    <ScrollView style={[styles.table, { backgroundColor: theme.colors.surface }]}>
      {children}
    </ScrollView>
  );
}

export function DataTableRow({ children }: DataTableRowProps) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      {children}
    </View>
  );
}

export function DataTableCell({ children, numeric = false }: DataTableCellProps) {
  return (
    <View style={[styles.cell, numeric && styles.numericCell]}>
      {children}
    </View>
  );
}

// Export as default object to match react-native-paper API
const DataTableComponents = {
  DataTable,
  Row: DataTableRow,
  Cell: DataTableCell,
};

export default DataTableComponents;

const styles = StyleSheet.create({
  table: {
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  cell: {
    flex: 1,
    paddingRight: 8,
  },
  numericCell: {
    alignItems: 'flex-end',
  },
});