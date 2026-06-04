import type { ReactNode } from "react";

// ── What each column needs ─────────────────────────────────────
interface IColumn<T> {
    header: string;
    render: (item: T, index: number) => ReactNode;
    cellClassName?: string;
    headerClassName?: string;
}

// ── What the Table component needs ─────────────────────────────
interface ITableProps<T> {
    columns: IColumn<T>[];
    data: T[];
    rowKey: (item: T, index: number) => string | number;
    emptyMessage?: string;
    emptySubMessage?: string;
}

// ── The Table component ────────────────────────────────────────
function Table<T>({
    columns,
    data,
    rowKey,
    emptyMessage = "No data available.",
    emptySubMessage,
}: ITableProps<T>) {
    return (
        <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse table-fixed min-w-[800px] max-md:min-w-[560px]">

                    {/* ── Table Header ── */}
                    <thead className="bg-slate-900/80 border-b border-slate-700">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.header}
                                    className={`py-3.5 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.5px] whitespace-nowrap border-b border-slate-700 ${col.headerClassName ?? ""}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* ── Table Body ── */}
                    <tbody>
                        {data.length > 0
                            ? data.map((item, index) => (
                                <tr
                                    key={rowKey(item, index)}
                                    className="border-b border-slate-700/50 transition-colors duration-200 hover:bg-indigo-500/5 last:border-b-0"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.header}
                                            className={`p-4 align-middle ${col.cellClassName ?? ""}`}
                                        >
                                            {col.render(item, index)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                            : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="text-center py-10 px-5"
                                    >
                                        <p className="text-slate-400 text-base m-0">
                                            {emptyMessage}
                                        </p>
                                        {emptySubMessage && (
                                            <p className="text-slate-500 text-sm mt-2 mb-0">
                                                {emptySubMessage}
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Table;
