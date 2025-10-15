<template>
  <main role="main">
    <section role="banner" class="hero is-medium is-info is-bold">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="title">
            {{ $t('hero.title') }}
          </h1>
          <h2 class="subtitle">
            {{ $t('hero.subtitle') }}
          </h2>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet">
            <div class="content notification is-light">
              <p>{{ $t('overview.p1') }}</p>
              <p>{{ $t('overview.p2') }}</p>
              <p>{{ $t('overview.p3') }}</p>
              <p class="has-text-centered">
                <nuxt-link class="button is-link" :to="localePath('/today')">
                  {{ $t('cta') }}
                </nuxt-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <figure role="figure" class="feature-card">
          <img class="screenshot" src="/screenshots/sc1-reading-suggestions.jpg" alt="My Bible Log showing Bible reading suggestions">
          <figcaption class="description">
            <h3 class="title is-5">
              {{ $t('reading_suggestions.title') }}
            </h3>
            <p>{{ $t('reading_suggestions.p1') }}</p>
            <p>{{ $t('reading_suggestions.p2') }}</p>
            <p>{{ $t('reading_suggestions.p3') }}</p>
          </figcaption>
        </figure>
        <figure role="figure" class="feature-card">
          <figcaption class="description">
            <h3 class="title is-5">
              {{ $t('daily_reading_goal.title') }}
            </h3>
            <p>{{ $t('daily_reading_goal.p1') }}</p>
            <p>{{ $t('daily_reading_goal.p2') }}</p>
          </figcaption>
          <img class="screenshot" src="/screenshots/sc4-daily-goal.jpg" alt="My Bible Log showing a daily reading goal being met">
        </figure>
        <figure role="figure" class="feature-card">
          <img class="screenshot" src="/screenshots/sc13-progress.jpg" alt="My Bible Log showing reading progress and goal setting features">
          <figcaption class="description">
            <h3 class="title is-5">
              {{ $t('set_goals.title') }}
            </h3>
            <p>{{ $t('set_goals.p1') }}</p>
            <p>{{ $t('set_goals.p2') }}</p>
            <nuxt-link class="button is-link" :to="localePath('/today')">
              {{ $t('cta') }}
            </nuxt-link>
          </figcaption>
        </figure>
        <figure role="figure" class="feature-card">
          <figcaption class="description">
            <h3 class="title is-5">
              {{ $t('reading_calendar.title') }}
            </h3>
            <p>{{ $t('reading_calendar.p1') }}</p>
            <p>{{ $t('reading_calendar.p2') }}</p>
            <p>{{ $t('reading_calendar.p3') }}</p>
          </figcaption>
          <img class="screenshot" src="/screenshots/sc9-calendar.jpg" alt="My Bible Log calendar showing reading trends over time.">
        </figure>
        <figure role="figure" class="feature-card">
          <img class="screenshot" src="/screenshots/sc6-book-chapter-progress.jpg" alt="My Bible Log showing which Bible chapters are read">
          <figcaption class="description">
            <h3 class="title is-5">
              {{ $t('track_book_chapter_progress.title') }}
            </h3>
            <p>{{ $t('track_book_chapter_progress.p1') }}</p>
            <p>{{ $t('track_book_chapter_progress.p2') }}</p>
            <p>{{ $t('track_book_chapter_progress.p3') }}</p>
          </figcaption>
        </figure>
        <figure role="figure" class="feature-card">
          <figcaption class="description">
            <h3 class="title is-5">
              {{ $t('track_whole_bible_progress.title') }}
            </h3>
            <p>{{ $t('track_whole_bible_progress.p1') }}</p>
            <p>{{ $t('track_whole_bible_progress.p2') }}</p>
            <nuxt-link class="button is-link" :to="localePath('/today')">
              {{ $t('cta') }}
            </nuxt-link>
          </figcaption>
          <img class="screenshot" src="/screenshots/sc7-bible-progress.jpg" alt="My Bible Log showing reading progress for the whole Bible">
        </figure>
        <figure role="figure" class="feature-card">
          <img class="screenshot" src="/screenshots/sc10-notes.jpg" alt="My Bible Log showing reading notes">
          <figcaption class="description">
            <h3 class="title is-5">
              {{ $t('take_bible_reading_notes.title') }}
            </h3>
            <p>{{ $t('take_bible_reading_notes.p1') }}</p>
            <p>{{ $t('take_bible_reading_notes.p2') }}</p>
            <p>{{ $t('take_bible_reading_notes.p3') }}</p>
          </figcaption>
        </figure>
        <figure role="figure" class="feature-card">
          <figcaption class="description">
            <h3 class="title is-5">
              {{ $t('organize_notes_with_custom_tags.title') }}
            </h3>
            <p>{{ $t('organize_notes_with_custom_tags.p1') }}</p>
            <p>{{ $t('organize_notes_with_custom_tags.p2') }}</p>
            <p>{{ $t('organize_notes_with_custom_tags.p3') }}</p>
          </figcaption>
          <img class="screenshot" src="/screenshots/sc11-note-tags.jpg" alt="My Bible Log showing custom note tags">
        </figure>
        <figure role="figure" class="feature-card">
          <img class="screenshot" src="/screenshots/sc12-checklist.jpg" alt="My Bible Log showing chapter reading checklist">
          <figcaption class="description">
            <h3 class="title is-5">
              {{ $t('track_reading_with_a_single_click.title') }}
            </h3>
            <p>{{ $t('track_reading_with_a_single_click.p1') }}</p>
            <p>{{ $t('track_reading_with_a_single_click.p2') }}</p>
            <p>{{ $t('track_reading_with_a_single_click.p3') }}</p>
            <nuxt-link class="button is-link" :to="localePath('/today')">
              {{ $t('cta') }}
            </nuxt-link>
          </figcaption>
        </figure>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="tile is-ancestor">
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-2">
                {{ $t('bible_facts.1.title') }}
              </h3>
              <p>{{ $t('bible_facts.1.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-2">
                {{ $t('bible_facts.2.title') }}
              </h3>
              <p>{{ $t('bible_facts.2.fact') }}</p>
            </div>
          </div>
        </div>
        <div class="tile is-ancestor">
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-2">
                {{ $t('bible_facts.3.title') }}
              </h3>
              <p>{{ $t('bible_facts.3.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-2">
                {{ $t('bible_facts.4.title') }}
              </h3>
              <p>{{ $t('bible_facts.4.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-2">
                {{ $t('bible_facts.5.title') }}
              </h3>
              <p>{{ $t('bible_facts.5.fact') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet">
            <div class="content">
              <h2>{{ $t('reading_the_bible_in_a_year.title') }}</h2>
              <p>{{ $t('reading_the_bible_in_a_year.p1') }}</p>
              <p>{{ $t('reading_the_bible_in_a_year.p2') }}</p>
              <p>{{ $t('reading_the_bible_in_a_year.p3') }}</p>
              <p>{{ $t('reading_the_bible_in_a_year.p4') }}</p>
              <p>{{ $t('reading_the_bible_in_a_year.p5') }}</p>
              <p class="has-text-centered">
                <nuxt-link class="button is-link" :to="localePath('/today')">
                  {{ $t('cta') }}
                </nuxt-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="tile is-ancestor">
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-2">
                {{ $t('bible_facts.6.title') }}
              </h3>
              <p>{{ $t('bible_facts.6.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-2">
                {{ $t('bible_facts.7.title') }}
              </h3>
              <p>{{ $t('bible_facts.7.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-2">
                {{ $t('bible_facts.8.title') }}
              </h3>
              <p>{{ $t('bible_facts.8.fact') }}</p>
            </div>
          </div>
        </div>
        <div class="tile is-ancestor">
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-2">
                {{ $t('bible_facts.9.title') }}
              </h3>
              <p>{{ $t('bible_facts.9.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-2">
                {{ $t('bible_facts.10.title') }}
              </h3>
              <p>{{ $t('bible_facts.10.fact') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <figure role="figure" class="feature-card">
          <img class="screenshot" src="/screenshots/sc8-install-anywhere.jpg" alt="My Bible Log installed as a desktop app">
          <figcaption class="description">
            <h3 class="title is-5">
              {{ $t('install_anywhere.title') }}
            </h3>
            <p>{{ $t('install_anywhere.p1') }}</p>
            <p>{{ $t('install_anywhere.p2') }}</p>
            <nuxt-link class="button is-link" :to="localePath('/today')">
              {{ $t('cta') }}
            </nuxt-link>
          </figcaption>
        </figure>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet">
            <div class="content">
              <h2>{{ $t('bible_reading_tracker_features.title') }}</h2>
              <p>{{ $t('bible_reading_tracker_features.p1') }}</p>
              <p>{{ $t('bible_reading_tracker_features.p2') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="tile is-ancestor">
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-4">
                {{ $t('feature_facts.1.title') }}
              </h3>
              <p>{{ $t('feature_facts.1.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-4">
                {{ $t('feature_facts.2.title') }}
              </h3>
              <p>{{ $t('feature_facts.2.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-4">
                {{ $t('feature_facts.3.title') }}
              </h3>
              <p>{{ $t('feature_facts.3.fact') }}</p>
            </div>
          </div>
        </div>
        <div class="tile is-ancestor">
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-4">
                {{ $t('feature_facts.4.title') }}
              </h3>
              <p>{{ $t('feature_facts.4.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-4">
                {{ $t('feature_facts.5.title') }}
              </h3>
              <p>{{ $t('feature_facts.5.fact') }}</p>
            </div>
          </div>
        </div>
        <div class="tile is-ancestor">
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-4">
                {{ $t('feature_facts.6.title') }}
              </h3>
              <p>{{ $t('feature_facts.6.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-4">
                {{ $t('feature_facts.7.title') }}
              </h3>
              <p>{{ $t('feature_facts.7.fact') }}</p>
            </div>
          </div>
          <div class="tile is-vertical is-parent">
            <div class="tile is-child box">
              <h3 class="title is-4">
                {{ $t('feature_facts.8.title') }}
              </h3>
              <p>{{ $t('feature_facts.8.fact') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet">
            <div class="content">
              <p class="has-text-centered">
                <nuxt-link class="button is-link" :to="localePath('/today')">
                  {{ $t('cta') }}
                </nuxt-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <nuxt-link :to="localePath('/policy/terms')">
              {{ $t('links.terms') }}
            </nuxt-link>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <nuxt-link :to="localePath('/policy/privacy')">
              {{ $t('links.privacy') }}
            </nuxt-link>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import i18nConfig from '../i18n.config';

export default {
  name: 'HomePage',
  components: {
  },
  middleware: ['auth'],
  asyncData({ $auth, redirect, app }) {
    if ($auth.loggedIn) {
      const currentSetLocale = app.i18n.locale;
      return redirect(app.localePath('/today', currentSetLocale));
    }
  },
  head() {
    const siteLocales = i18nConfig.locales.map(locale => locale.code);

    // Generate hreflang links
    const hreflangLinks = siteLocales.map(locale => ({
      rel: 'alternate',
      hreflang: locale,
      href: locale === 'en' ? this.$config.siteUrl : `${this.$config.siteUrl}/${locale}`,
    }));

    // Add x-default hreflang
    hreflangLinks.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: this.$config.siteUrl,
    });

    return {
      // no title - the homepage will fall back the site title itself
      title: '',
      link: [
        { rel: 'canonical', href: this.$config.siteUrl },
        ...hreflangLinks,
      ],
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t('meta.description'),
        },
        {
          hid: 'og:title',
          name: 'og:title',
          content: this.$t('meta.title'),
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content: this.$t('meta.og_description'),
        },
        {
          hid: 'og:image',
          name: 'og:image',
          content: `${this.$config.siteUrl}/share.jpg`,
        },
      ],
      script: [
        {
          type: 'application/ld+json',
          json: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: this.$t('ld_json.name'),
            description: this.$t('ld_json.description'),
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Any',
            browserRequirements: 'Any modern web browser',
            softwareVersion: '1.0',
            url: this.$config.siteUrl,
            screenshot: [
              `${this.$config.siteUrl}/screenshots/sc7-bible-progress.jpg`,
              `${this.$config.siteUrl}/screenshots/sc12-checklist.jpg`,
              `${this.$config.siteUrl}/screenshots/sc10-notes.jpg`,
              `${this.$config.siteUrl}/screenshots/sc9-calendar.jpg`,
              `${this.$config.siteUrl}/screenshots/sc4-daily-goal.jpg`,
            ],
            offers: {
              '@type': 'Offer',
              price: 'Free',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              url: this.$config.siteUrl,
            },
          },
        },
      ],
    };
  },
  auth: 'guest',
};
</script>

<style lang="scss" scoped>

$features-breakpoint: 660px;
.feature-card {
  display: flex;
  justify-content: center;
  align-items: center;
  @media screen and (max-width: $features-breakpoint) {
    flex-direction: column;
  }
  .screenshot {
    width: 45vw;
    margin: 4rem 10vw;
    max-width: 431px;
    @media screen and (max-width: $features-breakpoint) {
      order: 2;
      margin: 0 0 4rem;
      width: 80vw;
    }
  }
  .description {
    max-width: 370px;
    p {
      margin-bottom: 1rem;
    }
    @media screen and (max-width: $features-breakpoint) {
      order: 1;
      margin-bottom: 2rem;
    }
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "meta": {
      "description": "My Bible Log ist eine kostenlose Online-Bibel-Lese-Tracker-App.",
      "title": "My Bible Log",
      "og_description": "Eine kostenlose Online-Bibel-Lese-Tracker-App."
    },
    "ld_json": {
      "name": "My Bible Log",
      "description": "Ein kostenloser Bibel-Lese-Tracker und Notizen-App."
    },
    "cta": "Loslegen",
    "hero": {
      "title": "My Bible Log",
      "subtitle": "Lies die ganze Bibel auf deine Weise"
    },
    "overview": {
      "p1": "My Bible Log ist ein kostenloser Online-Bibel-Lese-Tracker.",
      "p2": "Mit My Bible Log kannst du die ganze Bibel in deinem eigenen Tempo lesen, deinem eigenen Plan folgen. Du siehst, was du gelesen hast und wann du es gelesen hast. Du kannst ein tägliches Leseziel setzen und deinen täglichen Fortschritt sehen.",
      "p3": "Es ist kostenlos und einfach zu bedienen. Melden Sie sich einfach mit Ihrer E-Mail an oder melden Sie sich mit Google an, um zu beginnen!"
    },
    "reading_suggestions": {
      "title": "Lesevorschläge",
      "p1": "Praktische Lesevorschläge erleichtern es, etwas zum Lesen zu finden.",
      "p2": "Die vorgeschlagenen Passagen helfen Ihnen, ungelesene Kapitel basierend auf Ihren letzten Einträgen zu finden.",
      "p3": "Verwenden Sie sie, um Ihr tägliches Leseziel zu erreichen."
    },
    "daily_reading_goal": {
      "title": "Tägliches Leseziel",
      "p1": "Sie können Ihr eigenes Ziel festlegen, wie viele neue Verse Sie jeden Tag lesen möchten.",
      "p2": "Wenn Sie mindestens 86 neue Verse pro Tag lesen, werden Sie die gesamte Bibel in einem Jahr lesen."
    },
    "set_goals": {
      "title": "Ziele setzen",
      "p1": "Sie können ein Datum auswählen, an dem Sie mit dem Lesen der Bibel fertig sein möchten.",
      "p2": "My Bible Log wird rückwärts arbeiten, um zu bestimmen, wie viele Verse Sie jeden Tag lesen müssen, um Ihr Ziel zu erreichen."
    },
    "reading_calendar": {
      "title": "Leseplan",
      "p1": "Sie können alle Logbucheinträge anzeigen und bearbeiten, die Sie gemacht haben. Schauen Sie sich Ihr vergangenes Bibellesen an, um neue Einsichten über Ihre Gewohnheiten zu gewinnen.",
      "p2": "Ein goldener Stern wird an Tagen erscheinen, an denen Sie Ihr tägliches Leseziel erreicht haben.",
      "p3": "Sie können auch Ihr Lese-Log als Tabelle exportieren und importieren."
    },
    "track_book_chapter_progress": {
      "title": "Verfolgen Sie den Fortschritt der Buchkapitel",
      "p1": "Sehen Sie, welche Kapitel Sie gelesen haben, und öffnen Sie Kapitel zum Lesen in einer Bibel-App oder -Website.",
      "p2": "Verfolgen Sie Ihr Lesen ganz einfach mit der Schaltfläche \"Verfolgen\". Sie können ein Kapitel ohne Eingabe protokollieren.",
      "p3": "Kapitel, die Sie gelesen haben, werden einen goldenen Stern anzeigen."
    },
    "track_whole_bible_progress": {
      "title": "Verfolgen Sie den Fortschritt der gesamten Bibel",
      "p1": "Erhalten Sie einen Überblick über die gesamte Bibel und sehen Sie, welchen Prozentsatz jedes Buches Sie gelesen haben.",
      "p2": "Die Fortschrittsbalken zeigen Ihr Lesen vor Ort an, damit Sie erkennen können, wo Sie noch lesen müssen - in jedem Buch oder der ganzen Bibel."
    },
    "take_bible_reading_notes": {
      "title": "Bibellesenotizen machen",
      "p1": "Übernehmen Sie die Kontrolle über Ihr Bibellesen mit einer leistungsstarken und flexiblen Notizfunktion.",
      "p2": "Notieren Sie Ihre Fragen, damit Sie später darauf zurückkommen können.",
      "p3": "Erstellen Sie eine Aufzeichnung Ihres Lernens, während Sie die Schriften studieren."
    },
    "organize_notes_with_custom_tags": {
      "title": "Notizen mit individuellen Tags organisieren",
      "p1": "Definieren Sie Ihre eigenen Tags und passen Sie die Farben für eine leichte Erkennung an.",
      "p2": "Verwenden Sie Tags, um Ihre persönlichen Bibelstudien-Workflows zu unterstützen.",
      "p3": "Tags können Gedächtnisverse, offene Fragen, interessante Themen und vieles mehr identifizieren."
    },
    "track_reading_with_a_single_click": {
      "title": "Verfolge das Lesen mit einem Klick",
      "p1": "Knapp an Zeit?",
      "p2": "Markieren Sie ein Kapitel als \"gelesen\" mit einem einzigen Klick oder Tippen auf der Seite Kapitel-Checkliste.",
      "p3": "Dies erstellt einen Logbucheintrag für Sie, so dass Sie Ihr Lesen auch auf anderen Seiten anzeigen können."
    },
    "bible_facts": {
      "1": {
        "title": "1500",
        "fact": "Die ungefähre Anzahl der Jahre, über die die Bücher der Bibel geschrieben wurden."
      },
      "2": {
        "title": "40+",
        "fact": "Die Anzahl der Autoren, denen die Bücher der Bibel traditionell zugeschrieben werden."
      },
      "3": {
        "title": "365",
        "fact": "Die Anzahl der Tage, die es dauern kann, die Bibel zu lesen - oder weniger!"
      },
      "4": {
        "title": "Kostenlos",
        "fact": "Der Preis, den Sie bezahlen werden, um My Bible Log zu verwenden."
      },
      "5": {
        "title": "0",
        "fact": "Die Anzahl der Anzeigen, die Sie in My Bible Log sehen werden."
      },
      "6": {
        "title": "66",
        "fact": "Die Anzahl der Bücher in der Bibel."
      },
      "7": {
        "title": "1189",
        "fact": "Die Anzahl der Kapitel in der Bibel."
      },
      "8": {
        "title": "31,102",
        "fact": "Die Gesamtanzahl der Verse in der Bibel."
      },
      "9": {
        "title": "3.26",
        "fact": "Die durchschnittliche Anzahl der Kapitel, die Sie täglich lesen müssen, um die Bibel in einem Jahr zu lesen."
      },
      "10": {
        "title": "86",
        "fact": "Die Anzahl der Verse, die Sie täglich lesen müssen, um die Bibel in einem Jahr zu beenden."
      }
    },
    "reading_the_bible_in_a_year": {
      "title": "Lesen Sie die Bibel in einem Jahr",
      "p1": "Ein Ziel von My Bible Log ist es, mehr Menschen dazu zu bringen, die gesamte Bibel zu lesen.",
      "p2": "Die Bibel ist ein großes Buch. Technisch gesehen handelt es sich um eine Anthologie von 66 Büchern. Diese 66 Bücher wurden später in Kapitel und Verse organisiert, wobei ein Vers im Grunde genommen ein Satz ist.",
      "p3": "Es gibt 31.102 Verse in der Bibel. Das ist eine Menge zu lesen.",
      "p4": "Wenn Sie die Bibel in einem Jahr lesen möchten, müssen Sie 86 Verse pro Tag lesen. Das ist jetzt handlicher. Und wenn Sie wissen, dass einige Tage und Zeiten besser für Sie arbeiten als andere, können Sie an diesen Zeiten mehr lesen und es ausgleichen lassen. Es liegt an Ihnen.",
      "p5": "Anstatt dem Leseplan einer anderen Person zu folgen, können Sie Ihr Bibellesen aus Predigten, Kleingruppen, Leseplänen und Andachten erfassen. Alles, was Sie bereits lesen, zählt zu Ihrem Ziel. Solange Sie weiterhin neue Verse lesen, wird Ihr Lesen die gesamte Bibel umfassen. Wenn Sie durchschnittlich 86 Verse pro Tag lesen, werden Sie die Bibel in einem Jahr fertig lesen."
    },
    "install_anywhere": {
      "title": "Überall installieren",
      "p1": "My Bible Log ist eine Website, aber auch eine App. Verwenden Sie es auf Ihre Weise.",
      "p2": "Sie können My Bible Log auf Ihrem Telefon, Tablet oder Desktop-Computer installieren."
    },
    "bible_reading_tracker_features": {
      "title": "Funktionen des Bibel-Lese-Trackers",
      "p1": "Die meisten Bibel-Lesepläne sagen Ihnen, was Sie lesen sollen und wann Sie es lesen sollen. Im Gegensatz dazu geben Sie My Bible Log an, was Sie gelesen haben und wann Sie es gelesen haben. Dies ist Ihr persönlicher Bibel-Lese-Tracker. Haben Sie es auf Ihre Weise.",
      "p2": "Die Funktionen von My Bible Log sind darauf ausgelegt, schnell und einfach zu bedienen zu sein."
    },
    "feature_facts": {
      "1": {
        "title": "Fortschrittsverfolgung",
        "fact": "Sehen Sie, wie viel von der Bibel und von jedem einzelnen Buch Sie bereits gelesen haben, damit Sie sich auf das Lesen neuer Teile der Bibel konzentrieren können."
      },
      "2": {
        "title": "Tägliches Leseziel",
        "fact": "Legen Sie ein Ziel fest, wie viele Verse Sie täglich lesen möchten, und beobachten Sie, wie jeder Eintrag Sie Ihrem Ziel näher bringt."
      },
      "3": {
        "title": "Lesefunktionen",
        "fact": "Erhalten Sie Empfehlungen, was Sie als nächstes lesen sollen, um mit der Bibel weiterzumachen."
      },
      "4": {
        "title": "Soziale Anmeldung",
        "fact": "Sie müssen kein Passwort festlegen, es sei denn, Sie möchten. Melden Sie sich mit Google an, um My Bible Log jetzt zu verwenden!"
      },
      "5": {
        "title": "Keine Eingabe",
        "fact": "Protokollieren Sie Ihr Lesen ohne Tastatur. Sie können Bücher, Kapitel und Versnummern ohne Eingabe auswählen."
      },
      "6": {
        "title": "Direkte Bibelverknüpfung",
        "fact": "Sie können eine Bibel-Lese-App oder -Website direkt aus My Bible Log öffnen."
      },
      "7": {
        "title": "Export / Import",
        "fact": "Sie können Ihr Leselog als Tabelle exportieren oder eine Tabelle importieren, um schnell zu beginnen."
      },
      "8": {
        "title": "Überall installieren",
        "fact": "Sie können My Bible Log als App auf Ihrem Telefon, Tablet oder Computer installieren."
      }
    },
    "links": {
      "terms": "Nutzungsbedingungen",
      "privacy": "Datenschutzrichtlinie"
    }
  },
  "en": {
    "meta": {
      "description": "My Bible Log is a free online Bible reading tracker app.",
      "title": "My Bible Log",
      "og_description": "A free online Bible reading tracker app."
    },
    "ld_json": {
      "name": "My Bible Log",
      "description": "A free Bible reading tracker and note taker."
    },
    "cta": "Get Started",
    "hero": {
      "title": "My Bible Log",
      "subtitle": "Read the whole Bible your way"
    },
    "overview": {
      "p1": "My Bible Log is a free online Bible reading tracker.",
      "p2": "With My Bible Log, you can read the whole Bible at your own pace, following your own plan. You can see what you've read and when you read it. You can set a daily reading goal and see your progress each day.",
      "p3": "It's free and easy to use. Just sign up with your email, or sign in with Google to get started!"
    },
    "reading_suggestions": {
      "title": "Reading Suggestions",
      "p1": "Convenient reading suggestions make it easy to find something to read next.",
      "p2": "The suggested passages help you find unread chapters based on your recent log entries.",
      "p3": "Use them to reach your daily reading goal."
    },
    "daily_reading_goal": {
      "title": "Daily Reading Goal",
      "p1": "You can set your own goal of how many new verses to read each day.",
      "p2": "Reading at least 86 new verses a day means you will read the entire Bible in a year."
    },
    "set_goals": {
      "title": "Set Goals",
      "p1": "You can choose a date when you want to finish reading the Bible.",
      "p2": "My Bible Log will work backwards to determine how many verses you need to read each day to meet your goal."
    },
    "reading_calendar": {
      "title": "Reading Calendar",
      "p1": "You can view and edit any log entry you've made. Look through your past Bible reading to gain new insights on your habits.",
      "p2": "A gold star will appear on days where you met your daily reading goal.",
      "p3": "You can also export and import your reading log as a spreadsheet."
    },
    "track_book_chapter_progress": {
      "title": "Track Book Chapter Progress",
      "p1": "See which chapters you've read, and open chapters to read in a Bible app or website.",
      "p2": "Easily track your reading with the \"Track\" button. You can log a chapter without any typing.",
      "p3": "Chapters you've read will show a gold star."
    },
    "track_whole_bible_progress": {
      "title": "Track Whole Bible Progress",
      "p1": "Get a birds-eye view of the entire Bible, and see what percentage of each book you've read.",
      "p2": "The progress bars show your reading in-place, so you can tell where in each book or the whole Bible you still need to read."
    },
    "take_bible_reading_notes": {
      "title": "Take Bible Reading Notes",
      "p1": "Take charge of your Bible reading with a powerful and flexible notes feature.",
      "p2": "Write down your questions so you can come back to them later.",
      "p3": "Create a record of your learning as you study scriptures."
    },
    "organize_notes_with_custom_tags": {
      "title": "Organize Notes with Custom Tags",
      "p1": "Define your own tags and customize the colors for easy recognition.",
      "p2": "Use tags to support your personal Bible study workflows.",
      "p3": "Tags can identify memory verses, open questions, topics of interest, and much more."
    },
    "track_reading_with_a_single_click": {
      "title": "Track Reading with a Single Click",
      "p1": "Short on time?",
      "p2": "Mark a chapter as \"read\" with a single click or tap on the Chapter Checklist page.",
      "p3": "This creates a log entry for you, allowing you to view your reading on other pages as well."
    },
    "bible_facts": {
      "1": {
        "title": "1500",
        "fact": "The approximate number of years over which the books of the Bible were written."
      },
      "2": {
        "title": "40+",
        "fact": "The number of authors to whom the books of the Bible are traditionally attributed."
      },
      "3": {
        "title": "365",
        "fact": "The number of days it can take you to read the Bible - or less!"
      },
      "4": {
        "title": "Free",
        "fact": "The price you will pay to use My Bible Log."
      },
      "5": {
        "title": "0",
        "fact": "The number of ads you will see on My Bible Log."
      },
      "6": {
        "title": "66",
        "fact": "The number of books in the Bible."
      },
      "7": {
        "title": "1189",
        "fact": "The number of chapters in the Bible."
      },
      "8": {
        "title": "31,102",
        "fact": "The total number of verses in the Bible."
      },
      "9": {
        "title": "3.26",
        "fact": "The average number of chapters you need to read each day to read the Bible in a year."
      },
      "10": {
        "title": "86",
        "fact": "The number of verses you need to read each day to finish reading the Bible in a year."
      }
    },
    "reading_the_bible_in_a_year": {
      "title": "Reading the Bible in a Year",
      "p1": "One goal of My Bible Log is to help more people read the entire Bible.",
      "p2": "The Bible is a huge book. Technically, it's an anthology of 66 books. Those 66 books were later organized into chapters and verses, with a verse being basically a sentence.",
      "p3": "There are 31,102 verses in the Bible. That's a lot of reading.",
      "p4": "If you want to read the Bible in a year you need to read 86 verses a day. Now that's more manageable. And if you know that some days and times work better than others, you can read more during those times and let it all balance out. It's up to you.",
      "p5": "Instead of following someone else's reading plan, you can log your Bible reading from sermons, small groups, reading plans, and devotionals. All the reading you are already doing counts toward your goal. As long as you keep reading new verses, your reading will cover the entire Bible. If you read an average of 86 verses each day, you'll finish reading the Bible in a year."
    },
    "install_anywhere": {
      "title": "Install Anywhere",
      "p1": "My Bible Log is a website, but it is also an app. Use it your way.",
      "p2": "You can install My Bible Log on your phone, tablet, or desktop computer."
    },
    "bible_reading_tracker_features": {
      "title": "Bible Reading Tracker Features",
      "p1": "Most Bible reading plans tell you what to read and when you should read it. In contrast, you tell My Bible Log what you've read and when you read it. This is your personal Bible reading tracker. Have it your way.",
      "p2": "My Bible Log's features are designed to be quick and easy to use."
    },
    "feature_facts": {
      "1": {
        "title": "Progress Tracking",
        "fact": "See how much of the Bible and each individual book you've already read, so you can focus on reading new parts of the Bible."
      },
      "2": {
        "title": "Daily Reading Goal",
        "fact": "Set a goal of how many verses to read each day and watch each log entry move you closer to your goal."
      },
      "3": {
        "title": "Reading Suggestions",
        "fact": "Get recommendations for what to read next to keep you moving through the Bible."
      },
      "4": {
        "title": "Social Sign In",
        "fact": "No need to set a password unless you want to. Sign in with Google to start using My Bible Log now!"
      },
      "5": {
        "title": "No Typing",
        "fact": "Log your reading without a keyboard. You can choose books, chapters, and verse numbers with no typing."
      },
      "6": {
        "title": "Direct Bible Linking",
        "fact": "You can open a Bible reading app or website directly from My Bible Log."
      },
      "7": {
        "title": "Export / Import",
        "fact": "You can export your reading log as a spreadsheet, or import a spreadsheet to quickly get started."
      },
      "8": {
        "title": "Install Anywhere",
        "fact": "You can install My Bible Log as an app on your phone, tablet, or computer."
      }
    },
    "links": {
      "terms": "Terms of Service",
      "privacy": "Privacy Policy"
    }
  },
  "es": {
    "meta": {
      "description": "My Bible Log es un rastreador de lectura de la Biblia en línea gratuito.",
      "title": "My Bible Log",
      "og_description": "Rastreador de lectura de la Biblia en línea gratuito."
    },
    "ld_json": {
      "name": "My Bible Log",
      "description": "Rastreador de lectura de la Biblia y notas gratuito."
    },
    "cta": "Comenzar",
    "hero": {
      "title": "My Bible Log",
      "subtitle": "Lee toda la Biblia a tu manera"
    },
    "overview": {
      "p1": "My Bible Log es un rastreador gratuito en línea de lectura de la Biblia.",
      "p2": "Con My Bible Log, puedes leer toda la Biblia a tu propio ritmo, siguiendo tu propio plan. Puedes ver lo que has leído y cuándo lo has leído. Puedes establecer un objetivo de lectura diaria y ver tu progreso cada día.",
      "p3": "Es gratuito y fácil de usar. ¡Solo regístrate con tu correo electrónico, o inicia sesión con Google para comenzar!"
    },
    "reading_suggestions": {
      "title": "Sugerencias de Lectura",
      "p1": "Las sugerencias de lectura convenientes facilitan encontrar algo para leer a continuación.",
      "p2": "Los pasajes sugeridos te ayudan a encontrar capítulos no leídos basados en tus entradas recientes en el registro.",
      "p3": "Úsalos para alcanzar tu objetivo de lectura diaria."
    },
    "daily_reading_goal": {
      "title": "Objetivo de Lectura Diaria",
      "p1": "Puedes establecer tu propio objetivo de cuántos versículos nuevos leer cada día.",
      "p2": "Leer al menos 86 versículos nuevos al día significa que leerás toda la Biblia en un año."
    },
    "set_goals": {
      "title": "Establecer Metas",
      "p1": "Puedes elegir una fecha en la que quieras terminar de leer la Biblia.",
      "p2": "My Bible Log trabajará hacia atrás para determinar cuántos versículos debes leer cada día para alcanzar tu objetivo."
    },
    "reading_calendar": {
      "title": "Calendario de Lectura",
      "p1": "Puedes ver y editar cualquier entrada que hayas hecho en el registro. Observa tu lectura pasada de la Biblia para obtener nuevas ideas sobre tus hábitos.",
      "p2": "Aparecerá una estrella dorada en los días en los que cumpliste tu objetivo de lectura diaria.",
      "p3": "También puedes exportar e importar tu registro de lectura como una hoja de cálculo."
    },
    "track_book_chapter_progress": {
      "title": "Seguir Progreso de Libro y Capítulo",
      "p1": "Ve qué capítulos has leído y abre capítulos para leer en una aplicación o sitio web de la Biblia.",
      "p2": "Realiza un seguimiento fácil de tu lectura con el botón \"Seguir\". Puedes registrar un capítulo sin necesidad de escribir nada.",
      "p3": "Los capítulos que has leído mostrarán una estrella dorada."
    },
    "track_whole_bible_progress": {
      "title": "Seguir Progreso de Toda la Biblia",
      "p1": "Obtén una vista panorámica de toda la Biblia y ve qué porcentaje de cada libro has leído.",
      "p2": "Las barras de progreso muestran tu lectura en su lugar, para que puedas ver dónde en cada libro o en toda la Biblia aún necesitas leer."
    },
    "take_bible_reading_notes": {
      "title": "Tomar Notas de Lectura de la Biblia",
      "p1": "Toma el control de tu lectura de la Biblia con una función de notas poderosa y flexible.",
      "p2": "Escribe tus preguntas para poder volver a ellas más tarde.",
      "p3": "Crea un registro de tu aprendizaje mientras estudias las escrituras."
    },
    "organize_notes_with_custom_tags": {
      "title": "Organizar Notas con Etiquetas Personalizadas",
      "p1": "Define tus propias etiquetas y personaliza los colores para un reconocimiento fácil.",
      "p2": "Utiliza etiquetas para respaldar tus flujos de trabajo personales de estudio de la Biblia.",
      "p3": "Las etiquetas pueden identificar versículos memorables, preguntas abiertas, temas de interés y mucho más."
    },
    "track_reading_with_a_single_click": {
      "title": "Seguir Lectura con un Solo Clic",
      "p1": "¿Con poco tiempo?",
      "p2": "Marca un capítulo como \"leído\" con un solo clic o toque en la página de la Lista de Capítulos.",
      "p3": "Esto crea una entrada en el registro para que puedas ver tu lectura en otras páginas también."
    },
    "bible_facts": {
      "1": {
        "title": "1500",
        "fact": "La cantidad aproximada de años durante los cuales se escribieron los libros de la Biblia."
      },
      "2": {
        "title": "40+",
        "fact": "El número de autores a quienes se atribuyen tradicionalmente los libros de la Biblia."
      },
      "3": {
        "title": "365",
        "fact": "La cantidad de días que puedes tardar en leer la Biblia, ¡o menos!"
      },
      "4": {
        "title": "Gratis",
        "fact": "El precio que pagarás por usar My Bible Log."
      },
      "5": {
        "title": "0",
        "fact": "La cantidad de anuncios que verás en My Bible Log."
      },
      "6": {
        "title": "66",
        "fact": "La cantidad de libros en la Biblia."
      },
      "7": {
        "title": "1189",
        "fact": "La cantidad de capítulos en la Biblia."
      },
      "8": {
        "title": "31,102",
        "fact": "La cantidad total de versículos en la Biblia."
      },
      "9": {
        "title": "3.26",
        "fact": "El número promedio de capítulos que necesitas leer cada día para leer la Biblia en un año."
      },
      "10": {
        "title": "86",
        "fact": "La cantidad de versículos que necesitas leer cada día para terminar de leer la Biblia en un año."
      }
    },
    "reading_the_bible_in_a_year": {
      "title": "Leyendo la Biblia en un Año",
      "p1": "Uno de los objetivos de My Bible Log es ayudar a más personas a leer toda la Biblia.",
      "p2": "La Biblia es un libro enorme. Técnicamente, es una antología de 66 libros. Estos 66 libros se organizaron más tarde en capítulos y versículos, siendo un versículo básicamente una oración.",
      "p3": "Hay 31,102 versículos en la Biblia. Eso es mucha lectura.",
      "p4": "Si quieres leer la Biblia en un año, necesitas leer 86 versículos al día. Ahora eso es más manejable. Y si sabes que algunos días y momentos funcionan mejor que otros, puedes leer más durante esos momentos y dejar que todo se equilibre. Depende de ti.",
      "p5": "En lugar de seguir el plan de lectura de otra persona, puedes registrar tu lectura de la Biblia de sermones, grupos pequeños, planes de lectura y devocionales. Toda la lectura que ya estás haciendo cuenta para tu objetivo. Mientras sigas leyendo versículos nuevos, tu lectura cubrirá toda la Biblia. Si lees un promedio de 86 versículos cada día, terminarás de leer la Biblia en un año."
    },
    "install_anywhere": {
      "title": "Instala en Cualquier Lugar",
      "p1": "My Bible Log es un sitio web, pero también es una aplicación. Úsalo a tu manera.",
      "p2": "Puedes instalar My Bible Log en tu teléfono, tableta o computadora de escritorio."
    },
    "bible_reading_tracker_features": {
      "title": "Características del Rastreador de Lectura Bíblica",
      "p1": "La mayoría de los planes de lectura de la Biblia te dicen qué leer y cuándo leerlo. En cambio, tú le dices a My Bible Log qué has leído y cuándo lo has leído. Este es tu rastreador de lectura personal de la Biblia. Hazlo a tu manera.",
      "p2": "Las características de My Bible Log están diseñadas para ser rápidas y fáciles de usar."
    },
    "feature_facts": {
      "1": {
        "title": "Seguimiento de Progreso",
        "fact": "Observa cuánto de la Biblia y de cada libro individual ya has leído, para que puedas enfocarte en leer nuevas partes de la Biblia."
      },
      "2": {
        "title": "Objetivo de Lectura Diaria",
        "fact": "Establece un objetivo de cuántos versículos leer cada día y observa cómo cada entrada en el registro te acerca a tu objetivo."
      },
      "3": {
        "title": "Sugerencias de Lectura",
        "fact": "Recibe recomendaciones sobre qué leer a continuación para mantenerte avanzando a través de la Biblia."
      },
      "4": {
        "title": "Inicio de Sesión Social",
        "fact": "No es necesario establecer una contraseña a menos que quieras. ¡Inicia sesión con Google para empezar a usar My Bible Log ahora mismo!"
      },
      "5": {
        "title": "Sin Escribir",
        "fact": "Registra tu lectura sin teclado. Puedes elegir libros, capítulos y números de versículos sin escribir nada."
      },
      "6": {
        "title": "Enlace Directo a la Biblia",
        "fact": "Puedes abrir una aplicación o sitio web de lectura de la Biblia directamente desde My Bible Log."
      },
      "7": {
        "title": "Exportar / Importar",
        "fact": "Puedes exportar tu registro de lectura como una hoja de cálculo o importar una hoja de cálculo para empezar rápidamente."
      },
      "8": {
        "title": "Instala en Cualquier Lugar",
        "fact": "Puedes instalar My Bible Log como una aplicación en tu teléfono, tableta o computadora."
      }
    },
    "links": {
      "terms": "Términos de Servicio",
      "privacy": "Política de Privacidad"
    }
  },
  "fr": {
    "meta": {
      "description": "My Bible Log est un suivi de lecture de la Bible en ligne gratuit.",
      "title": "My Bible Log",
      "og_description": "Suivi de lecture de la Bible en ligne gratuit."
    },
    "ld_json": {
      "name": "My Bible Log",
      "description": "Suivi de lecture de la Bible et notes gratuit."
    },
    "cta": "Commencer",
    "hero": {
      "title": "My Bible Log",
      "subtitle": "Lisez toute la Bible à votre façon"
    },
    "overview": {
      "p1": "My Bible Log est un suivi de lecture de la Bible en ligne gratuit.",
      "p2": "Avec My Bible Log, vous pouvez lire toute la Bible à votre rythme, en suivant votre propre plan. Vous pouvez voir ce que vous avez lu et quand vous l'avez lu. Vous pouvez définir un objectif de lecture quotidien et suivre vos progrès chaque jour.",
      "p3": "C'est gratuit et facile à utiliser. Inscrivez-vous simplement avec votre e-mail, ou connectez-vous avec Google pour commencer!"
    },
    "reading_suggestions": {
      "title": "Suggestions de lecture",
      "p1": "Les suggestions de lecture pratiques facilitent la recherche d'une prochaine lecture.",
      "p2": "Les passages suggérés vous aident à trouver des chapitres non lus en fonction de vos entrées de journal récentes.",
      "p3": "Utilisez-les pour atteindre votre objectif de lecture quotidien."
    },
    "daily_reading_goal": {
      "title": "Objectif de lecture quotidien",
      "p1": "Vous pouvez définir votre propre objectif de lectures quotidiennes.",
      "p2": "Lire au moins 86 nouveaux versets par jour signifie que vous lirez toute la Bible en un an."
    },
    "set_goals": {
      "title": "Définir des objectifs",
      "p1": "Vous pouvez choisir une date à laquelle vous souhaitez terminer la lecture de la Bible.",
      "p2": "My Bible Log travaillera en arrière pour déterminer combien de versets vous devez lire chaque jour pour atteindre votre objectif."
    },
    "reading_calendar": {
      "title": "Calendrier de Lecture",
      "p1": "Vous pouvez consulter et modifier toutes les entrées de journal que vous avez faites. Parcourez vos lectures bibliques passées pour obtenir de nouveaux aperçus sur vos habitudes.",
      "p2": "Une étoile dorée apparaîtra les jours où vous avez atteint votre objectif de lecture quotidien.",
      "p3": "Vous pouvez également exporter et importer votre journal de lecture sous forme de feuille de calcul."
    },
    "track_book_chapter_progress": {
      "title": "Suivi de la Progression des Chapitres du Livre",
      "p1": "Voyez quels chapitres vous avez lus, et ouvrez des chapitres à lire dans une application ou un site Web biblique.",
      "p2": "Suivez facilement votre lecture avec le bouton \"Suivre\". Vous pouvez enregistrer un chapitre sans avoir à taper quoi que ce soit.",
      "p3": "Les chapitres que vous avez lus afficheront une étoile dorée."
    },
    "track_whole_bible_progress": {
      "title": "Suivi de la Progression de Toute la Bible",
      "p1": "Obtenez une vue d'ensemble de toute la Bible et voyez le pourcentage de chaque livre que vous avez lu.",
      "p2": "Les barres de progression montrent votre lecture en place, pour que vous puissiez voir où vous devez encore lire dans chaque livre ou dans toute la Bible."
    },
    "take_bible_reading_notes": {
      "title": "Prendre des notes de lecture de la Bible",
      "p1": "Prenez le contrôle de votre lecture de la Bible avec une fonctionnalité de notes puissante et flexible.",
      "p2": "Notez vos questions pour pouvoir y revenir plus tard.",
      "p3": "Créez un enregistrement de votre apprentissage pendant que vous étudiez les Écritures."
    },
    "organize_notes_with_custom_tags": {
      "title": "Organiser les notes avec des étiquettes personnalisées",
      "p1": "Définissez vos propres étiquettes et personnalisez les couleurs pour une reconnaissance facile.",
      "p2": "Utilisez des étiquettes pour soutenir vos flux de travail personnels d'étude de la Bible.",
      "p3": "Les étiquettes peuvent identifier des versets de mémoire, des questions ouvertes, des sujets d'intérêt, et bien plus encore."
    },
    "track_reading_with_a_single_click": {
      "title": "Suivre la lecture en un seul clic",
      "p1": "Vous manquez de temps?",
      "p2": "Marquez un chapitre comme \"lu\" en un seul clic ou en appuyant sur la page de la Liste des chapitres.",
      "p3": "Cela crée une entrée dans le journal pour vous, vous permettant de voir votre lecture sur d'autres pages également."
    },
    "bible_facts": {
      "1": {
        "title": "1500",
        "fact": "Le nombre approximatif d'années pendant lesquelles les livres de la Bible ont été écrits."
      },
      "2": {
        "title": "40+",
        "fact": "Le nombre d'auteurs auxquels les livres de la Bible sont traditionnellement attribués."
      },
      "3": {
        "title": "365",
        "fact": "Le nombre de jours qu'il peut vous falloir pour lire la Bible - ou moins!"
      },
      "4": {
        "title": "Gratuit",
        "fact": "Le prix que vous paierez pour utiliser My Bible Log."
      },
      "5": {
        "title": "0",
        "fact": "Le nombre de publicités que vous verrez sur My Bible Log."
      },
      "6": {
        "title": "66",
        "fact": "Le nombre de livres dans la Bible."
      },
      "7": {
        "title": "1189",
        "fact": "Le nombre de chapitres dans la Bible."
      },
      "8": {
        "title": "31,102",
        "fact": "Le nombre total de versets dans la Bible."
      },
      "9": {
        "title": "3.26",
        "fact": "Le nombre moyen de chapitres que vous devez lire chaque jour pour lire la Bible en un an."
      },
      "10": {
        "title": "86",
        "fact": "Le nombre de versets que vous devez lire chaque jour pour finir de lire la Bible en un an."
      }
    },
    "reading_the_bible_in_a_year": {
      "title": "Lire la Bible en un an",
      "p1": "Un objectif de My Bible Log est d'aider plus de personnes à lire l'intégralité de la Bible.",
      "p2": "La Bible est un énorme livre. Techniquement, c'est une anthologie de 66 livres. Ces 66 livres ont ensuite été organisés en chapitres et versets, un verset étant essentiellement une phrase.",
      "p3": "Il y a 31 102 versets dans la Bible. C'est beaucoup de lecture.",
      "p4": "Si vous voulez lire la Bible en un an, vous devez lire 86 versets par jour. Maintenant, c'est plus gérable. Et si vous savez que certains jours et moments sont plus propices que d'autres, vous pouvez lire plus à ces moments-là et tout faire équilibrer. C'est à vous de décider.",
      "p5": "Au lieu de suivre le plan de lecture de quelqu'un d'autre, vous pouvez enregistrer votre lecture biblique à partir de sermons, de petits groupes, de plans de lecture et de méditations. Toute la lecture que vous faites déjà compte pour votre objectif. Tant que vous continuez à lire de nouveaux versets, votre lecture couvrira l'intégralité de la Bible. Si vous lisez en moyenne 86 versets chaque jour, vous aurez fini de lire la Bible en un an."
    },
    "install_anywhere": {
      "title": "Installer Partout",
      "p1": "My Bible Log est un site web, mais c'est aussi une application. Utilisez-le à votre façon.",
      "p2": "Vous pouvez installer My Bible Log sur votre téléphone, tablette ou ordinateur de bureau."
    },
    "bible_reading_tracker_features": {
      "title": "Fonctionnalités du Suivi de la Lecture de la Bible",
      "p1": "La plupart des plans de lecture de la Bible vous disent quoi lire et quand le lire. En revanche, vous indiquez à My Bible Log ce que vous avez lu et quand vous l'avez lu. C'est votre suivi personnel de la lecture de la Bible. Faites-le à votre manière.",
      "p2": "Les fonctionnalités de My Bible Log sont conçues pour être rapides et faciles à utiliser."
    },
    "feature_facts": {
      "1": {
        "title": "Suivi de la Progression",
        "fact": "Voyez combien de la Bible et de chaque livre individuel vous avez déjà lu, afin de vous concentrer sur la lecture de nouvelles parties de la Bible."
      },
      "2": {
        "title": "Objectif de Lecture Quotidienne",
        "fact": "Définissez un objectif du nombre de versets à lire chaque jour et suivez chaque entrée de journal vous rapprocher de votre objectif."
      },
      "3": {
        "title": "Suggestions de lecture",
        "fact": "Obtenez des recommandations pour savoir quoi lire ensuite pour continuer à avancer dans la Bible."
      },
      "4": {
        "title": "Connexion sociale",
        "fact": "Pas besoin de définir un mot de passe sauf si vous le désirez. Connectez-vous avec Google pour commencer à utiliser My Bible Log dès maintenant !"
      },
      "5": {
        "title": "Pas de saisie",
        "fact": "Enregistrez votre lecture sans clavier. Vous pouvez sélectionner des livres, des chapitres et des numéro de versets sans avoir à taper."
      },
      "6": {
        "title": "Lien direct vers la Bible",
        "fact": "Vous pouvez ouvrir une application de lecture de la Bible ou un site web directement depuis My Bible Log."
      },
      "7": {
        "title": "Exportation / Importation",
        "fact": "Vous pouvez exporter votre journal de lecture sous forme de feuille de calcul, ou importer une feuille de calcul pour commencer rapidement."
      },
      "8": {
        "title": "Install Anywhere",
        "fact": "Vous pouvez installer My Bible Log en tant qu'application sur votre téléphone, tablette ou ordinateur."
      }
    },
    "links": {
      "terms": "Conditions d'utilisation",
      "privacy": "Politique de confidentialité"
    }
  },
  "pt": {
    "meta": {
      "description": "My Bible Log é um aplicativo gratuito de rastreamento de leitura da Bíblia online.",
      "title": "My Bible Log",
      "og_description": "Um aplicativo gratuito de rastreamento de leitura da Bíblia online."
    },
    "ld_json": {
      "name": "My Bible Log",
      "description": "Um rastreador de leitura da Bíblia e anotações gratuito."
    },
    "cta": "Começar",
    "hero": {
      "title": "My Bible Log",
      "subtitle": "Leia toda a Bíblia do seu jeito"
    },
    "overview": {
      "p1": "My Bible Log é um rastreador de leitura da Bíblia online e gratuito.",
      "p2": "Com o My Bible Log, você pode ler toda a Bíblia no seu próprio ritmo, seguindo seu próprio plano. Você pode ver o que leu e quando leu. Você pode definir uma meta de leitura diária e acompanhar seu progresso a cada dia.",
      "p3": "É gratuito e fácil de usar. Basta se inscrever com seu e-mail ou entrar com o Google para começar!"
    },
    "reading_suggestions": {
      "title": "Sugestões de Leitura",
      "p1": "Sugestões de leitura convenientes facilitam a busca pelo próximo texto a ler.",
      "p2": "Os trechos sugeridos ajudam você a encontrar capítulos não lidos com base em suas entradas recentes no registro.",
      "p3": "Use-as para alcançar sua meta diária de leitura."
    },
    "daily_reading_goal": {
      "title": "Meta de Leitura Diária",
      "p1": "Você pode definir sua própria meta de quantos novos versículos ler a cada dia.",
      "p2": "Ler pelo menos 86 versículos novos por dia significa que você lerá toda a Bíblia em um ano."
    },
    "set_goals": {
      "title": "Definir Metas",
      "p1": "Você pode escolher uma data para terminar a leitura da Bíblia.",
      "p2": "My Bible Log trabalhará inversamente para determinar quantos versículos você precisa ler por dia para atingir sua meta."
    },
    "reading_calendar": {
      "title": "Calendário de Leitura",
      "p1": "Você pode visualizar e editar qualquer entrada de log que você fez. Olhe através de sua leitura passada da Bíblia para ganhar novas percepções sobre seus hábitos.",
      "p2": "Uma estrela dourada aparecerá nos dias em que você atingiu sua meta diária de leitura.",
      "p3": "Você também pode exportar e importar seu log de leitura como uma planilha."
    },
    "track_book_chapter_progress": {
      "title": "Acompanhar Progresso do Livro Capítulo",
      "p1": "Veja quais capítulos você leu, e abra capítulos para ler em um aplicativo ou site da Bíblia.",
      "p2": "Acompanhe facilmente sua leitura com o botão \"Acompanhar\". Você pode registrar um capítulo sem digitar nada.",
      "p3": "Capítulos que você leu mostrarão uma estrela dourada."
    },
    "track_whole_bible_progress": {
      "title": "Acompanhar Progresso da Bíblia Completa",
      "p1": "Obtenha uma visão panorâmica de toda a Bíblia e veja qual a porcentagem de cada livro que você leu.",
      "p2": "As barras de progresso mostram sua leitura no local, para que você possa saber onde em cada livro ou na Bíblia inteira ainda precisa ler."
    },
    "take_bible_reading_notes": {
      "title": "Faça Anotações na Leitura da Bíblia",
      "p1": "Assuma o controle de sua leitura da Bíblia com um recurso de anotações poderoso e flexível.",
      "p2": "Anote suas perguntas para poder voltar a elas depois.",
      "p3": "Crie um registro de seu aprendizado enquanto estuda as escrituras."
    },
    "organize_notes_with_custom_tags": {
      "title": "Organize Anotações com Tags Personalizadas",
      "p1": "Defina suas próprias tags e personalize as cores para fácil reconhecimento.",
      "p2": "Use tags para apoiar seus fluxos de trabalho pessoais de estudo da Bíblia.",
      "p3": "As tags podem identificar versículos de memória, perguntas em aberto, tópicos de interesse e muito mais."
    },
    "track_reading_with_a_single_click": {
      "title": "Rastrear Leitura com um Único Clique",
      "p1": "Com pouco tempo?",
      "p2": "Marque um capítulo como \"lido\" com um único clique ou toque na página Lista de Capítulos.",
      "p3": "Isso cria um registro para você, permitindo visualizar sua leitura em outras páginas também."
    },
    "bible_facts": {
      "1": {
        "title": "1500",
        "fact": "O número aproximado de anos durante os quais os livros da Bíblia foram escritos."
      },
      "2": {
        "title": "40+",
        "fact": "O número de autores aos quais os livros da Bíblia são tradicionalmente atribuídos."
      },
      "3": {
        "title": "365",
        "fact": "O número de dias que você pode levar para ler a Bíblia - ou menos!"
      },
      "4": {
        "title": "Grátis",
        "fact": "O preço que você pagará para usar Meu Registro Bíblico."
      },
      "5": {
        "title": "0",
        "fact": "O número de anúncios que você verá no Meu Registro Bíblico."
      },
      "6": {
        "title": "66",
        "fact": "O número de livros na Bíblia."
      },
      "7": {
        "title": "1189",
        "fact": "O número de capítulos na Bíblia."
      },
      "8": {
        "title": "31,102",
        "fact": "O número total de versículos na Bíblia."
      },
      "9": {
        "title": "3.26",
        "fact": "A média de capítulos que você precisa ler todos os dias para ler a Bíblia em um ano."
      },
      "10": {
        "title": "86",
        "fact": "O número de versículos que você precisa ler todos os dias para terminar de ler a Bíblia em um ano."
      }
    },
    "reading_the_bible_in_a_year": {
      "title": "Lendo a Bíblia em um Ano",
      "p1": "Um objetivo do My Bible Log é ajudar mais pessoas a lerem a Bíblia inteira.",
      "p2": "A Bíblia é um livro grande. Tecnicamente, é uma antologia de 66 livros. Esses 66 livros foram posteriormente organizados em capítulos e versículos, sendo um versículo basicamente uma frase.",
      "p3": "Há 31.102 versículos na Bíblia. Isso é muita leitura.",
      "p4": "Se você deseja ler a Bíblia em um ano, precisa ler 86 versículos por dia. Agora isso é mais administrável. E se você souber que alguns dias e períodos funcionam melhor do que outros, você pode ler mais nesses momentos e deixar tudo se equilibrar. A escolha é sua.",
      "p5": "Em vez de seguir o plano de leitura de outra pessoa, você pode registrar sua leitura da Bíblia a partir de sermões, grupos pequenos, planos de leitura e devocionais. Toda a leitura que você já está fazendo conta para o seu objetivo. Contanto que você continue lendo novos versículos, sua leitura abrangerá toda a Bíblia. Se você ler uma média de 86 versículos por dia, terminará de ler a Bíblia em um ano."
    },
    "install_anywhere": {
      "title": "Instalar em Qualquer Lugar",
      "p1": "Meu registro da Bíblia é um site, mas também é um aplicativo. Use do seu jeito.",
      "p2": "Você pode instalar Meu registro da Bíblia no seu telefone, tablet ou computador desktop."
    },
    "bible_reading_tracker_features": {
      "title": "Recursos de Acompanhamento da Leitura da Bíblia",
      "p1": "A maioria dos planos de leitura da Bíblia dizem o que ler e quando ler. Em contraste, você diz ao Meu registro da Bíblia o que leu e quando leu. Este é o seu pessoal registro de leitura da Bíblia. Tenha do seu jeito.",
      "p2": "Os recursos do Meu registro da Bíblia são projetados para serem rápidos e fáceis de usar."
    },
    "feature_facts": {
      "1": {
        "title": "Acompanhamento de Progresso",
        "fact": "Veja quanto da Bíblia e de cada livro individual você já leu, para poder focar em ler novas partes da Bíblia."
      },
      "2": {
        "title": "Meta de Leitura Diária",
        "fact": "Defina uma meta de quantos versículos ler por dia e veja cada entrada de registro te aproximar da sua meta."
      },
      "3": {
        "title": "Sugestões de Leitura",
        "fact": "Receba recomendações para o que ler a seguir para manter você avançando pela Bíblia."
      },
      "4": {
        "title": "Login Social",
        "fact": "Não é necessário definir uma senha a menos que você queira. Faça login com o Google para começar a usar My Bible Log agora!"
      },
      "5": {
        "title": "Sem Digitar",
        "fact": "Registre sua leitura sem um teclado. Você pode escolher livros, capítulos e números de versículos sem digitar."
      },
      "6": {
        "title": "Link Direto para a Bíblia",
        "fact": "Você pode abrir um aplicativo ou site de leitura da Bíblia diretamente do My Bible Log."
      },
      "7": {
        "title": "Exportar / Importar",
        "fact": "Você pode exportar seu registro de leitura como uma planilha, ou importar uma planilha para começar rapidamente."
      },
      "8": {
        "title": "Instale em Qualquer Lugar",
        "fact": "Você pode instalar My Bible Log como um aplicativo em seu telefone, tablet ou computador."
      }
    },
    "links": {
      "terms": "Termos de Serviço",
      "privacy": "Política de Privacidade"
    }
  },
  "uk": {
    "meta": {
      "description": "My Bible Log - це безкоштовний онлайн-трекер читання Біблії.",
      "title": "My Bible Log",
      "og_description": "Безкоштовний онлайн-трекер читання Біблії."
    },
    "ld_json": {
      "name": "My Bible Log",
      "description": "Безкоштовний трекер читання Біблії та заміток."
    },
    "cta": "Почати",
    "hero": {
      "title": "My Bible Log",
      "subtitle": "Читайте Біблію у своєму ритмі"
    },
    "overview": {
      "p1": "My Bible Log (Мій Біблійний Журнал) - це безкоштовний онлайн-трекер читання Біблії.",
      "p2": "За допомогою My Bible Log ви можете прочитати Біблію у своєму темпі, слідуючи власному плану. Ви зможете побачити, що ви прочитали і коли саме. Ви можете встановити щоденну ціль читання і відслідковувати прогрес щодня.",
      "p3": "Сервіс безкоштовний та легкий у використанні. Зареєструйтесь через електронну пошту, або увійдіть за допомогою Google, щоби розпочати!"
    },
    "reading_suggestions": {
      "title": "Рекомендації для читання",
      "p1": "Зручні підказки полегшують вибір вашого наступного читання.",
      "p2": "На основі ваших останніх записів в журналі сервіс підкаже вам тексти, що були непрочитані.",
      "p3": "Використовуйте їх, щоб досягти вашої щоденної цілі читання."
    },
    "daily_reading_goal": {
      "title": "Щоденна ціль читання",
      "p1": "Ви можете поставити собі ціль, скільки нових біблійних віршів читати щодня.",
      "p2": "Читання принаймні 86 нових віршів на день означає, що ви прочитаєте всю Біблію протягом року."
    },
    "set_goals": {
      "title": "Встановлюйте цілі",
      "p1": "Ви можете поставити собі ціль щодо того, скільки нових біблійних віршів ви плануєте читати щодня.",
      "p2": "My Bible Log астоматично підрахує, скільки віршів вам потрібно читати щодня, щоби досягнути вашу мету."
    },
    "reading_calendar": {
      "title": "Календар читання",
      "p1": "Ви можете переглядати та редагувати будь-який запис у журналі. Перегляньте ваше минуле читання Біблії, щоби більше дізнатися про ваші звички.",
      "p2": "Золота зірка відмічає дні, коли вашу щоденну ціль читання виконано.",
      "p3": "Ви також можете експортувати та імпортувати свій журнал читання у форматі таблиці."
    },
    "track_book_chapter_progress": {
      "title": "Відстеження прогресу по розділам книги",
      "p1": "Перегляньте розділи, що вже прочитано та відкривайте їх у додатку або веб-сайті читання Біблії.",
      "p2": "Легко відстежуйте своє читання за допомогою кнопки \"Відстежити\". Ви можете зберегти розділ без зайвих зусиль.",
      "p3": "Розділи, що прочитано, позначено золотою зіркою."
    },
    "track_whole_bible_progress": {
      "title": "Відстеження прогресу читання Біблії",
      "p1": "Погляд \"з висоти пташиного польоту\" на усю Біблію допоможе побачити, який відсоток книг вже прочитано.",
      "p2": "Індикатор прогресу відображає ваше читання, щоби ви могли визначити, які розділи у поточній книзі або усій Біблії, вам залишилося прочитати."
    },
    "take_bible_reading_notes": {
      "title": "Робіть нотатки під час читання Біблії",
      "p1": "Здобувайте звичку нотувати думки під час читання Біблії за допомогою потужної та гнучкої функції нотаток.",
      "p2": "Запишіть свої питання, щоби повернутися до них згодом.",
      "p3": "Створюйте записи під час особистого вивчення Писання."
    },
    "organize_notes_with_custom_tags": {
      "title": "Організовуйте нотатки за допомогою тегів",
      "p1": "Визначайте власні теги та налаштовуйте кольори для легкого сприйняття.",
      "p2": "Використовуйте теги для опрацювання власних звичок та процесів з вивчення Біблії.",
      "p3": "Ви можете використовувати теги, щоб позначати пам’ятні біблійні вірші, запитання, теми, що цікавлять, тощо."
    },
    "track_reading_with_a_single_click": {
      "title": "Відстежуйте читання одним кліком",
      "p1": "Не вистачає часу?",
      "p2": "Відмітьте главу як \"прочитану\" одним кліком на сторінці перевірки розділу.",
      "p3": "Це створить запис у вашому журналі читання, який ви можете переглянути згодом."
    },
    "bible_facts": {
      "1": {
        "title": "1500",
        "fact": "Приблизна кількість років, протягом яких були написані книги Біблії."
      },
      "2": {
        "title": "40+",
        "fact": "За традицією, саме стільки авторів написали усі книги Біблії."
      },
      "3": {
        "title": "365",
        "fact": "Кількість днів, які вам можуть знадобитися, щоби прочитати Біблію - або менше!"
      },
      "4": {
        "title": "Безкоштовно",
        "fact": "Ціна, яку ви заплатите за використання Мого My Bible Log."
      },
      "5": {
        "title": "0",
        "fact": "Кількість реклами, яку ви побачите у Моєму Біблійному Журналі."
      },
      "6": {
        "title": "66",
        "fact": "Кількість книг у Біблії."
      },
      "7": {
        "title": "1189",
        "fact": "Кількість розділів в Біблії."
      },
      "8": {
        "title": "31,102",
        "fact": "Загальна кількість віршів в Біблії."
      },
      "9": {
        "title": "3.26",
        "fact": "Середня кількість розділів, які вам потрібно читати кожен день, щоб прочитати Біблію за рік."
      },
      "10": {
        "title": "86",
        "fact": "Кількість віршів, які вам потрібно читати кожен день, щоб закінчити читання Біблії за рік."
      }
    },
    "reading_the_bible_in_a_year": {
      "title": "Читання Біблії протягом року",
      "p1": "Одна з цілей Мого My Bible Log - допомогти більшій кількості людей прочитати Біблію цілком.",
      "p2": "Біблія - це досить об'ємна книга. Інакше кажучи, це ціла бібліотека з 66 різних книг. У процесі формування ці книги були впорядковані на розділи та вірші, тобто речення.",
      "p3": "У Біблії 31 102 вірші. Це досить не мало!",
      "p4": "Якщо ви хочете прочитати Біблію цілком протягом року, вам потрібно читати 86 віршів щодня. Тепер ці більш зрозуміло. Якщо ви знаєте, що деякі дні та години підходять краще, ніж інші - просто читайте у ці дні більше та наздоганяйте вашу ціль. Рухайтеся у своєму темпі.",
      "p5": "Замість того, щоб слідувати плану читання іншої людини, фіксуйте своє читання Біблії з проповідей, малих груп, планів читання та спілкування. Усе читання, яке ви вже робите, враховується в напрямку встановленої мети. Таким чином, продовжуючи читати нові вірші, ви охопите усю Біблію. Якщо ви читаєте в середньому 86 віршів щодня, ви завершите читання Біблії протягом року."
    },
    "install_anywhere": {
      "title": "Доступний для встановлення",
      "p1": "My Bible Log - це веб-сайт, але це також додаток. Використовуйте його як вам зручно.",
      "p2": "Ви можете встановити My Bible Log на свій телефон, планшет або комп'ютер."
    },
    "bible_reading_tracker_features": {
      "title": "Функції відстеження читання Біблії",
      "p1": "Більшість планів читання Біблії скеровують, що саме і коли читати. У випадку з Моїм Біблійним Журналом ви самі повідомляєте, що і коли ви прочитали. Це ваш особистий трекер читання Біблії. Читайте за власним ритмом.",
      "p2": "My Bible Log простий та легкий у використанні."
    },
    "feature_facts": {
      "1": {
        "title": "Відслідковуйте прогрес",
        "fact": "Переглядайте, скільки з Біблії та кожної окремої книги, ви вже прочитали, щоби зосередитися на читанні нових розділів Біблії."
      },
      "2": {
        "title": "Щоденна ціль читання",
        "fact": "Встановіть ціль, скільки віршів ви плануєте читати щодня, і спостерігайте за тим, як ви наближаєтеся до мети."
      },
      "3": {
        "title": "Рекомендації щодо читання",
        "fact": "Отримуйте рекомендації, що читати далі, щоби просуватися у читанні Біблії."
      },
      "4": {
        "title": "Вхід через соцмережі",
        "fact": "Не потрібно пароля, якщо ви не хочете. Увійдіть за допомогою Google, для початку користування Моїм Біблійним Журналом."
      },
      "5": {
        "title": "Без введення тексту",
        "fact": "Фіксуйте ваше читання просто. Ви можете обирати книги, розділи та номери віршів прямо з випадаючих списків, без введення тексту."
      },
      "6": {
        "title": "Пряме посилання на Біблію",
        "fact": "Ви можете відкривати додаток або веб-сайт для читання Біблії безпосередньо з Мого My Bible Log."
      },
      "7": {
        "title": "Експорт / Імпорт",
        "fact": "Ви можете експортувати ваш журнал читання у вигляді таблиці або імпортувати таблицю для швидкого початку."
      },
      "8": {
        "title": "Встановлення скрізь",
        "fact": "Ви можете встановити My Bible Log, як додаток на свій телефон, планшет або комп'ютер."
      }
    },
    "links": {
      "terms": "Умови надання послуг",
      "privacy": "Політика конфіденційності"
    }
  }
}
</i18n>
