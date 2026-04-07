const express = require('express');
const app = express();

// Route
app.get('/', (req, res) => {
  res.send('Server Running');
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});