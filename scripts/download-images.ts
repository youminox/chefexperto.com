import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const CONCURRENCY = 10;
const TIMEOUT = 15000;

interface DownloadResult {
  url: string;
  filename: string;
  success: boolean;
  error?: string;
}

function downloadFile(url: string, destPath: string): Promise<DownloadResult> {
  const filename = path.basename(destPath);
  
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout: TIMEOUT }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, destPath).then(resolve);
          return;
        }
      }
      
      if (res.statusCode !== 200) {
        resolve({ url, filename, success: false, error: `HTTP ${res.statusCode}` });
        return;
      }
      
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve({ url, filename, success: true });
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        resolve({ url, filename, success: false, error: err.message });
      });
    });
    
    req.on('error', (err) => {
      resolve({ url, filename, success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, filename, success: false, error: 'Timeout' });
    });
  });
}

async function downloadBatch(urls: string[], startIndex: number): Promise<DownloadResult[]> {
  const promises = urls.map(async (url, i) => {
    const filename = url.split('/').pop() || `image-${startIndex + i}.jpg`;
    const destPath = path.join(IMAGES_DIR, filename);
    
    // Skip if already downloaded
    if (fs.existsSync(destPath)) {
      return { url, filename, success: true } as DownloadResult;
    }
    
    return downloadFile(url, destPath);
  });
  
  return Promise.all(promises);
}

async function downloadAllImages() {
  console.log('🖼️  Image Downloader for chefexperto.com');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Read image URLs
  const imageUrlsPath = path.join(DATA_DIR, 'image-urls.json');
  if (!fs.existsSync(imageUrlsPath)) {
    console.error('❌ image-urls.json not found. Run parse-wordpress.ts first.');
    process.exit(1);
  }
  
  const imageUrls: string[] = JSON.parse(fs.readFileSync(imageUrlsPath, 'utf-8'));
  console.log(`📋 Total image URLs: ${imageUrls.length}`);
  
  // Filter only featured images (main post images)
  // We'll focus on the most important images first
  const featuredUrls = imageUrls.filter(url => 
    !url.includes('-150x150') && 
    !url.includes('-300x') && 
    !url.includes('-768x') &&
    !url.includes('-scaled')
  );
  
  console.log(`🎯 Filtered to ${featuredUrls.length} main images (excluding thumbnails)`);
  
  // Create output directory
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
  
  // Check already downloaded
  const existingFiles = fs.readdirSync(IMAGES_DIR);
  const existingSet = new Set(existingFiles);
  const toDownload = featuredUrls.filter(url => {
    const filename = url.split('/').pop() || '';
    return !existingSet.has(filename);
  });
  
  console.log(`📥 Already downloaded: ${featuredUrls.length - toDownload.length}`);
  console.log(`📥 To download: ${toDownload.length}`);
  
  if (toDownload.length === 0) {
    console.log('✅ All images already downloaded!');
    return;
  }
  
  // Download in batches
  let downloaded = 0;
  let failed = 0;
  let skipped = featuredUrls.length - toDownload.length;
  
  for (let i = 0; i < toDownload.length; i += CONCURRENCY) {
    const batch = toDownload.slice(i, i + CONCURRENCY);
    const results = await downloadBatch(batch, i);
    
    for (const result of results) {
      if (result.success) {
        downloaded++;
      } else {
        failed++;
      }
    }
    
    const progress = Math.round(((i + batch.length) / toDownload.length) * 100);
    process.stdout.write(`\r  ⏳ Progress: ${progress}% (${downloaded} ok, ${failed} failed)`);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Download complete!`);
  console.log(`  📥 Downloaded: ${downloaded}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📁 Saved to: ${IMAGES_DIR}`);
}

downloadAllImages().catch(console.error);
