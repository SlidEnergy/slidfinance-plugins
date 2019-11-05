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
  return pipe(document.querySelector(".mts_leftpanel_cards_card_amount"), setBorder, innerText, parseAmount);
}

function parseTransactions() {
  let dateTime;
  let transactions = [];
  let records = document.querySelectorAll(".fto-list-grid-operations-history .fto-listgrid-item")
  for (let record of Array.from(records)) {
    let dateElement = record.querySelector(".list-grid-group");
    if (dateElement) {
      dateTime = pipe(dateElement, setBorder, innerText, parseDate);
    }

    if (!dateTime || !(dateTime instanceof Date))
      continue;

    let description = pipe(record.querySelector("div.row > div:nth-child(1) span"), setBorder, firstChildText);
    let matches = description.match(/\d+$/);
    let mcc = matches && +matches[0];
    let amount = pipe(record.querySelector("div.row > div:nth-child(2) span.fto-amount"), setBorder, firstChildText, parseAmount);

    let transaction = {description, mcc, dateTime: toISOStringWithoutTimeZone(dateTime), amount};

    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
