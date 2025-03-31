<script setup lang="ts">
import { useAppStore } from "./stores/app.store";
const appStore = useAppStore();
</script>

<template>
  <h1 class="mb-6">Обработка заказов</h1>
  <v-text-field
    class="mb-3"
    hide-details="auto"
    label="Keywords"
    v-model="appStore.afKeywords"
    :disabled="appStore.loading"
  ></v-text-field>
  <v-text-field
    class="mb-3"
    hide-details="auto"
    label="Ключ номера заказа"
    v-model="appStore.orderKey"
    :disabled="appStore.loading"
  ></v-text-field>
  <v-select
    label="Статус"
    :items="appStore.statuses.initial"
    multiple
    v-model="appStore.statuses.selected"
    :disabled="appStore.loading"
  ></v-select>
  <v-autocomplete
    v-model="appStore.campaignItems.selected"
    :items="appStore.campaignItems.initial"
    label="Campaign"
    clearable
    multiple
    :disabled="appStore.loading"
  ></v-autocomplete>
  <v-autocomplete
    v-model="appStore.cities.selected"
    :items="appStore.cities.initial"
    label="Города"
    clearable
    multiple
    :disabled="appStore.loading"
  ></v-autocomplete>
  <v-select
    label="Is primary attribution"
    :items="appStore.primaryAttribution.initial"
    v-model="appStore.primaryAttribution.selected"
    :disabled="appStore.loading"
    clearable
  ></v-select>
  <div class="d-flex align-center ga-4 mb-4">
    <div class="flex-column flex-1-1-0">
      <v-file-upload
        scrim="primary"
        divider-text="или"
        browse-text="Выбрать файл"
        :title="
          appStore.rawOrders.loading ? 'Загрузка, подождите' : 'Файл выкупов'
        "
        clearable
        v-model="appStore.rawOrders.file"
        @update:modelValue="appStore.handleFileChange('rawOrders', $event)"
        :disabled="appStore.rawOrders.loading"
      ></v-file-upload>
    </div>
    <div class="flex-column flex-1-1-0">
      <v-file-upload
        scrim="primary"
        divider-text="или"
        browse-text="Выбрать файл"
        :title="
          appStore.purchasedOrders.loading
            ? 'Загрузка, подождите'
            : 'Файл сырой выгрузки'
        "
        clearable
        v-model="appStore.purchasedOrders.file"
        @update:modelValue="
          appStore.handleFileChange('purchasedOrders', $event)
        "
        :disabled="appStore.purchasedOrders.loading"
      ></v-file-upload>
    </div>
  </div>
  <v-btn
    v-if="appStore.canDownload"
    @click="appStore.download"
    :disabled="appStore.isDownloading"
  >
    {{ appStore.isDownloading ? "Формируем" : "Скачать" }}
  </v-btn>
</template>

<style scoped></style>
