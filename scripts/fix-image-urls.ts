import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Get list of available local images
const availableImages = new Set(fs.readdirSync(IMAGES_DIR));
console.log(`📁 Found ${availableImages.size} local images`);

// Process posts.json
const postsPath = path.join(DATA_DIR, 'posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

let updatedFeatured = 0;
let updatedContent = 0;
let missingImages = 0;

for (const post of posts) {
  // Update featured image URL
  if (post.featuredImageUrl) {
    const filename = post.featuredImageUrl.split('/').pop();
    if (filename && availableImages.has(filename)) {
      post.featuredImageUrl = `/images/${filename}`;
      updatedFeatured++;
    } else {
      // Try to find a similar filename (without size suffix)
      post.featuredImageUrl = '';
      missingImages++;
    }
  }

  // Update image URLs inside content
  if (post.content) {
    post.content = post.content.replace(
      /https?:\/\/chefexperto\.com\/wp-content\/uploads\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp)/gi,
      (match: string) => {
        const filename = match.split('/').pop();
        if (filename && availableImages.has(filename)) {
          updatedContent++;
          return `/images/${filename}`;
        }
        return match; // Keep original if not found locally
      }
    );
  }
}

// Save updated posts
fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf-8');

// Process pages.json
const pagesPath = path.join(DATA_DIR, 'pages.json');
const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));

for (const page of pages) {
  if (page.featuredImageUrl) {
    const filename = page.featuredImageUrl.split('/').pop();
    if (filename && availableImages.has(filename)) {
      page.featuredImageUrl = `/images/${filename}`;
    } else {
      page.featuredImageUrl = '';
    }
  }

  if (page.content) {
    page.content = page.content.replace(
      /https?:\/\/chefexperto\.com\/wp-content\/uploads\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp)/gi,
      (match: string) => {
        const filename = match.split('/').pop();
        if (filename && availableImages.has(filename)) {
          return `/images/${filename}`;
        }
        return match;
      }
    );
  }
}

fs.writeFileSync(pagesPath, JSON.stringify(pages, null, 2), 'utf-8');

console.log('\n✅ Image URLs updated!');
console.log(`  🖼️  Featured images updated: ${updatedFeatured}`);
console.log(`  📝 Content images updated: ${updatedContent}`);
console.log(`  ❌ Missing images: ${missingImages}`);
