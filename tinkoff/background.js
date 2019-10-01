// Listen click event by extension button
chrome.browserAction.onClicked.addListener(tab => {

    // Send message to check whether the script has already been injected
    chrome.tabs.sendMessage(tab.id, "ping", pingResponse => {
        // If no message handler exists (i.e. content-script hasn't been injected before),
        // this callback is called right away with no arguments, so ...
        if (typeof pingResponse === "undefined") {
            // ... inject content-script (null means current active tab)
            chrome.tabs.executeScript(tab.id, { file: "content-script.js" }, executeResponse => {
                let e = chrome.runtime.lastError;
                if (e !== undefined) {
                    console.log(tabId, executeResponse, e);
                }
                else {
                    exportCommand(tab.id);
                }
            });
        } else {
            //# Register events or other stuff that send messages to the content-script
            exportCommand(tab.id);
        }
    });
});

function exportCommand(tabId) {
    getTokenOrAuthorize()
        .then(token => {
            if (!token) {
                alert("Error: Token is " + token);
                return;
            }

            chrome.tabs.sendMessage(tabId, "export", response => {
                if (response) {
                    sendTransactions(token, response.data);
                    console.log("export " + response);
                }
            });
        });
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

    req.send(data);
}

function getTokenOrAuthorize() {
    return getToken()
        .then(token => {
            if (!token) {
                return login().then(auth => {
                    setAuth(auth);
                    return auth.token;
                });
            }
            return token;
        })
        .then(token => {
            return getCurrentUser(token).then(user => {
                if (user)
                    return token;
                else {
                    return login().then(auth => {
                        setAuth(auth);
                        return auth.token;
                    });
                }
            });
        });
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

function login() {
    return new Promise((resolve, reject) => {
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

        getEmailAndPassword().then(result => {
            if (!result.email || !result.password) {
                reject();
                return;
            }

            req.send(JSON.stringify(result));
        });
    });
}

function getEmailAndPassword() {
    return new Promise(resolve => chrome.storage.sync.get(x => resolve({ email: x && x.email, password: x && x.password })));
}

function getToken() {
    return new Promise(resolve => {
        chrome.storage.sync.get(x => resolve(x && x.auth && x.auth.token))
    });
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
