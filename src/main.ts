import { createApp } from "vue";
import App from "./App.vue";
//import "./registerServiceWorker";
//import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import Toast, { PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./assets/scss/style.scss";

const options: PluginOptions = {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
};

loadFonts();

createApp(App).use(vuetify).use(Toast, options).mount("#app");
