require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitflow', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Models
const User = require('./models/User');
const Habit = require('./models/Habit');

// --- Routes ---

// Default route
app.get('/', (req, res) => {
    res.send('HabitFlow API is running');
});

// Authentication Routes

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Check existing
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        });

        if (existingUser) {
            if (existingUser.email.toLowerCase() === email.toLowerCase()) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            return res.status(400).json({ message: 'Username already taken' });
        }

        const newUser = new User({
            name,
            username,
            email: email.toLowerCase(),
            password, // In production, hash this password!
            level: 1,
            currentXp: 0,
            nextLevelXp: 1000,
            totalXp: 0,
            darkMode: true,
            language: 'es',
            subscriptionPlan: 'free',
            onboardingCompleted: false
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const user = await User.findOne({
            $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // In production, compare hashed password
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json(user);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// User Routes

// Get all users (for ranking)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ totalXp: -1 }).limit(50);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Update User
app.put('/api/users/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const updates = req.body;
        delete updates.password; // Prevent password update via this route for simplicity
        delete updates._id;

        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            updates,
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});


// Habit Routes

// Get habits for user
app.get('/api/habits/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email.toLowerCase() });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const habits = await Habit.find({ userId: user._id });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching habits' });
    }
});

// Save habits (sync/update)
app.post('/api/habits/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email.toLowerCase() });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const habitsData = req.body; // Array of habits

        // Simple strategy: Delete existing and re-insert (easiest for syncing full state)
        // A more complex strategy would be patch updates
        await Habit.deleteMany({ userId: user._id });

        const habitsToInsert = habitsData.map(h => ({
            ...h,
            userId: user._id
        }));

        if (habitsToInsert.length > 0) {
            await Habit.insertMany(habitsToInsert);
        }

        res.json({ message: 'Habits saved successfully' });
    } catch (error) {
        console.error('Error saving habits:', error);
        res.status(500).json({ message: 'Error saving habits' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
