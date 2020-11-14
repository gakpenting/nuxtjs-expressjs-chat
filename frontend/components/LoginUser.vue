<template>
  <section class="hero is-primary is-fullheight">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-5-tablet is-4-desktop is-3-widescreen">
            <form @submit.prevent="logins" class="box">
              <div class="field">
                <label for="" class="label">Username</label>
                <div class="control has-icons-left">
                  <input
                    type="text"
                    placeholder="username"
                    class="input"
                    required
                    v-model="username"
                  />
                  <span class="icon is-small is-left">
                    <i class="fa fa-lock"></i>
                  </span>
                </div>
              </div>

              <div class="field">
                <button class="button is-success" @click="logins">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ToastProgrammatic as Toast } from 'buefy'
import Cookies from 'js-cookie'

@Component
export default class MyStore extends Vue {
  public username: string = ''
  public password: string = ''
  public error: string = ''
  created() {
    if (Cookies.get('user')) this.$router.push('/chat')
  }
  async logins() {
    Cookies.set('user', this.username, { expires: 7 })
    this.$router.push('/chat')
  }
}
</script>
