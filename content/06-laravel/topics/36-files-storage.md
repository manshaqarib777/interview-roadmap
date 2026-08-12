# Topic 36 — Files & Storage

**Checklist anchor:** Storage facade · local disk · S3 · public/private files · signed URLs · temporary URLs · file uploads · validation · storage disks

**Owning lesson:** [128 Rate Limiting & Security](../128-security.md)

---

## The one-sentence answer

**The Storage facade gives every file a uniform API across disks — local, S3, or anything else — with public/private visibility, signed URLs for controlled access, and validation for uploads.**

## The mental model

```text
Storage facade (one API)
   ├─ local disk   →  storage/app
   ├─ public disk  →  storage/app/public (symlinked to public/)
   ├─ s3 disk      →  an S3 bucket
   └─ any Flysystem adapter → Dropbox, FTP, Azure…
```

The facade is the point (Lesson 7): **code writes files without knowing where they land.** Switch `FILESYSTEM_DISK` from `local` to `s3` and the code doesn't change. The disk is the abstraction; the facade is the door.

## How it works

### Disks

```php
// config/filesystems.php
'disks' => [
    'local' => ['driver' => 'local', 'root' => storage_path('app')],
    'public' => ['driver' => 'local', 'root' => storage_path('app/public'),
                 'url' => env('APP_URL').'/storage', 'visibility' => 'public'],
    's3' => ['driver' => 's3', 'key' => env('AWS_ACCESS_KEY_ID'), ...],
],
```

`local` = private app storage; `public` = symlinked to `public/storage` (web-served); `s3` = cloud. Default disk: `FILESYSTEM_DISK`.

### The API

```php
Storage::put('avatars/1.png', $contents);        // write
Storage::get('avatars/1.png');                   // read
Storage::exists('avatars/1.png');                // check
Storage::delete('avatars/1.png');                // remove
Storage::disk('s3')->put('uploads/x.pdf', $file); // explicit disk
Storage::url('avatars/1.png');                   // public URL
Storage::download('files/invoice.pdf');          // force download
Storage::files('avatars');                       // list
```

### File uploads + validation

```php
// controller:
$request->validate([
    'avatar' => ['required', 'image', 'mimes:jpg,png,webp', 'max:2048'], // 2MB, image types
]);

$path = $request->file('avatar')->store('avatars', 'public');
// → storage/app/public/avatars/xxx.png, web-served via the symlink
```

### Public vs private

| | Public disk | Private (local/S3-private) |
|---|---|---|
| Access | Web-served, anyone with the URL | Nothing public — controlled delivery |
| Use for | Avatars, product images | Invoices, reports, user data |
| URL | `Storage::url(...)` | **Signed URL** (below) |

### Signed URLs — controlled access to private files

```php
// a temporary, expiring link to a PRIVATE file:
$url = Storage::temporaryUrl('invoices/1.pdf', now()->addMinutes(30));
// S3: pre-signed URL, valid 30 min
// local: the same contract via the signed-url route
```

The senior pattern: **private storage + temporary signed URLs.** The file isn't public; the user gets a short-lived link (email attachment links, download buttons) that expires — no public exposure, no open bucket.

### The security rule (from Lesson 37)

- Store uploads **outside the public web root** — `storage/app` by default.
- **Validate MIME, size, extension** server-side.
- Never trust the client's filename/extension alone.

## Interview questions

**Q1. What is the Storage facade?**
> A uniform file API across disks — local, public (symlinked), S3, or any Flysystem adapter. `Storage::put/get/delete` works identically on every disk, and the active disk is a config choice. That's replaceability in practice: switch `FILESYSTEM_DISK` and the code doesn't change.

**Q2. Public vs private files?**
> Public files live on a disk that's web-served — anyone with the URL gets them (avatars, images). Private files live where the web server can't reach them — delivered deliberately via signed URLs (invoices, reports). The rule: anything user-specific is private; only genuinely public assets go public.

**Q3. What are signed/temporary URLs?**
> Expiring links to private files — `Storage::temporaryUrl('invoices/1.pdf', now()->addMinutes(30))`. On S3 that's a pre-signed URL; locally it's the same contract via a route. The file stays private; the *link* is the access — short-lived, revocable by expiry, no open bucket.

**Q4. How do you handle file uploads?**
> Validate at the boundary — `image|mimes:jpg,png,webp|max:2048` — then `$request->file('avatar')->store('avatars', 'public')`. The validation checks MIME, size, and extension server-side; the store() picks the disk and generates a unique path. Never trust the client's filename or extension.

**Q5. How do you switch storage providers?**
> Change the config, not the code — `FILESYSTEM_DISK=s3` in `.env` and the facade calls hit S3. The disk abstraction is the whole point: the app depends on the disk, the config supplies the implementation (Lesson 52's contracts in practice).

**Senior follow-up: What's the secure pattern for user-uploaded files?**
> Validate server-side (MIME sniffing + size + extension whitelist), store **outside the public root** (private disk), serve via **signed temporary URLs** with short expiry, and never let the client control the path or the extension that gets served. That's the full Lesson 37 file-upload defence — the checklist's "storage outside public directory" as a system.

## Common mistakes

❌ Storing uploads in `public/` directly — web-served, no validation, no control.

❌ Open S3 buckets — "private" disk misconfigured to public reads.

❌ Trusting client filenames/extensions — validate server-side, store under generated names.

❌ Serving private files as public URLs — that's the leak the signed URL exists to prevent.

## Quick revision notes

- **Storage facade** = one API over any disk (local, public, S3)
- Disks: `local` (private) · `public` (symlinked, web-served) · `s3`
- **Private + signed URLs** = the senior file pattern
- Uploads: **validate MIME/size/extension**, store outside public root
- `temporaryUrl($path, $expiry)` = expiring access
- Switch providers = **`.env` change**, code untouched

## Check your understanding

1. What does the Storage facade abstract away?
2. When is a file public vs private?
3. How does a signed URL let a private file be downloaded?
4. What's the validation shape for an image upload?
5. Why shouldn't user uploads ever land in `public/`?
