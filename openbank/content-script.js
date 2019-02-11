console.log("content-script loaded")

// Listen for messages from browser-action or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    var response;

    // Message to check whether this script has been injected
    if (request === "ping") {
        // "Yeah, we're good"
        response = "pong";
    }
    else if (request == "export") {
        try {
            exportTransactionsCommandHandler();
            console.log("Export completed");
            response = "ok";
        } catch (error) {
            console.log("Export error: " + error);
            response = "error";
        }
    }

    sendResponse(response);
});

function exportTransactionsCommandHandler() {
    let token = getToken();
    if (!token) {
        alert("Error: Token is " + token);
        throw Error("Error: Token is " + token);
    }

    let accountCode = getAccountCode();
    if (!accountCode) {
        alert("Error: accountCode is " + accountCode);
        throw Error("Error: accountCode is " + accountCode);
    }

    prepareToParse();
    let transactions = parseTransactions();
    let balance = parseBalance();

    if (token && transactions && transactions.length)
        sendTransactions(token, accountCode, { balance, transactions });
}

function getToken() {
    var auth = localStorage.getItem("auth");

    try {
        var jsonAuth = auth && JSON.parse(auth);
    }
    catch{ }

    return jsonAuth && jsonAuth.token;
}

function getAccountCode() {
    return localStorage.getItem("accountCode");
}

function parseDate(text) {
    const months = { "января": 0, "февраля": 1, "марта": 2, "апреля": 3, "мая": 4, "июня": 5, "июля": 6, "августа": 7, "сентября": 8, "октября": 9, "ноября": 10, "декабря": 11 };

    let matches = text.match(/(\d{1,2}) (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)[ ]{0,1}(\d{0,4})/);
    if (matches) {
        let year = new Date().getFullYear();
        if (matches[3])
            year = +matches[3];
        let date = new Date(Date.UTC(year, months[matches[2]], +matches[1]));
        return date;
    }
}

function parseBalance() {
    return document.querySelector(".wocb-product-item-header_card .wocb-product-item-header__amount, .wocb-select-product-item_card .wocb-select-product-item__amount").pipe(setBorder, innerText, parseAmount);
}

function parseAmount(text) {
    return parseFloat(text.replace(/[+\sр]/g, "").replace(/,/g, ".").replace(/–/g, "-"));
}

function innerText(element) {
    return element.innerText.trim();
}

function setBorder(element) {
    let border = "1px solid red";
    element.style.border = border;
    return element;
}

function prepareToParse() {
    const _pipe = (a, b) => (arg) => b(a(arg));
    const pipe = (...ops) => ops.reduce(_pipe);

    Object.defineProperty(Element.prototype, "pipe", {
        value: function (...ops) {
            return pipe(...ops)(this);
        },
        writable: true,
        configurable: true
    });
}

function parseTransactions() {
    let transactions = [];
    let records = document.querySelectorAll(".wocb-transactions > .wocb-transaction, .wocb-transactions-list > .wocb-transaction");

    for (let record of records) {
        let description = record.querySelector(".wocb-transaction__description").pipe(setBorder, innerText);
        let dateTime = record.querySelector(".wocb-transaction__date").pipe(setBorder, innerText, parseDate);

        let amount = record.querySelector(".wocb-transaction__amount").pipe(setBorder, innerText, parseAmount);

        let transaction = { description, dateTime, amount };

        console.log(JSON.stringify(transaction));
        transactions.push(transaction);
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