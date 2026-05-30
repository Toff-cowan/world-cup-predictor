import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { CountdownVisibilityProvider } from "./context/CountdownVisibilityContext.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CountdownVisibilityProvider>
          <App />
        </CountdownVisibilityProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
