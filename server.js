const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Atlas Connection
const cloudURI = "mongodb://ajbhai192837465_db_user:joQQAMUMnKK1v5OF@cluster0-shard-00-00.g7kubzo.mongodb.net:27017,cluster0-shard-00-01.g7kubzo.mongodb.net:27017,cluster0-shard-00-02.g7kubzo.mongodb.net:27017/expenseDB?ssl=true&replicaSet=atlas-g7kubzo-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(cloudURI)
  .then(() => console.log('MongoDB Atlas Cloud Connected Successfully!'))
  .catch(err => console.error('Connection Error:', err));

// Schema & Model
const expenseSchema = new mongoose.Schema({
  amount: Number,
  category: String,
  note: String,
  date: Date,
  day: String
});

const Expense = mongoose.model('Expense', expenseSchema);

// 1. Naya Kharcha Save Karne Ki API
app.post('/api/expenses', async (req, res) => {
  try {
    const { amount, category, note, date } = req.body;
    const entryDate = date ? new Date(date) : new Date();
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[entryDate.getDay()];

    const newExpense = new Expense({
      amount,
      category,
      note,
      date: entryDate,
      day: dayName
    });

    await newExpense.save();
    res.status(201).json({ message: 'Expense Saved Successfully', data: newExpense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Selected Month Ka Data Aur Total Nikalne Ki API
app.get('/api/expenses/month/:monthNumber', async (req, res) => {
  try {
    const month = parseInt(req.params.monthNumber);
    const year = new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    res.json({ expenses, totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic Port Assignment (Render environment mate zaroori)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));