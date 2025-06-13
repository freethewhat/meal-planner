<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Import Recipe</h2>
      <div class="space-y-4">
        <div>
          <label for="recipe-json" class="block text-sm font-medium text-gray-700">Recipe JSON</label>
          <textarea
            id="recipe-json"
            v-model="recipeJson"
            rows="10"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Paste recipe JSON here..."
          ></textarea>
        </div>
        <button
          @click="importRecipe"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Import Recipe
        </button>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Manage Meals</h2>
      </div>

      <div class="divide-y divide-gray-200">
        <div v-for="meal in meals" :key="meal.id" class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ meal.name }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ format(new Date(meal.date), 'MMMM d, yyyy') }}</p>
            </div>
            <div class="flex space-x-3">
              <button
                @click="editMeal(meal)"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                @click="deleteMeal(meal.id)"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Meal Modal -->
    <TransitionRoot appear :show="isModalOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-10">
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
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Edit Meal
                </DialogTitle>

                <div class="mt-4 space-y-4">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      id="name"
                      v-model="editingMeal.name"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                  </div>

                  <div>
                    <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      id="date"
                      v-model="editingMeal.date"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                  </div>

                  <div>
                    <label for="time" class="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="text"
                      id="time"
                      v-model="editingMeal.time"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                  </div>

                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      v-model="editingMeal.description"
                      rows="3"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    ></textarea>
                  </div>

                  <div>
                    <label for="servings" class="block text-sm font-medium text-gray-700">Servings</label>
                    <input
                      type="number"
                      id="servings"
                      v-model.number="editingMeal.servings"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Ingredients</label>
                    <div v-for="(ingredient, index) in editingMeal.ingredients" :key="index" class="mt-2 flex space-x-2">
                      <input
                        type="text"
                        v-model="ingredient.name"
                        placeholder="Name"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                      <input
                        type="text"
                        v-model="ingredient.amount"
                        placeholder="Amount"
                        class="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                      <input
                        type="text"
                        v-model="ingredient.unit"
                        placeholder="Unit"
                        class="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                      <button
                        @click="removeIngredient(index)"
                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <button
                      @click="addIngredient"
                      class="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Add Ingredient
                    </button>
                  </div>

                  <div>
                    <label for="instructions" class="block text-sm font-medium text-gray-700">Instructions</label>
                    <textarea
                      id="instructions"
                      v-model="editingMeal.instructions"
                      rows="5"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    ></textarea>
                  </div>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    @click="closeModal"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveMeal"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
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
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
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
const { meals, loading, error } = storeToRefs(store)
const recipeJson = ref('')
const isModalOpen = ref(false)
const editingMeal = ref(null)

const importRecipe = async () => {
  try {
    const recipe = JSON.parse(recipeJson.value)
    await store.addMeal(recipe)
    recipeJson.value = ''
  } catch (error) {
    console.error('Error importing recipe:', error)
  }
}

const editMeal = (meal) => {
  editingMeal.value = JSON.parse(JSON.stringify(meal))
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingMeal.value = null
}

const saveMeal = async () => {
  if (editingMeal.value) {
    await store.updateMeal(editingMeal.value.id, editingMeal.value)
    closeModal()
  }
}

const deleteMeal = async (id) => {
  if (confirm('Are you sure you want to delete this meal?')) {
    await store.deleteMeal(id)
  }
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

onMounted(() => {
  store.fetchMeals()
})
</script> 