<template>
  <div action="" class="box is-info">
    <div class="columns" :style="{ width: '100%', height: '2em' }">
      <div class="column">Chat</div>
      <div
        :style="{
          padding: '.25em',
          justifyContent: 'flex-end',
          overflowWrap: 'normal',
          display: 'flex',
        }"
      >
        <button class="button is-success" @click="logout">Logout</button>
      </div>
    </div>

    <div
      v-for="(item, index) in messages"
      :key="index"
      :style="{
        padding: '.25em',
        justifyContent: 'flex-start',
        overflowWrap: 'normal',
        display: 'flex',
      }"
    >
      <div
        :style="{
          backgroundColor: item.role ? 'blue' : '#48c774',
          color: '#fff',
          padding: '.5em',
          wordWrap: 'break-word',
        }"
        :class="{
          'is-medium': true,
          'is-success': item.role ? false : true,
          'is-info': item.role ? true : false,
        }"
      >
        <label for="" class="label" :style="{ marginBottom: 0 }">{{
          item.username
        }}</label>

        <div>{{ item.message }}</div>
      </div>
    </div>
    <div class="field column is-12-desktop has-addons">
      <div class="control is-expanded">
        <input
          class="input"
          v-model="inputMessage"
          type="text"
          @keyup.enter="sendMessage(inputMessage)"
          placeholder="type message"
        />
      </div>
      <div class="control">
        <a class="button is-info" @click="sendMessage(inputMessage)"> Send</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'nuxt-property-decorator'
@Component
export default class Message extends Vue {
  inputMessage: string = ''
  @Prop({ required: true }) readonly messages!: Array<object>
  @Emit()
  sendMessage(message: object): void {
    this.inputMessage = ''
  }
  @Emit()
  logout(): void {}
}
</script>
