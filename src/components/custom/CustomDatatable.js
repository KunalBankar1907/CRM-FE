import React, { useState, useMemo } from "react";

const CustomDataTable = ({
    tableClass = "",
    theadClass = "",
    columns = [],
    data = [],
    renderActions = null,
    noDataText = "No records found",
}) => {
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });

    const handleSort = (field) => {
        if (!field) return;

        setSortConfig((prev) => ({
            key: field,
            direction:
                prev.key === field && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (typeof aVal === "number") {
                return sortConfig.direction === "asc"
                    ? aVal - bVal
                    : bVal - aVal;
            }

            return sortConfig.direction === "asc"
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }, [data, sortConfig]);

    const getSortIcon = (field) => {
        if (sortConfig.key !== field) return "↕";
        return sortConfig.direction === "asc" ? "↑" : "↓";
    };

    return (
        <div className="table-responsive shadow-sm rounded bg-white">
            <table
                className={`table table-bordered table-hover align-middle mb-0 ${tableClass}`}
            >
                <thead className={theadClass}>
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                style={{
                                    fontWeight: "600",
                                    cursor: col.sortable ? "pointer" : "default",
                                    textAlign: col.align || "left",
                                    userSelect: "none",
                                }}
                                onClick={() => col.sortable && handleSort(col.field)}
                            >
                                <span className="d-flex align-items-center gap-1">
                                    {col.label}
                                    {col.sortable && (
                                        <small>{getSortIcon(col.field)}</small>
                                    )}
                                </span>
                            </th>
                        ))}

                        {renderActions && (
                            <th style={{ fontWeight: "600", textAlign: "center" }}>
                                Action
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {sortedData.length > 0 ? (
                        sortedData.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex}>
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        style={{ textAlign: col.align || "left" }}
                                    >
                                        {col.render
                                            ? col.render(row)
                                            : row[col.field]}
                                    </td>
                                ))}

                                {renderActions && (
                                    <td className="text-center">
                                        {renderActions(row)}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length + (renderActions ? 1 : 0)}
                                className="text-center py-4 text-muted"
                            >
                                {noDataText}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CustomDataTable;
