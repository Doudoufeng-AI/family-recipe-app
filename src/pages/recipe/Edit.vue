<template>
  <RecipeForm :recipeId="id" @saved="onSaved" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RecipeForm from './Form.vue'

const route = useRoute()
const router = useRouter()
const id = ref(route.params.id)

function onSaved(data) {
  router.push(`/recipe/${data.id}`)
}
</script>
