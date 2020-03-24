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
  let amount1 = pipe(document.querySelector(".balance-currency .amount-sign"), setBorder, innerText);
  let amount2 = pipe(document.querySelector(".balance-currency .amount-integer-part"), setBorder, innerText);
  let amount3 = pipe(document.querySelector(".balance-currency .amount-decimal-part"), setBorder, innerText);

  return parseAmount(amount1 + amount2 + "." + amount3);
}

function parseTransactions() {
  let dateTime;
  let transactions = [];
  let records = document.querySelectorAll("personal-events-list .date, personal-events-list personal-event");
  for (let record of Array.from(records)) {
    if (record.className == "date") {
      dateTime = pipe(record.querySelector(":scope > span"), setBorder, innerText, parseDate);
      continue;
    }

    if (!dateTime || !(dateTime instanceof Date))
      continue;

    let description = pipe(record.querySelector(".column-desc > div > div:nth-child(1)"), setBorder, innerText);

    let categoryElement = record.querySelector(".operation-title + div");
    let category = categoryElement ? pipe(categoryElement, setBorder, innerText) : "";

    let mccElement = record.querySelector(".column-desc > div > div:nth-child(2)");
    let mcc = null;
    if (mccElement) {
      let mccText = pipe(mccElement, setBorder, innerText);
      if (mccText) {
        let matches = mccText.match(/МСС: (\d{4})/);
        if(matches && matches.length > 1)
        mcc = parseInt(matches[1]);
      }
    }

    let amount1 = pipe(record.querySelector(".amount-sign"), setBorder, innerText);
    let amount2 = pipe(record.querySelector(".amount-integer-part"), setBorder, innerText);
    let amount3 = pipe(record.querySelector(".amount-decimal-part"), setBorder, innerText);

    let amount = parseAmount(amount1 + amount2 + amount3);

    let transaction = {description, category, dateTime: toISOStringWithoutTimeZone(dateTime), amount, mcc};

    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
