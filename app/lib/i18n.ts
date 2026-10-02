import { definitions, type Content, type Field } from './website-schema';
import type { Research } from './research';

export type Locale = 'en' | 'fr' | 'it';
export const languages: { code: Locale; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'it', label: 'Italiano', short: 'IT' },
];

export function parseLocale(value: unknown): Locale {
  return value === 'fr' || value === 'it' ? value : 'en';
}

export function localeFromParams(params: Record<string, string | string[] | undefined>): Locale {
  return parseLocale(params.lang);
}

// Editorially reviewed translations of the built-in interface and default copy.
// Custom editorial content uses the per-field translations saved in the desk.
const copy: Record<string, [string, string]> = {
  'Skip to content': ['Aller au contenu', 'Vai al contenuto'],
  'Research': ['Publications', 'Pubblicazioni'],
  'Services': ['Services', 'Servizi'],
  'About': ['À propos', 'Chi siamo'],
  'Contact': ['Contact', 'Contatti'],
  'Resources': ['Ressources', 'Risorse'],
  'Research updates': ['Actualités de recherche', 'Aggiornamenti di ricerca'],
  'Research updates — Heuresis Capital': ['Actualités de recherche — Heuresis Capital', 'Aggiornamenti di ricerca — Heuresis Capital'],
  'Explore': ['Explorer', 'Esplora'],
  'Stay in the conversation': ['Restons en contact', 'Restiamo in contatto'],
  'Follow Heuresis': ['Suivre Heuresis', 'Segui Heuresis'],
  'Team sign in': ['Accès équipe', 'Accesso del team'],
  'Capital markets research': ['Recherche sur les marchés de capitaux', 'Ricerca sui mercati dei capitali'],
  'Privacy': ['Confidentialité', 'Privacy'],
  'Terms': ['Conditions', 'Termini'],
  'Research disclosures': ['Informations sur la recherche', 'Informative sulla ricerca'],
  'Explore publications': ['Explorer les publications', 'Esplora le pubblicazioni'],
  'Discuss your research needs': ['Discuter de vos besoins en recherche', 'Parliamo delle tue esigenze di ricerca'],
  'Perspective. Evidence. Understanding.': ['Perspective. Preuves. Compréhension.', 'Prospettiva. Evidenza. Comprensione.'],
  'A clearer view of capital markets.': ['Une vision plus claire des marchés de capitaux.', 'Una visione più chiara dei mercati dei capitali.'],
  'Company fundamentals. Economic forces. Structural change. Heuresis Capital brings them into focus through careful research and clear thinking.': ['Fondamentaux des entreprises. Forces économiques. Changements structurels. Heuresis Capital les éclaire par une recherche rigoureuse et une réflexion claire.', 'Fondamentali aziendali. Forze economiche. Cambiamenti strutturali. Heuresis Capital li mette a fuoco con ricerca rigorosa e pensiero chiaro.'],
  'The Heuresis perspective': ['La perspective Heuresis', 'La prospettiva Heuresis'],
  'Good questions. Considered answers.': ['De bonnes questions. Des réponses réfléchies.', 'Buone domande. Risposte ponderate.'],
  'Our first publications are in preparation. Discover the thinking behind Heuresis.': ['Nos premières publications sont en préparation. Découvrez la démarche de Heuresis.', 'Le nostre prime pubblicazioni sono in preparazione. Scopri il pensiero di Heuresis.'],
  'Our approach': ['Notre approche', 'Il nostro approccio'],
  'Ideas worth examining': ['Des idées à examiner', 'Idee da esaminare'],
  'Latest research': ['Dernières publications', 'Ultime pubblicazioni'],
  'The first chapter is taking shape.': ['Le premier chapitre prend forme.', 'Il primo capitolo sta prendendo forma.'],
  'Our first research publications will appear here. In the meantime, explore our purpose.': ['Nos premières publications paraîtront ici. En attendant, découvrez notre raison d’être.', 'Le nostre prime pubblicazioni appariranno qui. Nel frattempo, scopri il nostro obiettivo.'],
  'A question of your own?': ['Une question à explorer ?', 'Hai una domanda da approfondire?'],
  'Research shaped around what you need to understand.': ['Une recherche adaptée à ce que vous souhaitez comprendre.', 'Una ricerca pensata per ciò che desideri comprendere.'],
  'From company fundamentals to a sector’s changing economics, a well-defined question is the starting point for bespoke research.': ['Des fondamentaux d’une entreprise à l’évolution d’un secteur, une question bien définie est le point de départ d’une recherche sur mesure.', 'Dai fondamentali di un’azienda all’evoluzione di un settore, una domanda ben definita è il punto di partenza di una ricerca su misura.'],
  'Discuss a research project': ['Discuter d’un projet de recherche', 'Parliamo di un progetto di ricerca'],
  'View all research': ['Voir toutes les publications', 'Vedi tutte le pubblicazioni'],
  'About Heuresis': ['À propos de Heuresis', 'Chi è Heuresis'],
  'Research & ideas': ['Recherche et idées', 'Ricerca e idee'],
  'In focus': ['À la une', 'In primo piano'],
  'Research perspective': ['Perspective de recherche', 'Prospettiva di ricerca'],
  'Read the perspective': ['Lire l’analyse', 'Leggi l’analisi'],
  'Connecting the picture': ['Relier les perspectives', 'Collegare le prospettive'],
  'Research across the market': ['Recherche sur l’ensemble du marché', 'Ricerca su tutto il mercato'],
  'Explore our research areas.': ['Explorez nos domaines de recherche.', 'Esplora le nostre aree di ricerca.'],
  'The way we think': ['Notre manière de penser', 'Il nostro modo di pensare'],
  'Make the reasoning visible.': ['Rendre le raisonnement visible.', 'Rendere visibile il ragionamento.'],
  'Stay close to the thinking': ['Suivez notre réflexion', 'Segui il nostro pensiero'],
  'The Heuresis Brief': ['La lettre Heuresis', 'Il bollettino Heuresis'],
  'Research and market perspectives, sent when there is something worth sharing.': ['Des analyses et perspectives de marché, envoyées lorsque nous avons quelque chose d’utile à partager.', 'Analisi e prospettive di mercato, inviate quando abbiamo qualcosa di utile da condividere.'],
  'Be part of the conversation.': ['Prenez part à la conversation.', 'Partecipa alla conversazione.'],
  'Email us to express your interest in future research updates.': ['Écrivez-nous pour recevoir nos prochaines actualités de recherche.', 'Scrivici per ricevere i prossimi aggiornamenti di ricerca.'],
  'Request updates by email': ['Demander des actualités par e-mail', 'Richiedi aggiornamenti via email'],
  'Opens your email app. This is a request, not an automatic subscription.': ['Ouvre votre messagerie. Il s’agit d’une demande, sans abonnement automatique.', 'Apre il tuo programma di posta. È una richiesta, non un’iscrizione automatica.'],
  'Privacy notice': ['Avis de confidentialité', 'Informativa sulla privacy'],
  'Considered perspectives on companies, economies and market themes.': ['Des perspectives réfléchies sur les entreprises, les économies et les thèmes de marché.', 'Prospettive ragionate su aziende, economie e temi di mercato.'],
  'About Heuresis Capital': ['À propos de Heuresis Capital', 'Chi è Heuresis Capital'],
  'A considered perspective. A clearer understanding.': ['Une perspective réfléchie. Une compréhension plus claire.', 'Una prospettiva ponderata. Una comprensione più chiara.'],
  'Heuresis Capital is a new capital markets research firm founded by a group of friends.': ['Heuresis Capital est une nouvelle société de recherche sur les marchés de capitaux fondée par un groupe d’amis.', 'Heuresis Capital è una nuova società di ricerca sui mercati dei capitali fondata da un gruppo di amici.'],
  'Good research gives a question the attention it deserves.': ['Une bonne recherche accorde à chaque question l’attention qu’elle mérite.', 'Una buona ricerca dedica a ogni domanda l’attenzione che merita.'],
  'Our purpose is to make companies, economies and market themes easier to understand through careful analysis and clear writing.': ['Notre objectif est de rendre les entreprises, les économies et les thèmes de marché plus compréhensibles grâce à une analyse rigoureuse et une rédaction claire.', 'Il nostro obiettivo è rendere più comprensibili aziende, economie e temi di mercato attraverso analisi rigorose e una scrittura chiara.'],
  'We are building a research publication and a place to begin conversations about specific analytical questions.': ['Nous créons une publication de recherche et un espace de dialogue autour de questions d’analyse précises.', 'Stiamo creando una pubblicazione di ricerca e uno spazio di confronto su domande analitiche specifiche.'],
  'Our people': ['Notre équipe', 'Le nostre persone'],
  'The team': ['L’équipe', 'Il team'],
  'Profile': ['Profil', 'Profilo'],
  'Our team profiles will appear here once published.': ['Les profils de notre équipe apparaîtront ici après publication.', 'I profili del nostro team appariranno qui dopo la pubblicazione.'],
  'The research library': ['La bibliothèque de recherche', 'La raccolta di ricerca'],
  'Explore the thinking.': ['Explorez nos analyses.', 'Esplora le nostre analisi.'],
  'Perspectives that look beneath the headline. Find a question, follow the evidence, form a clearer view.': ['Des analyses qui vont au-delà des titres. Posez une question, suivez les preuves et formez-vous une vision plus claire.', 'Analisi che vanno oltre i titoli. Trova una domanda, segui le prove e costruisci una visione più chiara.'],
  'Our first publications are in preparation.': ['Nos premières publications sont en préparation.', 'Le nostre prime pubblicazioni sono in preparazione.'],
  'Explore the purpose behind Heuresis while we prepare our first research.': ['Découvrez la raison d’être de Heuresis pendant que nous préparons nos premières analyses.', 'Scopri l’obiettivo di Heuresis mentre prepariamo le nostre prime analisi.'],
  'Research capabilities': ['Domaines de recherche', 'Ambiti di ricerca'],
  'Start with the question. Build the understanding.': ['Partir de la question. Construire la compréhension.', 'Partire dalla domanda. Costruire la comprensione.'],
  'Focused research around the businesses, economic forces and market themes that matter to a decision.': ['Une recherche ciblée sur les entreprises, les forces économiques et les thèmes de marché qui comptent pour une décision.', 'Ricerca mirata su aziende, forze economiche e temi di mercato rilevanti per una decisione.'],
  'Our research scope is being prepared.': ['Notre offre de recherche est en préparation.', 'La nostra offerta di ricerca è in preparazione.'],
  'Confirmed capabilities will be shared here when available.': ['Nos domaines d’expertise confirmés seront présentés ici dès qu’ils seront disponibles.', 'Le competenze confermate saranno presentate qui quando disponibili.'],
  'Begin a conversation': ['Entamons la conversation', 'Iniziamo una conversazione'],
  'What would you like to understand?': ['Que souhaitez-vous comprendre ?', 'Cosa vorresti comprendere?'],
  'Share the question behind your research needs. A focused conversation is a useful place to begin.': ['Partagez la question à l’origine de vos besoins en recherche. Une conversation ciblée est un bon point de départ.', 'Condividi la domanda alla base delle tue esigenze di ricerca. Una conversazione mirata è un buon punto di partenza.'],
  'A little context goes a long way.': ['Quelques précisions font toute la différence.', 'Un po’ di contesto fa la differenza.'],
  'For a bespoke research discussion, it helps to consider:': ['Pour discuter d’une recherche sur mesure, pensez à préciser :', 'Per discutere una ricerca su misura, è utile considerare:'],
  'The analytical question or decision.': ['La question analytique ou la décision à prendre.', 'La domanda analitica o la decisione da prendere.'],
  'The companies, sector or market involved.': ['Les entreprises, le secteur ou le marché concernés.', 'Le aziende, il settore o il mercato coinvolti.'],
  'How you intend to use the research.': ['L’utilisation envisagée de la recherche.', 'Come intendi utilizzare la ricerca.'],
  'Any timing or scope constraints.': ['Les contraintes de calendrier ou de périmètre.', 'Eventuali vincoli di tempo o di ambito.'],
  'Start with your question.': ['Commencez par votre question.', 'Inizia dalla tua domanda.'],
  'Prepare your message below, then open it in your email app to review and send.': ['Rédigez votre message ci-dessous, puis ouvrez-le dans votre messagerie pour le relire et l’envoyer.', 'Prepara il messaggio qui sotto, poi aprilo nel tuo programma di posta per rivederlo e inviarlo.'],
  'Contact Heuresis Capital': ['Contacter Heuresis Capital', 'Contatta Heuresis Capital'],
  'Prefer to write directly? Send your question to our team.': ['Vous préférez écrire directement ? Envoyez votre question à notre équipe.', 'Preferisci scrivere direttamente? Invia la tua domanda al nostro team.'],
  'Supporting materials': ['Documents complémentaires', 'Materiali di supporto'],
  'Documents & resources': ['Documents et ressources', 'Documenti e risorse'],
  'Download research materials and reference documents.': ['Téléchargez des documents de recherche et de référence.', 'Scarica materiali di ricerca e documenti di riferimento.'],
  'Download document': ['Télécharger le document', 'Scarica il documento'],
  'No documents currently published.': ['Aucun document publié pour le moment.', 'Nessun documento pubblicato al momento.'],
  'Published materials and reports will be made available here.': ['Les documents et rapports publiés seront disponibles ici.', 'I materiali e i rapporti pubblicati saranno disponibili qui.'],
  'Search research': ['Rechercher des publications', 'Cerca nelle pubblicazioni'],
  'Title, topic or company': ['Titre, sujet ou entreprise', 'Titolo, tema o azienda'],
  'Research type': ['Type de recherche', 'Tipo di ricerca'],
  'All research': ['Toutes les publications', 'Tutte le pubblicazioni'],
  'Topic': ['Sujet', 'Tema'],
  'All topics': ['Tous les sujets', 'Tutti i temi'],
  'Reset filters': ['Réinitialiser les filtres', 'Reimposta i filtri'],
  'Newest first': ['Plus récentes d’abord', 'Più recenti prima'],
  'A different question may find more.': ['Une autre recherche pourrait donner plus de résultats.', 'Una ricerca diversa potrebbe trovare di più.'],
  'Try another keyword or broaden your filters.': ['Essayez un autre mot-clé ou élargissez vos filtres.', 'Prova un’altra parola chiave o amplia i filtri.'],
  'Clear search and filters': ['Effacer la recherche et les filtres', 'Cancella ricerca e filtri'],
  'Load more research': ['Charger d’autres publications', 'Carica altre pubblicazioni'],
  'Research library': ['Bibliothèque de recherche', 'Raccolta di ricerca'],
  'In this perspective': ['Dans cette analyse', 'In questa analisi'],
  'Sources & disclosures': ['Sources et informations', 'Fonti e informative'],
  'Sources, methodology & disclosures': ['Sources, méthodologie et informations', 'Fonti, metodologia e informative'],
  'Three key takeaways': ['Trois points essentiels', 'Tre punti chiave'],
  'Continue exploring': ['Poursuivre l’exploration', 'Continua a esplorare'],
  'Download report PDF': ['Télécharger le rapport PDF', 'Scarica il rapporto PDF'],
  'Read the research disclosures': ['Lire les informations sur la recherche', 'Leggi le informative sulla ricerca'],
  'Copy link': ['Copier le lien', 'Copia il link'],
  'Link copied': ['Lien copié', 'Link copiato'],
  'Copy the address from your browser': ['Copiez l’adresse depuis votre navigateur', 'Copia l’indirizzo dal browser'],
  'Print article': ['Imprimer l’article', 'Stampa l’articolo'],
  'Illustrative sample': ['Exemple illustratif', 'Esempio illustrativo'],
  'Sample': ['Exemple', 'Esempio'],
  'min read': ['min de lecture', 'min di lettura'],
  'Updated': ['Mis à jour le', 'Aggiornato il'],
  'This publication is currently available in English only.': ['Cette publication est actuellement disponible uniquement en anglais.', 'Questa pubblicazione è attualmente disponibile solo in inglese.'],
  'Article contents': ['Sommaire de l’article', 'Indice dell’articolo'],
  'Explore our approach': ['Explorer notre approche', 'Esplora il nostro approccio'],
  'Methodology and research disclosures': ['Méthodologie et informations sur la recherche', 'Metodologia e informative sulla ricerca'],
  'Discuss this research': ['Discuter de cette recherche', 'Parliamo di questa ricerca'],
  'Possible output': ['Livrable possible', 'Possibile risultato'],
  'Intended audience': ['Public concerné', 'Destinatari'],
  'Bespoke research': ['Recherche sur mesure', 'Ricerca su misura'],
  'A scope agreed together.': ['Un périmètre défini ensemble.', 'Un ambito definito insieme.'],
  'Initial discussion': ['Premier échange', 'Discussione iniziale'],
  'Understand your question, context and intended use.': ['Comprendre votre question, son contexte et l’usage prévu.', 'Comprendere la tua domanda, il contesto e l’uso previsto.'],
  'Agreed scope': ['Périmètre convenu', 'Ambito concordato'],
  'Conduct research': ['Mener la recherche', 'Svolgere la ricerca'],
  'Agree the coverage, format, sources and practical constraints.': ['Définir la couverture, le format, les sources et les contraintes pratiques.', 'Definire copertura, formato, fonti e vincoli pratici.'],
  'Examine the evidence and test the key assumptions.': ['Examiner les données et tester les principales hypothèses.', 'Esaminare le evidenze e verificare le ipotesi principali.'],
  'Delivery': ['Remise de l’analyse', 'Consegna'],
  'Present the analysis and explain its limitations.': ['Présenter l’analyse et en expliquer les limites.', 'Presentare l’analisi e spiegarne i limiti.'],
  'Frame the question': ['Formuler la question', 'Definire la domanda'],
  'Define the decision, the context and what needs to be understood.': ['Définir la décision, le contexte et ce qu’il faut comprendre.', 'Definire la decisione, il contesto e ciò che occorre comprendere.'],
  'Examine the evidence': ['Examiner les preuves', 'Esaminare le evidenze'],
  'Look closely at sources, comparability and the gaps in the data.': ['Étudier les sources, la comparabilité et les lacunes des données.', 'Esaminare fonti, comparabilità e lacune nei dati.'],
  'Test the assumptions': ['Tester les hypothèses', 'Verificare le ipotesi'],
  'Explore scenarios and the evidence that could change the view.': ['Explorer les scénarios et les éléments susceptibles de modifier l’analyse.', 'Esplorare scenari ed evidenze che potrebbero cambiare la valutazione.'],
  'Explain the implications': ['Expliquer les implications', 'Spiegare le implicazioni'],
  'Make the reasoning, uncertainty and conclusions clear.': ['Clarifier le raisonnement, les incertitudes et les conclusions.', 'Chiarire il ragionamento, le incertezze e le conclusioni.'],
  'result': ['résultat', 'risultato'],
  'results': ['résultats', 'risultati'],
  'Showing': ['Affichage de', 'Visualizzati'],
  'Illustrative preview order': ['Ordre de l’aperçu illustratif', 'Ordine dell’anteprima illustrativa'],
  'General enquiry': ['Demande générale', 'Richiesta generale'],
  'Research access': ['Accès à la recherche', 'Accesso alla ricerca'],
  'Name': ['Nom', 'Nome'],
  'Email address': ['Adresse e-mail', 'Indirizzo email'],
  'Organisation': ['Organisation', 'Organizzazione'],
  '(optional)': ['(facultatif)', '(facoltativo)'],
  'Enquiry type': ['Type de demande', 'Tipo di richiesta'],
  'Research topic': ['Sujet de recherche', 'Tema di ricerca'],
  'Geography': ['Zone géographique', 'Area geografica'],
  'Desired timing': ['Échéance souhaitée', 'Tempistica desiderata'],
  'Your message': ['Votre message', 'Il tuo messaggio'],
  'Tell us about the question, its context and what you need to understand.': ['Décrivez votre question, son contexte et ce que vous souhaitez comprendre.', 'Descrivi la tua domanda, il contesto e ciò che desideri comprendere.'],
  'Your details stay on this page until you choose to send the email. An enquiry does not subscribe you to marketing.': ['Vos coordonnées restent sur cette page jusqu’à l’envoi de l’e-mail. Une demande ne vous inscrit pas à des communications commerciales.', 'I tuoi dati restano su questa pagina finché non scegli di inviare l’email. Una richiesta non comporta l’iscrizione a comunicazioni promozionali.'],
  'Prepare email': ['Préparer l’e-mail', 'Prepara l’email'],
  'Your email draft is ready': ['Votre brouillon d’e-mail est prêt', 'La bozza dell’email è pronta'],
  'To:': ['À :', 'A:'],
  'Open email app': ['Ouvrir la messagerie', 'Apri l’app email'],
  'Nothing has been sent yet. Review and send in your email app, or copy this message into your webmail.': ['Rien n’a encore été envoyé. Relisez et envoyez le message depuis votre messagerie, ou copiez-le dans votre webmail.', 'Non è stato ancora inviato nulla. Rivedi e invia il messaggio dalla tua app email, oppure copialo nella tua webmail.'],
  'Hello Heuresis Capital,': ['Bonjour Heuresis Capital,', 'Buongiorno Heuresis Capital,'],
  'Name:': ['Nom :', 'Nome:'],
  'Email:': ['E-mail :', 'Email:'],
  'Organisation:': ['Organisation :', 'Organizzazione:'],
  'Research topic:': ['Sujet de recherche :', 'Tema di ricerca:'],
  'Geography:': ['Zone géographique :', 'Area geografica:'],
  'Desired timing:': ['Échéance souhaitée :', 'Tempistica desiderata:'],
  'Hello Heuresis Capital,\r\n\r\nPlease let me know when your research updates are available.': ['Bonjour Heuresis Capital,\r\n\r\nMerci de me prévenir lorsque vos actualités de recherche seront disponibles.', 'Buongiorno Heuresis Capital,\r\n\r\nVi prego di avvisarmi quando saranno disponibili i vostri aggiornamenti di ricerca.'],
  'Website information': ['Informations du site', 'Informazioni del sito'],
  'Draft · Review required': ['Brouillon · Révision requise', 'Bozza · Revisione necessaria'],
  'Equities': ['Actions', 'Azioni'],
  'Macro & Strategy': ['Macroéconomie et stratégie', 'Macroeconomia e strategia'],
  'Fixed Income': ['Obligations', 'Reddito fisso'],
  'Sectors & Themes': ['Secteurs et thèmes', 'Settori e temi'],
  'Bespoke': ['Sur mesure', 'Su misura'],
  'Page not found': ['Page introuvable', 'Pagina non trovata'],
  'A different direction.': ['Une autre direction.', 'Un’altra direzione.'],
  'The page may be unpublished or the address may have changed.': ['La page n’est peut-être pas publiée ou son adresse a changé.', 'La pagina potrebbe non essere pubblicata oppure l’indirizzo è cambiato.'],
};

