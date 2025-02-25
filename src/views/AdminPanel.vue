<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Admin Panel</h1>
    
    <div v-if="!isConnected" class="p-6 bg-card rounded-lg shadow-sm border border-border mb-6">
      <p class="mb-4 text-muted-foreground">Please connect your wallet to access admin features.</p>
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
      <!-- Global Admin Management -->
      <div class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">Global Admin Management</h2>
        <p class="mb-4 text-muted-foreground">
          Grant or revoke global admin rights for all your tokens. Global admins can manage all tokens you create.
        </p>
        
        <form @submit.prevent="grantGlobalAdmin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Admin Address</label>
            <input 
              v-model="globalAdminAddress" 
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
              :disabled="loading || !globalAdminAddress"
            >
              Grant Global Admin
            </button>
            
            <button 
              type="button"
              @click="revokeGlobalAdmin" 
              class="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90"
              :disabled="loading || !globalAdminAddress"
            >
              Revoke Global Admin
            </button>
          </div>
        </form>
      </div>
      
      <!-- Your Tokens -->
      <div class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">Your Tokens</h2>
        
        <div v-if="loading" class="text-muted-foreground">
          Loading your tokens...
        </div>
        
        <div v-else-if="yourTokens.length === 0" class="text-muted-foreground">
          You don't have any tokens yet. Mint a new token to get started.
          <div class="mt-4">
            <router-link 
              to="/mint" 
              class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 inline-block"
            >
              Mint Token
            </router-link>
          </div>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left p-2">ID</th>
                <th class="text-left p-2">Owner</th>
                <th class="text-left p-2">Royalty</th>
                <th class="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in yourTokens" :key="token.id" class="border-b border-border">
                <td class="p-2 font-mono">{{ token.id }}</td>
                <td class="p-2 font-mono text-xs">{{ shortenAddress(token.owner) }}</td>
                <td class="p-2">{{ (Number(token.royaltyBps) / 100).toFixed(2) }}%</td>
                <td class="p-2">
                  <router-link 
                    :to="`/token/${token.id}`" 
                    class="text-primary hover:underline"
                  >
                    Manage
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- All Creators -->
      <div class="p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 class="text-xl font-semibold mb-4">All Creators</h2>
        
        <div v-if="loading" class="text-muted-foreground">
          Loading creators...
        </div>
        
        <div v-else-if="creators.length === 0" class="text-muted-foreground">
          No creators found.
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left p-2">Creator</th>
                <th class="text-left p-2">Token Count</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="creator in creators" :key="creator" class="border-b border-border">
                <td class="p-2 font-mono text-xs">{{ creator }}</td>
                <td class="p-2">{{ getCreatorTokenCount(creator) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div v-if="error" class="p-4 bg-destructive/10 text-destructive rounded-md">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useContractStore } from '../stores/contract'

const contractStore = useContractStore()

// Form state
const globalAdminAddress = ref('')

// Computed properties
const isConnected = computed(() => contractStore.isConnected)
const account = computed(() => contractStore.account)
const loading = computed(() => contractStore.loading)
const error = computed(() => contractStore.error)
const tokens = computed(() => contractStore.tokens)
const creators = computed(() => contractStore.creators)

// Tokens owned or created by the current user
const yourTokens = computed(() => {
  if (!account.value) return []
  
  return tokens.value.filter(token => 
    token.owner.toLowerCase() === account.value.toLowerCase() || 
    token.creator.toLowerCase() === account.value.toLowerCase()
  )
})

// Methods
const connectWallet = async () => {
  await contractStore.connectWallet()
}

const loadData = async () => {
  if (!contractStore.contract) return
  await contractStore.loadTokens()
}

const grantGlobalAdmin = async () => {
  if (!globalAdminAddress.value) return
  
  const success = await contractStore.grantGlobalAdmin(globalAdminAddress.value)
  if (success) {
    globalAdminAddress.value = ''
  }
}

const revokeGlobalAdmin = async () => {
  if (!globalAdminAddress.value) return
  
  const success = await contractStore.revokeGlobalAdmin(globalAdminAddress.value)
  if (success) {
    globalAdminAddress.value = ''
  }
}

const getCreatorTokenCount = (creator: string) => {
  return tokens.value.filter(token => 
    token.creator.toLowerCase() === creator.toLowerCase()
  ).length
}

const shortenAddress = (address: string) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Lifecycle hooks
onMounted(async () => {
  if (isConnected.value && contractStore.contract) {
    await loadData()
  }
})
</script> 