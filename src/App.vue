<script setup lang="ts">
import { useContractStore } from './stores/contract'
import { computed } from 'vue'

const contractStore = useContractStore()
const isConnected = computed(() => contractStore.isConnected)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="border-b border-border">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold">ART Registry Token Tester</h1>
          </div>
          
          <nav>
            <ul class="flex space-x-4">
              <li>
                <router-link to="/" class="text-primary hover:underline">Home</router-link>
              </li>
              <li>
                <router-link to="/mint" class="text-primary hover:underline">Mint</router-link>
              </li>
              <li v-if="isConnected">
                <router-link to="/creator" class="text-primary hover:underline">Creator Panel</router-link>
              </li>
              <li v-if="isConnected">
                <router-link to="/admin" class="text-primary hover:underline">Admin Panel</router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
    
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
    
    <footer class="border-t border-border mt-auto">
      <div class="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>ART Registry Token Tester - A testing interface for the ART Registry Token contract</p>
      </div>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
