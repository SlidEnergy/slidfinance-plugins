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
  return pipe(document.querySelector(".balance-widget__amount .price__amount"), setBorder, innerText, parseAmount);
}

function parseTransactions() {
  let transactions = [];
  let records = document.querySelectorAll(".history-item-list .payment-history-item");
  for (let record of Array.from(records)) {
    let dateTime = pipe(record.querySelector(".payment-history-item__date"), setBorder, innerText, parseDate);
    let description = pipe(record.querySelector(".payment-history-item__text"), innerText);
    let amount = pipe(record.querySelector(".payment-history-item__sum"), innerText, parseAmount);

    let transaction = {description, dateTime: toISOStringWithoutTimeZone(dateTime), amount};
    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
