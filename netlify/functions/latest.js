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

  const type = (event.queryStringParameters?.type || 'semua').toLowerCase();

  try {
    const fetchHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://komiku.org/'
    };

    const listKomik = [];

    if (type === 'manga' || type === 'manhwa' || type === 'manhua') {
      const { data } = await axios.get(`https://api.komiku.org/manga/?tipe=${type}`, { headers: fetchHeaders });
      const $ = cheerio.load(data);

      $('.bge').each((i, el) => {
        const titleLink = $(el).find('.kan a').first();
        const title = cleanTitle(titleLink.text().trim());
        const href = titleLink.attr('href') || '';
        
        const imgElement = $(el).find('.bgei img');
        const thumb = imgElement.attr('data-src') || imgElement.attr('src') || '';
        
        const chapterLink = $(el).find('.new1 a').last();
        let chapterTerakhir = chapterLink.find('span').last().text().trim();
        if (!chapterTerakhir) {
          chapterTerakhir = chapterLink.text().trim();
        }
        chapterTerakhir = cleanTitle(chapterTerakhir) || 'Chapter Terbaru';

        const slug = cleanSlug(href
          .replace('https://komiku.org/manga/', '')
          .replace('https://komiku.org/', '')
          .replace('manga/', '')
          .replace(/\//g, ''));
          
        if (title && slug) {
          listKomik.push({
            title,
            thumb,
            chapterTerakhir,
            slug
          });
        }
      });
    } else {
      const { data } = await axios.get('https://komiku.org/', { headers: fetchHeaders });
      const $ = cheerio.load(data);

      $('article.ls4').each((i, el) => {
        const titleLink = $(el).find('.ls4j h4 a');
        const title = cleanTitle(titleLink.text().trim());
        const href = titleLink.attr('href') || '';
        
        const imgElement = $(el).find('.ls4v img');
        const thumb = imgElement.attr('data-src') || imgElement.attr('src') || '';
        
        const chapterLink = $(el).find('.ls4j a.ls24').first();
        const chapterTerakhir = cleanTitle(chapterLink.text().trim()) || 'Chapter Terbaru';
        
        const slug = cleanSlug(href
          .replace('https://komiku.org/manga/', '')
          .replace('https://komiku.org/', '')
          .replace('manga/', '')
          .replace(/\//g, ''));
          
        if (title && slug) {
          listKomik.push({
            title,
            thumb,
            chapterTerakhir,
            slug
          });
        }
      });
    }

    const uniqueKomik = listKomik.filter((v, i, a) => a.findIndex(t => t.slug === v.slug) === i);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: uniqueKomik.slice(0, 20) })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: error.message })
    };
  }
}
