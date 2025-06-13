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

    <!-- Meals Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="meal in weeklyMeals"
        :key="meal.id"
        class="bg-white shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
        @click="openMealModal(meal)"
      >
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-medium text-gray-900">{{ meal.name }}</h3>
            <span class="text-sm text-gray-500">{{ format(new Date(meal.date), 'EEE, MMM d') }}</span>
          </div>
          <p class="mt-2 text-sm text-gray-500">{{ meal.time }}</p>
          <p class="mt-2 text-gray-600">{{ meal.description }}</p>
          
          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              {{ meal.servings }} servings
            </div>
            <div class="text-sm text-gray-500">
              {{ meal.nutrition.per_serving.calories }} cal/serving
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Meal Modal -->
    <TransitionRoot appear :show="isModalOpen" as="template">
      <Dialog as="div" @close="closeMealModal" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div v-if="selectedMeal" class="space-y-6">
                  <DialogTitle as="h3" class="text-2xl font-bold text-gray-900">
                    {{ selectedMeal.name }}
                  </DialogTitle>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 class="text-lg font-medium text-gray-900 mb-4">Ingredients</h4>
                      <ul class="space-y-2">
                        <li v-for="ingredient in selectedMeal.ingredients" :key="ingredient.name" class="text-gray-600">
                          {{ ingredient.amount }} {{ ingredient.unit }} {{ ingredient.name }}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 class="text-lg font-medium text-gray-900 mb-4">Instructions</h4>
                      <ol class="list-decimal list-inside space-y-2">
                        <li v-for="(instruction, index) in selectedMeal.instructions.split('\n')" :key="index" class="text-gray-600">
                          {{ instruction }}
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div class="border-t border-gray-200 pt-6">
                    <h4 class="text-lg font-medium text-gray-900 mb-4">Nutrition Information</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div v-for="(value, key) in selectedMeal.nutrition.per_serving" :key="key" class="bg-gray-50 p-3 rounded">
                        <div class="text-sm text-gray-500">{{ formatNutritionKey(key) }}</div>
                        <div class="mt-1 text-lg font-semibold text-gray-900">{{ value }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { useMealsStore } from '../stores/meals'
import { storeToRefs } from 'pinia'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

const store = useMealsStore()
const { weeklyMeals, loading, error, currentWeekStart } = storeToRefs(store)
const isModalOpen = ref(false)
const selectedMeal = ref(null)

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

const openMealModal = (meal) => {
  selectedMeal.value = meal
  isModalOpen.value = true
}

const closeMealModal = () => {
  isModalOpen.value = false
  selectedMeal.value = null
}

const formatNutritionKey = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

onMounted(() => {
  store.fetchMeals()
})
</script> 