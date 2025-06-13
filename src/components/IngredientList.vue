<template>
  <div>
    <h4 class="text-h6 mb-4">Ingredients</h4>
    <template v-if="!editable">
      <v-list>
        <v-list-item
          v-for="ingredient in ingredients"
          :key="ingredient.name"
        >
          {{ ingredient.amount }} {{ ingredient.unit }} {{ ingredient.name }}
        </v-list-item>
      </v-list>
    </template>
    <template v-else>
      <v-row v-for="(ingredient, index) in ingredients" :key="index">
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="ingredient.name"
            label="Name"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="ingredient.amount"
            label="Amount"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="ingredient.unit"
            label="Unit"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="2" class="d-flex align-center">
          <v-btn
            icon="mdi-delete"
            color="error"
            variant="text"
            @click="$emit('remove', index)"
          ></v-btn>
        </v-col>
      </v-row>
      <v-btn
        color="primary"
        variant="text"
        @click="$emit('add')"
        class="mt-2"
      >
        Add Ingredient
      </v-btn>
    </template>
  </div>
</template>

<script setup>
defineProps({
  ingredients: {
    type: Array,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['add', 'remove'])
</script> 