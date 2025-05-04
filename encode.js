const serviceAccount = require('./serviceAccountKey.json'); // replace with actual path

const base64 = Buffer.from(JSON.stringify(serviceAccount)).toString('base64');
console.log(base64);
