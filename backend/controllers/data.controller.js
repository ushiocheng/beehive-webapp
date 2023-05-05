const asyncHandler = require("express-async-handler");
const Apiary = require("../models/apiary.model.js");
const Data = require("../models/data.model.js");

// get n last data points from array
const getData = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  // Check if device exists
  const deviceExists = await Apiary.findOne({
    devices: {
      $elemMatch: {
        serial: req.body.serial,
      },
    },
  });

  // If !deviceExists, error
  if (!deviceExists) {
    res.status(400);
    throw new Error("Device does not exist");
  }

  const data = await Data.findOne({ serial: req.params.serial });

  if (limit > data.datapoints.length()) {
    res.status(204);
    return;
  }

  const points = data.datapoints.slice(-limit);

  res.status(200).json(points);
});

// @status  DONE
// @desc    Upload data point
// @route   POST /api/data/serial/:serial
// @access  NEEDS PROTECTION (ML TEAM AUTHORIZED ONLY)
const putData = asyncHandler(async (req, res) => {
  const {
    time,
    raw_activity,
    weather,
    prediction_activity,
    last_prediction_deviation,
  } = req.body;

  // Check if device exists
  const deviceExists = await Apiary.findOne({
    devices: {
      $elemMatch: {
        serial: req.body.serial,
      },
    },
  });

  // If !deviceExists, error
  if (!deviceExists) {
    res.status(400);
    throw new Error("Device does not exist");
  }

  const updatedData = await Data.findOneAndUpdate(
    { serial: req.params.serial },
    {
      $push: {
        datapoints: {
          time: time,
          raw_activity: raw_activity,
          weather: weather,
          prediction_activity: prediction_activity,
          last_prediction_deviation: last_prediction_deviation,
        },
      },
    },
    {
      new: true,
    }
  );

  res.status(200).json(updatedData);
});

module.exports = {
  getData,
  putData,
};
