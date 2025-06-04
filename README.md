# Puttable

Eine Webseite zur Verwaltung von Minigolf-Turnieren.

## Über die Webseite

Puttable ist eine Anwendung zur Organisation und Durchführung von Minigolf-Turnieren. Die Webseite bietet folgende Funktionen:

- Verwaltung von Spielern und deren Bewertungsklassen
- Erstellung und Konfiguration von Turnieren
- Erfassung von Spielergebnissen in Echtzeit
- Anzeige einer Rangliste mit Ergebnissen
- Verwaltung von Scorecards für jeden Spieler

## Lokale Entwicklungsumgebung

### Voraussetzungen

- Docker und Docker Compose installiert
- Git zur Versionskontrolle
- npm > v20.11

### Entwicklungscontainer starten

Um die lokale Entwicklungsumgebung zu starten, führe folgenden Befehl im Projektverzeichnis aus:

```shell
# supabase starten
npx supabase start

# Starte die Container
docker compose up -d
```

Nach dem Start sind folgende Dienste verfügbar:

- **Puttable Anwendung**: http://localhost:5173
- **Keycloak Admin**: http://localhost:8080 (Zugangsdaten: admin/admin)
- **Supabase Studio**: http://localhost:54323

### Entwicklung

Die Anwendung verwendet:
- SvelteKit als Frontend-Framework
- Supabase für Datenbank und Authentifizierung
- Keycloak für die Benutzerverwaltung
- Tailwind CSS für das Styling
- Component Library Flowbite Svelte

## Terminologie

### Spieler (Player)

Ein Spieler ist eine Person, die Minigolf spielt. Ein Spieler hat einen Namen und eine Bewertungsklasse.
Ein Spieler wird erstellt, indem er zu einem Turnier hinzugefügt wird. Für nachfolgende Turniere kann ein Spieler über ein Dropdown-Menü ausgewählt werden.

### Turnier (Tournament)

Ein Turnier ist eine Veranstaltung, bei der die Ergebnisse für jeden Spieler registriert werden.
Das Turnier verfügt über eine Rangliste, die die erzielten Ergebnisse für jeden Spieler nach bestimmten Kriterien sortiert anzeigt.
Ein Turnier kann so konfiguriert werden, dass eine Mindestzahl von Spielern pro Session erforderlich ist.
Die Anzahl der zu spielenden Bahnen ist konfigurierbar.

### Scorekarte (Scorecard)

Eine Scorekarte enthält die erzielten Ergebnisse für jede Bahn für einen einzelnen Benutzer. Die Scorekarte kann während einer aktiven Session geändert werden.

### Ergebnis (Score)

Ein Ergebnis ist die Anzahl der Versuche, die ein Spieler benötigt hat, um eine Bahn zu absolvieren.

### Session

Ein oder mehrere Spieler können gemeinsam in einer Session spielen. Jedem Spieler wird eine Scorekarte für die jeweilige Session zugewiesen.
Die Session bleibt aktiv, bis sie eingereicht wird. Nur eingereichte Sessions werden auf der Rangliste angezeigt.
