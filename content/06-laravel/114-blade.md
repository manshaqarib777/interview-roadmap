# Lesson 114 — Blade

**Interview importance:** ⭐⭐⭐ — the view layer of the module: templates, components, slots, and the escaping rule that keeps XSS out.

Lesson 113 ended with controllers returning `view()`. This is what `view()` renders. Blade is Laravel's template engine: PHP that reads like a clean templating language, compiled down to plain PHP and cached.

For a full-stack interview, Blade matters for two reasons. One, it's how you actually build server-rendered pages in Laravel. Two, it contains the single most asked security question in the framework — `{{ }}` vs `{!! !!}` — which is the difference between a template that escapes everything and a site that gets XSS'd.

## Learning Objectives

By the end of this lesson you should be able to:

- Read and write the core directives: `@if`, `@foreach`, `@forelse`, `@isset`, `@empty`
- Build a layout with `@extends`/`@section`/`@yield` and with the modern `<x-layout>` component
- Create a component, pass props, and use named slots
- Explain the escaping rule: `{{ }}` escapes, `{!! !!}` doesn't, and when each is safe
- Drop `@csrf` into a form and say what it prevents
- Push content into a stack with `@push`/`@stack` and gate blocks with `@auth`/`@guest`

## 1. One-Line Definition

**Blade is Laravel's template engine: `.blade.php` files with directives (`@if`, `@foreach`) that compile to plain PHP, components and slots for reuse, and an escaping rule that keeps XSS out.**

## 2. Mental Model

Think of Blade as **PHP wearing a nicer syntax** — the same `if`, `foreach` and `echo`, with the ceremony removed. `@if` compiles to `<?php if ... ?>`, `{{ $x }}` compiles to `<?php echo e($x); ?>`. There is no new runtime: the compiler produces a cached `.php` file and runs that.

```text
welcome.blade.php  ── compile ──►  storage/framework/views/welcome.php  ── run ──► HTML
@if / {{ }} / @foreach               <?php if ... ?> / echo e(...)          <html>…
```

Everything you learn is "what does this compile to" — which is why the escaping rule is so easy to remember: it's literally `echo` vs `echo e()`.

## 3. Visual Flow

One full layout → view → render:

```text
<layout name="app">  ──────────────┐
  <slot />          ──►            │
                                  ▼
                       posts/index.blade.php
                       @extends('layouts.app')  ── pulls the layout ──►  layout body
                       @section('content')                                    │
                         <h1>{{ $title }}</h1>                                ▼
                         @foreach ($posts as $post)                    compiled layout,
                           <article>{{ $post->title }}</article>       with the section
                         @endforeach                                    injected into
                       @endsection                                       <slot /> / @yield
                                  ▼
                        HTML: layout's <html> + header + the posts
```

## 4. How It Works

### Directives

Directives are the template syntax. They compile to plain PHP:

```blade
@if ($user->is_admin)
    <p>You are an admin.</p>
@elseif ($user->is_member)
    <p>Member area.</p>
@else
    <p>Welcome, guest.</p>
@endif

@isset($settings['theme'])
    theme = {{ $settings['theme'] }}
@endisset

<ul>
@foreach ($posts as $post)
    <li>{{ $post->title }}</li>
@empty
    <li>No posts yet.</li>
@endforeach
</ul>
```

```text
compiles to roughly:

    <?php if ($user->is_admin): ?>
        <p>You are an admin.</p>
    <?php elseif ($user->is_member): ?>
        <p>Member area.</p>
    <?php else: ?>
        <p>Welcome, guest.</p>
    <?php endif; ?>
    ...
    <ul>
        <?php foreach ($posts as $post): ?>
            <li><?php echo e($post->title); ?></li>
        <?php endforeach; ?>
    </ul>
```

> [!TIP]
> `@forelse` is `@foreach` plus an `@empty` branch in one directive — the exact pair above. It's the most common Blade pattern on a list page, and the first one interviewers check.

