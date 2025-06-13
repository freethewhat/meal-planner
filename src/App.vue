<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './config/supabase'

const user = ref(null)
const navigation = [
  { name: 'Today', to: '/' },
  { name: 'Weekly', to: '/weekly' },
  { name: 'Ingredients', to: '/ingredients' },
  { name: 'Admin', to: '/admin' }
]

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user ?? null

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })
})

const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
  if (error) console.error('Error signing in with Google:', error.message)
}

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error signing out:', error.message)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Meal Planner</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                v-for="item in navigation"
                :key="item.name"
                :to="item.to"
                :class="[
                  $route.path === item.to
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                ]"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>
          <div class="flex items-center">
            <button
              v-if="!user"
              @click="signInWithGoogle"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign in with Google
            </button>
            <button
              v-else
              @click="signOut"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
