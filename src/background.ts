import {supportedBanks} from "./app/supported-banks";

chrome.runtime.onInstalled.addListener(() => {
  let urls: {urlMatches: string}[] = supportedBanks.map(bank => ({ urlMatches: bank.url}));

  chrome.webNavigation.onCompleted.addListener(() => {
      chrome.tabs.query({active: true, currentWindow: true}, ([{id}]) => {
        //chrome.pageAction.show(id);
        chrome.notifications.onClicked.addListener((notificationId => {

        }));

        chrome.notifications.create({
          type: "basic",
          iconUrl: "assets/angular.png",
          title: "SlidFinance",
          message: "Ваш банк поддерживается и Вы можете экспортировать ваши операции в систему SlidFinance",
        })
      });
    },
    {
      url: urls
    });
});
