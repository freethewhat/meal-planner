<template>
  <div class="space-y-6">
    <!-- Week Navigation -->
    <v-card>
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <v-btn @click="store.previousWeek" variant="outlined">
            Previous
          </v-btn>

          <div class="d-flex gap-4">
            <v-btn
              v-for="date in weekDates"
              :key="date"
              @click="store.setCurrentWeek(date)"
              :color="isCurrentWeek(date) ? 'primary' : undefined"
              variant="text"
            >
              {{ format(new Date(date), 'EEE') }}
            </v-btn>
          </div>

          <v-btn @click="store.nextWeek" variant="outlined">
            Next
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error">
      {{ error }}
    </v-alert>

    <!-- Meals Grid -->
    <v-row v-else>
      <v-col
        v-for="meal in weeklyMeals"
        :key="meal.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="h-100"
          @click="openMealModal(meal)"
          hover
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <h3 class="text-h6">{{ meal.name }}</h3>
              <span class="text-caption">{{ format(new Date(meal.date), 'EEE, MMM d') }}</span>
            </div>
            <p class="text-caption mt-2">{{ meal.time }}</p>
            <p class="mt-2">{{ meal.description }}</p>
            
            <div class="d-flex justify-space-between mt-4">
              <div class="text-caption">
                {{ meal.servings }} servings
              </div>
              <div class="text-caption">
                {{ meal.nutrition.per_serving.calories }} cal/serving
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Meal Dialog -->
    <v-dialog v-model="isModalOpen" max-width="800">
      <v-card v-if="selectedMeal">
        <v-card-title class="text-h4">
          {{ selectedMeal.name }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <h4 class="text-h6 mb-4">Ingredients</h4>
              <v-list>
                <v-list-item
                  v-for="ingredient in selectedMeal.ingredients"
                  :key="ingredient.name"
                >
                  {{ ingredient.amount }} {{ ingredient.unit }} {{ ingredient.name }}
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="6">
              <h4 class="text-h6 mb-4">Instructions</h4>
              <ol class="pl-4">
                <li
                  v-for="(instruction, index) in selectedMeal.instructions.split('\n')"
                  :key="index"
                  class="mb-2"
                >
                  {{ instruction }}
                </li>
              </ol>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <h4 class="text-h6 mb-4">Nutrition Information</h4>
          <v-row>
            <v-col
              v-for="(value, key) in selectedMeal.nutrition.per_serving"
              :key="key"
              cols="6"
              md="3"
            >
              <v-card variant="outlined">
                <v-card-text>
                  <div class="text-caption">{{ formatNutritionKey(key) }}</div>
                  <div class="text-h6">{{ value }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeMealModal">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { useMealsStore } from '../stores/meals'
import { storeToRefs } from 'pinia'

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