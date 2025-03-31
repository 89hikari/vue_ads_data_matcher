export type RawOrder = {
  order_number: string;
  status: string;
  city: string;
};

export type PurchasedOrder = {
  "Event Value": string;
  "Original URL": string;
  "Is Primary Attribution": string;
  Campaign: string;
};

export type EventValue = {
  [key: string]: string;
};

export type InitFile<T> = {
  file: File | undefined;
  data: T[];
  loading: boolean;
};
