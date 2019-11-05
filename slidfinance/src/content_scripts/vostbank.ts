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
  let amount1 = pipe(document.querySelector(".accounts-header__amount span.sum > nobr"), setBorder, firstChildText);
  let amount2 = pipe(document.querySelector(".accounts-header__amount span.sum > span"), setBorder, firstChildText);

  return parseAmount(amount1 + amount2);
}

function parseTransactions() {
  let dateTime;
  let transactions = [];
  let records = document.querySelectorAll("div.expenses-box > div:nth-child(2) > div:not(.more-link)"); // grid table-header & account-history
  for (let record of Array.from(records)) {
    if (record.className == "expenses-header") {
      dateTime = pipe(record, setBorder, innerText, parseDate);
      continue;
    }

    if (!dateTime || !(dateTime instanceof Date))
      continue;

    let description = pipe(record.querySelector("div.operation-details > div:first-child"), setBorder, firstChildText);

    let categoryElement = record.querySelector("div.operation-details div.combo-value > div:first-child");
    let category = categoryElement ? pipe(categoryElement, setBorder, firstChildText) : "";

    let amount1 = pipe(record.querySelector("span.sum > nobr"), setBorder, firstChildText);
    let amount2 = pipe(record.querySelector("span.sum > span"), setBorder, firstChildText);

    let amount = parseAmount(amount1 + amount2);

    let transaction = {description, category, dateTime: toISOStringWithoutTimeZone(dateTime), amount};

    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
