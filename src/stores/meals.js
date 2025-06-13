import { defineStore } from 'pinia'
import { supabase } from '../config/supabase'
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from 'date-fns'

export const useMealsStore = defineStore('meals', {
  state: () => ({
    meals: [],
    currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
    loading: false,
    error: null
  }),

  getters: {
    todayMeal: (state) => {
      const today = format(new Date(), 'yyyy-MM-dd')
      return state.meals.find(meal => meal.date === today)
    },
    
    weeklyMeals: (state) => {
      const weekStart = format(state.currentWeekStart, 'yyyy-MM-dd')
      const weekEnd = format(endOfWeek(state.currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      return state.meals.filter(meal => 
        meal.date >= weekStart && meal.date <= weekEnd
      ).sort((a, b) => new Date(a.date) - new Date(b.date))
    },

    weeklyIngredients: (state) => {
      const ingredients = new Map()
      state.weeklyMeals.forEach(meal => {
        meal.ingredients.forEach(ing => {
          const key = ing.name.toLowerCase()
          if (ingredients.has(key)) {
            const existing = ingredients.get(key)
            ingredients.set(key, {
              ...existing,
              amount: parseFloat(existing.amount) + parseFloat(ing.amount),
              unit: ing.unit
            })
          } else {
            ingredients.set(key, ing)
          }
        })
      })
      return Array.from(ingredients.values())
    }
  },

  actions: {
    async fetchMeals() {
      this.loading = true
      try {
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .order('date', { ascending: true })
        
        if (error) throw error
        this.meals = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    nextWeek() {
      this.currentWeekStart = addWeeks(this.currentWeekStart, 1)
    },

    previousWeek() {
      this.currentWeekStart = subWeeks(this.currentWeekStart, 1)
    },

    setCurrentWeek(date) {
      this.currentWeekStart = startOfWeek(new Date(date), { weekStartsOn: 1 })
    },

    async addMeal(meal) {
      try {
        const { data, error } = await supabase
          .from('meals')
          .insert([meal])
          .select()
        
        if (error) throw error
        this.meals.push(data[0])
      } catch (error) {
        this.error = error.message
      }
    },

    async updateMeal(id, updates) {
      try {
        const { data, error } = await supabase
          .from('meals')
          .update(updates)
          .eq('id', id)
          .select()
        
        if (error) throw error
        const index = this.meals.findIndex(m => m.id === id)
        if (index !== -1) {
          this.meals[index] = data[0]
        }
      } catch (error) {
        this.error = error.message
      }
    }
  }
}) 