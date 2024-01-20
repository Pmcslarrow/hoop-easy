export default function setGridStyle( startCol, startRow, endCol, endRow, color, fontSize, border ) {
    let columnDifference = endCol - startCol;
    let rowDifference = endRow - startRow;
    
    if (columnDifference < 0) {
        columnDifference = 0;
    }
    
    if (rowDifference < 0) {
        rowDifference = 0;
    }
    
    const spanColumn = `span ${columnDifference}`;
    const spanRow = `span ${rowDifference}`;
    
    const style = {
        gridColumnStart: String(startCol),
        gridRowStart: String(startRow),
        gridColumnEnd: spanColumn,
        gridRowEnd: spanRow,
    };
    
    if (color) {
        style.backgroundColor = color;
    } else {
        style.backgroundColor = 'none';
    }

    if (fontSize) {
            style.fontSize = fontSize
    } 

    if (border) {
            style.border = '1px solid white'
    }

    style.margin = '0'
    style.textAlign = 'center'
    style.textDecoration = 'none'

    return style;
}
