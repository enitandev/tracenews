import { createClient } from "@supabase/supabase-js";
import outlets from "./src/data/outlets.json" with { type: "json" };

const supabase = createClient(
    "https://yqqysehsnwicppejgfky.supabase.co",
    process.env.SUPABASE_SERVICE_KEY
);

const rows = outlets.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    website: o.website,
    rss_feeds: o.rss_feeds,
    logo_url: o.logo_url || null,
    founded_year: o.founded_year,
    headquarters_city: o.headquarters_city,
    headquarters_region: o.headquarters_region,
    medium: o.medium,
    reach: o.reach,
    ownership_name: o.ownership_name,
    ownership_type: o.ownership_type,
    ownership_transparency: o.ownership_transparency,
    geopolitical_lean: o.geopolitical_lean,
    party_proximity: o.party_proximity,
    religious_framing: o.religious_framing,
    languages: o.languages,
    active: o.active,
    trust_score: o.trust_score || null,
    twitter_handle: o.social_handles?.twitter || null,
    facebook_handle: o.social_handles?.facebook || null,
    instagram_handle: o.social_handles?.instagram || null,
    notes: o.notes || null,
}));

const { data, error } = await supabase.from("outlets").insert(rows);

if (error) {
    console.error("Seed failed:", error.message);
} else {
    console.log(`Successfully seeded ${rows.length} outlets.`);
}