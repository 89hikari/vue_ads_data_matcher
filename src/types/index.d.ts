export type RawOrder = {
  order_number: string;
  status: string;
};

export type PurchasedOrder = {
  "Event Value": string;
  "Original URL": string;
};

export type EventValue = {
  [key: string]: string;
};
