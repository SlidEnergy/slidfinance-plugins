import {
  firstChildText,
  innerText,
  parseAmount,
  parseDate,
  pipe,
  setBorder,
  toISOStringWithoutTimeZone
} from "./shared/utils";
import {registerParser} from "./shared/parser";

registerParser(exportCommandHandler);

function exportCommandHandler(): { balance: number, transactions: any[] } | undefined {
  let transactions = parseTransactions();
  let balance = parseBalance();

  if (transactions && transactions.length)
    return {balance, transactions};
}

function parseBalance() {
  return pipe(document.querySelector("div[class^='account-info-amount']"), setBorder, innerText, parseAmount);
}

function parseTransactions() {
  let dateTime;
  let transactions = [];
  let records = document.querySelectorAll("div[class^='content-column-self'] div[class^='dated-block-date'], div[class^='content-column-self'] div[class*='history-item-self'][class*='history-item-success']");
  for (let record of Array.from(records)) {
    let dateElement = record.querySelector("span[class^='dated-block-date-value']");
    if (dateElement) {
      dateTime = pipe(dateElement, setBorder, firstChildText, parseDate);
      continue;
    }

    if (!dateTime || !(dateTime instanceof Date))
      continue;

    let description = pipe(record.querySelector("span[class^='history-item-header-info-provider']"), setBorder, innerText);

    let amount = pipe(record.querySelector("span[class^='history-item-header-sum-amount']"), setBorder, innerText, parseAmount);

    let transaction = {description, dateTime: toISOStringWithoutTimeZone(dateTime), amount};

    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
