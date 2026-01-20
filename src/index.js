import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'
import 'react-toastify/dist/ReactToastify.css'

import App from './App'
import store from './store'
import { colors } from './utils/constant'

const THEME_KEY = 'coreui-free-react-admin-template-theme'

if (!localStorage.getItem(THEME_KEY)) {
  localStorage.setItem(THEME_KEY, 'light')
}

const root = document.documentElement;

Object.entries(colors).forEach(([key, value]) => {
  root.style.setProperty(`--${key}`, value);
});

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
