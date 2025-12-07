<template>
  <main>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet is-half-desktop">
            <header class="page-header">
              <h2 class="title">
                {{ $t('note_tags') }}
                <info-link :to="localePath('/about/page-features--notes')" />
              </h2>
              <div class="buttons is-align-items-flex-start">
                <nuxt-link class="button" :to="localePath('/notes')">
                  {{ $t('notes') }}
                  <CaretRight style="margin-left: 0.2rem;" />
                </nuxt-link>
                <button class="button is-info" @click="openPassageNoteTagEditor()">
                  {{ $t('new') }}
                </button>
              </div>
            </header>
            <div>
              <div v-for="tag in passageNoteTags" :key="tag.id" class="tag-line">
                <div>
                  <div class="passage-note-tag" :style="passageNoteTagStyle(tag)">
                    {{ tag.label }}
                  </div>
                  <div class="tag-description">
                    <hyperlinked-text :text="tag.description" />
                  </div>
                </div>
                <div class="buttons is-right">
                  <button class="button is-small" @click="viewTagNotes(tag)">
                    {{ $t('notes_count', { count: tag.noteCount }) }}
                  </button>
                  <button class="button is-small" @click="openPassageNoteTagEditor(tag)">
                    {{ $t('edit') }}
                  </button>
                  <button class="button is-small" @click="deletePassageNoteTag(tag.id)">
                    {{ $t('delete') }}
                  </button>
                </div>
              </div>
              <div v-if="!passageNoteTags.length" class="tag-line">
                <div class="has-text-centered">
                  {{ $t('no_tags') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { mapState } from 'vuex';
import HyperlinkedText from '@/components/HyperlinkedText';
import InfoLink from '@/components/InfoLink';
import CaretRight from '@/components/svg/CaretRight';

export default {
  name: 'NoteTagsListPage',
  components: {
    HyperlinkedText,
    InfoLink,
    CaretRight,
  },
  computed: {
    ...mapState({
      passageNoteTags: state => state['passage-note-tags'].passageNoteTags,
    }),
  },
  mounted() {
    this.$store.dispatch('passage-note-tags/loadPassageNoteTags');
  },
  methods: {
    viewTagNotes(tag) {
      this.$store.dispatch('passage-notes/stageQuery', { filterTags: [tag.id] });
      this.$router.push(this.localePath('/notes'));
    },
    openPassageNoteTagEditor(passageNoteTag = null) {
      this.$store.dispatch('passage-note-tag-editor/openEditor', passageNoteTag);
    },
    async deletePassageNoteTag(id) {
      if (this.passageNoteTags.find(tag => tag.id === id).noteCount > 0) {
        await this.$store.dispatch('dialog/alert', {
          message: this.$t('cannot_delete_tag_in_use'),
        });
        return;
      }
      const confirmed = await this.$store.dispatch('dialog/confirm', {
        message: this.$t('confirm_delete_tag'),
      });
      if (!confirmed) { return; }

      const success = await this.$store.dispatch('passage-note-tags/deletePassageNoteTag', id);
      if (!success) {
        this.$store.dispatch('toast/add', {
          type: 'error',
          text: this.$t('tag_not_deleted'),
        });
      }
    },
    passageNoteTagStyle(tag) {
      return {
        'background-color': tag.color,
      };
    },
  },
  middleware: ['auth'],
  head() {
    return {
      title: this.$t('note_tags'),
    };
  },
};
</script>

<style lang="scss" scoped>
.tag-line {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  margin: 1rem -0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 7px #999;
}
.passage-note-tag {
  color: #fff;
  text-shadow: 0 0 2px #000;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.tag-description {
  white-space: pre-wrap;
  margin: 0.5rem 0;
  padding: 0 0.5rem;
}
</style>

<i18n lang="json">
{
  "de": {
    "note_tags": "Notiz-Tags",
    "notes": "Notizen",
    "new": "Neu",
    "edit": "Bearbeiten",
    "delete": "Löschen",
    "no_tags": "Keine Notiz-Tags",
    "label": "Label",
    "color": "Farbe",
    "description": "Beschreibung",
    "save": "Speichern",
    "close": "Schließen",
    "notes_count": "Notizen: {count}",
    "edit_tag": "Tag bearbeiten",
    "add_tag": "Tag hinzufügen",
    "confirm_delete_tag": "Sind Sie sicher, dass Sie diesen Tag löschen möchten?",
    "cannot_delete_tag_in_use": "Ein Tag kann nicht gelöscht werden, wenn er noch von Notizen verwendet wird.",
    "tag_deleted": "Der Tag wurde gelöscht.",
    "tag_not_deleted": "Der Tag konnte nicht gelöscht werden.",
    "unknown_error": "Ein unbekannter Fehler ist aufgetreten."
  },
  "en": {
    "note_tags": "Note Tags",
    "notes": "Notes",
    "new": "New",
    "edit": "Edit",
    "delete": "Delete",
    "no_tags": "No Tags",
    "label": "Label",
    "color": "Color",
    "description": "Description",
    "save": "Save",
    "close": "Close",
    "notes_count": "Notes: {count}",
    "edit_tag": "Edit Tag",
    "add_tag": "Add Tag",
    "confirm_delete_tag": "Are you sure you want to delete this tag?",
    "cannot_delete_tag_in_use": "Cannot delete a tag that is still being used by notes.",
    "tag_deleted": "The tag was deleted.",
    "tag_not_deleted": "The tag could not be deleted.",
    "unknown_error": "An unknown error occurred."
  },
  "es": {
    "note_tags": "Etiquetas de Notas",
    "notes": "Notas",
    "new": "Nuevo",
    "edit": "Editar",
    "delete": "Eliminar",
    "no_tags": "No hay etiquetas",
    "label": "Etiqueta",
    "color": "Color",
    "description": "Descripción",
    "save": "Guardar",
    "close": "Cerrar",
    "notes_count": "Notas: {count}",
    "edit_tag": "Editar Etiqueta",
    "add_tag": "Añadir Etiqueta",
    "confirm_delete_tag": "¿Estás seguro de que quieres eliminar esta etiqueta?",
    "cannot_delete_tag_in_use": "No se puede eliminar una etiqueta que todavía está siendo utilizada por notas.",
    "tag_deleted": "La etiqueta fue eliminada.",
    "tag_not_deleted": "La etiqueta no se pudo eliminar.",
    "unknown_error": "Ocurrió un error desconocido."
  },
  "fr": {
    "note_tags": "Étiquettes de note",
    "notes": "Notes",
    "new": "Nouveau",
    "edit": "Éditer",
    "delete": "Supprimer",
    "no_tags": "Pas d'étiquettes",
    "label": "Étiquette",
    "color": "Couleur",
    "description": "Description",
    "save": "Enregistrer",
    "close": "Fermer",
    "notes_count": "Notes : {count}",
    "edit_tag": "Éditer le tag",
    "add_tag": "Ajouter un tag",
    "confirm_delete_tag": "Voulez-vous vraiment supprimer ce tag ?",
    "cannot_delete_tag_in_use": "Impossible de supprimer un tag encore utilisé par des notes.",
    "tag_deleted": "Le tag a été supprimé.",
    "tag_not_deleted": "Le tag n'a pas pu être supprimé.",
    "unknown_error": "Une erreur inconnue est survenue."
  },
  "pt": {
    "note_tags": "Marcadores",
    "notes": "Notas",
    "new": "Novo",
    "edit": "Editar",
    "delete": "Apagar",
    "no_tags": "Sem Marcadores",
    "label": "Nome",
    "color": "Cor",
    "description": "Descrição",
    "save": "Salvar",
    "close": "Fechar",
    "notes_count": "Notas: {count}",
    "edit_tag": "Editar Tag",
    "add_tag": "Adicionar Tag",
    "confirm_delete_tag": "Tem certeza de que deseja excluir esta tag?",
    "cannot_delete_tag_in_use": "Não é possível excluir uma tag que ainda está sendo usada por notas.",
    "tag_deleted": "A tag foi excluída.",
    "tag_not_deleted": "A tag não pôde ser excluída.",
    "unknown_error": "Ocorreu um erro desconhecido."
  },
  "uk": {
    "note_tags": "Теги Нотаток",
    "notes": "Нотатки",
    "new": "Новий",
    "edit": "Редагувати",
    "delete": "Видалити",
    "no_tags": "Немає тегів",
    "label": "Мітка",
    "color": "Колір",
    "description": "Опис",
    "save": "Зберегти",
    "close": "Закрити",
    "notes_count": "Нотатки: {count}",
    "edit_tag": "Редагувати Тег",
    "add_tag": "Додати Тег",
    "confirm_delete_tag": "Ви впевнені, що хочете видалити цей тег?",
    "cannot_delete_tag_in_use": "Не можна видалити тег, який все ще використовується нотатками.",
    "tag_deleted": "Тег був видалений.",
    "tag_not_deleted": "Тег не видалено.",
    "unknown_error": "Сталася невідома помилка."
  }
}
</i18n>
