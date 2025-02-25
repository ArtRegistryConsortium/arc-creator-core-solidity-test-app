<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Mint New Token</h1>
    
    <div v-if="!isConnected" class="p-6 bg-card rounded-lg shadow-sm border border-border mb-6">
      <p class="mb-4 text-muted-foreground">Please connect your wallet to mint tokens.</p>
      <button 
        @click="connectWallet" 
        class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        :disabled="loading"
      >
        {{ loading ? 'Connecting...' : 'Connect Wallet' }}
      </button>
    </div>
    
    <div v-else-if="!contractStore.contract" class="p-6 bg-card rounded-lg shadow-sm border border-border mb-6">
      <p class="mb-4 text-muted-foreground">Please set the contract address on the home page first.</p>
      <router-link 
        to="/" 
        class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 inline-block"
      >
        Go to Home
      </router-link>
    </div>
    
    <div v-else class="grid gap-6">
      <div class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">Mint Token</h2>
        
        <form @submit.prevent="mintToken" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Recipient Address</label>
            <input 
              v-model="recipient" 
              type="text" 
              class="w-full p-2 border border-input rounded-md bg-background"
              placeholder="0x..."
              required
            />
            <p class="text-xs text-muted-foreground mt-1">
              Address that will own the token (leave empty to use your address)
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Token URI</label>
            <input 
              v-model="tokenUri" 
              type="text" 
              class="w-full p-2 border border-input rounded-md bg-background"
              placeholder="ar://..."
              required
            />
            <p class="text-xs text-muted-foreground mt-1">
              Arweave URI pointing to the token metadata
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Royalty Percentage</label>
            <input 
              v-model="royaltyPercentage" 
              type="number" 
              min="0" 
              max="100" 
              step="0.01"
              class="w-full p-2 border border-input rounded-md bg-background"
              required
            />
            <p class="text-xs text-muted-foreground mt-1">
              Royalty percentage (0-100%)
            </p>
          </div>
          
          <button 
            type="submit" 
            class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 w-full"
            :disabled="loading || !isValidForm"
          >
            {{ loading ? 'Minting...' : 'Mint Token' }}
          </button>
        </form>
      </div>
      
      <div v-if="error" class="p-4 bg-destructive/10 text-destructive rounded-md">
        {{ error }}
      </div>
      
      <div v-if="mintedTokenId" class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4 text-green-600">Token Minted Successfully!</h2>
        <p class="mb-2">Token ID: <span class="font-mono">{{ mintedTokenId }}</span></p>
        <div class="mt-4">
          <router-link 
            :to="`/token/${mintedTokenId}`" 
            class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 inline-block mr-2"
          >
            View Token Details
          </router-link>
          <button 
            @click="resetForm" 
            class="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 inline-block"
          >
            Mint Another Token
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useContractStore } from '../stores/contract'

const contractStore = useContractStore()

// Form state
const recipient = ref('')
const tokenUri = ref('')
const royaltyPercentage = ref(5) // Default 5%
const mintedTokenId = ref<string | null>(null)

// Computed properties
const isConnected = computed(() => contractStore.isConnected)
const account = computed(() => contractStore.account)
const loading = computed(() => contractStore.loading)
const error = computed(() => contractStore.error)

const isValidForm = computed(() => {
  return (
    tokenUri.value.trim() !== '' &&
    royaltyPercentage.value >= 0 &&
    royaltyPercentage.value <= 100
  )
})

// Methods
const connectWallet = async () => {
  await contractStore.connectWallet()
}

const mintToken = async () => {
  // Reset previous results
  mintedTokenId.value = null
  
  // Use current account if recipient is empty
  const recipientAddress = recipient.value.trim() || account.value
  
  // Convert percentage to basis points (1% = 100 basis points)
  const royaltyBps = Math.round(royaltyPercentage.value * 100)
  
  const tokenId = await contractStore.mintToken(
    recipientAddress,
    tokenUri.value,
    royaltyBps
  )
  
  if (tokenId) {
    mintedTokenId.value = tokenId.toString()
  }
}

const resetForm = () => {
  recipient.value = ''
  tokenUri.value = ''
  royaltyPercentage.value = 5
  mintedTokenId.value = null
}
</script> 