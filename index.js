const express = require('express');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'internship_db'
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Middleware to parse JSON bodies
app.use(express.json());

// API routes

// GET data with search and filter
app.get('/api/data', (req, res) => {
  const { ticker, column, period } = req.query;

  // Construct the SELECT clause based on the requested columns
  let selectClause = '*';
  if (column) {
    const columns = column.split(',');
    selectClause = columns.join(',');
  }

  // Construct the WHERE clause based on the query parameters
  const whereClause = [];
  const queryParams = [];
  if (ticker) {
    whereClause.push('ticker = ?');
    queryParams.push(ticker);
  }
  // Add logic for period filter if needed

  let query = `SELECT ${selectClause} FROM sample_data_historic`;
  if (whereClause.length > 0) {
    query += ' WHERE ' + whereClause.join(' AND ');
  }

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }

    // Convert results to HTML table format
    let htmlTable = '<table border="1">';
    htmlTable += '<tr>';
    for (const column in results[0]) {
      htmlTable += `<th>${column}</th>`;
    }
    htmlTable += '</tr>';
    results.forEach(row => {
      htmlTable += '<tr>';
      for (const column in row) {
        htmlTable += `<td>${row[column]}</td>`;
      }
      htmlTable += '</tr>';
    });
    htmlTable += '</table>';

    res.send(htmlTable);
  });
});

// POST new data
app.post('/api/data', (req, res) => {
  const { ticker, date, revenue, gp, fcf, capex } = req.body;
  const query = `INSERT INTO sample_data_historic (ticker, date, revenue, gp, fcf, capex) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
  connection.query(query, [ticker, date, revenue, gp, fcf, capex], (err, result) => {
    if (err) {
      console.error('Error creating data:', err);
      res.status(500).json({ error: 'Error creating data' });
      return;
    }
    res.status(201).json({ message: 'Data created successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
