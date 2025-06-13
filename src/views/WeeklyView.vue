<template>
  <div class="space-y-4">
    <!-- Week Navigation -->
    <WeekNavigation
      :start-date="weekDates[0]"
      :end-date="weekDates[6]"
      :is-current-week="isCurrentWeekSelected"
      @previous="store.previousWeek"
      @next="store.nextWeek"
      @current="goToCurrentWeek"
    />

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
        sm="6"
        md="4"
      >
        <MealCard
          :meal="meal"
          @click="openMealModal(meal)"
        />
      </v-col>
    </v-row>

    <!-- Meal Dialog -->
    <v-dialog v-model="isModalOpen" max-width="800" fullscreen="smAndDown">
      <v-card v-if="selectedMeal">
        <v-card-title class="d-flex flex-column flex-sm-row justify-space-between align-start gap-2">
          <div>
            <span class="text-h4 text-truncate">{{ selectedMeal.name }}</span>
            <div class="text-caption mt-1">
              {{ format(parseDate(selectedMeal.date), 'EEEE, MMMM d, yyyy') }}
            </div>
          </div>
          <div class="d-flex align-center gap-2">
            <v-btn
              v-if="isAuthenticated"
              icon="mdi-pencil"
              variant="text"
              @click="startEditing"
            ></v-btn>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="closeMealModal"
            ></v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <template v-if="!isEditing">
            <v-row>
              <v-col cols="12" md="6">
                <IngredientList
                  :ingredients="selectedMeal.ingredients"
                  :editable="false"
                />
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

            <NutritionInfo
              :nutrition="selectedMeal.nutrition"
              :editable="false"
            />
          </template>

          <template v-else>
            <v-form @submit.prevent="saveMeal">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="editingMeal.name"
                    label="Meal Name"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editingMeal.time"
                    label="Preparation Time"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-menu
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        :model-value="format(parseDate(editingMeal.date), 'EEEE, MMMM d, yyyy')"
                        label="Date"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="props"
                        required
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="editingMeal.date"
                      @update:model-value="dateMenu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="editingMeal.servings"
                    label="Servings"
                    type="number"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="editingMeal.description"
                    label="Description"
                    required
                  ></v-textarea>
                </v-col>

                <v-col cols="12">
                  <IngredientList
                    :ingredients="editingMeal.ingredients"
                    :editable="true"
                    @add="addIngredient"
                    @remove="removeIngredient"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="editingMeal.instructions"
                    label="Instructions"
                    required
                    hint="Enter each step on a new line"
                    persistent-hint
                  ></v-textarea>
                </v-col>

                <v-col cols="12">
                  <NutritionInfo
                    :nutrition="editingMeal.nutrition"
                    :editable="true"
                  />
                </v-col>
              </v-row>
            </v-form>
          </template>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <template v-if="isEditing">
            <v-btn color="error" variant="text" @click="cancelEditing">
              Cancel
            </v-btn>
            <v-btn color="primary" @click="saveMeal">
              Save Changes
            </v-btn>
          </template>
          <template v-else>
            <v-btn color="primary" @click="closeMealModal">
              Close
            </v-btn>
          </template>
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
import { supabase } from '../config/supabase'
import { useAuthStore } from '../stores/auth'
import MealCard from '../components/MealCard.vue'
import NutritionInfo from '../components/NutritionInfo.vue'
import IngredientList from '../components/IngredientList.vue'
import WeekNavigation from '../components/WeekNavigation.vue'

const store = useMealsStore()
const { weeklyMeals, loading, error, currentWeekStart } = storeToRefs(store)
const isModalOpen = ref(false)
const selectedMeal = ref(null)
const isEditing = ref(false)
const editingMeal = ref(null)
const isAuthenticated = ref(false)
const dateMenu = ref(false)

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

const parseDate = (dateInput) => {
  if (dateInput instanceof Date) {
    return dateInput
  }
  const [year, month, day] = dateInput.split('-').map(Number)
  // Create date at noon to avoid timezone issues
  return new Date(year, month - 1, day, 12, 0, 0)
}

const openMealModal = async (meal) => {
  console.log('Opening modal with meal date:', meal.date)
  selectedMeal.value = meal
  isModalOpen.value = true
  isEditing.value = false
  
  // Check authentication status
  const { data: { session } } = await supabase.auth.getSession()
  isAuthenticated.value = session?.user?.email === 'matthew.c.sutton@gmail.com'
}

const closeMealModal = () => {
  isModalOpen.value = false
  selectedMeal.value = null
  isEditing.value = false
  editingMeal.value = null
}

const startEditing = () => {
  console.log('Starting edit with date:', selectedMeal.value.date)
  editingMeal.value = JSON.parse(JSON.stringify(selectedMeal.value))
  // Keep the date exactly as it is from the database
  editingMeal.value.date = selectedMeal.value.date
  console.log('Editing meal date set to:', editingMeal.value.date)
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  editingMeal.value = null
}

const addIngredient = () => {
  if (!editingMeal.value.ingredients) {
    editingMeal.value.ingredients = []
  }
  editingMeal.value.ingredients.push({ name: '', amount: '', unit: '' })
}

const removeIngredient = (index) => {
  editingMeal.value.ingredients.splice(index, 1)
}

const saveMeal = async () => {
  try {
    console.log('Before save - editingMeal date:', editingMeal.value.date)
    // Keep the date exactly as it is
    const mealToSave = {
      ...editingMeal.value,
      date: editingMeal.value.date
    }
    console.log('About to save meal with date:', mealToSave.date)
    await store.updateMeal(mealToSave.id, mealToSave)
    console.log('After save - selectedMeal date:', selectedMeal.value.date)
    selectedMeal.value = mealToSave
    isEditing.value = false
    editingMeal.value = null
  } catch (error) {
    console.error('Error saving meal:', error)
  }
}

const formatNutritionKey = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

const isCurrentWeekSelected = computed(() => {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  return format(weekStart, 'yyyy-MM-dd') === format(currentWeekStart.value, 'yyyy-MM-dd')
})

const goToCurrentWeek = () => {
  store.setCurrentWeek(new Date())
}

onMounted(() => {
  store.fetchMeals()
})
</script> 