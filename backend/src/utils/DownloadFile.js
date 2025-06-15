import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../../code/input.txt');

export const downloadFile = async (cloudinaryurl) => {
  try {
    console.log('Downloading file from:', cloudinaryurl);
    const response = await axios.get(cloudinaryurl, {
      responseType: 'stream',
    });

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log(`File saved to ${outputPath}`);
    });

    writer.on('error', (err) => {
      console.error('Error writing file:', err);
    });
  } catch (error) {
    console.error('Download failed:', error.message);
  }
};
