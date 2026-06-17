import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PayPalScriptProvider options={{"client-id": "ATuHDcR3OTiKtFh-AHWJywX3v0ag_QOqsj-67e_yv7pIN1ebegibXbJ6V_vnajrjZdWRGFCbjfCI5W5L",currency: "MXN",components: "buttons",
    disableFunding: "card"}}>
      <App />
    </PayPalScriptProvider>
  </React.StrictMode>,
)