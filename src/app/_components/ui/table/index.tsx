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
import React, { useState } from "react"
import "./table.scss"

interface TableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	className?: string
	enableSorting?: boolean
	enablePagination?: boolean
	enableSelection?: boolean
	onSelectionChange?: (selectedRows: TData[]) => void
}

export function Table<TData, TValue>({
	columns,
	data,
	className,
	enableSorting = true,
	enablePagination = false,
	enableSelection = false,
	onSelectionChange,
}: TableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [rowSelection, setRowSelection] = useState({})

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

	// Compute selected rows when selection changes
	const selectedRows = React.useMemo(() => {
		// Touch rowSelection so it's a real dependency for linting and recomputation
		void rowSelection
		return table.getFilteredSelectedRowModel().rows.map((row) => row.original)
	}, [table, rowSelection])

	// Notify parent component of selection changes
	React.useEffect(() => {
		if (!onSelectionChange) return
		onSelectionChange(selectedRows)
	}, [onSelectionChange, selectedRows])

	return (
		<div className={`table ${className || ""}`}>
			<div className="table__container">
				<table className="table__table">
					<thead className="table__header">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="table__header__row">
								{headerGroup.headers.map((header) => (
									<th key={header.id} className="table__header__cell">
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="table__body">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className="table__body__row"
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="table__body__cell">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						) : (
							<tr className="table__body__row">
								<td colSpan={columns.length} className="table__body__cell table__body__cell--empty">
									No tags found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{enablePagination && (
				<div className="table__pagination">
					<div className="table__pagination__info">
						Showing{" "}
						{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
						{Math.min(
							(table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
							table.getFilteredRowModel().rows.length,
						)}{" "}
						of {table.getFilteredRowModel().rows.length} entries
					</div>
					<div className="table__pagination__controls">
						<button
							type="button"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
							className="table__pagination__button"
						>
							First
						</button>
						<button
							type="button"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className="table__pagination__button"
						>
							Previous
						</button>
						<button
							type="button"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className="table__pagination__button"
						>
							Next
						</button>
						<button
							type="button"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
							className="table__pagination__button"
						>
							Last
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
