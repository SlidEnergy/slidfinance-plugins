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
            response = exportTransactionsCommandHandler();
            response.data = JSON.stringify(response.data);
            console.log("Export completed");
        } catch (error) {
            console.log("Export error: " + error);
            response = null;
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
        return { token, accountCode, data: { balance, transactions } };

    return null;
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

    matches = text.match(/(сегодня|вчера)/);
    if (matches) {
        if (matches[1] === 'сегодня') {
            let nowDate = new Date();
            let date = new Date(Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()));
            return date;
        }
        if (matches[1] === 'вчера') {
            let nowDate = new Date();
            let date = new Date(Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()));
            date.setDate(date.getDate() - 1);
            return date;
        }
    }
}

function parseBalance() {
    let amount = document.querySelector("div[data-key='5003116562'].board__QbjcC .board__2Vhh9").pipe(setBorder, innerText, parseAmount);

    return amount;
}

function parseAmount(text) {
    return parseFloat(text.replace(/[+\s₽]/g, "").replace(/,/g, ".").replace(/−/g, "-"));
}

function firstChildText(element) {
    if (element.firstChild && element.firstChild.nodeType == 3) {
        return element.firstChild.textContent.trim();
    }
}

function lastChildText(element) {
    if (element.lastChild && element.lastChild.nodeType == 3) {
        return element.lastChild.textContent.trim();
    }
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
    let dateTime;
    let transactions = [];
    let records = document.querySelectorAll("div.OperationsList__list_7dZy_ > div.OperationsList__listItem_1ksLk"); // grid table-header & account-history
    for (let record of records) {
        if (record.childElementCount == 0) {
            dateTime = record.pipe(setBorder, firstChildText, parseDate);
            continue;
        }

        if (!dateTime || !(dateTime instanceof Date))
            continue;

        let description = record.querySelector("span.OperationItem__description_3qZ0t").pipe(setBorder, innerText);
        let category = record.querySelector("span.OperationItem__category_1cmuu").pipe(setBorder, innerText);
        let amount = record.querySelector("span.OperationItem__value_3wApj").pipe(setBorder, innerText, parseAmount);

        let transaction = { description, category, dateTime, amount };

        console.log(JSON.stringify(transaction));
        transactions.push(transaction);
    }

    return transactions;
}
