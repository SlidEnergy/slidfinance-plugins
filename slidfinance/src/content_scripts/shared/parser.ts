export function registerParser(exportCommandHandler: () => { balance: number, transactions: any[] } | undefined) {

  // Listen for messages from browser-action or background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("command received");
    // Message to check whether this script has been injected
    if (request === "ping") {
      sendResponse("pong");
    } else if (request == "export") {
      console.log("export command received");
      try {
        let response = exportCommandHandler();
        //let json = JSON.stringify(response);
        console.log("Export completed");
        console.log(response);
        sendResponse(response);
      } catch (error) {
        console.log("Export error: " + error);
        sendResponse("error");
      }
    }

    return true;
  });

}
