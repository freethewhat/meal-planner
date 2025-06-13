<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './config/supabase'
import { useAuthStore } from './stores/auth'

const user = ref(null)
const navigation = [
  { name: 'Today', to: '/' },
  { name: 'Weekly', to: '/weekly' },
  { name: 'Ingredients', to: '/ingredients' },
  { name: 'Admin', to: '/admin' }
]

const authStore = useAuthStore()

onMounted(async () => {
  // Check for existing session
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user || null

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
  })

  authStore.initialize()
})

const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
  if (error) console.error('Error signing in:', error.message)
}

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error signing out:', error.message)
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-title>Family Meal Planner</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        variant="text"
        color="white"
        class="mx-2"
      >
        {{ item.name }}
      </v-btn>
      <v-btn v-if="!user" @click="signInWithGoogle" color="white">
        Sign in with Google
      </v-btn>
      <v-btn v-else @click="signOut" color="white">
        Sign Out
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view v-if="user" />
        <v-card v-else class="mx-auto mt-16" max-width="400">
          <v-card-text class="text-center">
            <h2 class="text-h5 mb-4">Welcome to Family Meal Planner</h2>
            <p class="text-body-1">Please sign in to continue</p>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
.v-application {
  background: #f5f5f5 !important;
}
</style>
