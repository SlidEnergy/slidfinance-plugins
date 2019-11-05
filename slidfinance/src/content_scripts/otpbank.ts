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
  return pipe(document.querySelector(".allapot_informacio_keskeny tr:nth-child(3) td"), setBorder, innerText, parseAmount);
}

function parseTransactions() {
  let transactions = [];
  let records = document.querySelectorAll(".eredmenytabla > tbody > tr");
  for (let record of Array.from(records)) {
    let dateTime = pipe(record.querySelector("td:nth-child(2)"), setBorder, innerText, parseDate);
    let description = pipe(record.querySelector("td:nth-child(3)"), setBorder, innerText);
    let amount1 = pipe(record.querySelector("td:nth-child(4)"), setBorder, innerText);
    let amount2 = pipe(record.querySelector("td:nth-child(5)"), setBorder, innerText);
    let amount = parseAmount(amount1 + amount2);

    let transaction = {description, dateTime: toISOStringWithoutTimeZone(dateTime), amount};

    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
