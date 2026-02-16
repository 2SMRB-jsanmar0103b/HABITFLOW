const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    level: { type: Number, default: 1 },
    currentXp: { type: Number, default: 0 },
    nextLevelXp: { type: Number, default: 1000 },
    totalXp: { type: Number, default: 0 },
    darkMode: { type: Boolean, default: true },
    language: { type: String, default: 'es', enum: ['es', 'en'] },
    profileImage: String,
    subscriptionPlan: { type: String, default: 'free', enum: ['free', 'basic', 'premium'] },
    isGuest: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    onboardingAnswers: {
        goal: String,
        energy: String,
        intensity: String
    },
    weeklyXp: Number,
    maxStreakRecord: Number,
    hardestHabitCompleted: String
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
