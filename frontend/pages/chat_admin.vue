<template>
  <ChatAdmin />
</template>
<script lang="ts">
import ChatAdmin from '@/components/chat-component/ChatAdmin.vue'
import { Component, Vue } from 'nuxt-property-decorator'
@Component({
  components: {
    ChatAdmin
  }
})
export default class MyStore extends Vue {}
</script>
