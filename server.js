const express = require('express')
const app = express()
const port = process.env.PORT || 3000
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
// export default app;  // Vercel will use this export

  