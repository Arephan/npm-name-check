# npm-name-check

Check if npm package names are available. Instant availability check.

![npm version](https://img.shields.io/npm/v/npm-name-check)
![license](https://img.shields.io/npm/l/npm-name-check)

## Install

```bash
npm install -g npm-name-check
```

## Usage

```bash
# Check single name
npm-check my-cool-package

# Check multiple names
npm-check react vue svelte

# Get similar name suggestions
npm-check my-app -s
```

## Output

```
✓  my-cool-package - Available!
✗  react - Taken
✗  vue - Taken
   Checking alternatives...
   ✓ vue-next
   ✓ my-vue
```

## Options

| Flag | Description |
|------|-------------|
| `-s, --similar` | Suggest available alternatives |
| `-h, --help` | Show help |

## Validation

Also checks for valid npm name rules:
- Lowercase only
- No special characters
- Max 214 characters
- Can't start with . or _

## Why?

- ✅ Instant check before you build
- ✅ Check multiple names at once
- ✅ Get alternative suggestions
- ✅ No API key needed

## License

MIT
