CREATE TYPE severity_level AS ENUM ('Information', 'Warning', 'Critical');
CREATE TYPE risk_level AS ENUM ('Low', 'Moderate', 'High', 'Critical');
CREATE TYPE news_status AS ENUM ('Published', 'Private', 'Rejected');