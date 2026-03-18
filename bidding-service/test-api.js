const axios = require('axios');
axios.get('http://localhost:3003/1')
  .then(res => {
    console.log("HISTORY:", JSON.stringify(res.data.history, null, 2));
    console.log("RANKINGS:", JSON.stringify(res.data.rankings, null, 2));
  })
  .catch(console.error);
