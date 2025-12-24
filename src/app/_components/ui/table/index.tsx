"use client"

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table"
import * as React from "react"
import { Button } from "@/app/_components/ui/button"
import { cn } from "@/utils/lib/shadcn-ui"

const TableRoot = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
	({ className, ...props }, ref) => (
		<div className="relative w-full overflow-auto">
			<table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
		</div>
	),
)
TableRoot.displayName = "TableRoot"

const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<thead ref={ref} className={cn("bg-muted/60 [&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tfoot
		ref={ref}
		className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
		{...props}
	/>
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
	({ className, ...props }, ref) => (
		<tr
			ref={ref}
			className={cn(
				"border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
				className,
			)}
			{...props}
		/>
	),
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
	HTMLTableCellElement,
	React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<th
		ref={ref}
		className={cn(
			"h-8 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			className,
		)}
		{...props}
	/>
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<td
		ref={ref}
		className={cn(
			"p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			className,
		)}
		{...props}
	/>
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
	HTMLTableCaptionElement,
	React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
	<caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
))
TableCaption.displayName = "TableCaption"

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	className?: string
	enableSorting?: boolean
	enablePagination?: boolean
	enableSelection?: boolean
	onSelectionChange?: (selectedRows: TData[]) => void
	emptyMessage?: string
	filterColumn?: string
	filterValue?: string
	defaultSorting?: SortingState
}

function Table<TData, TValue>({
	columns,
	data,
	className,
	enableSorting = true,
	enablePagination = false,
	enableSelection = false,
	onSelectionChange,
	emptyMessage = "No results.",
	filterColumn,
	filterValue,
	defaultSorting = [],
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>(defaultSorting)
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
	const [rowSelection, setRowSelection] = React.useState({})

	React.useEffect(() => {
		if (filterColumn && filterValue !== undefined) {
			setColumnFilters((prev) => {
				const newFilters = prev.filter((filter) => filter.id !== filterColumn)
				if (filterValue) {
					newFilters.push({ id: filterColumn, value: filterValue })
				}
				return newFilters
			})
		}
	}, [filterColumn, filterValue])

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onRowSelectionChange: setRowSelection,
		getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
		enableSorting,
		enableRowSelection: enableSelection,
		state: {
			sorting,
			columnFilters,
			rowSelection,
		},
	})

	const selectedRows = React.useMemo(() => {
		void rowSelection
		return table.getFilteredSelectedRowModel().rows.map((row) => row.original)
	}, [table, rowSelection])

	React.useEffect(() => {
		if (!onSelectionChange) return
		onSelectionChange(selectedRows)
	}, [onSelectionChange, selectedRows])

	return (
		<div className={cn("space-y-4", className)}>
			<div className="rounded-md border m-0">
				<TableRoot>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</TableRoot>
			</div>

			{(enablePagination || enableSelection) && (
				<div className="flex items-center justify-end space-x-2 py-4">
					{enableSelection && (
						<div className="text-muted-foreground flex-1 text-sm">
							{table.getFilteredSelectedRowModel().rows.length} of{" "}
							{table.getFilteredRowModel().rows.length} row(s) selected.
						</div>
					)}
					{enablePagination && (
						<div className="space-x-2">
							<Button
								variant="outline"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								Next
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRoot,
	TableRow,
}
