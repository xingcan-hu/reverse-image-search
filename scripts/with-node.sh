#!/bin/sh
set -eu

PATH="${PATH:-/usr/bin:/bin}"
export PATH

if [ $# -lt 1 ]; then
  echo "Usage: with-node.sh <command> [args...]" >&2
  exit 2
fi

cmd="$1"
shift

path_prepend() {
  dir="$1"
  [ -d "$dir" ] || return 0
  case ":${PATH:-}:" in
    *":$dir:"*) ;;
    *) PATH="$dir:${PATH:-}" ;;
  esac
}

if command -v "$cmd" >/dev/null 2>&1; then
  exec "$cmd" "$@"
fi

# Common install locations (useful for GUI git clients on macOS).
path_prepend "/opt/homebrew/bin"
path_prepend "/usr/local/bin"

# Volta.
path_prepend "${HOME:-}/.volta/bin"

# asdf shims.
path_prepend "${HOME:-}/.asdf/shims"

# mise shims.
path_prepend "${HOME:-}/.local/share/mise/shims"
path_prepend "${HOME:-}/.mise/shims"

# NVM (pick the highest installed version).
nvm_dir="${NVM_DIR:-${HOME:-}/.nvm}"
nvm_versions="$nvm_dir/versions/node"
if [ -d "$nvm_versions" ]; then
  if sort -V </dev/null >/dev/null 2>&1; then
    latest_node_dir="$(ls -1 "$nvm_versions" 2>/dev/null | sort -V | tail -n 1 || true)"
  else
    latest_node_dir="$(ls -1 "$nvm_versions" 2>/dev/null | sort | tail -n 1 || true)"
  fi
  if [ -n "${latest_node_dir:-}" ]; then
    path_prepend "$nvm_versions/$latest_node_dir/bin"
  fi
fi

if ! command -v "$cmd" >/dev/null 2>&1; then
  echo "lefthook: '$cmd' not found in PATH (git hooks run in a minimal environment)." >&2
  echo "Install Node.js (>=20) and ensure npm/npx are available to non-interactive shells." >&2
  echo "PATH was: ${PATH:-}" >&2
  exit 127
fi

exec "$cmd" "$@"
