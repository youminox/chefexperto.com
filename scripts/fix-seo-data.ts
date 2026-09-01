import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const postsPath = path.join(DATA_DIR, 'posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

console.log('🔧 SEO Fix Script for chefexperto.com');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📄 Total posts: ${posts.length}`);

let fixedTitles = 0;
let fixedExcerpts = 0;
let removedEmpty = 0;

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b[a-záéíóúñü]/g, (c: string) => c.toUpperCase())
    .replace(/\b(De|Del|La|Las|Los|El|En|Con|Para|Por|Un|Una|Y|O|A|Al|Su|Se|Es|Que|Como|Sin)\b/gi, 
      (w: string) => w.toLowerCase())
    .replace(/^./, (c: string) => c.toUpperCase());
}

function generateExcerpt(content: string, maxLength: number = 155): string {
  const text = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

// Filter and fix posts
const fixedPosts = [];

for (const post of posts) {
  const contentText = (post.content || '').replace(/<[^>]*>/g, '').trim();
  
  // Remove posts that have no title AND no content (junk entries)
  if ((!post.title || post.title.length < 3) && contentText.length < 20) {
    removedEmpty++;
    continue;
  }
  
  // Fix empty titles by generating from slug
  if (!post.title || post.title.length < 3) {
    post.title = slugToTitle(post.slug);
    fixedTitles++;
  }
  
  // Fix empty/bad excerpts
  if (!post.excerpt || post.excerpt.replace(/<[^>]*>/g, '').trim().length < 20) {
    const newExcerpt = generateExcerpt(post.content);
    if (newExcerpt) {
      post.excerpt = newExcerpt;
      fixedExcerpts++;
    }
  }
  
  // Clean up excerpt (remove HTML tags)
  if (post.excerpt) {
    post.excerpt = post.excerpt.replace(/<[^>]*>/g, '').trim();
  }
  
  // Ensure proper date format for Schema.org
  if (post.date && !post.date.includes('T')) {
    post.date = post.date.replace(' ', 'T');
  }
  if (post.modified && !post.modified.includes('T')) {
    post.modified = post.modified.replace(' ', 'T');
  }
  
  fixedPosts.push(post);
}

// Update category counts
const categoriesPath = path.join(DATA_DIR, 'categories.json');
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

// Reset counts
for (const cat of categories) {
  cat.count = 0;
}

// Recount
for (const post of fixedPosts) {
  for (const postCat of post.categories) {
    const cat = categories.find((c: any) => c.slug === postCat.slug);
    if (cat) cat.count++;
  }
}

// Remove empty categories
const activeCategories = categories.filter((c: any) => c.count > 0);

// Save
fs.writeFileSync(postsPath, JSON.stringify(fixedPosts, null, 2), 'utf-8');
fs.writeFileSync(categoriesPath, JSON.stringify(activeCategories, null, 2), 'utf-8');

console.log('\n✅ SEO fixes applied!');
console.log(`  🔤 Titles fixed (generated from slug): ${fixedTitles}`);
console.log(`  📝 Excerpts generated: ${fixedExcerpts}`);
console.log(`  🗑️  Empty posts removed: ${removedEmpty}`);
console.log(`  📄 Posts remaining: ${fixedPosts.length}`);
console.log(`  📂 Active categories: ${activeCategories.length}`);
