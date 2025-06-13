import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../config/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  // Initialize auth state
  const initialize = async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null

      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Error initializing auth:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    initialize,
    signIn,
    signUp,
    signOut
  }
}) 