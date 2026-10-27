require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5060;

app.listen(PORT, () => {
  console.log('====================================================');
  console.log('  RAWLINK TRACKER — Archival Wireframe Analytics');
  console.log(`  Server live on: http://localhost:${PORT}`);
  console.log(`  Herd site link: http://rawlink.test`);
  console.log(`  Dashboard API:  http://localhost:${PORT}/api/links`);
  console.log('====================================================');
});
