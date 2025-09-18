import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TableColumn {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "currency" | "percentage";
  options?: string[];
  required?: boolean;
  formula?: (row: any, allRows: any[]) => number;
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

interface EditableTableProps {
  columns: TableColumn[];
  data: TableRow[];
  onDataChange: (data: TableRow[]) => void;
  title: string;
  addButtonText?: string;
  className?: string;
}

export const EditableTable = ({ 
  columns, 
  data, 
  onDataChange, 
  title, 
  addButtonText = "Add Row",
  className 
}: EditableTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<TableRow | null>(null);

  const handleAdd = () => {
    const newRow: TableRow = {
      id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...columns.reduce((acc, col) => ({
        ...acc,
        [col.key]: col.type === 'number' || col.type === 'currency' || col.type === 'percentage' ? 0 : ''
      }), {})
    };
    setEditingRow(newRow);
    setEditingId(newRow.id);
    onDataChange([...data, newRow]);
  };

  const handleEdit = (row: TableRow) => {
    setEditingId(row.id);
    setEditingRow({ ...row });
  };

  const handleSave = () => {
    if (editingRow) {
      const updatedData = data.map(row => 
        row.id === editingRow.id ? editingRow : row
      );
      onDataChange(updatedData);
    }
    setEditingId(null);
    setEditingRow(null);
  };

  const handleCancel = () => {
    if (editingRow && !data.find(row => row.id === editingRow.id && row !== editingRow)) {
      // If it's a new row that hasn't been saved, remove it
      onDataChange(data.filter(row => row.id !== editingRow.id));
    }
    setEditingId(null);
    setEditingRow(null);
  };

  const handleDelete = (id: string) => {
    onDataChange(data.filter(row => row.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingRow(null);
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    if (editingRow) {
      setEditingRow({ ...editingRow, [key]: value });
    }
  };

  const formatValue = (value: any, column: TableColumn) => {
    if (value === null || value === undefined || value === '') return '-';
    
    switch (column.type) {
      case 'currency':
        return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${Number(value).toFixed(1)}%`;
      case 'number':
        return Number(value).toLocaleString();
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      default:
        return value.toString();
    }
  };

  const getStatusColor = (value: any, column: TableColumn) => {
    if (column.key === 'status' && typeof value === 'string') {
      switch (value.toLowerCase()) {
        case 'good':
        case 'completed':
        case 'green':
          return 'status-positive';
        case 'warning':
        case 'pending':
        case 'yellow':
          return 'status-warning';
        case 'critical':
        case 'overdue':
        case 'red':
          return 'status-negative';
        default:
          return '';
      }
    }
    
    if (column.type === 'currency' || column.type === 'number') {
      const numValue = Number(value);
      if (column.key.includes('profit') || column.key.includes('revenue')) {
        return numValue > 0 ? 'text-success' : numValue < 0 ? 'text-destructive' : '';
      }
      if (column.key.includes('expense') || column.key.includes('debt')) {
        return numValue > 0 ? 'text-destructive' : 'text-success';
      }
    }
    
    return '';
  };

  const renderCell = (row: TableRow, column: TableColumn) => {
    const isEditing = editingId === row.id;
    const value = editingRow && isEditing ? editingRow[column.key] : row[column.key];
    
    // Calculate formula values
    const calculatedValue = column.formula ? column.formula(row, data) : value;
    const displayValue = column.formula ? calculatedValue : value;

    if (isEditing && !column.formula) {
      switch (column.type) {
        case 'select':
          return (
            <Select value={value} onValueChange={(val) => handleFieldChange(column.key, val)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {column.options?.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'date':
          return (
            <Input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(column.key, e.target.value)}
              className="h-8 text-xs"
            />
          );
        case 'currency':
        case 'number':
        case 'percentage':
          return (
            <Input
              type="number"
              step={column.type === 'currency' ? '0.01' : column.type === 'percentage' ? '0.1' : '1'}
              value={value}
              onChange={(e) => handleFieldChange(column.key, e.target.value)}
              className="h-8 text-xs"
            />
          );
        default:
          return (
            <Input
              value={value}
              onChange={(e) => handleFieldChange(column.key, e.target.value)}
              className="h-8 text-xs"
            />
          );
      }
    }

    const colorClass = getStatusColor(displayValue, column);
    
    if (column.key === 'status' && typeof displayValue === 'string') {
      return (
        <Badge className={cn("text-xs", colorClass)}>
          {displayValue}
        </Badge>
      );
    }

    return (
      <span className={cn("text-xs text-financial", colorClass)}>
        {formatValue(displayValue, column)}
      </span>
    );
  };

  return (
    <Card className={cn("card-elegant p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {addButtonText}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th key={column.key} className="text-left p-3 text-sm font-medium text-muted-foreground">
                  {column.label}
                  {column.required && <span className="text-destructive ml-1">*</span>}
                </th>
              ))}
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-secondary/20">
                {columns.map((column) => (
                  <td key={column.key} className="p-3 min-w-[120px]">
                    {renderCell(row, column)}
                  </td>
                ))}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {editingId === row.id ? (
                      <>
                        <Button size="sm" onClick={handleSave} className="h-7 w-7 p-0">
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 w-7 p-0">
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(row)} className="h-7 w-7 p-0">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)} className="h-7 w-7 p-0">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-muted-foreground">
                  No data yet. Click "{addButtonText}" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};