import {parseDate, toISOStringWithoutTimeZone} from "./utils";
import * as moment from 'moment';

describe('to iso string without timezone', () => {
  it('should be converted', () => {
    let string = toISOStringWithoutTimeZone(new Date(Date.parse("2019-09-25T00:00:00")));
    expect(string).toEqual("2019-09-25T00:00:00");
  });
});

describe('utils', () => {
  let today = moment().startOf('day');
  let  yesterday = today.clone().add(-1, 'day');
  let  beforeYesterday = today.clone().add(-2, 'day');
  let  tomorrow = today.clone().add(1, 'day');
  let  afterTomorrow = today.clone().add(2, 'day');

  it('should be parsed', () => {
    let date = parseDate("25 Сентября 2019");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });
  it('should be parsed', () => {
    let date = parseDate("25 сентября 2019");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });
  it('should be parsed 25 сентября', () => {
    let date = parseDate("25 сентября");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });

  it('should be parsed', () => {
    let date = parseDate("25 Сент 2019");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });
  it('should be parsed', () => {
    let date = parseDate("25 сент 2019");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });
  it('should be parsed 25 сентября', () => {
    let date = parseDate("25 сент");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });

  it('should be parsed 25.09.2019', () => {
    let date = parseDate("25.09.2019");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });
  it('should be parsed 25.09', () => {
    let date = parseDate("25.09");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });
  it('should be parsed 25.9.2019', () => {
    let date = parseDate("25.9.2019");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });
  it('should be parsed 25.9', () => {
    let date = parseDate("25.9");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });

  it('should be parsed 25/09/2019', () => {
    let date = parseDate("25/09/2019");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });
  it('should be parsed 25/09', () => {
    let date = parseDate("25/09");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });
  it('should be parsed 25/9/2019', () => {
    let date = parseDate("25/9/2019");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });
  it('should be parsed 25/9', () => {
    let date = parseDate("25/9");
    expect(+date).toEqual(Date.parse("2019-09-25T00:00:00"));
  });

  it('should be parsed сегодня', () => {
    let date = parseDate("сегодня");
    expect(+date).toEqual(+today);
  });
  it('should be parsed Сегодня', () => {
    let date = parseDate("Сегодня");
    expect(+date).toEqual(+today);
  });
  it('should be parsed вчера', () => {
    let date = parseDate("вчера");
    expect(+date).toEqual(+yesterday);
  });
  it('should be parsed позавчера', () => {
    let date = parseDate("позавчера");
    expect(+date).toEqual(+beforeYesterday);
  });
  it('should be parsed завтра', () => {
    let date = parseDate("завтра");
    expect(+date).toEqual(+tomorrow);
  });
  it('should be parsed послезавтра', () => {
    let date = parseDate("послезавтра");
    expect(+date).toEqual(+afterTomorrow);
  });
});
