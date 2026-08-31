import axios from 'axios';
import * as cheerio from 'cheerio';

function cleanSlug(slug) {
  if (!slug) return '';
  return slug
    .replace(/^komik-/, '')
    .replace(/-indonesia-chapter-/, '-chapter-')
    .replace(/-indo-chapter-/, '-chapter-')
    .replace(/-indo$/, '')
    .replace(/-indonesia$/, '');
}

function cleanTitle(title) {
  if (!title) return '';
  return title.replace(/^(Komik|Manga|Manhwa|Manhua)\s+/i, '');
}

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const q = event.queryStringParameters?.q;

  if (!q) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, message: "Query pencarian kosong." })
    };
  }

  try {
    const { data } = await axios.get(`https://api.komiku.org/?post_type=manga&s=${encodeURIComponent(q)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://komiku.org/'
      },
      timeout: 6000
    });

    const $ = cheerio.load(data);
    let results = [];

    $('.bge').each((i, el) => {
      const title = cleanTitle($(el).find('h3').text().trim());
      const href = $(el).find('a').first().attr('href') || '';
      const thumbnail = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';
      const description = $(el).find('.pembaca').text().trim() || $(el).find('p').text().trim() || 'Baca komik ini terbaru lengkap hanya di NotNotBaca.';

      if (title && href) {
        const mangaSlug = cleanSlug(href
          .replace('https://komiku.org/manga/', '')
          .replace('https://komiku.org/', '')
          .replace('/manga/', '')
          .replace(/\//g, ''));

        if (!mangaSlug.includes('chapter')) {
          results.push({
            title,
            slug: mangaSlug,
            thumbnail,
            description
          });
        }
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: results })
    };
  } catch (error) {
    // Fallback data
    const fallbackMangaList = [
      {
        title: 'One Piece',
        slug: 'one-piece',
        description: 'Kisah petualangan legendaris Monkey D. Luffy untuk menjadi Raja Bajak Laut di seluruh samudra.',
        thumbnail: 'https://img.komiku.org/upload5/one-piece/cover.jpg'
      },
      {
        title: 'Boruto: Two Blue Vortex',
        slug: 'boruto-two-blue-vortex',
        description: 'Kelanjutan kisah Boruto Uzumaki setelah timeskip, menghadapi ancaman Shinju yang mengerikan.',
        thumbnail: 'https://img.komiku.org/upload5/boruto-two-blue-vortex/cover.jpg'
      },
      {
        title: 'Solo Leveling (Ragnarok)',
        slug: 'solo-leveling-ragnarok',
        description: 'Sekuel resmi dari dunia Solo Leveling, berfokus pada petualangan anak Sung Jin-Woo, Sung Suho.',
        thumbnail: 'https://img.komiku.org/upload5/solo-leveling-ragnarok/cover.jpg'
      },
      {
        title: 'Jujutsu Kaisen',
        slug: 'jujutsu-kaisen',
        description: 'Pertarungan hidup dan mati para penyihir jujutsu melawan raja kutukan Ryomen Sukuna.',
        thumbnail: 'https://img.komiku.org/upload5/jujutsu-kaisen/cover.jpg'
      },
      {
        title: 'Black Clover',
        slug: 'black-clover',
        description: 'Perjuangan Asta yang lahir tanpa sihir untuk membuktikan dirinya menjadi Kaisar Sihir.',
        thumbnail: 'https://img.komiku.org/upload5/black-clover/cover.jpg'
      }
    ];

    const filtered = fallbackMangaList.filter((m) =>
      m.title.toLowerCase().includes(q.toLowerCase())
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: filtered })
    };
  }
}
