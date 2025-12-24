import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: string | ((row: T) => string);
  actions?: (row: T) => React.ReactNode;
  actionsHeader?: string;
  stickyHeader?: boolean;
  loading?: boolean;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search...",
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  emptyMessage = "No data found",
  onRowClick,
  rowClassName,
  actions,
  actionsHeader = "Actions",
  stickyHeader = false,
  loading = false,
  className,
}: DataTableProps<T>) {
  const [globalSearch, setGlobalSearch] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = React.useState(false);
  const [sort, setSort] = React.useState<SortState>({ column: null, direction: null });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  // Get nested value from object
  const getNestedValue = (obj: T, path: string): any => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  // Filter data
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Global search
    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          if (col.searchable === false) return false;
          const value = getNestedValue(row, col.key as string);
          return String(value ?? "").toLowerCase().includes(searchLower);
        })
      );
    }

    // Column filters
    Object.entries(columnFilters).forEach(([colKey, filterValue]) => {
      if (filterValue) {
        result = result.filter((row) => {
          const value = getNestedValue(row, colKey);
          return String(value ?? "").toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    return result;
  }, [data, globalSearch, columnFilters, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sort.column || !sort.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = getNestedValue(a, sort.column!);
      const bVal = getNestedValue(b, sort.column!);

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = typeof aVal === "string"
        ? aVal.localeCompare(bVal)
        : aVal < bVal ? -1 : 1;

      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sort]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, columnFilters, pageSize]);

  const handleSort = (columnKey: string) => {
    setSort((prev) => {
      if (prev.column !== columnKey) {
        return { column: columnKey, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { column: columnKey, direction: "desc" };
      }
      return { column: null, direction: null };
    });
  };

  const handleColumnFilter = (columnKey: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
  };

  const clearFilters = () => {
    setGlobalSearch("");
    setColumnFilters({});
    setSort({ column: null, direction: null });
  };

  const hasActiveFilters = globalSearch || Object.values(columnFilters).some(Boolean);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sort.column !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-muted-foreground/50" />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 text-primary" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-primary" />
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-primary/10")}
          >
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Column Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg border border-border">
          {columns
            .filter((col) => col.searchable !== false)
            .map((col) => (
              <div key={col.key as string}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {col.header}
                </label>
                <Input
                  placeholder={`Filter ${col.header.toLowerCase()}...`}
                  value={columnFilters[col.key as string] || ""}
                  onChange={(e) => handleColumnFilter(col.key as string, e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ))}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {paginatedData.length} of {sortedData.length} results
          {hasActiveFilters && ` (filtered from ${data.length})`}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className={cn(stickyHeader && "sticky top-0 bg-card z-10")}>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((col) => (
                  <TableHead
                    key={col.key as string}
                    className={cn(
                      "whitespace-nowrap font-semibold",
                      col.sortable !== false && "cursor-pointer select-none hover:bg-muted/80",
                      col.headerClassName
                    )}
                    onClick={() => col.sortable !== false && handleSort(col.key as string)}
                  >
                    <div className="flex items-center">
                      {col.header}
                      {col.sortable !== false && <SortIcon columnKey={col.key as string} />}
                    </div>
                  </TableHead>
                ))}
                {actions && (
                  <TableHead className="text-right whitespace-nowrap font-semibold">
                    {actionsHeader}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="h-32 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={row.id || rowIndex}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      onRowClick && "cursor-pointer",
                      typeof rowClassName === "function" ? rowClassName(row) : rowClassName
                    )}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key as string} className={cn("whitespace-nowrap", col.className)}>
                        {col.render
                          ? col.render(getNestedValue(row, col.key as string), row)
                          : getNestedValue(row, col.key as string)}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {actions(row)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
