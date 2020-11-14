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
                    v-model="username"
                    type="text"
                    placeholder="username"
                    class="input"
                    required
                  />
                  <span class="icon is-small is-left">
                    <i class="fa fa-envelope"></i>
                  </span>
                </div>
              </div>
              <div class="field">
                <label for="" class="label">Password</label>
                <div class="control has-icons-left">
                  <input
                    v-model="password"
                    type="password"
                    placeholder="*******"
                    class="input"
                    required
                  />
                  <span class="icon is-small is-left">
                    <i class="fa fa-lock"></i>
                  </span>
                </div>
              </div>

              <div class="field">
                <button type="button" class="button is-success" @click="logins">
                  Login
                </button>
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
    if (Cookies.get('token')) this.$router.push('/chat_admin')
  }
  async logins() {
    try {
      const cek = await this.$axios.post('/login', {
        username: this.username,
        password: this.password,
      })
      if (!cek.data.status){
        return this.$buefy.toast.open({
          message: 'username or password wrong',
          type: 'is-warning',
        })}
      Cookies.set('token', cek.data.data.token, { expires: 7 })
      this.$router.push('/chat_admin')
    } catch (e) {
      this.$buefy.toast.open({
        message: 'username or password wrong',
        type: 'is-warning',
      })
      console.log(e.message)
    }
  }
}
</script>
