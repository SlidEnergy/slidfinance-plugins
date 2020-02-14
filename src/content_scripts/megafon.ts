import {innerText, parseAmount, parseDate, pipe, setBorder, toISOStringWithoutTimeZone} from "./shared/utils";
import {registerParser} from "./shared/parser";

registerParser(exportCommandHandler);

function exportCommandHandler(): { balance: number, transactions: any[] } | undefined {
  let transactions = parseTransactions();
  let balance = parseBalance();

  if (transactions && transactions.length)
    return {balance, transactions};
}

function parseBalance() {
  return pipe(document.querySelector(".balance__count-number"), setBorder, innerText, parseAmount);
}

function parseTransactions() {
  let transactions = [];
  let records = document.querySelectorAll(".list-transactions .transaction");

  for (let record of Array.from(records)) {
    let description = pipe(record.querySelector(".transaction__desc .transaction__name"), setBorder, innerText);
    let dateTime = pipe(record.querySelector(".transaction__datetime .transaction__date"), setBorder, innerText, parseDate);

    let amount = pipe(record.querySelector(".transaction__sum .transaction__sum-num"), setBorder, innerText, parseAmount);

    let categoryElement = record.querySelector(".transaction__sum .transaction__sum-desc-name");
    let category = categoryElement ? pipe(categoryElement, setBorder, innerText) : "";

    let transaction = {description, category, dateTime: toISOStringWithoutTimeZone(dateTime), amount};

    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
