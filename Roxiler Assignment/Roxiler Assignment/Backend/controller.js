const axios = require('axios');
const ProductTransaction = require('../models/ProductTransaction');

const initializeDatabase = async (req, res) => {
  const url = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';
  try {
    const response = await axios.get(url);
    const data = response.data;
    await ProductTransaction.deleteMany({});
    await ProductTransaction.insertMany(data);
    res.status(200).send('Database initialized with seed data.');
  } catch (error) {
    res.status(500).send('Error initializing database.');
  }
};

const getTransactions = async (req, res) => {
  const { page = 1, perPage = 10, search = '', month } = req.query;
  const query = { dateOfSale: { $regex: `-${month.padStart(2, '0')}-` } };

  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { price: new RegExp(search, 'i') }
    ];
  }

  try {
    const transactions = await ProductTransaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    const totalCount = await ProductTransaction.countDocuments(query);
    res.json({ transactions, totalPages: Math.ceil(totalCount / perPage) });
  } catch (error) {
    res.status(500).send('Error fetching transactions.');
  }
};

const getStatistics = async (req, res) => {
  const { month } = req.query;
  try {
    const transactions = await ProductTransaction.find({
      dateOfSale: { $regex: `-${month.padStart(2, '0')}-` }
    });

    const totalSaleAmount = transactions.reduce((acc, item) => item.sold ? acc + item.price : acc, 0);
    const totalSoldItems = transactions.filter(item => item.sold).length;
    const totalNotSoldItems = transactions.filter(item => !item.sold).length;

    res.json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
  } catch (error) {
    res.status(500).send('Error fetching statistics.');
  }
};

const getBarChart = async (req, res) => {
  const { month } = req.query;
  try {
    const transactions = await ProductTransaction.find({
      dateOfSale: { $regex: `-${month.padStart(2, '0')}-` }
    });

    const priceRanges = {
      '0-100': 0, '101-200': 0, '201-300': 0, '301-400': 0, '401-500': 0,
      '501-600': 0, '601-700': 0, '701-800': 0, '801-900': 0, '901-above': 0
    };

    transactions.forEach(t => {
      if (t.price <= 100) priceRanges['0-100'] += 1;
      else if (t.price <= 200) priceRanges['101-200'] += 1;
      else if (t.price <= 300) priceRanges['201-300'] += 1;
      else if (t.price <= 400) priceRanges['301-400'] += 1;
      else if (t.price <= 500) priceRanges['401-500'] += 1;
      else if (t.price <= 600) priceRanges['501-600'] += 1;
      else if (t.price <= 700) priceRanges['601-700'] += 1;
      else if (t.price <= 800) priceRanges['701-800'] += 1;
      else if (t.price <= 900) priceRanges['801-900'] += 1;
      else priceRanges['901-above'] += 1;
    });

    res.json(priceRanges);
  } catch (error) {
    res.status(500).send('Error fetching bar chart data.');
  }
};

const getPieChart = async (req, res) => {
  const { month } = req.query;
  try {
    const transactions = await ProductTransaction.find({
      dateOfSale: { $regex: `-${month.padStart(2, '0')}-` }
    });

    const categoryCounts = {};
    transactions.forEach(t => {
      if (categoryCounts[t.category]) {
        categoryCounts[t.category] += 1;
      } else {
        categoryCounts[t.category] = 1;
      }
    });

    res.json(categoryCounts);
  } catch (error) {
    res.status(500).send('Error fetching pie chart data.');
  }
};

const getCombinedData = async (req, res) => {
  const { month } = req.query;
  try {
    const transactions = await ProductTransaction.find({
      dateOfSale: { $regex: `-${month.padStart(2, '0')}-` }
    });

    const totalSaleAmount = transactions.reduce((acc, item) => item.sold ? acc + item.price : acc, 0);
    const totalSoldItems = transactions.filter(item => item.sold).length;
    const totalNotSoldItems = transactions.filter(item => !item.sold).length;

    const priceRanges = {
      '0-100': 0, '101-200': 0, '201-300': 0, '301-400': 0, '401-500': 0,
      '501-600': 0, '601-700': 0, '701-800': 0, '801-900': 0, '901-above': 0
    };

    transactions.forEach(t => {
      if (t.price <= 100) priceRanges['0-100'] += 1;
      else if (t.price <= 200) priceRanges['101-200'] += 1;
      else if (t.price <= 300) priceRanges['201-300'] += 1;
      else if (t.price <= 400) priceRanges['301-400'] += 1;
      else if (t.price <= 500) priceRanges['401-500'] += 1;
      else if (t.price <= 600) priceRanges['501-600'] += 1;
      else if (t.price <= 700) priceRanges['601-700'] += 1;
      else if (t.price <= 800) priceRanges['701-800'] += 1;
      else if (t.price <= 900) priceRanges['801-900'] += 1;
      else priceRanges['901-above'] += 1;
    });

    const categoryCounts = {};
    transactions.forEach(t => {
      if (categoryCounts[t.category]) {
        categoryCounts[t.category] += 1;
      } else {
        categoryCounts[t.category] = 1;
      }
    });

    res.json({
      statistics: { totalSaleAmount, totalSoldItems, totalNotSoldItems },
      barChart: priceRanges,
      pieChart: categoryCounts,
      transactions
    });
  } catch (error) {
    res.status(500).send('Error fetching combined data.');
  }
};

module.exports = {
  initializeDatabase,
  getTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData
};
