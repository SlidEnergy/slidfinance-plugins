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
            console.log("Export success");
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

    let accountId = getAccountId();
    if (!accountId) {
        alert("Error: AccountId is " + accountId);
        throw Error("Error: AccountId is " + accountId);
    }

    prepareToParse();
    let transactions = parseTransactions();
    let balance = parseBalance();

    if (token && transactions && transactions.length)
        sendTransactions(token, accountId, { balance, transactions });
}

function getToken() {
    var auth = localStorage.getItem("auth");

    try {
        var jsonAuth = auth && JSON.parse(auth);
    }
    catch{ }

    return jsonAuth && jsonAuth.token;
}

function getAccountId() {
    var accountId = localStorage.getItem("accountId");

    try {
        return parseInt(accountId);
    }
    catch{ }

    return null;
}

function parseDate(text) {
    let matches = text.match(/(\d{2})[\/.](\d{2})[\/.](\d{4})/);
    let date = new Date(+matches[3], +matches[2] - 1, +matches[1]);
    date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
    return date;
}

function parseBalance() {
    return document.querySelector("div.new-info-list__balance").pipe(setBorder, firstChildText, parseAmount);
}

function parseAmount(text) {
    return parseFloat(text.replace(/[+\sр]/g, "").replace(/,/g, "."));
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
    let records = document.querySelectorAll("ul.tab-content-details-balance li:not(.dop)");
    for (let record of records) {
        let description = record.querySelector(".name").pipe(setBorder, firstChildText);
        let dateTime = record.querySelector(".name .info span:first-child").pipe(setBorder, lastChildText, parseDate);

        let categoryElement1 = record.querySelector(".name .info span:nth-child(2)");
        let categoryElement2 = record.querySelector(".name .info span:nth-child(3)");

        let category = "";
        if (categoryElement1)
            category = "" + categoryElement1.pipe(setBorder, firstChildText);

        if (categoryElement2)
            category = (category ? category + " " : "") + categoryElement2.pipe(setBorder, firstChildText);

        let amount = record.querySelector(".val > div").pipe(setBorder, firstChildText, parseAmount);

        let transaction = { description, category, dateTime, amount };

        console.log(JSON.stringify(transaction));
        transactions.push(transaction);
    }

    return transactions;
}

function sendTransactions(token, accountId, data) {
    var req = new XMLHttpRequest();
    req.open('PATCH', 'https://myfinance-server.herokuapp.com/api/v1/accounts/' + accountId, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Authorization", "Bearer " + token);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 201) {
            alert("Successful!");
        }
    };

    req.send(JSON.stringify(data));
}