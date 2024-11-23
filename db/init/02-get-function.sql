CREATE OR REPLACE FUNCTION get_offers(
    p_region_ids integer[],
    p_time_range_start bigint,
    p_time_range_end bigint,
    p_number_days integer,
    p_sort_order text,
    p_page integer,
    p_page_size integer,
    p_price_range_width integer,
    p_min_number_seats integer,
    p_min_price numeric,
    p_max_price numeric,
    p_car_type text,
    p_only_vollkasko boolean,
    p_min_free_kilometer integer,
    p_min_free_kilometer_width integer
) RETURNS jsonb AS $$
WITH filtered_offers AS (
    SELECT *
    FROM rental_offers ro
    WHERE 
        ro."mostSpecificRegionID" = ANY(p_region_ids)
        -- internally we store the start and end date as TIMESTAMP
        -- that's why we also need to convert the raw ms to it
        AND ro."startDate" >= to_timestamp(p_time_range_start::double precision / 1000)
        AND ro."endDate" <= to_timestamp(p_time_range_end::double precision / 1000)
        -- get the number of seconds of the difference
        AND (
            EXTRACT(DAY FROM ro."endDate"::timestamp) - 
            EXTRACT(DAY FROM ro."startDate"::timestamp) +
            (EXTRACT(YEAR FROM ro."endDate"::timestamp) - 
             EXTRACT(YEAR FROM ro."startDate"::timestamp)) * 365 +
            (EXTRACT(MONTH FROM ro."endDate"::timestamp) - 
             EXTRACT(MONTH FROM ro."startDate"::timestamp)) * 30
        ) = p_number_days


        -- Optional filters
        AND (p_min_number_seats IS NULL OR ro."numberSeats" >= p_min_number_seats)
        AND (p_min_price IS NULL OR ro.price >= p_min_price)
        AND (p_max_price IS NULL OR ro.price < p_max_price)
        AND (p_car_type IS NULL OR ro."carType" = p_car_type)
        AND (p_only_vollkasko IS NULL OR ro."hasVollkasko" = p_only_vollkasko)
        AND (p_min_free_kilometer IS NULL OR ro."freeKilometers" >= p_min_free_kilometer)
),
paginated_offers AS (
    SELECT 
        ro.id::text as id,  -- Explicitly convert UUID to text
        ro.data,
        ro.price  -- Added for sorting
    FROM filtered_offers ro
    ORDER BY 
        CASE WHEN p_sort_order = 'price-asc' THEN price END ASC NULLS LAST,
        CASE WHEN p_sort_order = 'price-asc' THEN id::text END ASC,
        CASE WHEN p_sort_order = 'price-desc' THEN price END DESC NULLS LAST,
        CASE WHEN p_sort_order = 'price-desc' THEN id::text END ASC
    LIMIT p_page_size
    OFFSET (p_page * p_page_size)
),
price_ranges AS (
    SELECT 
        (price / p_price_range_width) * p_price_range_width as range_start,
        ((price / p_price_range_width) * p_price_range_width) + p_price_range_width as range_end,
        COUNT(*)::integer as count
    FROM filtered_offers
    GROUP BY (price / p_price_range_width)
    HAVING COUNT(*) > 0
    ORDER BY range_start
),
car_type_counts AS (
    SELECT 
        COALESCE(SUM(CASE WHEN "carType" = 'small' THEN 1 ELSE 0 END), 0)::integer as small,
        COALESCE(SUM(CASE WHEN "carType" = 'sports' THEN 1 ELSE 0 END), 0)::integer as sports,
        COALESCE(SUM(CASE WHEN "carType" = 'luxury' THEN 1 ELSE 0 END), 0)::integer as luxury,
        COALESCE(SUM(CASE WHEN "carType" = 'family' THEN 1 ELSE 0 END), 0)::integer as family
    FROM filtered_offers
),
seats_count AS (
    SELECT 
        "numberSeats",
        COUNT(*)::integer as count
    FROM filtered_offers
    GROUP BY "numberSeats"
    HAVING COUNT(*) > 0
    ORDER BY "numberSeats"
),
free_kilometer_ranges AS (
    SELECT 
        ("freeKilometers" / p_min_free_kilometer_width) * p_min_free_kilometer_width as range_start,
        (("freeKilometers" / p_min_free_kilometer_width) * p_min_free_kilometer_width) + p_min_free_kilometer_width as range_end,
        COUNT(*)::integer as count
    FROM filtered_offers
    GROUP BY ("freeKilometers" / p_min_free_kilometer_width)
    HAVING COUNT(*) > 0
    ORDER BY range_start
),
vollkasko_count AS (
    SELECT
        COALESCE(SUM(CASE WHEN "hasVollkasko" THEN 1 ELSE 0 END), 0)::integer as true_count,
        COALESCE(SUM(CASE WHEN NOT "hasVollkasko" THEN 1 ELSE 0 END), 0)::integer as false_count
    FROM filtered_offers
)
SELECT jsonb_build_object(
    'offers', COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'ID', id,
                'data', data
            )
        )
        FROM paginated_offers
    ), '[]'::jsonb),
    'priceRanges', COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'start', range_start,
                'end', range_end,
                'count', count
            )
        )
        FROM price_ranges
    ), '[]'::jsonb),
    'carTypeCounts', COALESCE(
        (SELECT to_jsonb(car_type_counts.*)
        FROM car_type_counts
    ), '{"small":0,"sports":0,"luxury":0,"family":0}'::jsonb),
    'seatsCount', COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'numberSeats', "numberSeats",
                'count', count
            )
        )
        FROM seats_count
    ), '[]'::jsonb),
    'freeKilometerRange', COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'start', range_start,
                'end', range_end,
                'count', count
            )
        )
        FROM free_kilometer_ranges
    ), '[]'::jsonb),
    'vollkaskoCount', COALESCE(
        (SELECT jsonb_build_object(
            'trueCount', true_count,
            'falseCount', false_count
        )
        FROM vollkasko_count
    ), '{"trueCount":0,"falseCount":0}'::jsonb)
);
$$ LANGUAGE SQL;
