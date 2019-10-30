export function toISOStringWithoutTimeZone(dateTime: Date) {
  let MM = dateTime.getUTCMonth() + 1;
  let dd = dateTime.getUTCDate();
  let hh = dateTime.getUTCHours();
  let mm = dateTime.getUTCMinutes();
  let ss = dateTime.getUTCSeconds();

  let date = [
    dateTime.getUTCFullYear(),
    (MM > 9 ? '' : '0') + MM,
    (dd > 9 ? '' : '0') + dd,
  ].join('-');

  let time = [
    (hh > 9 ? '' : '0') + hh,
    (mm > 9 ? '' : '0') + mm,
    (ss > 9 ? '' : '0') + ss,
  ].join(':');

  return date + 'T' + time;
}

export function firstChildText(element) {
  if (element.firstChild && element.firstChild.nodeType == 3) {
    return element.firstChild.textContent.trim();
  }
}

export function innerText(element) {
  return element.innerText.trim();
}

export function setBorder(element) {
  element.style.border = "1px solid red";
  return element;
}

export function pipe(element: Element, ...ops) {
  const _pipe = (a, b) => (arg) => b(a(arg));
  const pipe = (...ops) => ops.reduce(_pipe);

  return pipe(...ops)(element);
}

export function parseDate(text) {
  const months = {
    "января": 0,
    "февраля": 1,
    "марта": 2,
    "апреля": 3,
    "мая": 4,
    "июня": 5,
    "июля": 6,
    "августа": 7,
    "сентября": 8,
    "октября": 9,
    "ноября": 10,
    "декабря": 11
  };

  let matches = text.match(/(\d{1,2}) (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s?(\d{0,4})/i);
  if (matches) {
    let year = new Date().getFullYear();
    if (matches[3])
      year = +matches[3];
    return new Date(Date.UTC(year, months[matches[2].toLowerCase()], +matches[1]));
  }

  matches = text.match(/(Сегодня|Вчера)/i);
  if (matches) {
    if (matches[1] === 'Сегодня') {
      let nowDate = new Date();
      return new Date(Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()));
    }
    if (matches[1] === 'Вчера') {
      let nowDate = new Date();
      let date = new Date(Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()));
      date.setDate(date.getDate() - 1);
      return date;
    }
  }
}

export function parseAmount(text) {
  return parseFloat(text.replace(/[+\s₽]/g, "").replace(/,/g, ".").replace(/−/g, "-"));
}
