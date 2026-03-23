#!/bin/bash

# --- CONFIGURATION ---
YML_FILES=$(ls *.yml 2>/dev/null | tr '\n' ' ')
CORE_FILES="App.jsx nginx.conf Dockerfile $YML_FILES"
OUTPUT_FILE="engineer_plan.md"
MASTER_PROMPT_FILE="jenkins_master_prompt.md"

# Budgeting (Based on Claude 3.5 Sonnet rates)
BUDGET_CAP_CENTS=75  # 50 cents max
TOKEN_RATE_PER_M=3   # $3.00 per 1M input tokens

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[!] Jenkins Media: Scanning all configs and $YML_FILES...${NC}"

# --- 1. PRE-FLIGHT BUDGET CHECK ---
if ! command -v bc &> /dev/null; then
    echo -e "${RED}[X] Error: 'bc' is not installed. Run 'sudo apt install bc' for budget tracking.${NC}"
    exit 1
fi

FILE_CHARS=$(cat $CORE_FILES 2>/dev/null | wc -c)

if [ -z "$FILE_CHARS" ] || [ "$FILE_CHARS" -eq 0 ]; then
    echo -e "${RED}[X] Error: No target files found. Check your directory.${NC}"
    exit 1
fi

# Estimate tokens (approx 4 chars/token, across 5 agents + 1 lead)
EST_INPUT_TOKENS=$(( (FILE_CHARS / 4) * 6 ))
EST_COST_CENTS=$(echo "scale=2; ($EST_INPUT_TOKENS / 1000000) * $TOKEN_RATE_PER_M * 100" | bc | cut -d. -f1)

echo -e "${BLUE}[i] Estimated Cost: ~$EST_COST_CENTS¢${NC}"

if [ "$EST_COST_CENTS" -gt "$BUDGET_CAP_CENTS" ]; then
    echo -e "${RED}[X] BUDGET ALERT: Estimated cost ($EST_COST_CENTS¢) exceeds cap (${BUDGET_CAP_CENTS}¢).${NC}"
    read -p "Proceed anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}[i] Audit canceled by user.${NC}"
        exit 1
    fi
fi

# --- 2. EXECUTION ---
echo -e "${YELLOW}[>] Dispatching agents in parallel...${NC}"

claude code-simplifier "Review for DRY principles: $CORE_FILES" > .simp.tmp 2>/dev/null &
claude ethical-hacker-pentester "Review for vulnerabilities: $CORE_FILES" > .pent.tmp 2>/dev/null &
claude security-reviewer "Review for secrets and Docker security: $CORE_FILES" > .sec.tmp 2>/dev/null &
claude tech-lead "Review architectural integrity: $CORE_FILES" > .tech.tmp 2>/dev/null &
claude ux-reviewer "Review font size and relative sizes of diagrams and pictures. Also mobile responsiveness: $CORE_FILES" > .ux.tmp 2>/dev/null &

wait

# --- 3. MASTER PROMPT COMPILATION ---
echo -e "${GREEN}[+] Reports gathered. Compiling Master Prompt...${NC}"

cat <<PROMPT_END > .master_prompt.tmp
INSTRUCTIONS: Act as the Lead Engineer. Review these reports for the following files: $CORE_FILES.

1. Identify Conflict Points (e.g., Security vs. UX).
2. Rank changes by Criticality (P0: Security, P1: Structural, P2: Polish).
3. Provide 'Golden Snippets' for the most critical changes.
4. Provide an attributed Todo List.
5. Ask for approval to apply changes.

--- START AGENT REPORTS ---
$(cat .simp.tmp 2>/dev/null)
$(cat .pent.tmp 2>/dev/null)
$(cat .sec.tmp 2>/dev/null)
$(cat .tech.tmp 2>/dev/null)
$(cat .ux.tmp 2>/dev/null)
--- END AGENT REPORTS ---
PROMPT_END

# --- 4. INTERACTIVE TOGGLE ---
echo -e "\n${BLUE}[?] The Master Prompt has been compiled.${NC}"
read -p "Do you want to save this prompt for manual review and exit? (y/N): " SAVE_CHOICE

if [[ "$SAVE_CHOICE" =~ ^[Yy]$ ]]; then
    mv .master_prompt.tmp "$MASTER_PROMPT_FILE"
    echo -e "${GREEN}[✔] Saved to: $MASTER_PROMPT_FILE${NC}"
    echo -e "${YELLOW}[i] Exiting. You can manually feed this file to the Lead Engineer later.${NC}"
    
    # Clean up the agent temp files
    rm -f .simp.tmp .pent.tmp .sec.tmp .tech.tmp .ux.tmp
    exit 0
fi

# --- 5. LEAD ENGINEER SYNTHESIS ---
echo -e "${YELLOW}[>] Proceeding... Feeding the Master Prompt to the Lead Engineer...${NC}"

claude tech-lead "$(cat .master_prompt.tmp)" > "$OUTPUT_FILE"

# Clean up
rm -f .simp.tmp .pent.tmp .sec.tmp .tech.tmp .ux.tmp .master_prompt.tmp

echo -e "${GREEN}[✔] DONE! Review your final plan in: $OUTPUT_FILE${NC}"

# --- 6. USAGE REPORT ---
if command -v ccusage &> /dev/null; then
    echo -e "\n${YELLOW}--- ACTUAL COST ---${NC}"
    ccusage report daily --limit 1
fi
