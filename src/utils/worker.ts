import { utils as XLSXUtils, read } from "xlsx";
import type { EventValue, PurchasedOrder, RawOrder } from "../types";

const extractSearchPhrase = (urlString: string, key: string): string | null => {
  try {
    const parsedUrl = new URL(urlString);
    const params = new URLSearchParams(parsedUrl.search);
    return params.get(key) || null;
  } catch (e) {
    return null;
  }
};

self.onmessage = (event) => {
  if (event.data.type === "uploadFile") {
    const workbook = read(event.data.data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSXUtils.sheet_to_json(sheet);

    self.postMessage(jsonData);
    return;
  }

  const parsedData = JSON.parse(event.data);

  const newFileJson = parsedData.purchasedOrdersData.map(
    (newOrder: PurchasedOrder) => {
      const eventValueJson = <EventValue>JSON.parse(newOrder["Event Value"]);
      const eventValueKey = eventValueJson[parsedData.orderKey];
      if (eventValueKey) {
        const order = parsedData.rawOrdersData.find(
          (orderElem: RawOrder) =>
            orderElem.order_number?.trim() === eventValueKey.trim()
        );
        if (
          order &&
          (parsedData.statusesSelected.indexOf(order.status) !== -1 ||
            !parsedData.statusesSelected.length) &&
          (parsedData.campaignItemsSelected.indexOf(newOrder.Campaign) !== -1 ||
            !parsedData.campaignItemsSelected.length) &&
          (parsedData.selectedCities.indexOf(order.city) !== -1 ||
            !parsedData.selectedCities.length) &&
          (parsedData.isPrimaryAttribution
            ? parsedData.isPrimaryAttribution === "Да"
              ? newOrder["Is Primary Attribution"] === "true"
              : newOrder["Is Primary Attribution"] === "false"
            : true)
        )
          return {
            ...newOrder,
            ...order,
            decodedKeywords: extractSearchPhrase(
              newOrder["Original URL"],
              parsedData.afKeywords
            ),
          };
      }

      return newOrder;
    }
  );

  if (newFileJson) {
    const ws = XLSXUtils.json_to_sheet(newFileJson);
    const wb = XLSXUtils.book_new();

    self.postMessage({
      ws,
      wb,
    });
  }
};
