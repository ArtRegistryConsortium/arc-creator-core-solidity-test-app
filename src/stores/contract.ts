import { defineStore } from 'pinia'
import { ethers } from 'ethers'
import { ref, computed } from 'vue'

// ABI for the ArtRegistryToken contract
const ART_REGISTRY_TOKEN_ABI = [
  // ERC721 standard functions
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  
  // Custom functions
  "function mint(address to, string memory uri, uint256 royaltyBps) returns (uint256)",
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",
  "function setRoyalty(uint256 tokenId, uint256 royaltyBps)",
  "function updateTokenURI(uint256 tokenId, string memory newUri)",
  "function grantTokenAdmin(uint256 tokenId, address admin)",
  "function revokeTokenAdmin(uint256 tokenId, address admin)",
  "function grantGlobalAdmin(address admin)",
  "function revokeGlobalAdmin(address admin)",
  "function isTokenAdmin(uint256 tokenId, address admin) view returns (bool)",
  "function creatorOf(uint256 tokenId) view returns (address)",
  "function getRoyaltyBps(uint256 tokenId) view returns (uint256)",
  "function getTokensByCreator(address creator) view returns (uint256[])",
  "function creatorTokenCount(address creator) view returns (uint256)",
  "function getAllCreators() view returns (address[])",
  "function creatorCount() view returns (uint256)",
  "function isCreator(address creator) view returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event RoyaltySet(uint256 indexed tokenId, uint256 royaltyBps)",
  "event TokenURIUpdated(uint256 indexed tokenId, string newUri)",
  "event AdminGranted(uint256 indexed tokenId, address indexed admin, address indexed grantor)",
  "event AdminRevoked(uint256 indexed tokenId, address indexed admin, address indexed revoker)",
  "event GlobalAdminGranted(address indexed creator, address indexed admin, address indexed grantor)",
  "event GlobalAdminRevoked(address indexed creator, address indexed admin, address indexed revoker)"
]

