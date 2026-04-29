require('dotenv').config();
const baiduDocumentService = require('./services/baiduDocumentService');
const fs = require('fs');
const path = require('path');

async function testBaiduService() {
  try {
    // 查找测试文件
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('Uploads directory not found:', uploadsDir);
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.log('No PDF files found in uploads directory');
      return;
    }

    const testFile = path.join(uploadsDir, pdfFiles[0]);
    console.log('Testing with file:', testFile);

    // 测试百度智能云文档解析
    console.log('\n=== Testing Baidu Document Service ===');
    const content = await baiduDocumentService.parseDocument(testFile);
    console.log('Parsed content length:', content.length);
    console.log('Parsed content preview:', content.substring(0, 500));

  } catch (error) {
    console.error('Test failed:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
  }
}

testBaiduService();
