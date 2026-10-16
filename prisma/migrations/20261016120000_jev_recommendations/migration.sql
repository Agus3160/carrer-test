ALTER TABLE "Assessment"
ALTER COLUMN "recommendationVersion" SET DEFAULT 'jev-choice-v1';

ALTER TABLE "Result"
ADD COLUMN "jevProbability" DOUBLE PRECISION,
ALTER COLUMN "recommendationVersion" SET DEFAULT 'jev-choice-v1';
