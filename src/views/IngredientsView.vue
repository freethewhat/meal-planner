<template>
  <div class="space-y-6">
    <!-- Week Navigation -->
    <div class="bg-white shadow rounded-lg p-4">
      <div class="flex items-center justify-between">
        <button
          @click="store.previousWeek"
          class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Previous
        </button>

        <div class="flex items-center space-x-4">
          <button
            v-for="date in weekDates"
            :key="date"
            @click="store.setCurrentWeek(date)"
            :class="[
              isCurrentWeek(date) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50',
              'px-3 py-2 rounded-md text-sm font-medium'
            ]"
          >
            {{ format(new Date(date), 'EEE') }}
          </button>
        </div>

        <button
          @click="store.nextWeek"
          class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>

    <!-- Ingredients List -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">
          Shopping List for {{ format(currentWeekStart, 'MMMM d') }} - {{ format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMMM d, yyyy') }}
        </h2>
      </div>

      <div class="divide-y divide-gray-200">
        <div v-for="ingredient in weeklyIngredients" :key="ingredient.name" class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                @change="toggleIngredient(ingredient)"
                :checked="checkedIngredients.includes(ingredient.name)"
              >
              <span class="ml-3 text-gray-900">{{ ingredient.name }}</span>
            </div>
            <div class="text-gray-500">
              {{ ingredient.amount }} {{ ingredient.unit }}
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-gray-50">
        <button
          @click="printShoppingList"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Print Shopping List
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { useMealsStore } from '../stores/meals'
import { storeToRefs } from 'pinia'

const store = useMealsStore()
const { weeklyIngredients, loading, error, currentWeekStart } = storeToRefs(store)
const checkedIngredients = ref([])

const weekDates = computed(() => {
  const start = startOfWeek(currentWeekStart.value, { weekStartsOn: 1 })
  const end = endOfWeek(currentWeekStart.value, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map(date => format(date, 'yyyy-MM-dd'))
})

const isCurrentWeek = (date) => {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const checkDate = new Date(date)
  return checkDate >= weekStart && checkDate <= weekEnd
}

const toggleIngredient = (ingredient) => {
  const index = checkedIngredients.value.indexOf(ingredient.name)
  if (index === -1) {
    checkedIngredients.value.push(ingredient.name)
  } else {
    checkedIngredients.value.splice(index, 1)
  }
}

const printShoppingList = () => {
  const printWindow = window.open('', '_blank')
  const ingredients = weeklyIngredients.value
    .filter(ing => !checkedIngredients.value.includes(ing.name))
    .map(ing => `${ing.amount} ${ing.unit} ${ing.name}`)
    .join('\n')

  printWindow.document.write(`
    <html>
      <head>
        <title>Shopping List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { margin-bottom: 20px; }
          .ingredients { white-space: pre-line; }
        </style>
      </head>
      <body>
        <h1>Shopping List</h1>
        <div class="ingredients">${ingredients}</div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

onMounted(() => {
  store.fetchMeals()
})
</script> 