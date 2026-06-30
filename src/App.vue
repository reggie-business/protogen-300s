<script setup lang="ts">
import { computed, ref } from 'vue'

// Demo-only client-side gate over mock data; this code is visible in the client bundle.
const ACCESS_CODE = 'harbor'

const enteredCode = ref('')
const unlocked = ref(false)
const showError = ref(false)

const canSubmit = computed(() => enteredCode.value.trim().length > 0)

const unlockDashboard = () => {
  if (enteredCode.value.trim().toLowerCase() === ACCESS_CODE) {
    unlocked.value = true
    showError.value = false
    return
  }
  showError.value = true
}
</script>

<template>
  <div v-if="!unlocked" class="gate-wrapper">
    <div class="gate-card">
      <p class="gate-eyebrow">Mercy General</p>
      <h1 class="gate-title">Clinical Operations Access</h1>
      <p class="gate-copy">Enter the access code to view the operational dashboard.</p>

      <div class="gate-form">
        <div class="form-group">
          <label for="access-code" class="form-label">Access Code</label>
          <input
            id="access-code"
            v-model="enteredCode"
            type="text"
            class="form-input"
            placeholder="Enter code"
            @keydown.enter="unlockDashboard"
          />
        </div>

        <div v-if="showError" class="form-error">
          Access code is incorrect.
        </div>

        <button
          class="form-button"
          :disabled="!canSubmit"
          @click="unlockDashboard"
        >
          Unlock
        </button>
      </div>
    </div>
  </div>

  <RouterView v-else />
</template>

<style scoped>
.gate-wrapper {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #def2f1 0%, #feffff 100%);
}

.gate-card {
  width: 100%;
  max-width: 420px;
  background: #feffff;
  border: 1px solid #b9d9d7;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 8px 26px rgba(23, 37, 42, 0.08);
}

.gate-eyebrow {
  margin: 0;
  color: #2b7a78;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.76rem;
  font-weight: 700;
}

.gate-title {
  margin: 0.35rem 0 0;
  color: #17252a;
  font-size: 1.55rem;
  line-height: 1.15;
  font-weight: 800;
}

.gate-copy {
  margin: 1rem 0 0;
  color: #17252a;
  font-size: 0.95rem;
}

.gate-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.8rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #17252a;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #17252a;
  background-color: #feffff;
  border: 2px solid #b9d9d7;
  border-radius: 6px;
  font-family: 'IBM Plex Sans', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:hover {
  border-color: #3aafa9;
}

.form-input:focus {
  outline: none;
  border-color: #2b7a78;
  box-shadow: 0 0 0 3px rgba(58, 175, 169, 0.22);
}

.form-input::placeholder {
  color: #557175;
}

.form-error {
  padding: 0.75rem 1rem;
  background-color: rgba(255, 77, 95, 0.1);
  border: 1px solid #ff4d5f;
  border-radius: 6px;
  color: #ff4d5f;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-button {
  padding: 0.9rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #feffff;
  background-color: #2b7a78;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'IBM Plex Sans', sans-serif;
  transition: background-color 0.2s, box-shadow 0.2s;
  margin-top: 0.5rem;
}

.form-button:hover:not(:disabled) {
  background-color: #246664;
  box-shadow: 0 4px 12px rgba(43, 122, 120, 0.28);
}

.form-button:active:not(:disabled) {
  background-color: #1d5352;
}

.form-button:disabled {
  background-color: #8eaead;
  cursor: not-allowed;
}

.form-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(58, 175, 169, 0.25);
}
</style>
