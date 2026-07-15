#!/usr/bin/env bash
# guidellm rate-type family benchmark runner.
# Secrets come ONLY from env (never committed): GD_KEY, GD_HMODEL.
# Fixed knobs: GD_TARGET, GD_MODEL, token shape, processor.
#
#   RATE_TYPE=synchronous ./bench.sh sync
#   RATE_TYPE=throughput  RATE=24 ./bench.sh throughput
#   RATE_TYPE=constant    RATE=6  ./bench.sh constant
#   RATE_TYPE=poisson     RATE=6  ./bench.sh poisson
set -euo pipefail

GD_TARGET="${GD_TARGET:?set GD_TARGET}"
GD_MODEL="${GD_MODEL:?set GD_MODEL}"
GD_KEY="${GD_KEY:?set GD_KEY}"
GD_HMODEL="${GD_HMODEL:?set GD_HMODEL}"

PROMPT_TOKENS="${PROMPT_TOKENS:-512}"
OUTPUT_TOKENS="${OUTPUT_TOKENS:-128}"
MAX_SECONDS="${MAX_SECONDS:-40}"
MAX_REQUESTS="${MAX_REQUESTS:-600}"
PROCESSOR="${PROCESSOR:-Qwen/Qwen3-32B}"
SEED="${SEED:-42}"

RATE_TYPE="${RATE_TYPE:?set RATE_TYPE}"
NAME="${1:?usage: bench.sh <name>}"
OUT="$(cd "$(dirname "$0")" && pwd)/${NAME}.json"

# Auth + Higress routing header, and disable Qwen3 thinking so the model streams
# normal content tokens (otherwise reasoning deltas break TTFT/ITL timing).
HEADERS_JSON=$(printf '{"extras":{"headers":{"Authorization":"Bearer %s","x-higress-llm-model":"%s"},"body":{"chat_template_kwargs":{"enable_thinking":false}}}}' "$GD_KEY" "$GD_HMODEL")

ARGS=(
  --target="$GD_TARGET"
  --model="$GD_MODEL"
  --rate-type="$RATE_TYPE"
  --data="prompt_tokens=${PROMPT_TOKENS},output_tokens=${OUTPUT_TOKENS}"
  --processor="$PROCESSOR"
  --request-type=chat_completions
  --request-formatter-kwargs="$HEADERS_JSON"
  --backend-kwargs='{"validate_backend": false}'
  --max-seconds="$MAX_SECONDS"
  --max-requests="$MAX_REQUESTS"
  --random-seed="$SEED"
  --output-path="$OUT"
)
[ -n "${RATE:-}" ] && ARGS+=( --rate="$RATE" )

echo ">> guidellm benchmark run --rate-type=$RATE_TYPE ${RATE:+--rate=$RATE}"
guidellm benchmark run "${ARGS[@]}"
echo ">> saved $OUT"
