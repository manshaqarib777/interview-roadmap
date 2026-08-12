# Topic 51 — Accessors & Mutators

**Checklist anchor:** transforming attributes · `$casts` · attribute objects · serialization · modern Laravel syntax

**Owning lesson:** [115 Eloquent ORM](../115-eloquent.md)

---

## The one-sentence answer

**Accessors transform an attribute when you read it, mutators transform it when you write it — the modern form being an `Attribute` object with `get` and/or `set` closures.**

## The mental model

The database stores raw values; the application wants useful ones:

```text
DB: first_name = "ada", last_name = "lovelace"
READ  →  $user->full_name  →  "Ada Lovelace"        (accessor)
WRITE →  $user->full_name = "Ada Lovelace"
     →  first_name = "Ada", last_name = "Lovelace"  (mutator)
```

Accessors and mutators are the **translation layer** between stored data and the model's public face — so the transformation lives in one place instead of scattered through controllers and views.

## How it works — the modern syntax

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Model
{
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => trim($this->first_name.' '.$this->last_name),
            set: fn ($value) => [
                'first_name' => ucfirst(strtok($value, ' ')),
                'last_name'  => ucfirst(strtok('')),
            ],
        );
    }

    protected function password(): Attribute
    {
        return Attribute::make(set: fn ($value) => Hash::make($value));
    }
}
```

```php
$user->full_name;                    // "Ada Lovelace" — through the getter
$user->full_name = 'Grace Hopper';   // splits into first/last — through the setter
$user->password = 'secret';          // hashed on write, never stored plaintext
```

## Accessors vs `$casts` vs attribute objects

| Tool | What it does | Example |
|---|---|---|
| **Accessor** | Transform a value on read / on write | `full_name`, hashed password |
| **`$casts`** | Convert the DB value to a PHP type at the boundary | `'is_active' => 'boolean'`, `'meta' => 'array'` |
| **Attribute object** | A class that encapsulates a complex cast | `AsCollection`, a custom cast class |

```php
protected $casts = [
    'is_active' => 'boolean',    // 0/1 ↔ true/false, automatically
    'metadata' => 'array',       // JSON column ↔ PHP array
    'price' => 'decimal:2',      // money formatting
    'paid_at' => 'datetime',     // string ↔ Carbon instance
];
```

The boundary: **casts are type conversion** (the DB's representation → PHP's type); **accessors are transformation** (the value → a derived or presented form). Both run at the attribute boundary, and both affect serialization.

## Serialization interplay

```php
$user->toArray();            // accessors and casts run → JSON-safe output
$user->toJson();
$user->append('full_name');  // include an accessor in serialization
$user->makeHidden('password'); // exclude from output
```

A mutator that hashes the password means `$user->password` is never plaintext in any output — as long as you don't re-expose it (and `makeHidden` guards the JSON side).

## Interview questions

**Q1. What are accessors and mutators?**
> Accessors transform an attribute when read; mutators transform it when written. The modern syntax is an `Attribute` object with `get` and/or `set` closures. They centralize presentation (full name) and write logic (password hashing) in the model instead of duplicating it in controllers and views.

**Q2. Accessor vs cast?**
> A cast converts the raw DB value to a PHP type — `0` ↔ `false`, a JSON string ↔ array, a date string ↔ Carbon. An accessor transforms a value into a derived or presented form — full name from parts, formatted price. Casts are type conversion; accessors are transformation. Both live at the model's attribute boundary.

**Q3. What's an attribute object?**
> A class that encapsulates how an attribute's value is stored and retrieved — `AsCollection`, `AsEncryptedArrayObject`, or a custom cast class implementing `CastsAttributes`. It's the cast/accessor pattern for complex, reusable attribute types.

**Q4. How do mutators affect security?**
> A `password` mutator that hashes on write means plaintext never reaches the database — `$user->password = 'secret'` stores a hash. Combined with `$hidden`/`makeHidden` on serialization, the plaintext never leaks into JSON either. It's the framework's clean home for "always hash on write."

**Q5. How do accessors interact with serialization?**
> Accessors and casts run when the model is serialized (`toArray()`/`toJson()`), so derived values appear in API output. You control the surface: `append()` includes a computed accessor, `makeHidden()`/`$hidden` excludes sensitive attributes. The serialized model is the API contract — accessors shape it.

**Senior follow-up: When does an accessor become a trap?**
> When it queries the database. `get: fn () => $this->orders()->count()` turns every read into a query — N+1 in disguise (Lesson 11). Accessors are for transforming what's already loaded; counts belong in `withCount()`. The rule: if an accessor needs a query, it shouldn't be an accessor.

## Common mistakes

❌ Accessors that run queries — N+1 in a pretty costume; use `withCount()`.

❌ Mutators doing more than transforming — side effects in a setter surprise every caller.

❌ Forgetting serialization — a computed accessor isn't in JSON unless `append()`ed; a raw attribute isn't hidden unless `$hidden`/`makeHidden`.

❌ Hand-hashing passwords in controllers — the mutator is the single place.

## Quick revision notes

- **Accessor** (`get`) = transform on read · **Mutator** (`set`) = transform on write
- Modern form: `Attribute::make(get: ..., set: ...)`
- **Casts** = type conversion (`boolean`, `array`, `datetime`) · **Accessors** = transformation
- **Attribute objects** = reusable complex casts
- Serialization: `append()`, `makeHidden()`, `$hidden` shape the API
- Never **query in an accessor** — `withCount()` instead

## Check your understanding

1. What's the difference between a cast and an accessor?
2. Write a `full_name` accessor with a mutator that splits on write.
3. How does a password mutator keep plaintext out of the DB *and* JSON?
4. What happens to accessors when a model is serialized?
5. Why is a querying accessor an N+1 trap, and what replaces it?
