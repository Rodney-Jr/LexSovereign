DO $$ 
BEGIN 
    -- 1. Drop old column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PricingConfig' AND column_name='stripePriceId') THEN
        ALTER TABLE "PricingConfig" DROP COLUMN "stripePriceId";
    END IF;

    -- 2. Add base price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PricingConfig' AND column_name='stripeBasePriceId') THEN
        ALTER TABLE "PricingConfig" ADD COLUMN "stripeBasePriceId" TEXT;
    END IF;

    -- 3. Add user price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PricingConfig' AND column_name='stripeUserPriceId') THEN
        ALTER TABLE "PricingConfig" ADD COLUMN "stripeUserPriceId" TEXT;
    END IF;
END $$;
