// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const generateColorfulTicket = async ({ booking, user, theatre, movie, screen, seatDetails }) => {
//   const ticketPath = path.join(__dirname, `../tickets/booking_${booking._id}.pdf`);
//   const doc = new PDFDocument({ size: 'A6', layout: 'landscape', margin: 20 });

//   doc.pipe(fs.createWriteStream(ticketPath));

//   // Background with gradient-like rectangle for style
//   doc.rect(0, 0, 420, 200)
//     .fill('#1E88E5'); // Vibrant blue base color

//   // Overlay white rounded rectangle for content
//   doc.roundedRect(15, 15, 390, 170, 15)
//     .fill('#fff');

//   // Header: Movie Ticket Title with icon
//   doc.fillColor('#D32F2F') // Strong red accent
//     .fontSize(26)
//     .font('Helvetica-Bold')
//     .text('🎟️ CINENOW MOVIE TICKET', 25, 30);

//   // Movie Title
//   doc.fillColor('#212121')
//     .fontSize(18)
//     .font('Helvetica-Bold')
//     .text(movie.title, 25, 70, { width: 350, ellipsis: true });

//   // User and Booking info block
//   doc.fontSize(12)
//     .fillColor('#616161')
//     .font('Helvetica')
//     .text(`Name: ${user.name || user.email}`, 25, 100)
//     .text(`Theatre: ${theatre.name}`, 25, 120)
//     .text(`Screen: ${screen.screenName}`, 25, 140)
//     .text(`Date: ${new Date(booking.bookingDate).toLocaleDateString()}`, 25, 160)
//     .text(`Time: ${booking.timeSlot || 'N/A'}`, 25, 180);

//   // Seats block on right side with colored dots for seat types
//   const seatStartX = 300;
//   doc.fillColor('#D32F2F')
//     .font('Helvetica-Bold')
//     .fontSize(14)
//     .text('Seats:', seatStartX, 100);

//   seatDetails.forEach((seat, i) => {
//     let color;
//     switch (seat.seatType.toLowerCase()) {
//       case 'platinum':
//         color = '#FFD700'; // Gold
//         break;
//       case 'gold':
//         color = '#FFA000'; // Dark orange
//         break;
//       default:
//         color = '#90CAF9'; // Light blue for Silver
//     }

//     const yPos = 120 + i * 20;
//     // Colored circle indicator for seat type
//     doc.circle(seatStartX + 10, yPos + 6, 6)
//       .fill(color);
//     doc.fillColor('#212121')
//       .font('Helvetica')
//       .fontSize(12)
//       .text(`${seat.seatId} (${seat.seatType})`, seatStartX + 25, yPos);
//   });

//   // Price total at bottom left
//   doc.fillColor('#1E88E5')
//     .fontSize(16)
//     .font('Helvetica-Bold')
//     .text(`Total Paid: ₹${booking.totalAmount}`, 25, 210);

//   // Footer with thank you in small caps and colored background bar
//   doc.rect(0, 230, 420, 30)
//     .fill('#D32F2F');

//   doc.fillColor('#fff')
//     .fontSize(14)
//     .font('Helvetica-Bold')
//     .text('Thank you for booking with CineNow!', 100, 237, { width: 300, align: 'center' });

//   doc.end();

//   return ticketPath;
// };
