<script setup lang="ts">
import { ref } from "vue";
import * as XLSX from "xlsx";
import type { PurchasedOrder, RawOrder } from "./types";

const rawOrdersLoading = ref<boolean>(false);
const purchasedOrdersLoading = ref<boolean>(false);
const isDownloading = ref<boolean>(false);
const mainLoading = ref<boolean>(false);
const afKeywords = ref<string>("af_keywords");
const orderKey = ref<string>("af_order_id");
const statusesSelected = ref<string[]>([]);
const statuses = ref<string[]>([]);
const campaignItems = ref<string[]>([]);
const campaignItemsSelected = ref<string[]>([]);

const cities = ref<string[]>([]);
const selectedCities = ref<string[]>([]);
const isPrimaryAttribution = ref<string>();

const rawOrdersFile = ref<File | File[] | undefined>();
const purchasedOrdersFile = ref<File | File[] | undefined>();

const rawOrdersData = ref<RawOrder[] | null>(null);
const purchasedOrdersData = ref<PurchasedOrder[] | null>(null);

const worker = new Worker(new URL("./utils/worker?worker", import.meta.url), {
  type: "module",
});

const handleFileChange = (
  fileType: "rawOrders" | "purchasedOrders",
  incomingValue: File[] | File
) => {
  const file = Array.isArray(incomingValue) ? incomingValue[0] : incomingValue;
  if (!file) {
    if (fileType === "rawOrders") {
      rawOrdersData.value = [];
    } else {
      purchasedOrdersData.value = [];
    }
    return;
  }

  mainLoading.value = true;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (fileType === "rawOrders") {
      rawOrdersLoading.value = true;
    } else {
      purchasedOrdersLoading.value = true;
    }

    worker!.postMessage({
      type: "uploadFile",
      data: new Uint8Array(e.target?.result as ArrayBuffer),
    });

    worker.onmessage = (event: MessageEvent) => {
      if (fileType === "rawOrders") {
        rawOrdersData.value = event.data as RawOrder[];
        statuses.value = [
          ...new Set(rawOrdersData.value.map(({ status }) => status)),
        ];
        cities.value = [
          ...new Set(rawOrdersData.value.map(({ city }) => city.toString())),
        ].sort();
      } else if (fileType === "purchasedOrders") {
        purchasedOrdersData.value = event.data as PurchasedOrder[];
        campaignItems.value = [
          ...new Set(
            purchasedOrdersData.value.map(({ Campaign }) => Campaign.toString())
          ),
        ].sort();
      }

      mainLoading.value = false;
      rawOrdersLoading.value = false;
      purchasedOrdersLoading.value = false;
    };
  };

  const blob = new Blob([file], { type: file.type });
  reader.readAsArrayBuffer(blob);
};

const downloadMergedFile = () => {
  isDownloading.value = true;
  worker.postMessage(
    JSON.stringify({
      rawOrdersData: rawOrdersData.value,
      purchasedOrdersData: purchasedOrdersData.value,
      statusesSelected: statusesSelected.value,
      orderKey: orderKey.value,
      afKeywords: afKeywords.value,
      campaignItemsSelected: campaignItemsSelected.value,
      selectedCities: selectedCities.value,
      isPrimaryAttribution: isPrimaryAttribution.value,
    })
  );

  worker.onmessage = (event: MessageEvent) => {
    XLSX.utils.book_append_sheet(event.data.wb, event.data.ws, "Merged Orders");
    XLSX.writeFile(event.data.wb, "merged_orders.xlsx");

    isDownloading.value = false;
  };
};
</script>

<template>
  <h1 class="mb-6">Обработка заказов</h1>
  <v-text-field
    class="mb-3"
    hide-details="auto"
    label="Keywords"
    v-model="afKeywords"
    :disabled="mainLoading"
  ></v-text-field>
  <v-text-field
    class="mb-3"
    hide-details="auto"
    label="Ключ номера заказа"
    v-model="orderKey"
    :disabled="mainLoading"
  ></v-text-field>
  <v-select
    label="Статус"
    :items="statuses"
    multiple
    v-model="statusesSelected"
    :disabled="mainLoading"
  ></v-select>
  <v-autocomplete
    v-model="campaignItemsSelected"
    :items="campaignItems"
    label="Campaign"
    clearable
    multiple
    :disabled="mainLoading"
  ></v-autocomplete>
  <v-autocomplete
    v-model="selectedCities"
    :items="cities"
    label="Города"
    clearable
    multiple
    :disabled="mainLoading"
  ></v-autocomplete>
  <v-select
    label="Is primary attribution"
    :items="['Да', 'Нет']"
    v-model="isPrimaryAttribution"
    :disabled="mainLoading"
    clearable
  ></v-select>
  <div class="d-flex align-center ga-4 mb-4">
    <div class="flex-column flex-1-1-0">
      <v-file-upload
        scrim="primary"
        divider-text="или"
        browse-text="Выбрать файл"
        :title="rawOrdersLoading ? 'Загрузка, подождите' : 'Файл выкупов'"
        clearable
        v-model="rawOrdersFile"
        @update:modelValue="handleFileChange('rawOrders', $event)"
        :disabled="mainLoading"
      ></v-file-upload>
    </div>
    <div class="flex-column flex-1-1-0">
      <v-file-upload
        scrim="primary"
        divider-text="или"
        browse-text="Выбрать файл"
        :title="
          purchasedOrdersLoading ? 'Загрузка, подождите' : 'Файл сырой выгрузки'
        "
        clearable
        v-model="purchasedOrdersFile"
        @update:modelValue="handleFileChange('purchasedOrders', $event)"
        :disabled="mainLoading"
      ></v-file-upload>
    </div>
  </div>
  <v-btn
    v-if="rawOrdersData && purchasedOrdersData"
    @click="downloadMergedFile"
    :disabled="isDownloading"
  >
    {{ isDownloading ? "Формируем" : "Скачать" }}
  </v-btn>
</template>

<style scoped></style>
