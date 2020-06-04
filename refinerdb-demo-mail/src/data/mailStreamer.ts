import { Providers, prepScopes } from "@microsoft/mgt";
import get from "lodash/get";

export default function createMailStream(onData: (items: any[]) => void) {
  let isCanceled = false;
  let stream = {
    start: async () => {
      let result = await fetchMessages();
      if (isCanceled) return;
      onData(result.items);

      while (result.nextLink) {
        console.log(result);
        result = await fetchMessages(result.nextLink);
        if (isCanceled) return;
        onData(result.items);
      }
    },
    cancel: () => {
      isCanceled = true;
    },
  };
  return stream;
}

const SELECT_FIELDS = [
  "receivedDateTime",
  "subject",
  "conversationId",
  "from",
  "toRecipients",
  "ccRecipients",
  "uniqueBody",
  "webLink",
];

// const fetchAllMessages = async (syncLink) => {
//   let allItems = [];
//   let result = await this.fetchMessages(syncLink);
//   console.log("fetchAllMessages.result 1", result);
//   allItems = allItems.concat(result.items);

//   while (result.nextLink) {
//     result = await this.fetchMessages(result.nextLink);
//     allItems = allItems.concat(result.items);
//   }
// };

const fetchMessages = async (incomingNextLink?: string) => {
  let provider = Providers.globalProvider;
  let graphClient = provider.graph.client;

  let url =
    incomingNextLink ||
    `https://graph.microsoft.com//v1.0/me/MailFolders/Inbox/messages?$orderby=receivedDateTime+desc&$top=50`;
  console.log("Fectching", url);
  let apiReq = graphClient
    .api(url)
    .middlewareOptions(prepScopes("user.read", "mail.read"))
    .headers({
      Prefer: `outlook.body-content-type="text"`,
    });
  if (!incomingNextLink) {
    apiReq = apiReq
      // .top(250)
      .select(SELECT_FIELDS);
    // .orderby("receivedDateTime+desc");
  }
  let data: any = await apiReq.get();

  let items = data.value.map(transformResultItem);
  let nextLink = data["@odata.nextLink"];
  let deltaLink = data["@odata.deltaLink"];
  console.log("SYNC LINKS", { nextLink, deltaLink }, items);
  return { items, nextLink, deltaLink };
};

const transformResultItem = function(rawItem: any) {
  console.log(rawItem);
  let item = {
    ...rawItem,
    date: new Date(rawItem.receivedDateTime),
    from: transformEmailAddress(rawItem.from),
    toRecipients: rawItem.toRecipients.map(transformEmailAddress),
    ccRecipients: rawItem.ccRecipents ? rawItem.ccRecipients.map(transformEmailAddress) : ["None"],
    bodyPreview: get(rawItem, "uniqueBody.content", "").substring(0, 200),
    body: get(rawItem, "uniqueBody.content", ""),
  };
  return item;
};

const transformEmailAddress = ({ emailAddress }) =>
  emailAddress ? `${emailAddress.name} - ${emailAddress.address}` : "None";
