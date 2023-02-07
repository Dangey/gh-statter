const express = require('express');
const app = express();

const port = 3001;

app.use(express.static(__dirname + 'public'));

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
