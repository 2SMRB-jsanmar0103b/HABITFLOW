const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id: String, // Keep the frontend ID as well for compatibility, or migrate away later
    title: { type: String, required: true },
    description: String,
    icon: String,
    color: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'extreme'] },
    frequencyType: { type: String, enum: ['daily', 'weekly'] },
    xpReward: Number,
    completedDates: [String], // Array of ISO date strings
    streak: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema);
