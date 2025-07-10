import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const categories = [
  'science fiction',
  'fantasy',
  'mystery',
  'romance',
  'history',
  'biography',
  'technology',
  'philosophy',
  'psychology',
];

(async () => {
  const allBooks: any[] = [];
  for (const category of categories) {
    console.log(`Fetching category: ${category}`);
    for (let startIndex = 0; startIndex < 800; startIndex += 40) {
      console.log(` - startIndex ${startIndex}`);
      const res = await axios.get(
        'https://www.googleapis.com/books/v1/volumes',
        {
          params: {
            q: category,
            maxResults: 40,
            startIndex,
          },
        },
      );

      const items = res.data.items || [];

      if (items.length === 0) {
        console.log(` - No more results for "${category}"`);
        break;
      }

      const books = items.map((item: any) => ({
        id: uuidv4(),
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || 'Unknown',
        summary: item.volumeInfo.description || 'No description available.',
        genre: item.volumeInfo.categories?.[0] || category,
      }));

      allBooks.push(...books);

      // API rate limit protection
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`✅ Total books fetched: ${allBooks.length}`);
  fs.writeFileSync('books.json', JSON.stringify(allBooks, null, 2));
})();
