import React from "react";

interface TableProps {
  columns: React.ReactNode[];
  rows: React.ReactNode[][];
}

export default function Table({ columns, rows }: TableProps) {
  return (
    <div className="table-container">
      <table className="table is-hoverable is-fullwidth is-striped">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, id) => (
            <Row row={row} key={id} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row(props: { row: React.ReactNode[] }) {
  return (
    <tr>
      {props.row.map((col, idx) => (
        <td key={idx}>{col}</td>
      ))}
    </tr>
  );
}
