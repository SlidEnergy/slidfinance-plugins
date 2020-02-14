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
  return pipe(document.querySelector(".wocb-product-item-header_card .wocb-product-item-header__amount, .wb-select-product-item_card .wb-select-product-item__amount"), setBorder, innerText, parseAmount);
}

function parseTransactions() {
  let transactions = [];
  let records = document.querySelectorAll(".wocb-transactions > .wocb-transaction, .wocb-transactions-list > .wocb-transaction");

  for (let record of Array.from(records)) {
    let description = pipe(record.querySelector(".wocb-transaction__description"), setBorder, innerText);
    let dateTime = pipe(record.querySelector(".wocb-transaction__date"), setBorder, innerText, parseDate);

    let amount = pipe(record.querySelector(".wocb-transaction__amount"), setBorder, innerText, parseAmount);

    let transaction = {description, dateTime: toISOStringWithoutTimeZone(dateTime), amount};

    console.log(JSON.stringify(transaction));
    transactions.push(transaction);
  }

  return transactions;
}
