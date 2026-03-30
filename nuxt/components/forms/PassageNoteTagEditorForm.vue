<template>
  <form @submit.prevent="handleSubmit">
    <div v-if="errors._form" class="help is-danger">
      <div class="help is-danger">
        {{ $terr(errors._form) }}
      </div>
    </div>
    <div class="field">
      <div class="label">
        {{ $t('label') }}
      </div>
      <div v-if="errors.label" class="help is-danger">
        {{ $terr(errors.label, { field: $t('label') }) }}
      </div>
      <div class="control">
        <input :value="passageNoteTag.label" class="input" type="text" maxlength="32" @input="updateLabel">
      </div>
    </div>
    <div class="field">
      <div class="label">
        {{ $t('color') }}
      </div>
      <div class="control">
        <input :value="passageNoteTag.color" class="input" type="color" @input="updateColor">
      </div>
    </div>
    <div class="field">
      <div class="label">
        {{ $t('description') }}
      </div>
      <div class="control">
        <textarea :value="passageNoteTag.description" class="textarea" maxlength="1500" @input="updateDescription" />
      </div>
    </div>
    <!-- ensures property will be computed because it is accessed-->
    <p hidden="hidden">
      {{ isValid }}
    </p>
  </form>
</template>

<script>
import { usePassageNoteTagEditorStore } from '~/stores/passage-note-tag-editor';

export default {
  name: 'PassageNoteTagEditorForm',
  computed: {
    passageNoteTagEditorStore() {
      return usePassageNoteTagEditorStore();
    },
    passageNoteTag() {
      return this.passageNoteTagEditorStore.passageNoteTag;
    },
    errors() {
      return this.passageNoteTagEditorStore.errors;
    },
    isValid() {
      const valid = this.validatePassageNoteTag(this.passageNoteTag);
      this.passageNoteTagEditorStore.setValid(valid);
      return valid;
    },
  },
  methods: {
    validatePassageNoteTag(passageNoteTag) {
      if (passageNoteTag.label.trim().length < 1 || passageNoteTag.label.length > 32) {
        return false;
      }
      if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(passageNoteTag.color)) {
        return false;
      }
      return true;
    },
    updateLabel(event) {
      const updatedPassageNoteTag = JSON.parse(JSON.stringify(this.passageNoteTag));
      updatedPassageNoteTag.label = event.target.value;
      this.passageNoteTagEditorStore.updatePassageNoteTag(updatedPassageNoteTag);
    },
    updateColor(event) {
      const updatedPassageNoteTag = JSON.parse(JSON.stringify(this.passageNoteTag));
      updatedPassageNoteTag.color = event.target.value;
      this.passageNoteTagEditorStore.updatePassageNoteTag(updatedPassageNoteTag);
    },
    updateDescription(event) {
      const updatedPassageNoteTag = JSON.parse(JSON.stringify(this.passageNoteTag));
      updatedPassageNoteTag.description = event.target.value;
      this.passageNoteTagEditorStore.updatePassageNoteTag(updatedPassageNoteTag);
    },
    handleSubmit() {
      this.passageNoteTagEditorStore.savePassageNoteTag();
    },
  },
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/forms/PassageNoteTagEditorForm.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/forms/PassageNoteTagEditorForm.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/forms/PassageNoteTagEditorForm.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/forms/PassageNoteTagEditorForm.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/forms/PassageNoteTagEditorForm.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/forms/PassageNoteTagEditorForm.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/forms/PassageNoteTagEditorForm.json" />
