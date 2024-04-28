import App from "./App.vue";
import "normalize.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "primeflex/primeflex.css";
import "primevue/resources/themes/lara-light-teal/theme.css";
import "primevue/resources/primevue.min.css"; /* Deprecated */
import "primeicons/primeicons.css";
// import "./assets/main.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { useRemoteHostStore } from "@hict/app/stores/remoteHost";

const pinia = createPinia();

//import igv from "igv";

const app = createApp(App);
app.use(pinia);

useRemoteHostStore().setRemoteHost('http://localhost:5000');

app.mount("#app");
