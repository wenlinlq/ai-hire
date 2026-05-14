const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const pdf = require("pdf-parse");

class BaiduDocumentService {
  constructor() {
    this.apiKey = process.env.BAIDU_API_KEY || "";
    this.secretKey = process.env.BAIDU_SECRET_KEY || "";
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }

  async getAccessToken() {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        "https://aip.baidubce.com/oauth/2.0/token",
        null,
        {
          params: {
            grant_type: "client_credentials",
            client_id: this.apiKey,
            client_secret: this.secretKey,
          },
        },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpireTime = now + (response.data.expires_in - 60) * 1000;
      return this.accessToken;
    } catch (error) {
      console.error("Error getting Baidu access token:", error.message);
      throw error;
    }
  }

  async parseDocument(filePath) {
    try {
      console.log("Parsing document:", filePath);

      if (!fs.existsSync(filePath)) {
        throw new Error("Document file not found");
      }

      // 检查文件扩展名
      const ext = filePath.toLowerCase().split(".").pop();

      if (ext === "pdf") {
        // PDF文件使用pdfjs-dist提取文本
        console.log("File is PDF, using pdfjs-dist to extract text");
        return await this.parsePdfFile(filePath);
      } else {
        // 图片文件使用百度OCR
        console.log("File is image, using Baidu OCR");
        return await this.parseImageFile(filePath);
      }
    } catch (error) {
      console.error("Error parsing document:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw error;
    }
  }

  async parsePdfFile(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      console.log("PDF parsing completed, text length:", data.text.length);

      // 如果提取的文本为空或很短，可能是扫描件 PDF，尝试使用百度 OCR
      if (!data.text || data.text.trim().length < 10) {
        console.log(
          "PDF text is empty or too short, trying Baidu OCR for scanned PDF",
        );
        return await this.parsePdfWithOCR(filePath);
      }

      return data.text;
    } catch (error) {
      console.error("Error parsing PDF file:", error.message);
      throw error;
    }
  }

  async parsePdfWithOCR(filePath) {
    try {
      const accessToken = await this.getAccessToken();
      const fileBuffer = fs.readFileSync(filePath);
      const base64Content = fileBuffer.toString("base64");

      console.log("Sending scanned PDF to Baidu OCR");

      const response = await axios.post(
        `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`,
        { image: base64Content },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 60000,
        },
      );

      console.log("Baidu OCR response for PDF received");

      if (response.data.error_code) {
        throw new Error(`Baidu API error: ${response.data.error_msg}`);
      }

      const textContent = this.extractTextFromResponse(response.data);
      console.log("Extracted text from scanned PDF:", textContent.length);

      return textContent;
    } catch (error) {
      console.error("Error parsing scanned PDF with Baidu OCR:", error.message);
      return "";
    }
  }

  async parseImageFile(filePath) {
    try {
      const accessToken = await this.getAccessToken();

      // 使用 Base64 编码上传图片，避免 FormData 导致的 transcoding error
      const fileBuffer = fs.readFileSync(filePath);
      const base64Content = fileBuffer.toString("base64");

      console.log(
        "Sending image to Baidu OCR, base64 size:",
        base64Content.length,
      );

      const response = await axios.post(
        `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`,
        { image: base64Content },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 60000,
        },
      );

      console.log("Baidu OCR response received");

      if (response.data.error_code) {
        throw new Error(`Baidu API error: ${response.data.error_msg}`);
      }

      const textContent = this.extractTextFromResponse(response.data);
      console.log("Extracted text content length:", textContent.length);

      return textContent;
    } catch (error) {
      console.error("Error parsing image file with Baidu OCR:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  extractTextFromResponse(responseData) {
    if (
      !responseData.words_result ||
      !Array.isArray(responseData.words_result)
    ) {
      return "";
    }

    return responseData.words_result
      .map((item) => item.words || "")
      .filter((text) => text.trim().length > 0)
      .join("\n");
  }
}

module.exports = new BaiduDocumentService();
