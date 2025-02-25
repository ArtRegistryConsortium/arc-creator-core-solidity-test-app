/// <reference types="vite/client" />

// Declare module for Vue files
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Declare global ethereum property
interface Window {
  ethereum: any
}

// Declare module for shadcn-vue
declare module 'shadcn-vue' {
  const components: any
  export default components
} 