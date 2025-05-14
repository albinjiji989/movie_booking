function generateSeatingLayout({ layoutRanges, seatsPerRow }) {
    const seatingLayout = [];
    const status = 'available';
  
    const getCharRange = (start, end) => {
      const range = [];
      for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
        range.push(String.fromCharCode(i));
      }
      return range;
    };
  
    Object.entries(layoutRanges).forEach(([type, [startRow, endRow]]) => {
      const rows = getCharRange(startRow, endRow);
      rows.forEach(row => {
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
          seatingLayout.push({
            seatId: `${row}${seatNum}`,
            row,
            number: seatNum,
            type,
            status
          });
        }
      });
    });
  
    return seatingLayout;
  }
  
  module.exports = generateSeatingLayout;
  