### Layouts — classic and modern

```blade
{{-- resources/views/layouts/app.blade.php --}}
<html>
<head>
    <title>@yield('title', 'My App')</title>
    @stack('styles')
</head>
<body>
    <header>Site header</header>
    <main>
        @yield('content')
    </main>
    @stack('scripts')
</body>
</html>
```

```blade
{{-- resources/views/posts/index.blade.php --}}
@extends('layouts.app')

@section('title', 'All Posts')

@section('content')
    <h1>All posts</h1>
    <ul>@foreach ($posts as $post)<li>{{ $post->title }}</li>@endforeach</ul>
@endsection
```

```text
GET /posts → <html><head><title>All Posts</title></head>
             <body><header>Site header</header>
             <main><h1>All posts</h1><ul>…</ul></main></body></html>
```

The modern equivalent replaces `@extends`/`@yield` with components:

```blade
{{-- resources/views/components/layout.blade.php --}}
<html>
<head>
    <title>{{ $title ?? 'My App' }}</title>
    {{ $styles ?? '' }}
</head>
<body>
    <header>Site header</header>
    <main>{{ $slot }}</main>
    {{ $scripts ?? '' }}
</body>
</html>
```

```blade
{{-- resources/views/posts/index.blade.php --}}
<x-layout title="All Posts">
    <h1>All posts</h1>
    <ul>@foreach ($posts as $post)<li>{{ $post->title }}</li>@endforeach</ul>
</x-layout>
```

```text
same output — <x-layout> is the layout, the content between its tags is $slot
```

### Components and named slots

A component is a Blade file in `resources/views/components/`, usable as `<x-…>`. Attributes become variables; the body becomes `$slot`; named slots give a component multiple regions:

```blade
{{-- resources/views/components/card.blade.php --}}
<div class="card">
    <div class="card__title">{{ $title }}</div>
    <div>{{ $slot }}</div>
    @isset($footer)
        <div class="card__footer">{{ $footer }}</div>
    @endisset
</div>
```

```blade
{{-- used as --}}
<x-card title="Latest posts">
    <ul>@foreach ($posts as $post)<li>{{ $post->title }}</li>@endforeach</ul>

    <x-slot:footer>Updated {{ now()->format('Y-m-d') }}</x-slot:footer>
</x-card>
```

```text
renders:
<div class="card">
    <div class="card__title">Latest posts</div>
    <div><ul><li>Hello</li><li>World</li></ul></div>
    <div class="card__footer">Updated 2026-01-15</div>
</div>
```

## 5. Real Project Usage

| Job | Blade tool |
|---|---|
| Page shell | `<x-layout>` / `@extends` + `@yield` |
| Reusable UI | `<x-button>`, `<x-card>`, `<x-input>` components |
| Lists | `@foreach` … `@empty`, or `@forelse` |
| Auth-dependent UI | `@auth` / `@guest` blocks |
| Forms | `@csrf`, old-input helpers (`old('title')`) |
| Per-page scripts/styles | `@push('scripts')` … `@stack('scripts')` |
| User content | `{{ $post->body }}` — always escaped |

The three most common real-world fragments:

```blade
{{-- auth-aware nav --}}
@auth
    <a href="{{ route('dashboard') }}">Dashboard</a>
@endauth
@guest
    <a href="{{ route('login') }}">Log in</a>
@endguest
```

```blade
{{-- a form that survives the CSRF check --}}
<form method="POST" action="{{ route('posts.store') }}">
    @csrf
    <input name="title" value="{{ old('title') }}">
    <button type="submit">Publish</button>
</form>
```

```blade
{{-- per-page styles/scripts --}}
@push('styles')
    <link rel="stylesheet" href="{{ asset('css/posts.css') }}">
@endpush
```

