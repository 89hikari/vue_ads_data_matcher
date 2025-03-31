import { defineStore } from "pinia";
import { utils as XLSXUtils, writeFile } from "xlsx";
import {
  getFile,
  getStrFromArrByKey,
  getWorker,
} from "../helpers/common.helper";
import type * as Types from "../types";

const initFile = <T>(): Types.InitFile<T> => ({
  file: undefined,
  data: <T[]>[],
  loading: false,
});

const initList = {
  initial: <string[]>[],
  selected: <string[]>[],
};

export const useAppStore = defineStore("app", {
  state: () => ({
    rawOrders: initFile<Types.RawOrder>(),
    purchasedOrders: initFile<Types.PurchasedOrder>(),
    statuses: { ...initList },
    campaignItems: { ...initList },
    cities: { ...initList },
    primaryAttribution: {
      initial: ["Да", "Нет"],
      selected: "",
    },
    afKeywords: "af_keywords",
    orderKey: "af_order_id",
    isDownloading: false,
  }),
  actions: {
    setListData(
      listName: "statuses" | "campaignItems" | "cities",
      data: string[]
    ) {
      this[listName].initial = data;
    },
    handleFileChange(
      fileType: "rawOrders" | "purchasedOrders",
      incomingValue: File[] | File
    ) {
      const file = getFile(incomingValue);

      if (!file) return;

      const curContainer = this[fileType];

      curContainer.file = file;
      curContainer.loading = true;

      const reader = new FileReader();
      const blob = new Blob([file], { type: file.type });
      reader.readAsArrayBuffer(blob);

      const worker = getWorker();

      reader.onload = (e) =>
        worker!.postMessage({
          type: "uploadFile",
          data: new Uint8Array(<ArrayBuffer>e.target?.result),
        });

      const state = this;
      worker.onmessage = function (event: MessageEvent) {
        curContainer.data = event.data;
        if (fileType === "rawOrders") {
          state.setListData(
            "statuses",
            getStrFromArrByKey<Types.RawOrder>(curContainer.data, "status")
          );
          state.setListData(
            "cities",
            getStrFromArrByKey<Types.RawOrder>(curContainer.data, "city").sort()
          );
        } else {
          state.setListData(
            "campaignItems",
            getStrFromArrByKey<Types.PurchasedOrder>(
              curContainer.data,
              "Campaign"
            ).sort()
          );
        }

        curContainer.loading = false;
        this.terminate();
      };
    },
    download() {
      this.isDownloading = true;
      const worker = getWorker();
      worker.postMessage(
        JSON.stringify({
          rawOrdersData: this.rawOrders.data,
          purchasedOrdersData: this.purchasedOrders.data,
          statusesSelected: this.statuses.selected,
          orderKey: this.orderKey,
          afKeywords: this.afKeywords,
          campaignItemsSelected: this.campaignItems.selected,
          selectedCities: this.cities.selected,
          isPrimaryAttribution: this.primaryAttribution.selected,
        })
      );

      const state = this;
      worker.onmessage = function (event: MessageEvent) {
        XLSXUtils.book_append_sheet(
          event.data.wb,
          event.data.ws,
          "Merged Orders"
        );
        writeFile(event.data.wb, "merged_orders.xlsx");

        state.isDownloading = false;
        this.terminate();
      };
    },
  },
  getters: {
    loading(): boolean {
      return (
        this.rawOrders.loading ||
        this.purchasedOrders.loading ||
        this.isDownloading
      );
    },
    canDownload(): boolean {
      return !!this.rawOrders.data.length && !!this.purchasedOrders.data.length;
    },
  },
});
