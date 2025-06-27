exports.handler = async (event, context) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const filePath = path.join(__dirname, '../../dist/assets/index.js');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000'
      },
      body: fileContent
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: 'File not found'
    };
  }
};
