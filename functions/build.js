import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import * as chrono from 'chrono-node';
import ical from 'ical-generator';
import { DateTime } from 'luxon';


function parseDate(string) {
  const zone = "Australia/Melbourne";

  const date = chrono.parseDate(string);
  const fields = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
  const dt = DateTime.fromObject(fields, { zone });
  return dt;
}


export default async function() {

  const response = await fetch('https://www.ezistreat.co/whats-on/');
  const body = await response.text();

  const $ = cheerio.load(body);

  const data = $.extract({
    items: [{
      selector: 'article',
      value: {
        title: {
          selector: '.entry-title a',
          value: 'innerHTML'
        },
        link: {
          selector: '.entry-title a',
          value: 'href'
        },
        date: {
          selector: '.published',
          value: (el, _key) => {
            return parseDate($(el).text());
          }
        }
      }
    }],
  })

//  console.dir(data);

  const calendar = ical({name: 'EasyStreat Calendar'});

  data.items.forEach(({title, link, date}) => {
    calendar.createEvent({
      start: date,
      end: date,
      summary: title,
      description: `Link: ${link}`,
      location: 'EasyStreat',
      url: link
    });
  });

  // console.log(calendar.toString());
  return calendar.toString();
}