export function t(locale: Locale, english: string): string {
  if (locale === 'en') return english;
  return (copy[english] || copy[english.replace(/\s+/g, ' ').trim()])?.[locale === 'fr' ? 0 : 1] || english;
}

export function localizeWebsite(data: Record<string, Content>, locale: Locale): Record<string, Content> {
  if (locale === 'en') return data;
  const translate = (source: Content, fields: Field[]): Content => {
    const result: Content = { ...source };
    for (const field of fields) {
      const current = source[field.key];
      if (field.type === 'list' && Array.isArray(current)) {
        result[field.key] = current.map((item) => translate(item, field.fields || []));
      } else if ((field.type === 'text' || field.type === 'textarea') && typeof current === 'string') {
        const editorial = source[`${field.key}_${locale}`];
        result[field.key] = typeof editorial === 'string' && editorial.trim() ? editorial.trim() : t(locale, current);
      }
    }
    return result;
  };
  return Object.fromEntries(Object.entries(data).map(([key, section]) => [key, definitions[key] ? translate(section, definitions[key].fields) : section]));
}

export function hasResearchTranslation(report: Research, locale: Locale): boolean {
  if (locale === 'en') return true;
  const edition = report.translations?.[locale];
  return !!edition?.title?.trim() && !!edition.summary?.trim() && !!edition.disclosures?.trim()
    && edition.takeaways?.length === report.takeaways.length && edition.takeaways.every((x) => !!x.trim())
    && edition.sections?.length === report.sections.length
    && edition.sections.every((s, i) => !!s.title.trim() && s.paragraphs.length === report.sections[i].paragraphs.length && s.paragraphs.every((p) => !!p.trim()));
}

export function localizeResearch(report: Research, locale: Locale): Research {
  if (!hasResearchTranslation(report, locale) || locale === 'en') return report;
  const edition = report.translations![locale]!;
  return { ...report, title: edition.title, summary: edition.summary, takeaways: edition.takeaways,
    sections: report.sections.map((section, i) => ({ ...section, title: edition.sections[i].title, paragraphs: edition.sections[i].paragraphs })),
    disclosures: edition.disclosures };
}
