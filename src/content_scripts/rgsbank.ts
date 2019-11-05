import {
  firstChildText,
  lastChildText,
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
  return pipe(document.querySelector("div.new-info-list__balance"), setBorder, firstChildText, parseAmount);
}

function parseTransactions() {
  let transactions = [];
  let records = document.querySelectorAll("ul.tab-content-details-balance li:not(.dop)");
  for (let record of Array.from(records)) {
    let description = pipe(record.querySelector(".name"), setBorder, firstChildText);
    let dateTime = pipe(record.querySelector(".name .info span:first-child"), setBorder, lastChildText, parseDate);

    let mccElement = record.querySelector(".name .info span:nth-child(2)");
    let mcc = null;
    if (mccElement) {
      let mccText = pipe(mccElement, setBorder, firstChildText);
      if (mccText) {
        mcc = parseInt(mccText.match(/MCC: (\d{4})/)[1]);
      }
    }

    let categoryElement = record.querySelector(".name .info span:nth-child(3)");

    let category = "";
    if (categoryElement)
      category = pipe(categoryElement, setBorder, firstChildText);

    let amount = pipe(record.querySelector(".val > div"), setBorder, firstChildText, parseAmount);

    let transaction = {description, category, dateTime: toISOStringWithoutTimeZone(dateTime), amount, mcc};

    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
