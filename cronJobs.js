const cron = require('node-cron');
const moment = require('moment');
const Schedule = require('./models/movieScheduleSchema');
const Screen = require('./models/screenSchema');
const LockedSeat = require('./models/lockedSeatSchema');
const Booking = require('./models/bookingSchema'); // ✅ Add this line

// 1. Reset seat status after movie ends (runs every minute)
cron.schedule('*/1 * * * *', async () => {
  try {
    const currentTime = moment();
    const schedules = await Schedule.find({ status: 'active' });

    for (const schedule of schedules) {
      const movieEndTime = moment(schedule.endTime, 'HH:mm');
      const currentDate = moment().format('YYYY-MM-DD');
      const scheduleDate = moment(schedule.date).format('YYYY-MM-DD');

      if (movieEndTime.isBefore(currentTime) && currentDate === scheduleDate) {
        const screen = await Screen.findOne({ screenId: schedule.screen });

        if (screen) {
          screen.seatingLayout.forEach(seat => {
            seat.status = 'available'; // Reset all seats after movie ends
          });

          await screen.save();
          console.log(`✅ All seats in screen ${schedule.screen} are now available.`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error resetting seats after movie end:', err.message);
  }
});

// 2. Clear expired seat locks (runs every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  try {
    const expiredLocks = await LockedSeat.find({
      expiresAt: { $lte: new Date() }
    });

    for (const lock of expiredLocks) {
      const screen = await Screen.findOne({ screenId: lock.scheduleId });
      if (screen) {
        const seat = screen.seatingLayout.find(seat => seat.seatId === lock.seatId);
        if (seat && seat.status === 'locked') {
          seat.status = 'available'; // Release locked seat
        }
        await screen.save();
      }

      await LockedSeat.deleteOne({ _id: lock._id });
    }

    console.log(`✅ Expired seat locks cleared. Deleted: ${expiredLocks.length}`);
  } catch (err) {
    console.error('❌ Failed to clear expired seat locks:', err.message);
  }
});

// 3. Expire unpaid bookings after 10 minutes (runs every 2 minutes)
cron.schedule('*/2 * * * *', async () => {
  try {
    const expiryTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

    const expiredBookings = await Booking.find({
      paymentStatus: 'pending',
      bookingStatus: 'confirmed',
      bookedAt: { $lte: expiryTime }
    });

    for (const booking of expiredBookings) {
      const schedule = await Schedule.findById(booking.scheduleId);
      const screen = await Screen.findOne({ screenId: schedule.screen });

      if (screen) {
        booking.seats.forEach(bookedSeat => {
          const seat = screen.seatingLayout.find(s => s.seatId === bookedSeat.seatId);
          if (seat && seat.status === 'booked') {
            seat.status = 'available';
          }
        });
        await screen.save();
      }

      booking.paymentStatus = 'failed';
      booking.bookingStatus = 'cancelled';
      await booking.save();
    }

    console.log(`✅ Expired unpaid bookings cleaned: ${expiredBookings.length}`);
  } catch (err) {
    console.error('❌ Error cleaning expired unpaid bookings:', err.message);
  }
});
