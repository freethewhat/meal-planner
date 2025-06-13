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
              {{ format(parseDate(date), 'EEE') }}
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
              <span class="text-caption">{{ format(parseDate(meal.date), 'EEE, MMM d') }}</span>
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
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <span class="text-h4">{{ selectedMeal.name }}</span>
            <div class="text-caption mt-1">
              {{ format(parseDate(selectedMeal.date), 'EEEE, MMMM d, yyyy') }}
            </div>
          </div>
          <v-btn
            v-if="isAuthenticated"
            icon="mdi-pencil"
            variant="text"
            @click="startEditing"
          ></v-btn>
        </v-card-title>

        <v-card-text>
          <template v-if="!isEditing">
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

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editingMeal.time"
                    label="Preparation Time"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
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

                <v-col cols="12" md="6">
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
                  <h4 class="text-h6 mb-4">Ingredients</h4>
                  <v-row v-for="(ingredient, index) in editingMeal.ingredients" :key="index">
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="ingredient.name"
                        label="Name"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="ingredient.amount"
                        label="Amount"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="ingredient.unit"
                        label="Unit"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2" class="d-flex align-center">
                      <v-btn
                        icon="mdi-delete"
                        color="error"
                        variant="text"
                        @click="removeIngredient(index)"
                      ></v-btn>
                    </v-col>
                  </v-row>
                  <v-btn
                    color="primary"
                    variant="text"
                    @click="addIngredient"
                    class="mt-2"
                  >
                    Add Ingredient
                  </v-btn>
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
                  <h4 class="text-h6 mb-4">Nutrition Information</h4>
                  <v-row>
                    <v-col
                      v-for="(value, key) in editingMeal.nutrition.per_serving"
                      :key="key"
                      cols="6"
                      md="3"
                    >
                      <v-text-field
                        v-model.number="editingMeal.nutrition.per_serving[key]"
                        :label="formatNutritionKey(key)"
                        type="number"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
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

onMounted(() => {
  store.fetchMeals()
})
</script> 