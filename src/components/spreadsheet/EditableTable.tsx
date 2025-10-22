import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleAdd = () => {
    const newRow: TableRow = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      // Validate required fields before saving
      const missing = columns.filter(col => col.required).filter(col => {
        const val = editingRow[col.key];
        if (col.type === 'number' || col.type === 'currency' || col.type === 'percentage') {
          return val === '' || val === null || val === undefined || isNaN(Number(val));
        }
        return val === '' || val === null || val === undefined;
      });

      if (missing.length > 0) {
        toast({
          title: "Missing required fields",
          description: `Please fill: ${missing.map(m => m.label).join(', ')}`,
          variant: "destructive",
        });
        return; // Do not propagate changes
      }

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
              <SelectTrigger className="h-9 sm:h-8 text-xs min-w-[100px]">
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
              className="h-9 sm:h-8 text-xs min-w-[120px] bg-white dark:bg-gray-900 text-foreground [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
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
              className="h-9 sm:h-8 text-xs min-w-[100px]"
            />
          );
        default:
          return (
            <Input
              value={value}
              onChange={(e) => handleFieldChange(column.key, e.target.value)}
              className="h-9 sm:h-8 text-xs min-w-[100px]"
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
    <Card className={cn("card-elegant p-3 sm:p-6", className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
        <Button onClick={handleAdd} className="flex items-center gap-2 w-full sm:w-auto text-sm">
          <Plus className="w-4 h-4" />
          <span className="sm:inline">{addButtonText}</span>
        </Button>
      </div>

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="min-w-[600px] px-3 sm:px-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th key={column.key} className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px] sm:min-w-[120px]">
                    <div className="truncate">
                      {column.label}
                      {column.required && <span className="text-destructive ml-1">*</span>}
                    </div>
                  </th>
                ))}
                <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium text-muted-foreground min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-secondary/20">
                  {columns.map((column) => (
                    <td key={column.key} className="p-2 sm:p-3 min-w-[80px] sm:min-w-[120px]">
                      {renderCell(row, column)}
                    </td>
                  ))}
                  <td className="p-2 sm:p-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {editingId === row.id ? (
                        <>
                          <Button size="sm" onClick={handleSave} className="h-8 w-8 sm:h-7 sm:w-7 p-0 touch-manipulation">
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 sm:h-7 sm:w-7 p-0 touch-manipulation">
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(row)} className="h-8 w-8 sm:h-7 sm:w-7 p-0 touch-manipulation">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)} className="h-8 w-8 sm:h-7 sm:w-7 p-0 touch-manipulation">
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
                  <td colSpan={columns.length + 1} className="p-6 sm:p-8 text-center text-muted-foreground text-sm">
                    No data yet. Click "{addButtonText}" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};