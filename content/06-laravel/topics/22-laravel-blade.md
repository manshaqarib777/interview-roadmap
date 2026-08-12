# Topic 22 — Laravel Blade

**Checklist anchor:** components · layouts · slots · directives · loops · conditionals · includes · sections · stacks · escaping

**Owning lesson:** [114 Blade](../114-blade.md)

---

## The one-sentence answer

**Blade is Laravel's templating engine — PHP with a nicer syntax, compiled to plain PHP, with automatic HTML escaping as the default.**

## The mental model

Blade files are `.blade.php`. They look like HTML with directives, and they compile to **plain PHP** that runs as fast as writing PHP directly — but with three things PHP doesn't give you:

1. **Escaping by default** — `{{ $value }}` escapes HTML (the XSS shield, Lesson 37).
2. **Composable templates** — layouts, components, and slots instead of string concatenation.
3. **Readable control flow** — `@if` / `@foreach` instead of `<?php if ?>` soup.

```text
resources/views/welcome.blade.php
        │  compiled at render time
        ▼
storage/framework/views/*.php   (plain PHP, cached)
        │
        ▼
HTML response
```

## How it works

### Escaping — the security default

```blade
{{ $value }}      {{-- escaped: <script> becomes &lt;script&gt; --}}
{!! $value !!}    {{-- RAW: no escaping — only for trusted HTML you generate --}}
```

**Rule:** use `{{ }}` always; use `{!! !!}` only when you *own* the HTML (e.g. a safe rich-text renderer). Raw output of user input is an XSS vulnerability.

### Directives

```blade
@if ($user->isAdmin())
    <p>Admin</p>
@elseif ($user->isEditor())
    <p>Editor</p>
@else
    <p>Viewer</p>
@endif

@foreach ($posts as $post)
    <li>{{ $post->title }}</li>
@endforeach

@forelse ($posts as $post)
    <li>{{ $post->title }}</li>
@empty
    <li>No posts yet.</li>
@endforelse

@include('partials.header')            {{-- include a partial --}}
@auth                                {{-- only for logged-in users --}}
@guest                               {{-- only for guests --}}
```

### Layouts — classic and modern

**Classic (sections + extends):**

```blade
{{-- layouts/app.blade.php --}}
<html><body>
    @yield('content')
</body></html>

{{-- child view --}}
@extends('layouts.app')
@section('content')
    <h1>Page</h1>
@endsection
```

**Modern (components + slots):**

```blade
{{-- components/card.blade.php --}}
<div {{ $attributes }}>
    {{ $slot }}            {{-- the default slot --}}
</div>

{{-- usage --}}
<x-card class="p-4">
    Some content
</x-card>
```

### Components and named slots

```blade
{{-- components/alert.blade.php --}}
<div class="alert">
    <strong>{{ $title }}</strong>
    {{ $slot }}
</div>

{{-- usage with a named slot --}}
<x-alert>
    <x-slot:title>Heads up</x-slot:title>
    The message body.
</x-alert>
```

### Stacks

```blade
@push('scripts') <script src="..."></script> @endpush
@stack('scripts')   {{-- rendered where you place it, in push order --}}
```

### Layouts vs components

| | Layout | Component |
|---|---|---|
| Shape | One page shell, `@yield`/`@section` | Reusable piece, `$slot`/props |
| Use for | The overall page frame | Cards, buttons, alerts, repeated UI |
| Modern default | Components | Components |

## Interview questions

**Q1. What is Blade, and why does it exist?**
> Laravel's templating engine. `.blade.php` files compile to plain PHP, so they're fast, but the syntax is far more readable — `@if` instead of `<?php if ?>` — and `{{ }}` escapes by default, which is the framework's first line of XSS defence.

**Q2. What's the difference between `{{ }}` and `{!! !!}`?**
> `{{ }}` escapes HTML entities, so user input is rendered as text, never markup — the safe default. `{!! !!}` outputs raw HTML without escaping, and should only be used for trusted content you control. Raw-outputting user input is how XSS happens.

**Q3. Layouts vs components?**
> A layout is the page shell — the HTML frame with `@yield`/`@section` where content slots in. A component is a reusable piece — a card, an alert — with `$slot` and props. Modern Blade prefers components: they're composable, testable, and don't require the extends tree.

**Q4. What are Blade components and slots?**
> Components are `.blade.php` files in `resources/views/components/` used as `<x-card>`. The default `$slot` holds the content between the tags; named slots (`<x-slot:title>`) hold specific pieces. `{{ $attributes }}` lets callers pass HTML attributes through. It's the modern way to build composable UI.

**Q5. How does Blade handle security?**
> Escaping by default (`{{ }}`), plus directives for auth (`@auth`/`@guest`). The escaping is the key defence against XSS: any variable you echo is HTML-escaped unless you explicitly opt into raw output with `{!! !!}` — which you should only do for HTML you generate yourself.

**Senior follow-up: When would you reach for raw output?**
> When rendering trusted, server-generated HTML — a markdown renderer, a WYSIWYG result you sanitized, a rich-text field you control. The pattern is: sanitize server-side, then `{!! !!}` — never raw-output user input directly.

## Common mistakes

❌ `{!! $user->bio !!}` — raw-outputting user input is an XSS hole.

❌ Fat views — SQL or business logic in Blade; views are presentation only.

❌ Nested `@extends` spaghetti — prefer components for reuse.

❌ Using `@php` blocks for real logic — a sign the logic belongs in a controller/service or a computed attribute.

## Quick revision notes

- Blade compiles to **plain PHP** — fast, cached in `storage/framework/views`
- `{{ }}` **escapes** · `{!! !!}` is **raw** — use raw only for trusted HTML
- **Layouts** (`@extends`/`@section`/`@yield`) = page shells
- **Components** (`<x-card>`, `$slot`, `{{ $attributes }}`) = reusable pieces
- `@auth`/`@guest`/`@forelse`/`@push`+`@stack` cover common view needs

## Check your understanding

1. What does Blade compile to, and why does that matter for performance?
2. When is `{!! !!}` safe, and when is it an XSS vulnerability?
3. Layout vs component — when is each the right tool?
4. How do slots let a component be reusable?
5. What's the modern way to build a shared UI piece in Blade?
