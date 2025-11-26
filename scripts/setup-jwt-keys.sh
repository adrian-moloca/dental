#!/bin/bash
# ============================================================================
# Generate RSA Key Pairs for RS256 JWT Authentication
# ============================================================================
# This script generates the RSA key pairs required for secure JWT authentication.
# RS256 (RSA + SHA-256) is an asymmetric algorithm that prevents algorithm confusion attacks.
#
# Security Benefits:
# - Private keys only on auth service (sign tokens)
# - Public keys can be distributed to all services (verify tokens)
# - Prevents CVE-2015-9235 algorithm confusion vulnerability
#
# Usage:
#   ./scripts/setup-jwt-keys.sh
#   ./scripts/setup-jwt-keys.sh --output-dir=/path/to/keys
# ============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

OUTPUT_DIR="${1:-./keys}"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}DentalOS JWT RS256 Key Generator${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

echo -e "${YELLOW}Generating RSA key pairs...${NC}"

# Generate Access Token Keys (2048-bit RSA)
echo "  [1/4] Generating access token private key..."
openssl genrsa -out access_private.pem 2048 2>/dev/null

echo "  [2/4] Extracting access token public key..."
openssl rsa -in access_private.pem -pubout -out access_public.pem 2>/dev/null

# Generate Refresh Token Keys (2048-bit RSA)
echo "  [3/4] Generating refresh token private key..."
openssl genrsa -out refresh_private.pem 2048 2>/dev/null

echo "  [4/4] Extracting refresh token public key..."
openssl rsa -in refresh_private.pem -pubout -out refresh_public.pem 2>/dev/null

echo ""
echo -e "${GREEN}Keys generated successfully!${NC}"
echo ""

# Generate MFA Encryption Key (32 bytes = 64 hex chars for AES-256)
MFA_KEY=$(openssl rand -hex 32)
INTERNAL_API_KEY=$(openssl rand -hex 16)
DEVICE_TOKEN_SECRET=$(openssl rand -hex 32)

# Base64 encode the keys for easy embedding in .env
ACCESS_PRIVATE_B64=$(base64 -w 0 access_private.pem)
ACCESS_PUBLIC_B64=$(base64 -w 0 access_public.pem)
REFRESH_PRIVATE_B64=$(base64 -w 0 refresh_private.pem)
REFRESH_PUBLIC_B64=$(base64 -w 0 refresh_public.pem)

# Generate environment variables snippet
cat > jwt-env-vars.txt << EOF
# ============================================================================
# JWT RS256 Keys (Generated $(date))
# ============================================================================
# IMPORTANT: These are DEVELOPMENT keys. Generate new keys for production!
#
# The keys are base64-encoded PEM files for easy embedding in environment variables.
# The services will automatically decode base64 if the value doesn't start with "-----BEGIN"

# Access Token Keys (for signing/verifying short-lived access tokens)
JWT_ACCESS_PRIVATE_KEY=${ACCESS_PRIVATE_B64}
JWT_ACCESS_PUBLIC_KEY=${ACCESS_PUBLIC_B64}

# Refresh Token Keys (for signing/verifying long-lived refresh tokens)
JWT_REFRESH_PRIVATE_KEY=${REFRESH_PRIVATE_B64}
JWT_REFRESH_PUBLIC_KEY=${REFRESH_PUBLIC_B64}

# Other required secrets
MFA_ENCRYPTION_KEY=${MFA_KEY}
INTERNAL_API_KEY=${INTERNAL_API_KEY}
DEVICE_TOKEN_SECRET=${DEVICE_TOKEN_SECRET}

# Stripe test keys (replace with real test keys from Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_placeholder_replace_me
STRIPE_WEBHOOK_SECRET=whsec_placeholder_replace_me
EOF

echo -e "${GREEN}Environment variables saved to: ${OUTPUT_DIR}/jwt-env-vars.txt${NC}"
echo ""
echo -e "${YELLOW}To use these keys:${NC}"
echo "1. Copy the contents of jwt-env-vars.txt to your .env file"
echo "2. Or source it: source ${OUTPUT_DIR}/jwt-env-vars.txt"
echo ""
echo -e "${YELLOW}Key files generated:${NC}"
ls -la *.pem
echo ""
echo -e "${RED}SECURITY WARNING:${NC}"
echo "- Keep private keys SECRET. Never commit them to version control."
echo "- Distribute public keys to services that need to verify tokens."
echo "- Generate new keys for production environments."
echo ""
echo -e "${GREEN}Done!${NC}"
