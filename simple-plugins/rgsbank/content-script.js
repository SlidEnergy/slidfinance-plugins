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
        req.open('GET', 'https://slidfinance-server.herokuapp.com/api/v1/users/current', true);
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
        req.open('POST', 'https://slidfinance-server.herokuapp.com/api/v1/users/token', true);
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

        let mccElement = record.querySelector(".name .info span:nth-child(2)");
        let mcc = null;
        if (mccElement) {
            let mccText = mccElement.pipe(setBorder, firstChildText);
            if (mccText) {
                mcc = parseInt(mccText.match(/MCC: (\d{4})/)[1]);
            }
        }

        let categoryElement = record.querySelector(".name .info span:nth-child(3)");

        let category = "";
        if (categoryElement)
            category = categoryElement.pipe(setBorder, firstChildText);

        let amount = record.querySelector(".val > div").pipe(setBorder, firstChildText, parseAmount);

        let transaction = { description, category, dateTime, amount, mcc };

        console.log(JSON.stringify(transaction));
        transactions.push(transaction);
    }

    return transactions;
}

function sendTransactions(token, data) {
    var req = new XMLHttpRequest();
    req.open('POST', 'https://slidfinance-server.herokuapp.com/api/v1/import', true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Authorization", "Bearer " + token);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            alert("Successful!");
        }
    };

    req.send(JSON.stringify(data));
}
