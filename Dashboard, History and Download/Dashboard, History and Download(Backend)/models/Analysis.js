const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: String,
  xAxis: String,
  yAxis: String,
  chartType: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Analysis", analysisSchema);