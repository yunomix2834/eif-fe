#!/usr/bin/env bash
set -euo pipefail
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=common.sh
source "$script_dir/common.sh"

require_command jq
[[ -f package.json ]] || fail "package.json not found"
[[ -f package-lock.json ]] || fail "package-lock.json not found"

lock_version=$(jq -r '.lockfileVersion // 0' package-lock.json)
[[ "$lock_version" -ge 3 ]] || fail "package-lock.json must use lockfileVersion >= 3"

compare_dependency_field() {
  local field=$1
  local package_value
  local lock_value

  package_value=$(jq -cS ".${field} // {}" package.json)
  lock_value=$(jq -cS ".packages[\"\"].${field} // {}" package-lock.json)

  if [[ "$package_value" != "$lock_value" ]]; then
    printf 'package.json %s:\n%s\n\n' "$field" "$package_value" >&2
    printf 'package-lock.json root %s:\n%s\n' "$field" "$lock_value" >&2
    fail "package.json and package-lock.json are out of sync for $field"
  fi
}

package_name=$(jq -r '.name // ""' package.json)
lock_name=$(jq -r '.packages[""].name // ""' package-lock.json)
[[ "$package_name" == "$lock_name" ]] || fail "package name differs between package.json and package-lock.json"

package_version=$(jq -r '.version // ""' package.json)
lock_package_version=$(jq -r '.packages[""].version // ""' package-lock.json)
[[ "$package_version" == "$lock_package_version" ]] || fail "package version differs between package.json and package-lock.json"

compare_dependency_field dependencies
compare_dependency_field devDependencies
compare_dependency_field optionalDependencies

log_info "package.json and package-lock.json root metadata are synchronized"
