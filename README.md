# Lively

Umbrella repo for Lively. Each component lives in its own repo, wired in here as git submodules.

## Submodules

| Path | Repo |
|---|---|
| `backend` | [LivelyHub/lively-backend](https://github.com/LivelyHub/lively-backend) |
| `bot` | [LivelyHub/lively-bot](https://github.com/LivelyHub/lively-bot) |
| `mobile` | [LivelyHub/lively-mobile](https://github.com/LivelyHub/lively-mobile) |
| `landing` | [LivelyHub/lively-landing](https://github.com/LivelyHub/lively-landing) |

## Clone

```
git clone --recurse-submodules https://github.com/LivelyHub/lively.git
```

If already cloned without that flag:

```
git submodule update --init --recursive
```

## Update submodules to latest

```
git submodule update --remote --merge
```
