<script setup>
import { useUserStore } from '@/stores/userInfo.js'

const userInfo = useUserStore()
const user = userInfo.user
</script>

<template>
  <div>
    <h1>User</h1>
    <p>user page content</p>
    <p>{{ user.username }}</p>
  </div>
</template>

<style scoped></style>
