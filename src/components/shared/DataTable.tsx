import { useEffect, useId, useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type PaginationState, type SortingState } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Download, Search, X, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

const alignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: string[];
  actions?: (item: T) => React.ReactNode;
  actionsWidth?: string;
  fontSize?: number;
  exportFileName?: string;
  filterKey?: string;
  filterOptions?: Array<{ label: string; value: string }>;
  pageSizeOptions?: number[];
  loading?: boolean;
  defaultSortKey?: string;
}

export function DataTable<T extends Record<string, any>>({ data, columns, searchKeys = [], actions, actionsWidth, fontSize, exportFileName, filterKey, filterOptions = [], pageSizeOptions = [10, 25, 50], loading = false, defaultSortKey }: DataTableProps<T>) {
  const id = useId(); 
  const { language } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: pageSizeOptions[0] ?? 10 });
  const [sorting, setSorting] = useState<SortingState>(() => defaultSortKey ? [{ id: defaultSortKey, desc: false }] : []);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((item) => {
      const matchesSearch = !query || searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(query));
      const matchesFilter = !filterKey || !filter || String(item[filterKey] ?? '') === filter;
      return matchesSearch && matchesFilter;
    });
  }, [data, filter, filterKey, search, searchKeys]);

  const tableColumns = useMemo<ColumnDef<T>[]>(() => columns.map((column) => ({
    id: column.key,
    accessorKey: column.key,
    header: column.header,
    enableSorting: column.sortable !== false,
    cell: ({ row }) => column.render ? column.render(row.original, row.index) : String(row.original[column.key] ?? ''),
  })), [columns]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => { table.setPageIndex(0); }, [search, filter]);

  const handleExport = () => {
    const rows = filteredData.map((item) => Object.fromEntries(columns.map((column) => [column.header, item[column.key]])));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Data');
    XLSX.writeFile(workbook, `${exportFileName || 'export'}.xlsx`);
  };

  const rowCount = filteredData.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const firstRow = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, rowCount);

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative min-w-[220px] max-w-sm flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder={t('search', language)} value={search} onChange={(event) => setSearch(event.target.value)} className="rounded-[5px] pl-10 pr-10" />{search && <Button type="button" variant="ghost" size="icon" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-[5px] bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent"><X className="h-4 w-4" /></Button>}</div>
      {filterKey && filterOptions.length > 0 && <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-[5px] border border-border bg-field px-3 text-sm"><option value="">All</option>{filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>}
      {exportFileName && <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 rounded-[5px] border-border bg-white text-foreground hover:bg-white hover:text-foreground dark:bg-slate-900 dark:hover:bg-slate-900"><Download className="h-4 w-4" />{t('export', language)}</Button>}
    </div>
    <div className="overflow-x-auto rounded-[5px] border border-border bg-background shadow-sm"><Table className="table-fixed text-xs"><TableHeader className="bg-[#34495e]"><TableRow className="bg-[#34495e] hover:bg-[#34495e]">{table.getHeaderGroups().flatMap((headerGroup) => headerGroup.headers).map((header) => { const column = columns.find((item) => item.key === header.column.id); const align = column?.align || 'center'; return <TableHead key={header.id} style={{ width: column?.width }} className={`h-10 bg-[#34495e] py-2 ${alignmentClasses[align]} text-white`}><button type="button" disabled={!header.column.getCanSort()} onClick={header.column.getToggleSortingHandler()} className="flex h-full w-full items-center justify-center gap-2 font-semibold text-white disabled:cursor-default">{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getCanSort() && (header.column.getIsSorted() === 'asc' ? <ArrowUp className="h-4 w-4 opacity-80" /> : header.column.getIsSorted() === 'desc' ? <ArrowDown className="h-4 w-4 opacity-80" /> : <ArrowDown className="h-4 w-4 opacity-40" />)}</button></TableHead>; })}{actions && <TableHead className="h-10 bg-[#34495e] py-2 text-center font-semibold text-white">Actions</TableHead>}</TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center text-muted-foreground">Loading...</TableCell></TableRow> : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id} className="hover:bg-muted/30">{row.getVisibleCells().map((cell) => { const column = columns.find((item) => item.key === cell.column.id); const align = column?.align || 'center'; return <TableCell key={cell.id} style={{ width: column?.width }} className={`py-2 ${alignmentClasses[align]}`}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>; })}{actions && <TableCell className="py-1 text-center [&_button]:h-8 [&_button]:w-8 [&_button]:rounded-[5px]"><div className="flex justify-center [&>div]:justify-center">{actions(row.original)}</div></TableCell>}</TableRow>) : <TableRow><TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center text-muted-foreground">No results.</TableCell></TableRow>}</TableBody></Table></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-4"><p className="text-sm text-muted-foreground" aria-live="polite"><span className="text-foreground">{firstRow}-{lastRow}</span> of <span className="text-foreground">{rowCount}</span></p><label htmlFor={id} className="flex items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">Rows per page<select id={id} value={pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))} className="h-9 rounded-[5px] border border-border bg-field px-2 text-foreground">{pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}</select></label></div><div className="flex gap-1"><Button size="icon" variant="outline" className="rounded-[5px]" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()} aria-label="Go to first page"><ChevronFirst className="h-4 w-4" /></Button><Button size="icon" variant="outline" className="rounded-[5px]" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Go to previous page"><ChevronLeft className="h-4 w-4" /></Button><Button size="icon" variant="outline" className="rounded-[5px]" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Go to next page"><ChevronRight className="h-4 w-4" /></Button><Button size="icon" variant="outline" className="rounded-[5px]" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()} aria-label="Go to last page"><ChevronLast className="h-4 w-4" /></Button></div></div>
  </div>;
}
