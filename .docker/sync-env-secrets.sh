#!/usr/bin/env bash
# Create/update the GitHub "demo" environment and load its secrets from
# .docker/.env.demo. Requires an authenticated gh CLI with repository admin access.
set -euo pipefail

REPO="${REPO:-TaskCoper/hoatheomua-fe}"
ENVIRONMENTS="${ENVIRONMENTS:-demo}"
DIR="$(cd "$(dirname "$0")" && pwd)"

EXCLUDE='^(REGISTRY|TAG|PROFILE)='

branch_for_env() {
  case "$1" in
    demo) echo "demo" ;;
    *) echo "" ;;
  esac
}

command -v gh >/dev/null || {
  echo "gh CLI not found; install it and run 'gh auth login'." >&2
  exit 1
}

gh auth status >/dev/null 2>&1 || {
  echo "gh is not authenticated; run 'gh auth login'." >&2
  exit 1
}

for ENVIRONMENT in $ENVIRONMENTS; do
  FILE="${ENV_FILE:-$DIR/.env.$ENVIRONMENT}"
  [ -f "$FILE" ] || {
    echo "Missing environment file: $FILE" >&2
    exit 1
  }

  BRANCH="$(branch_for_env "$ENVIRONMENT")"

  echo ">> Ensuring GitHub environment '$ENVIRONMENT'..."
  if [ -n "$BRANCH" ]; then
    gh api -X PUT "repos/$REPO/environments/$ENVIRONMENT" --input - >/dev/null <<JSON
{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}
JSON

    existing="$(gh api "repos/$REPO/environments/$ENVIRONMENT/deployment-branch-policies" \
      --jq '.branch_policies[].name' 2>/dev/null || true)"

    if ! printf '%s\n' "$existing" | grep -qx "$BRANCH"; then
      echo "   + restricting deployments to branch '$BRANCH'"
      gh api -X POST "repos/$REPO/environments/$ENVIRONMENT/deployment-branch-policies" \
        -f name="$BRANCH" >/dev/null
    fi
  else
    gh api -X PUT "repos/$REPO/environments/$ENVIRONMENT" >/dev/null
  fi

  echo ">> Setting secrets for '$ENVIRONMENT' from $FILE..."
  gh secret set --repo "$REPO" --env "$ENVIRONMENT" \
    --env-file <(grep -vE '^[[:space:]]*#' "$FILE" | grep '=' | grep -vE "$EXCLUDE")

  echo ">> Finished '$ENVIRONMENT'."
done
