<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">ART Registry Token Tester</h1>
    
    <div class="grid gap-6">
      <!-- Wallet Connection -->
      <div class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">Connect Wallet</h2>
        <p class="mb-4 text-muted-foreground">Connect your wallet to interact with the ART Registry Token contract.</p>
        
        <div v-if="!isConnected" class="mb-4">
          <button 
            @click="connectWallet" 
            class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            :disabled="loading"
          >
            {{ loading ? 'Connecting...' : 'Connect Wallet' }}
          </button>
        </div>
        
        <div v-else class="mb-4">
          <p class="text-sm text-muted-foreground mb-2">Connected Account:</p>
          <p class="font-mono bg-muted p-2 rounded text-sm">{{ account }}</p>
        </div>
        
        <div v-if="error" class="p-3 bg-destructive/10 text-destructive rounded-md mt-4">
          {{ error }}
        </div>
      </div>
      
      <!-- Contract Interaction -->
      <div class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">Contract Interaction</h2>
        <p class="mb-4 text-muted-foreground">Set the contract address to interact with the ART Registry Token.</p>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Contract Address</label>
          <input 
            v-model="contractAddressInput" 
            type="text" 
            class="w-full p-2 border border-input rounded-md bg-background"
            placeholder="0x..."
          />
        </div>
        
        <button 
          @click="setContract" 
          class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 mr-2"
          :disabled="loading || !isConnected || !contractAddressInput"
        >
          Set Contract
        </button>
        
        <button 
          @click="loadTokenData" 
          class="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90"
          :disabled="loading || !isConnected || !contractStore.contract"
        >
          Load Tokens
        </button>
      </div>
      
      <!-- Token List -->
      <div v-if="tokens.length > 0" class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">Tokens</h2>
        
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left p-2">ID</th>
                <th class="text-left p-2">Owner</th>
                <th class="text-left p-2">Creator</th>
                <th class="text-left p-2">Royalty</th>
                <th class="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in tokens" :key="token.id" class="border-b border-border">
                <td class="p-2 font-mono">{{ token.id }}</td>
                <td class="p-2 font-mono text-xs">{{ shortenAddress(token.owner) }}</td>
                <td class="p-2 font-mono text-xs">{{ shortenAddress(token.creator) }}</td>
                <td class="p-2">{{ (Number(token.royaltyBps) / 100).toFixed(2) }}%</td>
                <td class="p-2">
                  <router-link 
                    :to="`/token/${token.id}`" 
                    class="text-primary hover:underline"
                  >
                    View Details
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div v-else-if="isConnected && contractStore.contract" class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <p class="text-muted-foreground">No tokens found. Mint a new token to get started.</p>
        <router-link 
          to="/mint" 
          class="inline-block mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Mint Token
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useContractStore } from '../stores/contract'

const contractStore = useContractStore()
const contractAddressInput = ref('')

// Computed properties
const isConnected = computed(() => contractStore.isConnected)
const account = computed(() => contractStore.account)
const loading = computed(() => contractStore.loading)
const error = computed(() => contractStore.error)
const tokens = computed(() => contractStore.tokens)

// Methods
const connectWallet = async () => {
  await contractStore.connectWallet()
}

const setContract = async () => {
  if (contractAddressInput.value) {
    await contractStore.setContractAddress(contractAddressInput.value)
    await loadTokenData()
  }
}

const loadTokenData = async () => {
  await contractStore.loadTokens()
}

const shortenAddress = (address: string) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Lifecycle hooks
onMounted(async () => {
  // Auto-connect wallet if possible
  if (window.ethereum && window.ethereum.isMetaMask) {
    await connectWallet()
  }
})
</script> 