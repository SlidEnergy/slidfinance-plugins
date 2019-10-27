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

  private createCallback(tabId: number | null, injectDetails: InjectDetails, innerCallback: (executeResponse) => void) {
    return () => chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
  }

  executeScripts(tabId: number | null, injectDetailsArray: InjectDetails[], callback: (executeResponse?) => void) {
    let innerCallback = callback;

    for (let i = injectDetailsArray.length - 1; i >= 0; --i)
      innerCallback = this.createCallback(tabId, injectDetailsArray[i], innerCallback);

    if (innerCallback !== null)
      innerCallback();   // execute outermost function
  }
}
