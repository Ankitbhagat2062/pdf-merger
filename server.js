const express = require('express')
const app = express()
const port = 3000

// Create an API endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Export the app as a Vercel-compatible handler
module.exports = app;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})