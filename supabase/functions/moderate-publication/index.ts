import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-firebase-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const FIREBASE_PROJECT_ID = "cityhealth-ec7e7";
const FIREBASE_API_KEY = "AIzaSyDo8AhKuuXiH2yC9MhgCZr9TxaouBvEyWU";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifyFirebaseAdmin(idToken: string): Promise<boolean> {
  try {
    // Verify the Firebase ID token via Firebase REST API
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!verifyRes.ok) return false;
    const verifyData = await verifyRes.json();
    const uid = verifyData?.users?.[0]?.localId;
    if (!uid) return false;

    // Check Firestore for admin status using the Firebase REST API
    const firestoreRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`,
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
    if (!firestoreRes.ok) return false;
    const doc = await firestoreRes.json();
    const userType = doc?.fields?.userType?.stringValue;
    return userType === "admin";
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // Extract Firebase ID token from header
  const firebaseToken = req.headers.get("x-firebase-token");
  if (!firebaseToken) {
    return jsonResponse({ error: "Missing Firebase token" }, 401);
  }

  // Verify admin identity via Firebase
  const isAdmin = await verifyFirebaseAdmin(firebaseToken);
  if (!isAdmin) {
    return jsonResponse({ error: "Unauthorized: admin only" }, 403);
  }

  let body: { action: string; ad_id: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { action, ad_id, reason } = body;
  if (!action || !ad_id) {
    return jsonResponse({ error: "Missing action or ad_id" }, 400);
  }

  // Fetch ad info for notification
  const { data: ad } = await supabase
    .from("ads")
    .select("provider_id, title, status")
    .eq("id", ad_id)
    .single();

  if (!ad) {
    return jsonResponse({ error: "Ad not found" }, 404);
  }

  switch (action) {
    case "approve": {
      const { error } = await supabase
        .from("ads")
        .update({ status: "approved", rejection_reason: null })
        .eq("id", ad_id);
      if (error) return jsonResponse({ error: error.message }, 500);
      await supabase.from("ad_notifications").insert({
        provider_id: ad.provider_id,
        ad_id,
        ad_title: ad.title,
        type: "approved",
        message: "Votre publication a été approuvée et est maintenant visible sur la page /annonces.",
      });
      return jsonResponse({ success: true, action: "approved" });
    }
    case "reject": {
      const rejectionReason = reason || "Non conforme aux règles de la plateforme";
      const { error } = await supabase
        .from("ads")
        .update({ status: "rejected", rejection_reason: rejectionReason })
        .eq("id", ad_id);
      if (error) return jsonResponse({ error: error.message }, 500);
      await supabase.from("ad_notifications").insert({
        provider_id: ad.provider_id,
        ad_id,
        ad_title: ad.title,
        type: "rejected",
        message: rejectionReason,
      });
      return jsonResponse({ success: true, action: "rejected" });
    }
    case "suspend": {
      const { error } = await supabase
        .from("ads")
        .update({ status: "suspended" })
        .eq("id", ad_id);
      if (error) return jsonResponse({ error: error.message }, 500);
      await supabase.from("ad_notifications").insert({
        provider_id: ad.provider_id,
        ad_id,
        ad_title: ad.title,
        type: "suspended",
        message: "Votre publication a été suspendue.",
      });
      return jsonResponse({ success: true, action: "suspended" });
    }
    case "delete": {
      const { error } = await supabase
        .from("ads")
        .delete()
        .eq("id", ad_id);
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ success: true, action: "deleted" });
    }
    default:
      return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  }
});