```text
@auth   → the Dashboard link renders only for signed-in users
@guest  → the Log in link renders only for guests
@csrf   → <input type="hidden" name="_token" value="…">  — the CSRF token
@push('styles') → the <link> appears in the layout's @stack('styles')
```

> [!NOTE]
> `@csrf` expands to a hidden `_token` input carrying the session's CSRF token. The `web` middleware group (Lesson 112) rejects a POST without a valid token with a 419 — the token is what makes your own forms pass, and it's the first thing to check when a form 419s.

## 6. Interview Explanation

> Blade is Laravel's template engine — `.blade.php` files that compile to plain PHP, so directives like `@if` and `@foreach` are just cleaner syntax for `<?php if ?>` and `<?php foreach ?>`. Layouts come in two flavours: the classic `@extends`/`@section`/`@yield`, and the modern `<x-layout>` component with `$slot`. Components take attributes as variables and named slots as regions. The security rule is the part I always state: `{{ $value }}` escapes through `e()` and is safe for user content, while `{!! $raw !!}` outputs without escaping — I only use it for content I fully control, never user input. `@csrf` embeds the CSRF token, `@auth`/`@guest` branch on login state, and `@push`/`@stack` carry per-page assets into the layout.

## 7. Senior-Level Insights

- **The escaping rule is one sentence:** `{{ }}` escapes, `{!! !!}` doesn't. User content goes through `{{ }}` — a username, a post body, anything — and `{!! !!}` is reserved for trusted, pre-sanitised output. Violating that rule is how Blade apps get XSS'd, and it's the first thing a security interviewer probes.
- **Components are the composition tool — Lesson 48's idea in server-side form.** A `<x-button>` or `<x-card>` is a reusable, prop-driven unit with named slots for regions. Teams that componentize their Blade end up with templates that read like a design system instead of copy-pasted markup.
- **`@php` blocks are a smell.** If you're writing a loop or a computation inside `@php … @endphp`, that logic belongs in the controller or a `@php`-free computed value. Templates should read data, not compute it.
- **Blade compiles once, runs many.** Compiled views live in `storage/framework/views/` and are reused until the source changes; `php artisan view:cache` warms them at deploy. That's why Blade is fast despite being "interpreted".
- **`@each`, `@include` and partials are the old way; components are the new way.** Each takes data one way; a component's contract is explicit (attributes + slots). Mentioning the migration shows you've shipped modern Laravel.

## 8. Common Mistakes

- **`{!! $user->bio !!}` on user input** — the #1 XSS vector in Laravel apps. Always `{{ }}` for anything a user typed.
- **Putting logic in `@php` blocks** — untestable, unreadable, and it breaks the "templates read data" contract.
- **Forgetting `@csrf` in a form** — every POST/PUT/DELETE form gets a 419 until the token input is there.
- **`@foreach` without an empty state** — the page renders an empty `<ul>` instead of a friendly message; `@forelse` covers it in one directive.
- **Nesting `@extends` inside a component** — a component is a piece, a layout is the shell; a component that extends a layout can't be nested.
- **Escaping with `{!! !!}` "because the content is HTML from the editor"** — editor HTML is still user input; sanitise it (or store a whitelisted subset) before outputting raw.
- **Assuming `{{ }}` is "HTML-safe" rather than "escaped"** — `e()` encodes `& < > " '`; it does not make markup safe to inline.

## 9. Best Practices

✅ Escape everything with `{{ }}` by default; treat `{!! !!}` as an exception with a comment

✅ Use `@forelse` for list rendering — the `@empty` branch is free

✅ Build layouts and repeated UI as components (`<x-layout>`, `<x-card>`, `<x-button>`)

✅ Always `@csrf` in forms; check `old('field')` to re-fill invalid input

✅ Use `@auth`/`@guest` for login-dependent UI, not `@if(auth()->check())`

✅ Keep `@php` out of templates — compute in the controller

❌ Don't render user input with `{!! !!}` — ever

❌ Don't duplicate layouts with `@include` when a component expresses the contract better

