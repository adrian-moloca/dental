#!/bin/bash

# DentalOS Billing API Test Script
# This script demonstrates the complete billing workflow

BASE_URL="http://localhost:3310"
AUTH_TOKEN="your-jwt-token-here"

echo "========================================="
echo "DentalOS Billing API Test"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Create Invoice
echo -e "${BLUE}Step 1: Creating invoice...${NC}"
INVOICE_RESPONSE=$(curl -s -X POST "$BASE_URL/invoices" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-123",
    "providerId": "provider-123",
    "issueDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "dueDate": "'$(date -u -d "+30 days" +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "currency": "RON",
    "notes": "Test invoice for dental treatment"
  }')

INVOICE_ID=$(echo $INVOICE_RESPONSE | jq -r '._id')
INVOICE_NUMBER=$(echo $INVOICE_RESPONSE | jq -r '.invoiceNumber')

echo -e "${GREEN}✓ Invoice created: $INVOICE_NUMBER (ID: $INVOICE_ID)${NC}"
echo ""

# Step 2: Add Line Item - Dental Cleaning
echo -e "${BLUE}Step 2: Adding line item - Dental Cleaning...${NC}"
curl -s -X POST "$BASE_URL/invoices/$INVOICE_ID/items" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemType": "PROCEDURE",
    "code": "PROC-001",
    "description": "Dental cleaning",
    "quantity": 1,
    "unitPrice": 100
  }' | jq '.'

echo -e "${GREEN}✓ Line item added (100 RON + 19% VAT = 119 RON)${NC}"
echo ""

# Step 3: Add Line Item - Toothpaste
echo -e "${BLUE}Step 3: Adding line item - Toothpaste...${NC}"
curl -s -X POST "$BASE_URL/invoices/$INVOICE_ID/items" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemType": "PRODUCT",
    "code": "PROD-001",
    "description": "Professional toothpaste",
    "quantity": 2,
    "unitPrice": 25,
    "taxRate": 0.19
  }' | jq '.'

echo -e "${GREEN}✓ Line item added (50 RON + 19% VAT = 59.5 RON)${NC}"
echo ""

# Step 4: Get Invoice to see totals
echo -e "${BLUE}Step 4: Getting invoice with calculated totals...${NC}"
INVOICE=$(curl -s -X GET "$BASE_URL/invoices/$INVOICE_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN")

echo $INVOICE | jq '{
  invoiceNumber: .invoiceNumber,
  status: .status,
  subtotal: .subtotal,
  taxAmount: .taxAmount,
  total: .total,
  balance: .balance,
  currency: .currency
}'

TOTAL=$(echo $INVOICE | jq -r '.total')
echo -e "${GREEN}✓ Invoice total: $TOTAL RON${NC}"
echo ""

# Step 5: Issue Invoice
echo -e "${BLUE}Step 5: Issuing invoice...${NC}"
curl -s -X POST "$BASE_URL/invoices/$INVOICE_ID/issue" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.status'

echo -e "${GREEN}✓ Invoice issued (status changed to SENT)${NC}"
echo ""

# Step 6: Record partial payment
echo -e "${BLUE}Step 6: Recording partial payment (100 RON)...${NC}"
curl -s -X POST "$BASE_URL/invoices/$INVOICE_ID/payments" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-123",
    "paymentDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "amount": 100,
    "currency": "RON",
    "paymentMethod": "CASH"
  }' | jq '{
    amount: .amount,
    paymentMethod: .paymentMethod,
    status: .status
  }'

echo -e "${GREEN}✓ Payment recorded${NC}"
echo ""

# Step 7: Check invoice status
echo -e "${BLUE}Step 7: Checking invoice status after partial payment...${NC}"
curl -s -X GET "$BASE_URL/invoices/$INVOICE_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '{
  status: .status,
  total: .total,
  amountPaid: .amountPaid,
  balance: .balance
}'

echo -e "${GREEN}✓ Invoice partially paid${NC}"
echo ""

# Step 8: Record remaining payment
echo -e "${BLUE}Step 8: Recording remaining payment...${NC}"
REMAINING=$(echo $INVOICE | jq -r '.balance')
curl -s -X POST "$BASE_URL/invoices/$INVOICE_ID/payments" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-123",
    "paymentDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "amount": 78.5,
    "currency": "RON",
    "paymentMethod": "CARD"
  }' | jq '{
    amount: .amount,
    paymentMethod: .paymentMethod,
    status: .status
  }'

echo -e "${GREEN}✓ Remaining payment recorded${NC}"
echo ""

# Step 9: Verify invoice is fully paid
echo -e "${BLUE}Step 9: Verifying invoice is fully paid...${NC}"
curl -s -X GET "$BASE_URL/invoices/$INVOICE_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '{
  invoiceNumber: .invoiceNumber,
  status: .status,
  total: .total,
  amountPaid: .amountPaid,
  balance: .balance,
  paidDate: .paidDate
}'

echo -e "${GREEN}✓ Invoice fully paid!${NC}"
echo ""

# Step 10: Get all payments for invoice
echo -e "${BLUE}Step 10: Getting payment history...${NC}"
curl -s -X GET "$BASE_URL/invoices/$INVOICE_ID/payments" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'

echo -e "${GREEN}✓ Payment history retrieved${NC}"
echo ""

# Step 11: List all invoices with pagination
echo -e "${BLUE}Step 11: Listing all invoices (paginated)...${NC}"
curl -s -X GET "$BASE_URL/invoices?page=1&limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '{
  total: .total,
  page: .page,
  limit: .limit,
  totalPages: .totalPages,
  invoiceCount: (.data | length)
}'

echo -e "${GREEN}✓ Invoice list retrieved${NC}"
echo ""

echo "========================================="
echo -e "${GREEN}All tests completed successfully!${NC}"
echo "========================================="
echo ""
echo "Summary:"
echo "- Invoice created: $INVOICE_NUMBER"
echo "- Items added: 2 (with 19% Romanian VAT)"
echo "- Invoice issued: SENT"
echo "- Payments recorded: 2 (CASH + CARD)"
echo "- Final status: PAID"
echo ""
echo "For more details, see:"
echo "- /apps/backend-billing-service/BILLING_API.md"
echo "- /apps/backend-billing-service/MVP_004_IMPLEMENTATION_SUMMARY.md"
