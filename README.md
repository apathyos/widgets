# apathyos widgets

**Desktop shell UI implementation for the apathyos desktop environment.**

`apathyos-widgets` provides the presentation, composition, and integration layer
for desktop-facing UI surfaces in apathyos. The project is built with GTK, AGS,
TypeScript, and an adapted Feature-Sliced Design architecture.

![TypeScript](https://img.shields.io/badge/TypeScript-UI%20runtime-3178C6?logo=typescript\&logoColor=white)
![GTK4](https://img.shields.io/badge/GTK4-shell%20UI-4A86CF)
![AGS](https://img.shields.io/badge/AGS-GTK%20shell-7C3AED)
![Feature-Sliced Design](https://img.shields.io/badge/architecture-Feature--Sliced%20Design-F2F2F2)
![Nix](https://img.shields.io/badge/Nix-flake-5277C3?logo=nixos\&logoColor=white)
![License](https://img.shields.io/badge/license-GPL%203.0-lightgrey)

</div>

---



## Project scope

`apathyos-widgets` is the frontend shell layer of the **apathyos** desktop
environment.

The repository contains the runtime modules, shell-level UI composition,
feature slices, shared primitives, styling, and integration boundaries required
to build the visible desktop interface.

The project focuses on:

* desktop shell surface composition;
* user-facing system controls;
* status and feedback presentation;
* desktop state visualization;
* notification and interaction flows;
* integration with apathyos system services;
* reproducible packaging through Nix.

The codebase is structured around apathyos-specific shell runtime concerns:
module startup, shell surface composition, feature-level decomposition, shared
UI primitives, and IPC/RPC integration with desktop services.

---

## Architecture

The project uses an adapted **Feature-Sliced Design** methodology for desktop
shell UI development.

The codebase is organized by responsibility and scope of influence rather than
by file type alone. Higher-level shell modules compose larger UI surfaces, while
feature slices encapsulate focused desktop capabilities. Shared code is kept
separate from product-specific behavior, and system communication is isolated
behind explicit integration layers.

### Architectural layers

```text id="01jfc8"
App
└── Runtime modules
    └── Shell surfaces
        └── Widgets
            └── Features
                └── Shared primitives / integration utilities
```

### Layer responsibilities

| Layer         | Responsibility                                               |
| ------------- | ------------------------------------------------------------ |
| `App`         | Application startup, global setup, stylesheet loading        |
| `modules`     | Runtime entry points for shell-level UI surfaces             |
| `components`  | Large desktop shell surfaces and composition roots           |
| `widgets`     | Composable UI blocks used inside shell surfaces              |
| `features`    | User-facing desktop capabilities with local UI and logic     |
| `shared`      | Reusable primitives, helpers, types, and low-level utilities |
| `ipc` / `rpc` | Communication contracts and adapters for system integration  |

This structure keeps desktop functionality grouped by product meaning while
preserving clear dependency boundaries between runtime, composition, features,
shared primitives, and system integration code.

---

## Design principles

### Feature-oriented decomposition

Desktop capabilities are represented as feature slices. Each feature can contain
its own presentation, local state, hooks, helpers, and integration logic when
that logic belongs to the feature itself.

### Explicit composition

Large shell surfaces are assembled from smaller widgets and features. This keeps
composition predictable and avoids concentrating unrelated behavior in a single
root component.

### Controlled integration

System communication is isolated behind IPC/RPC helpers and contracts. Visual
components should depend on explicit integration APIs instead of embedding
transport-level details directly.

### Shared infrastructure boundaries

Reusable primitives, styling utilities, types, and generic helpers are placed in
shared layers. Product-specific behavior should remain in features, widgets, or
shell-level composition layers.

---

## Development

Enter the development shell:

```bash id="89zlqo"
nix develop
```

Generate AGS types:

```bash id="skwf9z"
npm run types
```

---

## Project status

`apathyos-widgets` is an early-stage part of the apathyos desktop environment.

The runtime API, feature boundaries, shell composition model, and integration
contracts may change as the desktop stack evolves. The project should be treated
as an implementation component of apathyos rather than a standalone generic UI
library.
