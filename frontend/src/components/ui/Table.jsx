export const Table = ({
  columns,
  rows,
  emptyMessage = "No records found.",
}) => (
  <div className="overflow-hidden rounded-3xl border border-brand-border/70">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-brand-border/70 text-left text-sm">
        <thead className="bg-slate-50/90 text-brand-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/60 bg-white/90">
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50/90">
                {columns.map((column) => (
                  <td
                    key={`${row.id}-${column.key}`}
                    className="px-4 py-3 text-brand-text"
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="px-4 py-8 text-center text-brand-muted"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
