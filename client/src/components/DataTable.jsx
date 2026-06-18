import React from 'react';
import './DataTable.css';

// A generic data table driven entirely by props — no hardcoded column names.
// Props:
//   columns  (array)  — [{ key: 'name', label: 'Exercise Name' }, ...]
//                        key   = the property name on each data object
//                        label = the column header shown in the UI
//   data     (array)  — the array of objects fetched from the backend
//   caption  (string) — optional text shown above the table
function DataTable({ columns, data, caption }) {
  if (!data || data.length === 0) {
    return <p className="table-empty">No data to display.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        {caption && <caption>{caption}</caption>}

        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* For each object in data, create one row */}
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {/* For each column definition, pick that field from the row */}
              {columns.map(col => (
                <td key={col.key}>
                  {col.render
                    ? col.render(row[col.key] !== undefined ? row[col.key] : null, row)
                    : row[col.key] !== undefined && row[col.key] !== null
                      ? String(row[col.key])
                      : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
