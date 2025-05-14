const Screen = require('../models/screenSchema');
const Theatre = require('../models/theatreSchema');
const generateSeatingLayout = require('../utils/seatingGenerator');

exports.addScreen = async (req, res) => {
  try {
    const { screenId, theatreId, screenName, layoutRanges, seatsPerRow } = req.body;

    const seatingLayout = generateSeatingLayout({ layoutRanges, seatsPerRow });

    const screen = new Screen({
      screenId,
      theatreId,
      screenName,
      seatingLayout
    });

    await screen.save();

    await Theatre.findOneAndUpdate(
      { theatreId },
      { $addToSet: { screens: screenId } }
    );

    res.status(201).json({
      message: 'Screen created successfully',
      screen
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating screen' });
  }
};
