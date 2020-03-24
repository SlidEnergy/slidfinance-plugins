import {supportedBanks} from "./app/supported-banks";

chrome.runtime.onInstalled.addListener(() => {
  let urls: {urlMatches: string}[] = supportedBanks.map(bank => ({ urlMatches: bank.url}));

  chrome.webNavigation.onCompleted.addListener(() => {
      chrome.tabs.query({active: true, currentWindow: true}, ([{id}]) => {
      });
    },
    {
      url: urls
    });
});
