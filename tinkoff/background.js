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
        }

        //# Register events or other stuff that send messages to the content-script
        exportCommand(tab.id);
    });
});

function exportCommand(tabId) {
    chrome.tabs.sendMessage(tabId, "export", response => {
        if (response) {
            sendTransactions(response.token, response.accountCode, response.data);
            console.log("export " + response);
        }
    });
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

    req.send(data);
}