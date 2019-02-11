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
        console.log("export " + response);
    });
}