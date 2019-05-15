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
    let token = await getTokenOrAuthorize();
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
        sendTransactions(token, { code: accountCode, balance, transactions });
}

async function getTokenOrAuthorize() {
    let token = await getToken();
    if (!token) {
        let auth = await login();
        setAuth(auth);
        return auth.token;
    }

    let user = await getCurrentUser(token);
    if (user)
        return token;
    else {
        let auth = await login();
        setAuth(auth);
        return auth.token;
    }
}

function getCurrentUser(token) {
    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();
        req.open('GET', 'https://myfinance-server.herokuapp.com/api/v1/users/current', true);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", "Bearer " + token);
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    resolve(JSON.parse(req.response))
                } else {
                    resolve(null);
                }
            }
        };

        req.send();
    });
}

async function login() {
    let { email, password } = await getEmailAndPassword();

    return new Promise((resolve, reject) => {
        if (!email || !password) {
            reject();
            return;
        }

        var req = new XMLHttpRequest();
        req.open('POST', 'https://myfinance-server.herokuapp.com/api/v1/users/login', true);
        req.setRequestHeader("Content-Type", "application/json");
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    resolve(JSON.parse(req.response));
                } else {
                    console.error(req);
                    reject();
                }
            }
        };

        req.send(JSON.stringify({ email, password }));
    });
}

function getEmailAndPassword() {
    return new Promise(resolve => chrome.storage.sync.get(x => resolve({ email: x && x.email, password: x && x.password })));
}

function getToken() {
    return new Promise(resolve => chrome.storage.sync.get(x => resolve(x && x.auth && x.auth.token)));
}

function setAuth(auth) {
    return new Promise(resolve => chrome.storage.sync.get(x => {
        chrome.storage.sync.set(Object.assign(x, { auth }));
        resolve(x && x.auth && x.auth.token);
    }));
}

function getAccountCode() {
    return new Promise(resolve => chrome.storage.sync.get(x => resolve(x && x.accountCode)));
}

let months = { "Января": 0, "Февраля": 1, "Марта": 2, "Апреля": 3, "Мая": 4, "Июня": 5, "Июля": 6, "Августа": 7, "Сентября": 8, "Октября": 9, "Ноября": 10, "Декабря": 11 };

function parseDate(text) {
    let matches = text.match(/(\d{1,2}) (Января|Февраля|Марта|Апреля|Мая|Июня|Июля|Августа|Сентября|Октября|Ноября|Декабря) (\d{4})/);
    return new Date(Date.UTC(+matches[3], months[matches[2]], +matches[1], 0, 0, 0));
}

function parseBalance() {
    return document.querySelector("table.productBox.bg2 td.C").pipe(setBorder, innerText, parseAmount);
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
    let records = document.querySelectorAll(".accountMovementsBoxBody > tbody > tr")
    for (let record of records) {
        let dateElement = record.querySelector(".DATE > span");
        if (dateElement) {
            dateTime = dateElement.pipe(setBorder, innerText, parseDate);
            continue;
        }

        if (!dateTime || !(dateTime instanceof Date))
            continue;

        record = record.querySelector(".workingArea");
        if (record) {
            let descriptionAndCategory = record.querySelectorAll(".CLIP");

            let description = descriptionAndCategory[0].pipe(setBorder, innerText);
            let category = descriptionAndCategory[1].pipe(setBorder, innerText);;
            let amount = record.querySelector(".RED_AMOUNT, .GREEN_AMOUNT").pipe(setBorder, innerText, parseAmount);
            let transaction = { description, category, dateTime, amount };

            console.log(JSON.stringify(transaction));
            transactions.push(transaction);
            continue;
        }
    }

    return transactions;
}

function sendTransactions(token, data) {
    var req = new XMLHttpRequest();
    req.open('POST', 'https://myfinance-server.herokuapp.com/api/v1/import', true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Authorization", "Bearer " + token);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            alert("Successful!");
        }
    };

    req.send(JSON.stringify(data));
}