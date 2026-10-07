#!/usr/bin/env bash
set -euo pipefail
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=common.sh
source "$script_dir/common.sh"

output_dir=${1:-dist/security/source}
mkdir -p "$output_dir"
require_command trivy

log_info "Creating frontend vulnerability/misconfiguration report"
trivy fs \
  --scanners vuln,misconfig \
  --format json \
  --output "$output_dir/trivy-fs.json" \
  .

log_info "Creating frontend source SBOM"
trivy fs \
  --scanners vuln \
  --format cyclonedx \
  --output "$output_dir/sbom.cdx.json" \
  .

status=0

log_info "Failing on CRITICAL frontend vulnerabilities/misconfigurations"
if ! trivy fs \
  --scanners vuln,misconfig \
  --severity CRITICAL \
  --exit-code 1 \
  .; then
  status=1
fi

# Avoid persisting a secret report because findings can contain sensitive snippets.
log_info "Failing on any detected secret"
if ! trivy fs \
  --scanners secret \
  --exit-code 1 \
  --format table \
  .; then
  status=1
fi

exit "$status"
