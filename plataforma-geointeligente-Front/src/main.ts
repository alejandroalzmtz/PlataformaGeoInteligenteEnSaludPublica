import { bootstrapApplication } from '@angular/platform-browser';
// Ensure JIT compiler is available in dev/runtime environments that require it
import '@angular/compiler';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Suprimir errores de extensiones del navegador
window.addEventListener('error', (event) => {
  if (event.message?.includes('message channel closed') ||
      event.message?.includes('listener indicated an asynchronous response')) {
    event.preventDefault();
    return false;
  }
  return true;
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('message channel closed') ||
      event.reason?.message?.includes('listener indicated an asynchronous response')) {
    event.preventDefault();
    return false;
  }
  return true;
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
