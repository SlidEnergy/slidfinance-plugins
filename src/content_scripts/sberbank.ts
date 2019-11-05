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
  let amountElement = document.querySelector(".productAmount");
  return amountElement ? pipe(amountElement, setBorder, innerText, parseAmount) : null;
}

function parseTransactions() {
  let transactions = [];
  let records = document.querySelectorAll(".simpleTable .grid .ListLine0, .simpleTable .grid .ListLine1");
  for (let record of Array.from(records)) {
    let description;
    let dateTime;
    let amount;

    if (record.querySelectorAll("td").length == 3) {
      description = pipe(record.querySelector("td:nth-child(1)"), setBorder, innerText);
      dateTime = pipe(record.querySelector("td:nth-child(2)"), setBorder, innerText, parseDate);
      amount = pipe(record.querySelector("td:nth-child(3)"), setBorder, innerText, parseAmount);
    } else {
      description = pipe(record.querySelector("td:nth-child(1) .payment-description-body"), setBorder, innerText);
      let description2 = pipe(record.querySelector("td:nth-child(3)"), setBorder, innerText);
      if (description2)
        description = description + ', ' + description2;
      dateTime = pipe(record.querySelector("td:nth-child(4)"), setBorder, innerText, parseDate);
      amount = pipe(record.querySelector("td:nth-child(5)"), setBorder, innerText, parseAmount);
    }
    let transaction = {description, dateTime: toISOStringWithoutTimeZone(dateTime), amount};
    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