## 10. Interview Questions

**Q1. What is Blade?**

> Laravel's template engine. `.blade.php` files compile to plain PHP — `@if`, `@foreach` and `{{ }}` become `<?php if ?>`, `<?php foreach ?>` and `echo e()`. It adds layouts (`@extends`/`@yield` or `<x-layout>`), components with slots, and an escaping rule that keeps XSS out.

**Q2. What's the difference between `{{ $value }}` and `{!! $value !!}`?**

> `{{ }}` escapes the output through `e()`, encoding `& < > " '`, so it's safe for user content. `{!! !!}` outputs raw, unescaped. The rule: user input goes in `{{ }}`; `{!! !!}` is only for trusted content I control.

**Q3. How do layouts work in Blade?**

> Two ways. The classic: a layout uses `@yield('content')` and a view uses `@extends('layouts.app')` + `@section('content')`. The modern way: a `<x-layout>` component in `resources/views/components/`, and the view wraps its content in `<x-layout>…</x-layout>` where the body lands in `$slot`.

**Q4. What are components and slots?**

> A component is a Blade file in `resources/views/components/` used as `<x-card>`. Attributes become component variables — `<x-card title="…">` gives `$title` — and the content between the tags becomes `$slot`. Named slots (`<x-slot:footer>`) give a component more than one region.

**Q5. What does `@csrf` do?**

> It renders a hidden `_token` input with the session's CSRF token. The `web` middleware group verifies it on POST/PUT/DELETE and returns 419 on a mismatch — it's what stops cross-site request forgery against state-changing endpoints. Every Laravel form needs one.

**Q6. What do `@auth` and `@guest` do?**

> They're `@if(auth()->check())` and `@if(auth()->guest())` with nicer syntax — render the dashboard link only for signed-in users, the login link only for guests.

**Q7. How do you get per-page assets into the layout?**

> With stacks. The view does `@push('scripts') … @endpush`, and the layout renders them where it wants with `@stack('scripts')` — usually just before `</body>`.

**Senior follow-up: How would you render a comment section where comments contain Markdown?**

> Store the raw Markdown, render it to HTML once (server-side, with a whitelist — no raw links, no script), and output the *rendered, sanitised* HTML through `{!! !!}` while escaping the author's plain-text fields with `{{ }}`. The rule holds: only the output I've sanitised may be raw; everything a user typed stays escaped.

## 11. Follow-up Questions

**Is `{!! !!}` ever safe?**

> Yes — when the value is trusted: a pre-sanitised HTML fragment from a whitelist-based sanitizer, server-rendered Markdown, or static app content. The discipline is keeping that set tiny and auditable, and never letting user input reach it unprocessed.

**What does `old('title')` do in a form?**

> It re-fills the input with the previously submitted value after a validation failure — `{{ old('title') }}`. Laravel flashes the old input on validation errors, so the form survives a round-trip instead of wiping the user's work.

**`@foreach` vs `@forelse`?**

> Identical looping; `@forelse` adds the `@empty` branch — the "no posts yet" case — inside the same directive. Use `@forelse` for any list that can be empty.

**Where do compiled Blade views live?**

> `storage/framework/views/`. Blade recompiles when the source changes, and `php artisan view:cache` precompiles everything at deploy — so production never compiles on first hit.

## 12. Comparison Table

| | `{{ $value }}` | `{!! $value !!}` |
|---|---|---|
| Compiles to | `echo e($value)` | `echo $value` |
| Escapes `& < > " '` | ✅ | ❌ |
| Safe for user input | ✅ | ❌ |
| Use for | names, bios, bodies, attributes | sanitised/trusted HTML |

| | Classic layout | Component layout |
|---|---|---|
| Shell | `@extends` + `@section`/`@yield` | `<x-layout>` + `$slot` |
| Props | none — implicit | attributes → variables |
| Regions | `@yield('name')` | named slots `<x-slot:name>` |
| Modern | legacy but everywhere | the current idiom |

