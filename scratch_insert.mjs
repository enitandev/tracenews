import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const target_id = "b161dc66-c419-4017-9acc-437ebff73934";

const correction_data = {
    actor_id: "00000000-0000-0000-0000-000000000000",
    actor_email: "system@tracenews.app",
    action_type: "ledger_correction",
    target_table: "admin_audit_log",
    target_id: target_id,
    changes: {
        note: `Correction for ${target_id}: The previous entry was a test artifact whose actor_email was erroneously modified from 'Antigravity' to 'Enitan Bello' via direct database update. This correction restores the integrity of the audit trail by documenting the error.`,
        original_actor_email: "Antigravity",
        erroneous_actor_email: "Enitan Bello"
    }
};

async function insert() {
    const { data, error } = await supabase
        .from('admin_audit_log')
        .insert(correction_data)
        .select();
        
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Correction inserted:", data);
    }
}

insert();
