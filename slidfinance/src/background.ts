//chrome.runtime.onInstalled.addListener(() => {
  //chrome.webNavigation.onCompleted.addListener(() => {
  //   chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
  //     chrome.pageAction.show(id);
  //   });
  // }, { url: [{ urlMatches: 'google.com' }]


  //});
//});

function getSlidFinanceAuthData() {
  console.log("Getting auth data...")
  // Открываем вкладку в новом окне и выполняем скрипт в созданной вкладке.

  chrome.tabs.create({
    active: false,
    url: 'https://myfinance-frontend.herokuapp.com'
  }, function(tab) {
    chrome.tabs.executeScript(tab.id, {
      code: 'localStorage.getItem("auth");'
    }, function(result) {
      chrome.tabs.remove(tab.id);
      console.log("Result:\n");
      console.log(result);
    });
  });
}
