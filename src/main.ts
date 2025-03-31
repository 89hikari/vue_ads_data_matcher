import { createApp } from "vue";

import "@mdi/font/css/materialdesignicons.css"; // MDI Icons CSS
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { VFileUpload } from "vuetify/labs/VFileUpload";
import "vuetify/styles/main.css";
import "./style.css";

import { createPinia } from "pinia";
import App from "./App.vue";

const vuetify = createVuetify({
  directives,
  components: {
    ...components,
    VFileUpload,
  },
});

const pinia = createPinia();

createApp(App).use(vuetify).use(pinia).mount("#app");
