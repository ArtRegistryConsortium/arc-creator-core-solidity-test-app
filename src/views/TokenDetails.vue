<template>
  <div>
    <div class="flex items-center mb-6">
      <router-link to="/" class="text-primary hover:underline mr-4">
        &larr; Back to Home
      </router-link>
      <h1 class="text-3xl font-bold">Token Details</h1>
    </div>
    
    <div v-if="!isConnected" class="p-6 bg-card rounded-lg shadow-sm border border-border mb-6">
      <p class="mb-4 text-muted-foreground">Please connect your wallet to view token details.</p>
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
    
    <div v-else-if="loading" class="p-6 bg-card rounded-lg shadow-sm border border-border mb-6">
      <p class="text-muted-foreground">Loading token details...</p>
    </div>
    
    <div v-else-if="error" class="p-6 bg-destructive/10 text-destructive rounded-lg mb-6">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="token" class="grid gap-6">
      <!-- Token Info -->
      <div class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">Token Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground mb-1">Token ID</p>
            <p class="font-mono bg-muted p-2 rounded">{{ token.id }}</p>
          </div>
          
          <div>
            <p class="text-sm text-muted-foreground mb-1">Owner</p>
            <p class="font-mono bg-muted p-2 rounded text-sm break-all">{{ token.owner }}</p>
          </div>
          
          <div>
            <p class="text-sm text-muted-foreground mb-1">Creator</p>
            <p class="font-mono bg-muted p-2 rounded text-sm break-all">{{ token.creator }}</p>
          </div>
          
          <div>
            <p class="text-sm text-muted-foreground mb-1">Royalty</p>
            <p class="font-mono bg-muted p-2 rounded">{{ (Number(token.royaltyBps) / 100).toFixed(2) }}%</p>
          </div>
          
          <div class="md:col-span-2">
            <p class="text-sm text-muted-foreground mb-1">Token URI</p>
            <p class="font-mono bg-muted p-2 rounded text-sm break-all">{{ token.uri }}</p>
          </div>
        </div>
      </div>
      
      <!-- Update Token URI -->
      <div v-if="canEdit" class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">Update Token URI</h2>
        
        <form @submit.prevent="updateUri" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">New Token URI</label>
            <input 
              v-model="newUri" 
              type="text" 
              class="w-full p-2 border border-input rounded-md bg-background"
              placeholder="ar://..."
              required
            />
          </div>
          
          <button 
            type="submit" 
            class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            :disabled="loading || !newUri"
          >
            {{ loading ? 'Updating...' : 'Update URI' }}
          </button>
        </form>
      </div>
      
      <!-- Update Royalty -->
      <div v-if="canEdit" class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">Update Royalty</h2>
        
        <form @submit.prevent="updateRoyalty" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">New Royalty Percentage</label>
            <input 
              v-model="newRoyaltyPercentage" 
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
            class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            :disabled="loading"
          >
            {{ loading ? 'Updating...' : 'Update Royalty' }}
          </button>
        </form>
      </div>
      
      <!-- Admin Management -->
      <div v-if="isCreator" class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">Admin Management</h2>
        
        <form @submit.prevent="grantAdmin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Admin Address</label>
            <input 
              v-model="adminAddress" 
              type="text" 
              class="w-full p-2 border border-input rounded-md bg-background"
              placeholder="0x..."
              required
            />
          </div>
          
          <div class="flex space-x-2">
            <button 
              type="submit" 
              class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              :disabled="loading || !adminAddress"
            >
              Grant Admin
            </button>
            
            <button 
              type="button"
              @click="revokeAdmin" 
              class="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90"
              :disabled="loading || !adminAddress"
            >
              Revoke Admin
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <div v-else class="p-6 bg-card rounded-lg shadow-sm border border-border">
      <p class="text-muted-foreground">Token not found. Please check the token ID and try again.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useContractStore } from '../stores/contract'

const route = useRoute()
const contractStore = useContractStore()

// Token ID from route params
const tokenId = computed(() => route.params.id as string)

// Form state
const newUri = ref('')
const newRoyaltyPercentage = ref(0)
const adminAddress = ref('')

// Computed properties
const isConnected = computed(() => contractStore.isConnected)
const account = computed(() => contractStore.account)
const loading = computed(() => contractStore.loading)
const error = computed(() => contractStore.error)

// Find the token in the store
const token = computed(() => {
  return contractStore.tokens.find(t => t.id === tokenId.value)
})

// Check if the current user can edit the token
const canEdit = computed(() => {
  if (!token.value || !account.value) return false
  
  // Owner, creator, or admin can edit
  return (
    account.value.toLowerCase() === token.value.owner.toLowerCase() ||
    account.value.toLowerCase() === token.value.creator.toLowerCase() ||
    isAdmin.value
  )
})

// Check if the current user is the creator
const isCreator = computed(() => {
  if (!token.value || !account.value) return false
  return account.value.toLowerCase() === token.value.creator.toLowerCase()
})

// Check if the current user is an admin
const isAdmin = ref(false)

// Methods
const connectWallet = async () => {
  await contractStore.connectWallet()
}

const loadTokenData = async () => {
  if (!contractStore.contract || !tokenId.value) return
  
  // Load tokens if not already loaded
  if (contractStore.tokens.length === 0) {
    await contractStore.loadTokens()
  }
  
  // Check if current user is an admin for this token
  if (token.value && account.value) {
    isAdmin.value = await contractStore.checkTokenAdmin(tokenId.value, account.value)
  }
  
  // Initialize form values
  if (token.value) {
    newRoyaltyPercentage.value = Number(token.value.royaltyBps) / 100
    newUri.value = token.value.uri
  }
}

const updateUri = async () => {
  if (!token.value || !newUri.value) return
  
  const success = await contractStore.updateTokenURI(tokenId.value, newUri.value)
  if (success) {
    await loadTokenData()
  }
}

const updateRoyalty = async () => {
  if (!token.value) return
  
  // Convert percentage to basis points
  const royaltyBps = Math.round(newRoyaltyPercentage.value * 100)
  
  const success = await contractStore.updateRoyalty(tokenId.value, royaltyBps)
  if (success) {
    await loadTokenData()
  }
}

const grantAdmin = async () => {
  if (!token.value || !adminAddress.value) return
  
  const success = await contractStore.grantTokenAdmin(tokenId.value, adminAddress.value)
  if (success) {
    adminAddress.value = ''
  }
}

const revokeAdmin = async () => {
  if (!token.value || !adminAddress.value) return
  
  const success = await contractStore.revokeTokenAdmin(tokenId.value, adminAddress.value)
  if (success) {
    adminAddress.value = ''
  }
}

// Watch for changes in connected account or token ID
watch([account, tokenId], () => {
  loadTokenData()
})

// Load data on mount
onMounted(() => {
  if (isConnected.value) {
    loadTokenData()
  }
})
</script> 