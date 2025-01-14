const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
// export default app;  // Vercel will use this export

  