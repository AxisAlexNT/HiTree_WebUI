import App from "./App.vue";
import "normalize.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
// import "./assets/main.css";
import { createApp } from "vue";
import { createPinia } from "pinia";

const pinia = createPinia();

//import igv from "igv";

const app = createApp(App);
app.use(pinia);
app.mount("#app");
