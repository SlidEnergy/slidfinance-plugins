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
        req.open('POST', 'https://myfinance-server.herokuapp.com/api/v1/users/token', true);
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

function parseDate(text) {
    const months = { "января": 0, "февраля": 1, "марта": 2, "апреля": 3, "мая": 4, "июня": 5, "июля": 6, "августа": 7, "сентября": 8, "октября": 9, "ноября": 10, "декабря": 11 };

    let matches = text.match(/(\d{1,2}) (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)[ ]{0,1}(\d{0,4})/);
    if (matches) {
        let year = new Date().getFullYear();
        if (months[matches[2]] > new Date().getMonth())
            year -= 1;
        if (matches[3])
            year = +matches[3];
        let date = new Date(Date.UTC(year, months[matches[2]], +matches[1]));
        return date;
    }

    matches = text.match(/(Сегодня|Вчера)/);
    if (matches) {
        if (matches[1] === 'Сегодня') {
            let nowDate = new Date();
            let date = new Date(Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()));
            return date;
        }
        if (matches[1] === 'Вчера') {
            let nowDate = new Date();
            let date = new Date(Date.UTC(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()));
            date.setDate(date.getDate() - 1);
            return date;
        }
    }
}

function parseBalance() {
    return document.querySelector("div[class^='account-info-amount']").pipe(setBorder, innerText, parseAmount);
}

function parseAmount(text) {
    let negative = true;

    if (text.search(/\+/) >= 0)
        negative = false;

    let dollars = false;

    if (text.search(/\$/) >= 0)
        dollars = true;

    let value = parseFloat(text.replace(/[+$₽\s]/g, "").replace(/,/g, ".").replace(/–/g, "-"));

    if (negative)
        value *= -1;

    if (dollars)
        value *= 65;

    return value;
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
    let records = document.querySelectorAll("div[class^='content-column-self'] div[class^='history-block-date'], div[class^='content-column-self'] div[class*='history-item-self'][class*='history-item-success']");
    for (let record of records) {
        let dateElement = record.querySelector("span[class^='history-block-date-value']");
        if (dateElement) {
            dateTime = dateElement.pipe(setBorder, firstChildText, parseDate);
            continue;
        }

        if (!dateTime || !(dateTime instanceof Date))
            continue;

        let description = record.querySelector("span[class^='history-item-header-info-provider']").pipe(setBorder, innerText);

        let amount = record.querySelector("span[class^='history-item-header-sum-amount']").pipe(setBorder, innerText, parseAmount);

        let transaction = { description, dateTime, amount };

        console.log(JSON.stringify(transaction));
        transactions.push(transaction);
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
