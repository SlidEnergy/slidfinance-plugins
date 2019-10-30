import {firstChildText, innerText, parseAmount, parseDate, pipe, setBorder, toISOStringWithoutTimeZone} from "./shared/utils";
import {registerParser} from "./shared/parser";

registerParser(exportCommandHandler);

function exportCommandHandler(): { balance: number, transactions: any[] } | undefined {
  let transactions = parseTransactions();
  let balance = parseBalance();

  if (transactions && transactions.length)
    return {balance, transactions};
}

function parseBalance() {
  return pipe(document.querySelector("span[data-qa-id='sidebarItemMoney'] span:first-child"), setBorder, innerText, parseAmount);
}

function parseTransactions() {
  let dateTime;
  let transactions = [];
  let records = document.querySelectorAll(
    "div[class^='TimelineList__list'] > div[class^='TimelineList__item'], div[class^='TimelineList__list'] > h4[class^='TimelineList__item']");

  for (let record of Array.from(records)) {
    if (record.childElementCount == 0) {
      dateTime = pipe(record, setBorder, firstChildText, parseDate);
      continue;
    }

    if (!dateTime || !(dateTime instanceof Date))
      continue;

    let description = pipe(record.querySelector("p[class^='TimelineItem__description']"), setBorder, innerText);
    let categoryElement = record.querySelector("div[class^='UITimelineOperationItem__subDescription']");
    let category = categoryElement ? pipe(categoryElement, setBorder, innerText) : "";

    let amount = pipe(record.querySelector("span[class^='TimelineItem__value']"), setBorder, innerText, parseAmount);

    let transaction = {description, category, dateTime: toISOStringWithoutTimeZone(dateTime), amount};

    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
