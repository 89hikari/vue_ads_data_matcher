import { createApp } from "vue";

import "@mdi/font/css/materialdesignicons.css"; // MDI Icons CSS
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { VFileUpload } from "vuetify/labs/VFileUpload";
import "vuetify/styles/main.css";
import "./style.css";

import App from "./App.vue";

const vuetify = createVuetify({
  directives,
  components: {
    ...components,
    VFileUpload,
  },
});

createApp(App).use(vuetify).mount("#app");
