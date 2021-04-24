import { Fragment, useRef, useState } from "react";
import Head from "next/head";
import Header from "@components/Header";
import _cloneDeep from "lodash/cloneDeep";

import useCalculator from "@hooks/useCalculator";
import type { Calculation } from "@hooks/useCalculator";

export type TDataRow = [string, number, number];
export type TData = Array<TDataRow>;

function addRow(dataset: TData): TData {
  return [
    ...dataset,
    ["", 0, 0],
  ];
}

function removeRow(dataset: TData, removalIndex: number): TData {
  const clone = _cloneDeep(dataset);

  clone.splice(removalIndex, 1);

  return clone;
}

const tableCellStyles = {
  padding: "0.3rem 0.8rem",

};

export default function Home() {
  const tableRef = useRef<HTMLTableElement>(null);
  const calculate = useCalculator();
  const [data, setData] = useState<TData>([["", 0, 0]]);
  const [calculations, setCalculations] = useState<Calculation>([])

  function handleInput(e: React.FormEvent<HTMLInputElement>, data: TData) {
    const clone = _cloneDeep(data);
    const rowNumber = Number(e.currentTarget.dataset.row);
    const columnNumber = Number(e.currentTarget.dataset.column);
    const value = columnNumber === 0 
      ? e.currentTarget.value
      : Number(e.currentTarget.value);

    clone[rowNumber][columnNumber] = value;

    setData(clone);
    setCalculations(calculate(clone));
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    const rowNumber = Number(e.currentTarget.dataset.row);
    const columnNumber = Number(e.currentTarget.dataset.column);

    if (
      e.code === "Enter" ||
      e.code === "Tab" &&
      !e.shiftKey &&
      rowNumber === data.length - 1 &&
      columnNumber === 2
    ) {
      e.preventDefault();
      setData(addRow(data));
    } else if (
      e.code === "Backspace" &&
      e.currentTarget.value == ""
      && columnNumber === 0
      && rowNumber > 0
    ) {
      e.preventDefault();
      setData(removeRow(data, rowNumber));

      // Select the last cell of the row above the one we just deleted
      const previousCellSelector =
        `tbody tr:nth-child(${rowNumber}) td:nth-child(3) input`;
      const previousCell = tableRef
        .current
        .querySelector(previousCellSelector) as HTMLElement;

      previousCell.focus();
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Average Price Calculatore</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Average Price Calculator" />
        <table ref={tableRef}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Ounces</th>
              <th>Price</th>
              <th>Average</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: TDataRow, index: number) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    onChange={(e) => handleInput(e, data)}
                    onKeyDown={handleKeyPress}
                    value={row[0]}
                    data-row={index}
                    data-column={0}
                    autoFocus
                  />
                </td>
                <td>
                  <input
                    type="number"
                    onChange={(e) => handleInput(e, data)}
                    onKeyDown={handleKeyPress}
                    value={row[1]}
                    data-row={index}
                    data-column={1}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    onChange={(e) => handleInput(e, data)}
                    onKeyDown={handleKeyPress}
                    value={row[2]}
                    data-row={index}
                    data-column={2}
                  />
                </td>
                <td style={{paddingLeft: 10, textAlign: 'right'}}>
                  ${(row[2] / row[1]).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <section>
          <h2 style={{marginTop: '3rem', textAlign: 'center'}}>Calculations</h2>
          <table cellSpacing={15}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Total Ounces</th>
                <th>Average Price</th>
              </tr>
            </thead>
            <tbody>
              {calculations.map(row => (
                <tr key={row.description}>
                  <td style={{...tableCellStyles, paddingLeft: 0}}>{row.description}</td>
                  <td style={tableCellStyles}>{row.ounces.toFixed(3)} </td>
                  <td style={{...tableCellStyles, paddingRight: 0, textAlign: 'right'}}>${row.avgPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
