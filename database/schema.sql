-- NEWS_SEVERITY TABLE
CREATE TABLE news_severity (
    id SERIAL PRIMARY KEY,
    severity severity_level NOT NULL,
    description TEXT,
    severity_weight float NOT NULL DEFAULT 1.0 CHECK (severity_weight > 0)
);

-- CATEGORY_SCORE TABLE
CREATE TABLE category_score (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('Accident', 'Violence', 'Climate Hazard', 'Caution')),
    base_score FLOAT NOT NULL CHECK (base_score > 0),
    description TEXT
);

-- DISTRICT_ZONE TABLE
CREATE TABLE district_zone (
    district TEXT PRIMARY KEY,
    risk_level risk_level NOT NULL,
    risk_score FLOAT,
    province TEXT,
    country TEXT
);

-- NEWS TABLE
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitted_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    district TEXT REFERENCES district_zone(district) ON DELETE SET NULL,
    severity_id INT REFERENCES news_severity(id) ON DELETE SET NULL,
    category_id INT REFERENCES category_score(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    location_name TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    source TEXT,
    recommended_action TEXT,
    media_url TEXT,
    status news_status NOT NULL DEFAULT 'Private',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ
);

-- NEWS_SCORE TABLE
CREATE TABLE news_score (
    id UUID PRIMARY KEY REFERENCES news(id) ON DELETE CASCADE,
    calculated_score FLOAT NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);