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

    prepareToParse();
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

function parseDate(text) {
    let matches = text.match(/(\d{2})[\/.](\d{2})[\/.](\d{4})/);
    return new Date(Date.UTC(+matches[3], +matches[2] - 1, +matches[1], 0, 0, 0));
}

function parseBalance() {
    return document.querySelector(".mts_leftpanel_cards_card_amount").pipe(setBorder, innerText, parseAmount);
}

function parseAmount(text) {
    return parseFloat(text.replace(/[+\sр]/g, "").replace(/,/g, "."));
}

function firstChildText(element) {
    if (element.firstChild && element.firstChild.nodeType == 3) {
        return element.firstChild.textContent.trim();
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
    let records = document.querySelectorAll(".fto-list-grid-operations-history .fto-listgrid-item")
    for (let record of records) {
        let dateElement = record.querySelector(".list-grid-group");
        if (dateElement) {
            dateTime = dateElement.pipe(setBorder, innerText, parseDate);
        }

        if (!dateTime || !(dateTime instanceof Date))
            continue;

        let description = record.querySelector("div.row > div:nth-child(1) span").pipe(setBorder, firstChildText);
        let matches = description.match(/\d+$/);
        let mcc = matches && +matches[0];
        let amount = record.querySelector("div.row > div:nth-child(2) span.fto-amount").pipe(setBorder, firstChildText, parseAmount);

        let transaction = { description, mcc, dateTime, amount };

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