## 13. Code Example

A complete post page, from data to rendered HTML:

```blade
{{-- resources/views/posts/show.blade.php --}}
<x-layout :title="$post->title">

    <article>
        <h1>{{ $post->title }}</h1>
        <p class="meta">by {{ $post->author->name }} · {{ $post->published_at->format('M j, Y') }}</p>

        <div class="body">{{ $post->body }}</div>

        <h2>Comments ({{ $post->comments_count }})</h2>
        @forelse ($post->comments as $comment)
            <div class="comment">
                <strong>{{ $comment->author_name }}</strong>
                <p>{{ $comment->body }}</p>
            </div>
        @empty
            <p>No comments yet — be the first.</p>
        @endforelse

        @auth
            <form method="POST" action="{{ route('comments.store', $post) }}">
                @csrf
                <textarea name="body" placeholder="Add a comment"></textarea>
                <button type="submit">Post</button>
            </form>
        @else
            <p><a href="{{ route('login') }}">Log in</a> to comment.</p>
        @endauth
    </article>

    @push('scripts')
        <script>highlightCode();</script>
    @endpush

</x-layout>
```

What the browser receives:

```text
<html><head><title>Hello, Laravel</title></head>
<body><header>Site header</header>
<main>
  <article>
    <h1>Hello, Laravel</h1>
    <p class="meta">by Ada · Jan 15, 2026</p>
    <div class="body">Welcome to your first post.</div>
    <h2>Comments (1)</h2>
    <div class="comment"><strong>Grace</strong><p>Nice post!</p></div>
    <form method="POST" action="/posts/42/comments">
      <input type="hidden" name="_token" value="…">
      <textarea name="body" placeholder="Add a comment"></textarea>
      <button type="submit">Post</button>
    </form>
  </article>
</main>
<script>highlightCode();</script></body></html>
```

```narrate
1:   the layout component wraps everything; the title attribute becomes $title
5:   escaped output — a user-controlled string can never become markup here
9:   escaped again: post bodies are user content and stay inside {{ }}
11-17: @forelse gives the empty state ("No comments yet") for free
20:  the comment form appears only for signed-in users
23:  @csrf is what lets this POST through the web group's CSRF check
33:  this script lands in the layout's @stack('scripts') — before </body>
```

## 14. Performance Notes

- **Blade compiles once and caches** (`storage/framework/views/`). First render compiles; every render after reads the cache. `php artisan view:cache` warms it at deploy so production never compiles on a hot path.
- **`{{ }}` adds an `e()` call per echo** — negligible per field, but a list page with 500 rows times 5 fields is 2500 calls. Cache the rendered fragment (Lesson 127) if a section is hot; don't micro-optimise the escaping.
- **`@forelse` with N+1 is the real cost** — `$post->comments` inside the loop is a query per post. Lesson 117 is the fix; Blade itself is never the bottleneck.
- **Stacks are cheap**, but a layout that renders 30 `@push`ed scripts on every page pays for all of them. Push only what the page needs.
- **Keep templates dumb.** The most expensive "template" is one that recomputes in `@php` what the controller already knew.

## 15. Debugging Scenarios

| Symptom | Cause | Fix |
|---|---|---|
| Form POST returns 419 | `@csrf` missing or the token expired | add `@csrf`; re-fetch the page for a fresh token |
| HTML shows as escaped text (`&lt;b&gt;`) | `{{ }}` on content that *should* be markup | it's escaping doing its job — sanitise, then use `{!! !!}` deliberately |
| XSS in a field rendered with `{{ }}` | the field was output with `{!! !!}` somewhere else | grep for `{!!` and audit every one against user input |
| Page renders unstyled — no per-page CSS | `@push`ed styles never hit a `@stack` in the layout | confirm the layout calls `@stack('styles')` |
| "No comments yet" never shows on empty lists | `@foreach` without `@empty` | use `@forelse` |
| Blank page after editing a template | compiled view cache | `php artisan view:clear` |
| `$slot` empty in a component | forgot the closing tag or named-slot mismatch | check `</x-card>` and `<x-slot:name>` spelling |

