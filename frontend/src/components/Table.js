import React from "react";
import { Table } from "react-bootstrap";
import "../style.css";

function DataTable({ data }) {
    return (
        <div className="table-container">
            <Table striped bordered hover responsive className="shadow">
                <thead className="table-dark">
                <tr>
                    {data.length > 0
                        ? Object.keys(data[0]).map((key) => <th key={key}>{key.toUpperCase()}</th>)
                        : <th>Nessun dato disponibile</th>}
                </tr>
                </thead>
                <tbody>
                {data.length > 0
                    ? data.map((item, index) => (
                        <tr key={index}>
                            {Object.values(item).map((value, i) => <td key={i}>{value}</td>)}
                        </tr>
                    ))
                    : <tr><td colSpan="100%">Nessun dato disponibile</td></tr>}
                </tbody>
            </Table>
        </div>
    );
}

export default DataTable;



