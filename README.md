# Monorepo

## Run scripts with Just

[Just](https://github.com/casey/just) is similar to NPM scripts or makefile, but language agnostic, simple and powerful.

Recommended installation with [asdf](https://github.com/asdf-vm/asdf):

```sh
asdf plugin add just
asdf install just latest
asdf global just latest
```

- Run redis (for external and internal API): `just redis`
- Run mongo (for Next and APIs): `just mongo`
