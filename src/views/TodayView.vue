<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div v-if="loading" class="flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
    
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>
    
    <div v-else-if="todayMeal" class="space-y-6">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">{{ todayMeal.name }}</h2>
          <p class="mt-1 text-sm text-gray-500">{{ todayMeal.time }}</p>
        </div>
        <div class="text-sm text-gray-500">
          {{ format(new Date(todayMeal.date), 'EEEE, MMMM d, yyyy') }}
        </div>
      </div>

      <p class="text-gray-600">{{ todayMeal.description }}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Ingredients</h3>
          <ul class="space-y-2">
            <li v-for="ingredient in todayMeal.ingredients" :key="ingredient.name" class="flex items-center">
              <span class="text-gray-600">
                {{ ingredient.amount }} {{ ingredient.unit }} {{ ingredient.name }}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Instructions</h3>
          <ol class="list-decimal list-inside space-y-2">
            <li v-for="(instruction, index) in todayMeal.instructions.split('\n')" :key="index" class="text-gray-600">
              {{ instruction }}
            </li>
          </ol>
        </div>
      </div>

      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Nutrition Information</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="(value, key) in todayMeal.nutrition.per_serving" :key="key" class="bg-gray-50 p-3 rounded">
            <div class="text-sm text-gray-500">{{ formatNutritionKey(key) }}</div>
            <div class="mt-1 text-lg font-semibold text-gray-900">{{ value }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <h3 class="text-lg font-medium text-gray-900">No meal planned for today</h3>
      <p class="mt-2 text-gray-500">Check the weekly view to see upcoming meals.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { format } from 'date-fns'
import { useMealsStore } from '../stores/meals'
import { storeToRefs } from 'pinia'

const store = useMealsStore()
const { todayMeal, loading, error } = storeToRefs(store)

onMounted(() => {
  store.fetchMeals()
})

const formatNutritionKey = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}
</script> 