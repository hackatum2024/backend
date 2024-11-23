#!/bin/bash

echo "Running test queries..."

# Test 1: Basic query - all regions, sorted by price ascending
echo -e "\n=== Test 1: Basic query with all regions, sorted by price ascending ==="
echo "Expected output:"
echo "- Should return 6 offers in price ranges"
echo "- Offers should be sorted from 5000 cents to 15000 cents"
echo "- Should include all car types in carTypeCounts"
echo "- Should show vollkasko distribution (4 true, 2 false)"
PGPASSWORD=postgres psql -h localhost -U postgres -d rental_db -c "
SELECT get_offers(
    ARRAY[1, 2, 3]::integer[],
    1732104000000, -- Nov 20, 2024
    1732449600000, -- Nov 24, 2024
    2,
    'price-asc',
    0,
    10,
    5000, -- 50 EUR ranges
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    50
);"

# Test 2: Filter luxury cars only
echo -e "\n=== Test 2: Filter luxury cars only ==="
echo "Expected output:"
echo "- Should return 2 luxury cars (from regions 1 and 3)"
echo "- Price range should be 7000-8000 cents"
echo "- carTypeCounts should show only luxury cars"
PGPASSWORD=postgres psql -h localhost -U postgres -d rental_db -c "
SELECT get_offers(
    ARRAY[1, 2, 3]::integer[],
    1732104000000,
    1732449600000,
    2,
    'price-asc',
    0,
    10,
    5000,
    NULL,
    NULL,
    NULL,
    'luxury',
    NULL,
    NULL,
    50
);"

# Test 3: Filter by price range and vollkasko
echo -e "\n=== Test 3: Filter by price range (5000-10000 cents) and vollkasko ==="
echo "Expected output:"
echo "- Should return 3 offers (small and luxury cars under 10000 cents with vollkasko)"
echo "- Price ranges should be between 5000-10000 cents"
echo "- vollkaskoCount should show only true counts"
PGPASSWORD=postgres psql -h localhost -U postgres -d rental_db -c "
SELECT get_offers(
    ARRAY[1, 2, 3]::integer[],
    1732104000000,
    1732449600000,
    2,
    'price-asc',
    0,
    10,
    5000,
    NULL,
    NULL,
    10000,
    NULL,
    true,
    NULL,
    50
);"

# Test 4: Filter by specific region
echo -e "\n=== Test 4: Filter by specific region (Region 2 only) ==="
echo "Expected output:"
echo "- Should return 2 offers from region 2"
echo "- Should include only sports and family cars"
echo "- Price range should be 12000-15000 cents"
PGPASSWORD=postgres psql -h localhost -U postgres -d rental_db -c "
SELECT get_offers(
    ARRAY[2]::integer[],
    1732104000000,
    1732449600000,
    2,
    'price-asc',
    0,
    10,
    5000,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    50
);"

# Test 5: Test pagination
echo -e "\n=== Test 5: Test pagination (2 items per page, page 1) ==="
echo "Expected output:"
echo "- Should return 2 offers (3rd and 4th when sorted by price-asc)"
echo "- Should still show full aggregations for all matching offers"
PGPASSWORD=postgres psql -h localhost -U postgres -d rental_db -c "
SELECT get_offers(
    ARRAY[1, 2, 3]::integer[],
    1732104000000,
    1732449600000,
    2,
    'price-asc',
    1,
    2,
    5000,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    50
);"