## 16. Quick Revision Notes

- Blade = `.blade.php` compiled to plain PHP; `@if`→`<?php if ?>`, `{{ }}`→`echo e()`
- Directives: `@if`/`@elseif`/`@else`, `@foreach`/`@forelse` (+`@empty`), `@isset`, `@empty`
- Layouts: classic `@extends`/`@section`/`@yield`, modern `<x-layout>` with `$slot`
- Components: `resources/views/components/*.blade.php` → `<x-name>`; attributes = variables, body = `$slot`, `<x-slot:name>` = regions
- **Escaping rule:** `{{ }}` escapes (safe), `{!! !!}` doesn't (trusted only) — the XSS rule
- `@csrf` = hidden `_token` input; missing → 419 on POST/PUT/DELETE
- `@auth`/`@guest` = `auth()->check()` / `auth()->guest()` sugar
- Stacks: `@push('scripts')` in views, `@stack('scripts')` in the layout
- `old('field')` re-fills inputs after validation failure
- Compiled views: `storage/framework/views/`; `view:cache` / `view:clear`

## 17. Cheat Sheet

```text
Escaping:   {{ $v }}      escaped   ── echo e($v)      (user content)
            {!! $v !!}    raw       ── echo $v         (trusted only)
            {{ $v ?? 'default' }}   null-coalescing

Directives:
  @if @elseif @else @endif      @isset @endisset      @empty @endempty
  @foreach ($x as $y) @endforeach
  @forelse ($x as $y) … @empty … @endforelse
  @auth @else @endauth   @guest @endguest
  @php @endphp (avoid)

Layouts (classic):  layout: @yield('title', 'default')  @yield('content')
                    view:   @extends('layouts.app')  @section('title', '…')  @section('content')…@endsection

Layouts (modern):   resources/views/components/layout.blade.php → <x-layout>
                    {{ $slot }}        {{ $title ?? 'default' }}

Components:  <x-card :title="$post->title"> body <x-slot:footer>…</x-slot:footer> </x-card>
             attributes → $title (':title' passes a variable)

Forms:  @csrf   old('title')
Stacks: view:  @push('scripts') … @endpush
        layout: @stack('scripts')

Cache:  php artisan view:cache | view:clear   (storage/framework/views)
```

## 18. Key Takeaways

> [!RECAP]
> - Blade is PHP with nicer syntax — directives compile to `<?php ?>` and cached views run it
> - `{{ }}` escapes through `e()`; `{!! !!}` outputs raw — the XSS rule is: user content stays in `{{ }}`
> - Layouts: `@extends`/`@section`/`@yield`, or the modern `<x-layout>` component
> - Components take attributes as variables and named slots as regions — Lesson 48's composition, server-side
> - `@csrf` is mandatory in forms or the `web` group 419s the request
> - `@auth`/`@guest` branch on login state; `@push`/`@stack` move per-page assets into the layout
> - `@forelse` is list rendering done right — the empty state is built in

## Check your understanding

Answer these without looking back.

1. What does `{{ $x }}` compile to, and why does that make it XSS-safe?
2. Write a `@forelse` over `$posts` with an empty state.
3. Convert this layout to the `<x-layout>` component style: shell with `@yield('content')`.
4. When is `{!! !!}` acceptable? Name the one safe category of content.
5. A POST form returns 419. Name the missing line and what it renders.
6. How do you get a page-specific `<script>` into the layout's footer?
7. What's the difference between `@auth` and `@if(auth()->check())` — if any?

## What's Next

**Lesson 115 — Eloquent ORM.** Models, fillable/guarded, casts, accessors, scopes — the
largest Laravel interview topic, and the layer your thin controllers delegate to.
