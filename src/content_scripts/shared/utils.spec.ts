import {parseAmount, parseDate, toISOStringWithoutTimeZone} from "./utils";
import * as moment from 'moment';

describe('to iso string without timezone', () => {
  it('should be converted', () => {
    let string = toISOStringWithoutTimeZone(new Date(Date.parse("2019-09-25T00:00:00")));
    expect(string).toEqual("2019-09-25T00:00:00");
  });
});

describe('parse long date', () => {
  it('should be parsed 25 Сентября 2019', () => {
    let date = parseDate("25 Сентября 2019");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25 сентября 2019', () => {
    let date = parseDate("25 сентября 2019");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25 сентября', () => {
    let date = parseDate("25 сентября");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25 февраля', () => {
    let date = parseDate("25 февраля");
    expect(date).toEqual(new Date("2020-02-25T00:00:00"));
  });

  it('should be parsed 25 Сентября 2019, 12:15', () => {
    let date = parseDate("25 Сентября 2019, 12:15");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25 Сентября 2019. 12:15', () => {
    let date = parseDate("25 Сентября 2019. 12:15");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });

  it('should be parsed 25 Сен 2019', () => {
    let date = parseDate("25 Сен 2019");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25 сен 2019', () => {
    let date = parseDate("25 сен 2019");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25 сен', () => {
    let date = parseDate("25 сен");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25 фев', () => {
    let date = parseDate("25 фев");
    expect(date).toEqual(new Date("2020-02-25T00:00:00"));
  });

  it('should be parsed 25 сент\n09:30', () => {
    let date = parseDate("25 сент\n09:30");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 2 ноя\n10:30', () => {
    let date = parseDate("2 ноя\n10:30");
    expect(date).toEqual(new Date("2019-11-02T00:00:00"));
  });
  it('should be parsed 2 фев\n10:30', () => {
    let date = parseDate("2 фев\n10:30");
    expect(date).toEqual(new Date("2020-02-02T00:00:00"));
  });
});

describe('parse short date', () => {
  it('should be parsed 25.09.2019', () => {
    let date = parseDate("25.09.2019");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25.09', () => {
    let date = parseDate("25.09");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25.02', () => {
    let date = parseDate("25.02");
    expect(date).toEqual(new Date("2020-02-25T00:00:00"));
  });
  it('should be parsed 25.9.2019', () => {
    let date = parseDate("25.9.2019");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25.9', () => {
    let date = parseDate("25.9");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25.2', () => {
    let date = parseDate("25.2");
    expect(date).toEqual(new Date("2020-02-25T00:00:00"));
  });

  it('should be parsed 25/09/2019', () => {
    let date = parseDate("25/09/2019");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25/09', () => {
    let date = parseDate("25/09");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25/02', () => {
    let date = parseDate("25/02");
    expect(date).toEqual(new Date("2020-02-25T00:00:00"));
  });
  it('should be parsed 25/9/2019', () => {
    let date = parseDate("25/9/2019");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25/9', () => {
    let date = parseDate("25/9");
    expect(date).toEqual(new Date("2019-09-25T00:00:00"));
  });
  it('should be parsed 25/2', () => {
    let date = parseDate("25/2");
    expect(date).toEqual(new Date("2020-02-25T00:00:00"));
  });
});

describe('parse one word date', () => {
  let today = moment().startOf('day');
  let yesterday = today.clone().add(-1, 'day');
  let beforeYesterday = today.clone().add(-2, 'day');
  let tomorrow = today.clone().add(1, 'day');
  let afterTomorrow = today.clone().add(2, 'day');

  it('should be parsed сегодня', () => {
    let date = parseDate("сегодня");
    expect(date).toEqual(today.toDate());
  });
  it('should be parsed Сегодня', () => {
    let date = parseDate("Сегодня");
    expect(date).toEqual(today.toDate());
  });
  it('should be parsed вчера', () => {
    let date = parseDate("вчера");
    expect(date).toEqual(yesterday.toDate());
  });
  it('should be parsed позавчера', () => {
    let date = parseDate("позавчера");
    expect(date).toEqual(beforeYesterday.toDate());
  });
  it('should be parsed завтра', () => {
    let date = parseDate("завтра");
    expect(date).toEqual(tomorrow.toDate());
  });
  it('should be parsed послезавтра', () => {
    let date = parseDate("послезавтра");
    expect(date).toEqual(afterTomorrow.toDate());
  });
});

describe('parse amount', () => {
  it('should be parsed -0.00', () => {
    let amount = parseAmount("-0.00");
    expect(amount).toEqual(-0);
  });
  it('should be parsed -0.12', () => {
    let amount = parseAmount("-0.12");
    expect(amount).toEqual(-0.12);
  });
  it('should be parsed', () => {
    let amount = parseAmount("0.00");
    expect(amount).toEqual(0);
  });
  it('should be parsed', () => {
    let amount = parseAmount("0.12");
    expect(amount).toEqual(0.12);
  });
  it('should be parsed', () => {
    let amount = parseAmount("-123.00");
    expect(amount).toEqual(-123);
  });
  it('should be parsed', () => {
    let amount = parseAmount("123.45");
    expect(amount).toEqual(123.45);
  });
  it('should be parsed', () => {
    let amount = parseAmount("123.00");
    expect(amount).toEqual(123);
  });
  it('should be parsed', () => {
    let amount = parseAmount("123.45");
    expect(amount).toEqual(123.45);
  });
  it('should be parsed', () => {
    let amount = parseAmount("1 234.00");
    expect(amount).toEqual(1234);
  });
  it('should be parsed', () => {
    let amount = parseAmount("1 234.56");
    expect(amount).toEqual(1234.56);
  });
  it('should be parsed', () => {
    let amount = parseAmount("-1 234.00");
    expect(amount).toEqual(-1234.00);
  });
  it('should be parsed', () => {
    let amount = parseAmount("-1 234.56");
    expect(amount).toEqual(-1234.56);
  });


  it('should be parsed', () => {
    let amount = parseAmount("– 1 234.56");
    expect(amount).toEqual(-1234.56);
  });
  it('should be parsed', () => {
    let amount = parseAmount("− 1 234.56");
    expect(amount).toEqual(-1234.56);
  });
  it('should be parsed', () => {
    let amount = parseAmount("- 1 234,56");
    expect(amount).toEqual(-1234.56);
  });
  it('should be parsed', () => {
    let amount = parseAmount("- 1 234,56 ₽");
    expect(amount).toEqual(-1234.56);
  });
  it('should be parsed', () => {
    let amount = parseAmount("- 1 234,56 р");
    expect(amount).toEqual(-1234.56);
  });
  it('should be parsed', () => {
    let amount = parseAmount("- 1 234,56 $");
    expect(amount).toEqual(-1234.56 * 65);
  });
  it('should be parsed', () => {
    let amount = parseAmount("+ 1 234,56");
    expect(amount).toEqual(1234.56);
  });
  it('should be parsed', () => {
    let amount = parseAmount("1 234,56 р", true);
    expect(amount).toEqual(-1234.56);
  });
  it('should be parsed', () => {
    let amount = parseAmount("+ 1 234,56 р", true);
    expect(amount).toEqual(1234.56);
  });
});
