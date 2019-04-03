console.log("content-script loaded")

// Listen for messages from browser-action or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Message to check whether this script has been injected
    if (request === "ping") {
        sendResponse("pong");
    }
    else if (request == "export") {
        exportTransactionsCommandHandler()
            .then(() => {
                console.log("Export completed");
                sendResponse("ok");
            })
            .catch((error) => {
                console.log("Export error: " + error);
                sendResponse("error");
            });
    }

    return true;
});

async function exportTransactionsCommandHandler() {
    let token = await getToken();
    if (!token) {
        alert("Error: Token is " + token);
        throw Error("Error: Token is " + token);
    }

    let accountCode = await getAccountCode();
    if (!accountCode) {
        alert("Error: accountCode is " + accountCode);
        throw Error("Error: accountCode is " + accountCode);
    }

    let transactions = parseTransactions();
    let balance = parseBalance();

    if (token && transactions && transactions.length)
        sendTransactions(token, accountCode, { balance, transactions });
}

function getToken() {
    return new Promise(resolve => chrome.storage.sync.get(x => resolve(x && x.auth && x.auth.token)));
}

function getAccountCode() {
    return new Promise(resolve => chrome.storage.sync.get(x => resolve(x && x.accountCode)));
}

let months = { "Января": 0, "Февраля": 1, "Марта": 2, "Апреля": 3, "Мая": 4, "Июня": 5, "Июля": 6, "Августа": 7, "Сентября": 8, "Октября": 9, "Ноября": 10, "Декабря": 11 };

function parseDate(text) {
    let matches = text.match(/(\d{1,2}) (Января|Февраля|Марта|Апреля|Мая|Июня|Июля|Августа|Сентября|Октября|Ноября|Декабря) (\d{4})/);
    date = new Date(+matches[3], months[matches[2]], +matches[1], 0, 0, 0);
    date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
    return date;
}

function parseBalance() {
    let border = "1px solid red";

    let balanceElement = document.querySelector("table.productBox.bg2 td.C");
    balanceElement.style.border = border;
    return parseAmount(balanceElement.innerText);
}

function parseAmount(text) {
    return parseFloat(text.replace(/[+\sр]/g, "").replace(/,/g, "."));
}

function parseTransactions() {
    let border = "1px solid red";

    let dateTime;
    let transactions = [];
    let records = document.querySelectorAll(".accountMovementsBoxBody > tbody > tr")
    for (let record of records) {
        let dateElement = record.querySelector(".DATE > span");
        if (dateElement) {
            dateElement.style.border = border;
            dateTime = parseDate(dateElement.innerText);
            continue;
        }

        if (!dateTime || !(dateTime instanceof Date))
            continue;

        record = record.querySelector(".workingArea");
        if (record) {
            let descriptionAndCategory = record.getElementsByClassName("CLIP");

            let descriptionElement = descriptionAndCategory[0];
            descriptionElement.style.border = border;
            let description = descriptionElement.innerText;

            let categoryElement = descriptionAndCategory[1];
            categoryElement.style.border = border;
            let category = categoryElement.innerText;

            let redAmount = record.getElementsByClassName("RED_AMOUNT");
            let greenAmount = record.getElementsByClassName("GREEN_AMOUNT");
            let amountElement = redAmount.length ? redAmount[0] : greenAmount[0];
            amountElement.style.border = border;
            let amount = parseAmount(amountElement.innerText);

            let transaction = { description, category, dateTime, amount };

            console.log(JSON.stringify(transaction));
            transactions.push(transaction);
            continue;
        }
    }

    return transactions;
}

function sendTransactions(token, accountCode, data) {
    var req = new XMLHttpRequest();
    req.open('PATCH', 'https://myfinance-server.herokuapp.com/api/v1/accounts/' + accountCode, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Authorization", "Bearer " + token);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 204) {
            alert("Successful!");
        }
    };

    req.send(JSON.stringify(data));
}