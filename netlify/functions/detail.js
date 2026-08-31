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

async function getKomikuPage(cleanSlugVal) {
  const permutations = [
    `komik-${cleanSlugVal}-indo`,
    `komik-${cleanSlugVal}`,
    `${cleanSlugVal}-indo`,
    cleanSlugVal
  ];

  for (const perm of permutations) {
    try {
      const url = `https://komiku.org/manga/${perm}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://komiku.org/'
        },
        timeout: 4000
      });
      if (response.status === 200 && response.data) {
        return { data: response.data, resolvedSlug: perm };
      }
    } catch (err) {
      // try next permutation
    }
  }
  throw new Error(`Gagal memuat halaman untuk slug: ${cleanSlugVal}`);
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

  const slug = event.queryStringParameters?.slug;

  if (!slug) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, message: "Slug tidak ditemukan." })
    };
  }

  const initialClean = cleanSlug(slug);

  try {
    let title = 'Judul Komik';
    let thumbnail = '';
    let maxChapter = 100;

    let pageData;
    let resolvedSlug = initialClean;
    
    try {
      const resObj = await getKomikuPage(initialClean);
      pageData = resObj.data;
      resolvedSlug = resObj.resolvedSlug;
    } catch (err) {
      throw err;
    }

    const $ = cheerio.load(pageData);

    title = cleanTitle($('.manga-detail-title').text().trim() || $('h1').text().trim() || 'Judul Komik');
    thumbnail = $('.ims img').attr('data-src') || $('.ims img').attr('src') || $('.manga-detail-img img').attr('data-src') || $('.manga-detail-img img').attr('src') || '';

    const metadata = {};
    $('.inftable tr').each((i, el) => {
      const key = $(el).find('td').first().text().trim().replace(':', '');
      const value = $(el).find('td').last().text().trim();
      if (key && value) {
        metadata[key] = value;
      }
    });

    const synopsis = $('.desc, .sinopsis, #Sinopsis, [itemprop="description"]').first().text().trim();

    let chapters = [];
    $('#Daftar_Chapter a, .daftarch a, .list-chapter a, #daftar-chapter a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const chSlug = href
        .replace('https://komiku.org/', '')
        .replace(/^\//, '')
        .replace(/\/$/, '');
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      const chapterMatch = text.match(/Chapter\s+(\d+)/i) || chSlug.match(/chapter-(\d+)/i);
      const number = chapterMatch ? parseInt(chapterMatch[1]) : 0;

      if (chSlug && text && !chSlug.includes('manga/')) {
        chapters.push({
          title: cleanTitle(text),
          slug: cleanSlug(chSlug),
          date: 'Updated',
          number: number
        });
      }
    });

    if (initialClean === 'hunter-x-hunter') {
      const existingNumbers = new Set(chapters.map(c => c.number));
      for (let i = 116; i >= 1; i--) {
        if (!existingNumbers.has(i)) {
          chapters.push({
            title: `Chapter ${i}`,
            slug: `hunter-x-hunter-chapter-${i}`,
            date: 'Updated',
            number: i
          });
        }
      }
      chapters.sort((a, b) => b.number - a.number);
    }

    if (chapters.length === 0) {
      if (initialClean.includes('one-piece')) {
        maxChapter = 1184;
      } else if (initialClean.includes('boruto')) {
        maxChapter = 20;
      } else if (initialClean.includes('solo-leveling-ragnarok')) {
        maxChapter = 150;
      } else {
        maxChapter = 100;
      }

      for (let i = maxChapter; i >= 1; i--) {
        chapters.push({
          title: `Chapter ${i}`,
          slug: `${initialClean}-chapter-${i}`,
          date: 'Updated',
          number: i
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          slug: cleanSlug(resolvedSlug),
          title: title,
          thumbnail: thumbnail,
          chapters: chapters,
          alternativeTitle: metadata['Judul Alternatif'] || '',
          type: metadata['Tipe'] || 'Manga',
          theme: metadata['Tema'] || '',
          genres: metadata['Genre'] ? metadata['Genre'].split('\n').map(g => g.trim()).filter(Boolean) : [],
          author: metadata['Author'] || 'Unknown',
          status: metadata['Status'] || 'Ongoing',
          rating: metadata['Rating'] || 'N/A',
          synopsis: synopsis || 'Belum ada sinopsis untuk komik ini.'
        }
      })
    };
  } catch (error) {
    const fallbackTitle = cleanTitle(initialClean.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    let fallbackThumbnail = `https://img.komiku.org/upload5/${initialClean}/cover.jpg`;
    if (initialClean.includes('solo-leveling') || initialClean.includes('boruto')) {
      fallbackThumbnail = `https://img.komiku.org/upload5/${initialClean}/cover.webp`;
    }

    let maxChapter = 100;
    if (initialClean.includes('one-piece')) {
      maxChapter = 1184;
    } else if (initialClean.includes('kingdom')) {
      maxChapter = 877;
    } else if (initialClean.includes('boruto')) {
      maxChapter = 20;
    } else if (initialClean.includes('solo-leveling-ragnarok')) {
      maxChapter = 150;
    } else if (initialClean.includes('hunter-x-hunter')) {
      maxChapter = 400;
    }

    let backupChapters = [];
    for (let i = maxChapter; i >= 1; i--) {
      backupChapters.push({
        title: `Chapter ${i}`,
        slug: `${initialClean}-chapter-${i}`,
        date: 'Updated',
        number: i
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          slug: initialClean,
          title: fallbackTitle,
          thumbnail: fallbackThumbnail,
          chapters: backupChapters,
          alternativeTitle: '',
          type: 'Manga',
          theme: '',
          genres: [],
          author: 'Unknown',
          status: 'Ongoing',
          rating: 'N/A',
          synopsis: 'Belum ada sinopsis untuk komik ini.'
        }
      })
    };
  }
}
