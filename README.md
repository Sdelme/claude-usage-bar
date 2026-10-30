# usage-bar

Une barre affichée au-dessus de la zone de saisie de Claude, qui montre en permanence le pourcentage utilisé sur la fenêtre de 5 heures et sur la fenêtre de 7 jours, le temps restant avant chaque remise à zéro, et le remplissage du contexte de la conversation. Une notification apparaît quand une fenêtre passe 80 % puis 90 %. Les chiffres se mettent à jour après chaque réponse de Claude.

## Installation

Dans l'app Claude (bureau) : clique sur **+** à côté de la zone de saisie, puis **Plugins**, **Add marketplace** avec `Sdelme/claude-usage-bar`, puis **Add plugin** et choisis `usage-bar`.

Dans un terminal, à l'invite de Claude Code :

```
/plugin install usage-bar --marketplace Sdelme/claude-usage-bar
```

Depuis un shell :

```
claude plugin install usage-bar --marketplace Sdelme/claude-usage-bar
```

Réponds `y` pour ajouter le marketplace, puis choisis la portée (user).

## Licence

MIT
