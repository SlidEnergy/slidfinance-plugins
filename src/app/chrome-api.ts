import InjectDetails = chrome.tabs.InjectDetails;
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChromeApiService {

  get activeTab(): Observable<chrome.tabs.Tab> {
    return new Observable(subscriber => chrome.tabs.query({active: true, currentWindow: true}, tabs => subscriber.next(tabs[0])));
  }

  getSyncStorage(): Observable<any> {
    return new Observable(subscriber => chrome.storage.sync.get(data => subscriber.next(data)));
  }

  setSyncStorage(data): Observable<any> {
    return new Observable(subscriber => chrome.storage.sync.set(data, () => subscriber.next(true)));
  }

  sendMessage(tabId: number, message: string): Observable<any> {
    return new Observable( subscriber =>
      chrome.tabs.sendMessage(tabId, message, response => subscriber.next(response)));
  }

  private createCallback(tabId: number | null, injectDetails: InjectDetails, innerCallback: (executeResponse) => void) : () => void {
    return () => chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
  }

  executeScripts(tabId: number | null, injectDetailsArray: InjectDetails[]) : Observable<any> {
    return new Observable(subscriber => {
      let innerCallback = (executeResponse) => subscriber.next(executeResponse);

      for (let i = injectDetailsArray.length - 1; i >= 0; --i)
        innerCallback = this.createCallback(tabId, injectDetailsArray[i], innerCallback);

      if (innerCallback !== null)
        innerCallback(undefined);   // execute outermost function
    });
  }

  createTab(createProperties: chrome.tabs.CreateProperties): Observable<chrome.tabs.Tab> {
      return new Observable(subscriber =>
        chrome.tabs.create(createProperties, response => subscriber.next(response)));
  }
}
