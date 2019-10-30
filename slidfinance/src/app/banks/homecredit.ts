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
  return pipe(document.querySelector("table.productBox.bg2 td.C"), setBorder, innerText, parseAmount);
}

function parseTransactions() {
  let dateTime;
  let transactions = [];
  let records = document.querySelectorAll(".accountMovementsBoxBody > tbody > tr")
  for (let record of Array.from(records)) {
    let dateElement = record.querySelector(".DATE > span");
    if (dateElement) {
      dateTime = pipe(dateElement, setBorder, innerText, parseDate);
      continue;
    }

    if (!dateTime || !(dateTime instanceof Date))
      continue;

    record = record.querySelector(".workingArea");
    if (record) {
      let descriptionAndCategory = record.querySelectorAll(".CLIP");

      let description = pipe(descriptionAndCategory[0], setBorder, innerText);
      let category = pipe(descriptionAndCategory[1], setBorder, innerText);
      ;
      let amount = pipe(record.querySelector(".RED_AMOUNT, .GREEN_AMOUNT"), setBorder, innerText, parseAmount);

      let transaction = {description, category, dateTime: toISOStringWithoutTimeZone(dateTime), amount};

      console.log(JSON.stringify(transaction));
      transactions.push(transaction);
    }
  }

  return transactions;
}
