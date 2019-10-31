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

export function lastChildText(element) {
  if (element.lastChild && element.lastChild.nodeType == 3) {
    return element.lastChild.textContent.trim();
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
    "декабря": 12,

    "янв": 1,
    "фев": 2,
    "мар": 3,
    "апр": 4,
    "май": 5,
    "июн": 6,
    "июл": 7,
    "авг": 8,
    "сен": 9,
    "окт": 10,
    "ноя": 1,
    "дек": 12
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

  text = text.trim();

  // (\d{1,2}) - 1 или 2 числа для даты
  // (?:\s|\.|\/) - без выборки в результат, точка, пробел или слэш
  // (янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря|\d{1,2}) - месяц прописью либо 1 или 2 числа для месяца
  // ((?:\s|\.|\/)(\d{4}|\d{2}))? - разбор года, не обязательно
  // - (?:\s|\.|\/) - без выборки в результат, точка, пробел или слэш
  // - (\d{4}|\d{2}) - 4 или 2 числа для года, в обратном порядке не работает
  matches = text.match(/(\d{1,2})(?:\s|\.|\/)(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря|\d{1,2})((?:\s|\.|\/)(\d{4}|\d{2}))?/i);
  if (matches) {
    let year = new Date().getFullYear();
    if (matches[4])
      year = +matches[4];

    let month;
    if (matches[2].length == 1 || matches[2].length == 2)
      month = +matches[2];
    else
      month = months[matches[2].toLowerCase()];

    return new Date(year, month - 1, +matches[1]);
  }
}

export function parseAmount(text, defaultNegative = false) {
  text = text.trim();

  let toggleNegative = false;

  if (defaultNegative) {
    toggleNegative = text.search(/\+/) < 0;
  }

  let inUsd = false;

  if (text.search(/\$/) >= 0)
    inUsd = true;

  let value = parseFloat(
    text
      .replace(/[\s+₽р]/g, "")
      .replace(/,/g, ".")
      .replace(/[−–]/g, "-")
  );

  if (toggleNegative)
    value *= -1;

  if (inUsd)
    value *= 65;

  return value;
}
