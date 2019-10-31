export function toISOStringWithoutTimeZone(dateTime: Date) {
  let MM = dateTime.getMonth() + 1;
  let dd = dateTime.getDate();
  let hh = dateTime.getHours();
  let mm = dateTime.getMinutes();
  let ss = dateTime.getSeconds();

  let date = [
    dateTime.getFullYear(),
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
    "января": 1,
    "февраля": 2,
    "марта": 3,
    "апреля": 4,
    "мая": 5,
    "июня": 6,
    "июля": 7,
    "августа": 8,
    "сентября": 9,
    "октября": 10,
    "ноября": 11,
    "декабря": 12
  };

  let matches;

  matches = text.match(/(сегодня|вчера|позавчера|завтра|послезавтра)/i);
  if (matches) {
    if (matches[1].toLowerCase() === 'сегодня') {
      let nowDate = new Date();
      return new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    }
    if (matches[1].toLowerCase() === 'вчера') {
      let nowDate = new Date();
      let date = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
      date.setDate(date.getDate() - 1);
      return date;
    }
    if (matches[1].toLowerCase() === 'позавчера') {
      let nowDate = new Date();
      let date = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
      date.setDate(date.getDate() - 2);
      return date;
    }
    if (matches[1].toLowerCase() === 'завтра') {
      let nowDate = new Date();
      let date = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
      date.setDate(date.getDate() + 1);
      return date;
    }
    if (matches[1].toLowerCase() === 'послезавтра') {
      let nowDate = new Date();
      let date = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
      date.setDate(date.getDate() + 2);
      return date;
    }
  }

  matches = text.match(/(\d{1,2})(?:\.|\s)(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря|\d{2})(?:\s|\.)?(\d{0,4})/i);
  if (matches) {
    let year = new Date().getFullYear();
    if (matches[3])
      year = +matches[3];

    let month;
    if(matches[2].length == 2)
      month = +matches[2];
    else
      month = months[matches[2].toLowerCase()];

    return new Date(year, month - 1, +matches[1]);
  }
}

export function parseAmount(text) {
  return parseFloat(text.replace(/[+\s₽]/g, "").replace(/,/g, ".").replace(/−/g, "-"));
}
