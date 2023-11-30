import React, { useState } from 'react';
import { getDocs, addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import setGridStyle from '../setGridStyle';

const History = () => {

    const data = [
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 1', result: '2' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 2', result: '-0.5' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 3', result: '1' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 4', result: '-2' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 5', result: '3' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '1' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },
        { when: '11.07.2023', who: 'P. McSlarrow', where: 'Random Address 6', result: '-1' },

    ];
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(13, 1fr)',
        gridTemplateRows: 'repeat(30, 1fr)',
        gap: '10px',
    };
    const tableHeaderStyle = {
        textAlign: 'center',
        fontSize: '25px'
    };
    const tableCellStyle = {
        border: '1px solid rgba(255, 255, 255, 0.5)'
    };

    const h1Style = setGridStyle(2, 2, 13, 2, undefined, "8vw", false);
    const horizontalLine = setGridStyle(6, 4, 9, 4, "#da3c28", undefined, false);
    const paragraph = setGridStyle(5, 8, 10, 8, undefined, undefined, false);
    const tableGrid = setGridStyle(3, 10, 12, 30, undefined, undefined, true)

    return (
        <section id="history">
          <div id="history-container" style={gridStyle}>
            <h1 style={h1Style}>Your history</h1>
            <div style={horizontalLine}></div>
            <p style={paragraph}>See how previous games stack up.</p>

            <div style={{ ...tableGrid, overflow: 'auto' }}> 
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead style={tableHeaderStyle}>
                  <tr>
                    <th style={{ ...tableCellStyle, height: '50px' }}>When</th>
                    <th style={ tableCellStyle }>Who</th>
                    <th style={ tableCellStyle }>Where</th>
                    <th style={ tableCellStyle }>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => ( 
                    <tr key={index} style={{ border: '1px solid white' }}>
                        <td style={index === 0 ? { ...tableCellStyle, borderTop: '1px solid white' } : tableCellStyle}>
                         {row.when}
                        </td>
                        <td style={{ ...tableCellStyle, height: '50px' }}>{row.who}</td>
                        <td style={tableCellStyle}>{row.where}</td>
                        <td style={{
                            ...tableCellStyle,
                            color: parseFloat(row.result) > 0 ? 'green' : 'red',
                            fontSize: '20px'
                            }}>
                            {row.result}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );          
}

export { History }