export const useContractStore = defineStore('contract', () => {
  // State
  const provider = ref<ethers.BrowserProvider | null>(null)
  const signer = ref<ethers.JsonRpcSigner | null>(null)
  const contract = ref<ethers.Contract | null>(null)
  const account = ref<string>('')
  const isConnected = ref<boolean>(false)
  const contractAddress = ref<string>('')
  const tokens = ref<any[]>([])
  const creators = ref<string[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string>('')

  // Getters
  const isAdmin = computed(() => {
    // Add logic to check if the current account is an admin
    return false
  })

  // Actions
  async function connectWallet() {
    try {
      loading.value = true
      error.value = ''
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed')
      }
      
      // Create provider and signer
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      provider.value = browserProvider
      
      // Request account access
      const accounts = await browserProvider.send('eth_requestAccounts', [])
      account.value = accounts[0]
      
      // Get signer
      const signerInstance = await browserProvider.getSigner()
      signer.value = signerInstance
      
      isConnected.value = true
      
      // Initialize contract if address is set
      if (contractAddress.value) {
        initializeContract()
      }
    } catch (err: any) {
      console.error('Error connecting wallet:', err)
      error.value = err.message || 'Failed to connect wallet'
    } finally {
      loading.value = false
    }
  }

  function initializeContract() {
    if (!signer.value || !contractAddress.value) {
      error.value = 'Signer or contract address not available'
      return
    }
    
    try {
      contract.value = new ethers.Contract(
        contractAddress.value,
        ART_REGISTRY_TOKEN_ABI,
        signer.value
      )
    } catch (err: any) {
      console.error('Error initializing contract:', err)
      error.value = err.message || 'Failed to initialize contract'
    }
  }

  async function setContractAddress(address: string) {
    contractAddress.value = address
    if (signer.value) {
      initializeContract()
    }
  }

  async function mintToken(to: string, uri: string, royaltyBps: number) {
    if (!contract.value) {
      error.value = 'Contract not initialized'
      return null
    }
    
    try {
      loading.value = true
      error.value = ''
      
      const tx = await contract.value.mint(to, uri, royaltyBps)
      const receipt = await tx.wait()
      
      // Find the token ID from the Transfer event
      const transferEvent = receipt.logs
        .map((log: any) => {
          try {
            return contract.value?.interface.parseLog(log)
          } catch (e) {
            return null
          }
        })
        .find((event: any) => event && event.name === 'Transfer')
      
      if (transferEvent) {
        const tokenId = transferEvent.args[2]
        await loadTokens()
        return tokenId
      }
      
      return null
    } catch (err: any) {
      console.error('Error minting token:', err)
      error.value = err.message || 'Failed to mint token'
      return null
    } finally {
      loading.value = false
    }
  }

  async function loadTokens() {
    if (!contract.value) {
      error.value = 'Contract not initialized'
      return
    }
    
    try {
      loading.value = true
      error.value = ''
      
      // Load creators first
      const allCreators = await contract.value.getAllCreators()
      creators.value = allCreators
      
      // Load tokens for each creator
      const allTokens = []
      for (const creator of allCreators) {
        const creatorTokens = await contract.value.getTokensByCreator(creator)
        
        // Load details for each token
        for (const tokenId of creatorTokens) {
          const [owner, uri, royaltyBps, creator] = await Promise.all([
            contract.value.ownerOf(tokenId),
            contract.value.tokenURI(tokenId),
            contract.value.getRoyaltyBps(tokenId),
            contract.value.creatorOf(tokenId)
          ])
          
          allTokens.push({
            id: tokenId.toString(),
            owner,
            uri,
            royaltyBps: royaltyBps.toString(),
            creator
          })
        }
      }
      
      tokens.value = allTokens
    } catch (err: any) {
      console.error('Error loading tokens:', err)
      error.value = err.message || 'Failed to load tokens'
    } finally {
      loading.value = false
    }
  }

  async function updateRoyalty(tokenId: string, royaltyBps: number) {
    if (!contract.value) {
      error.value = 'Contract not initialized'
      return false
    }
    
    try {
      loading.value = true
      error.value = ''
      
      const tx = await contract.value.setRoyalty(tokenId, royaltyBps)
      await tx.wait()
      
      await loadTokens()
      return true
    } catch (err: any) {
      console.error('Error updating royalty:', err)
      error.value = err.message || 'Failed to update royalty'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateTokenURI(tokenId: string, newUri: string) {
    if (!contract.value) {
      error.value = 'Contract not initialized'
      return false
    }
    
    try {
      loading.value = true
      error.value = ''
      
      const tx = await contract.value.updateTokenURI(tokenId, newUri)
      await tx.wait()
      
      await loadTokens()
      return true
    } catch (err: any) {
      console.error('Error updating token URI:', err)
      error.value = err.message || 'Failed to update token URI'
      return false
    } finally {
      loading.value = false
    }
  }

  async function grantTokenAdmin(tokenId: string, adminAddress: string) {
    if (!contract.value) {
      error.value = 'Contract not initialized'
      return false
    }
    
    try {
      loading.value = true
      error.value = ''
      
      const tx = await contract.value.grantTokenAdmin(tokenId, adminAddress)
      await tx.wait()
      
      return true
    } catch (err: any) {
      console.error('Error granting token admin:', err)
      error.value = err.message || 'Failed to grant token admin'
      return false
    } finally {
      loading.value = false
    }
  }

  async function revokeTokenAdmin(tokenId: string, adminAddress: string) {
    if (!contract.value) {
      error.value = 'Contract not initialized'
      return false
    }
    
    try {
      loading.value = true
      error.value = ''
      
      const tx = await contract.value.revokeTokenAdmin(tokenId, adminAddress)
      await tx.wait()
      
      return true
    } catch (err: any) {
      console.error('Error revoking token admin:', err)
      error.value = err.message || 'Failed to revoke token admin'
      return false
    } finally {
      loading.value = false
    }
  }

  async function grantGlobalAdmin(adminAddress: string) {
    if (!contract.value) {
      error.value = 'Contract not initialized'
      return false
    }
    
    try {
      loading.value = true
      error.value = ''
      
      const tx = await contract.value.grantGlobalAdmin(adminAddress)
      await tx.wait()
      
      return true
    } catch (err: any) {
      console.error('Error granting global admin:', err)
      error.value = err.message || 'Failed to grant global admin'
      return false
    } finally {
      loading.value = false
    }
  }

  async function revokeGlobalAdmin(adminAddress: string) {
    if (!contract.value) {
      error.value = 'Contract not initialized'
      return false
    }
    
    try {
      loading.value = true
      error.value = ''
      
      const tx = await contract.value.revokeGlobalAdmin(adminAddress)
      await tx.wait()
      
      return true
    } catch (err: any) {
      console.error('Error revoking global admin:', err)
      error.value = err.message || 'Failed to revoke global admin'
      return false
    } finally {
      loading.value = false
    }
  }

  async function checkTokenAdmin(tokenId: string, adminAddress: string) {
    if (!contract.value) {
      error.value = 'Contract not initialized'
      return false
    }
    
    try {
      return await contract.value.isTokenAdmin(tokenId, adminAddress)
    } catch (err: any) {
      console.error('Error checking token admin:', err)
      error.value = err.message || 'Failed to check token admin'
      return false
    }
  }

  return {
    // State
    provider,
    signer,
    contract,
    account,
    isConnected,
    contractAddress,
    tokens,
    creators,
    loading,
    error,
    
    // Getters
    isAdmin,
    
    // Actions
    connectWallet,
    initializeContract,
    setContractAddress,
    mintToken,
    loadTokens,
    updateRoyalty,
    updateTokenURI,
    grantTokenAdmin,
    revokeTokenAdmin,
    grantGlobalAdmin,
    revokeGlobalAdmin,
    checkTokenAdmin
  }
}) 